import { GoogleGenAI, Type, Chat, Schema } from "@google/genai";
import { GameScenario, FinalEvaluation, PlayerProfile, AIConfig, ModelProvider } from "../types";
import { generatePromptFromTemplate, defaultTemplates } from "./promptTemplates";

// --- SHARED HELPERS ---

// Helper to clean Markdown code blocks and extra text from JSON response
const cleanJson = (text: string): string => {
  if (!text) return "{}";

  // Find the first '{' and the last '}'
  const firstBrace = text.indexOf('{');
  const lastBrace = text.lastIndexOf('}');

  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    return text.substring(firstBrace, lastBrace + 1);
  }

  // If no braces found, return original (likely to fail parse, but we tried)
  return text.trim();
};

const withRetry = async <T>(fn: () => Promise<T>, retries = 3, delay = 2000): Promise<T> => {
  let lastError: any;
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;
      console.warn(`Attempt ${i + 1} failed. Retrying in ${delay}ms...`, error);
      // Exponential backoff
      await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
    }
  }

  // Extract useful error message
  let errorMessage = "Unknown Error";
  if (lastError instanceof Error) {
    errorMessage = lastError.message;
  } else if (typeof lastError === 'object') {
    errorMessage = JSON.stringify(lastError);
  }

  throw new Error(`Action failed after ${retries} attempts. Error: ${errorMessage}`);
};

// --- STATE MANAGEMENT ---

let activeConfig: AIConfig | null = null;
let geminiChatSession: Chat | null = null;
let openaiHistory: Array<{ role: string; content: string }> = [];
let currentProfile: PlayerProfile | null = null;
let activePromptTemplate: string = defaultTemplates[0].template;

export const setAIConfig = (config: AIConfig) => {
  activeConfig = config;
};

export const setPromptTemplate = (template: string) => {
  activePromptTemplate = template;
};

// --- SCHEMAS ---

const scenarioSchemaStructure = {
  type: "object",
  properties: {
    phase: { type: "string", description: "Current Time and Status (e.g. '2026年春季 - 大一下学期')" },
    description: { type: "string", description: "Detailed narrative of the situation, based on the deduction of societal changes." },
    feedback: { type: "string", description: "Immediate consequence of previous action." },
    isGameOver: { type: "boolean", description: "True only after ~10 years of game time or death/critical failure." },
    options: {
      type: "array",
      items: {
        type: "object",
        properties: {
          id: { type: "string" },
          text: { type: "string", description: "Action choice." },
        },
        required: ["id", "text"],
      },
    },
  },
  required: ["phase", "description", "options", "isGameOver"],
};

// Gemini Schema Object (Typed)
const scenarioSchema: Schema = {
  type: Type.OBJECT,
  ...scenarioSchemaStructure
} as any;

const evaluationSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    score: { type: Type.NUMBER, description: "Life satisfaction/success score 0-100." },
    title: { type: Type.STRING, description: "Final epithet." },
    summary: { type: Type.STRING, description: "Deep analysis of the 10-year path." },
    timeline: { type: Type.STRING, description: "Bullet points of key milestones over the 10 years." },
    advice: { type: Type.STRING, description: "Reflection on what could have been done differently." },
  },
  required: ["score", "title", "summary", "timeline", "advice"],
};

// --- OPENAI COMPATIBLE ADAPTER ---

const callOpenAICompatible = async (
  messages: Array<{ role: string; content: string }>,
  requireJson: boolean = true
): Promise<string> => {
  if (!activeConfig) throw new Error("AI Config not set");

  const payload = {
    model: activeConfig.modelName,
    messages: messages,
    temperature: 0.7,
    response_format: requireJson ? { type: "json_object" } : undefined,
  };

  try {
    let url = activeConfig.baseUrl;
    if (!url.endsWith('/chat/completions')) {
      if (url.endsWith('/')) url = url.slice(0, -1);
      url = `${url}/chat/completions`;
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${activeConfig.apiKey}`
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`API Error ${response.status}: ${errText}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || "";
  } catch (error) {
    console.error("OpenAI Adapter Error:", error);
    throw error;
  }
};


// --- GAME LOGIC EXPORTS ---

export const initializeGame = async (profile: PlayerProfile): Promise<GameScenario> => {
  if (!activeConfig) throw new Error("Please configure API settings first.");

  // Save profile for later use
  currentProfile = profile;

  // Get API Key from config
  const apiKey = activeConfig?.apiKey || '';

  if (!apiKey) {
    throw new Error("请先在设置中配置 API Key");
  }

  const systemPrompt = generatePromptFromTemplate(activePromptTemplate, profile, activeConfig.provider !== ModelProvider.GEMINI);

  // Reset state
  geminiChatSession = null;
  openaiHistory = [];

  // GEMINI PATH
  if (activeConfig.provider === ModelProvider.GEMINI) {
    const ai = new GoogleGenAI({ apiKey: apiKey });

    // Create new session
    geminiChatSession = ai.chats.create({
      model: activeConfig.modelName || 'gemini-2.5-flash',
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json',
      },
    });

    return withRetry(async () => {
      if (!geminiChatSession) throw new Error("Session not initialized");
      const result = await geminiChatSession.sendMessage({
        message: "开始模拟 (Start Simulation)"
      });

      const text = result.text || "{}";
      const cleanText = cleanJson(text);
      return JSON.parse(cleanText) as GameScenario;
    });
  }
  // OPENAI COMPATIBLE PATH
  else {
    openaiHistory = [
      { role: "system", content: systemPrompt },
      { role: "user", content: "Start Simulation." }
    ];

    return withRetry(async () => {
      const responseText = await callOpenAICompatible(openaiHistory, true);
      openaiHistory.push({ role: "assistant", content: responseText });

      const cleanText = cleanJson(responseText);
      try {
        return JSON.parse(cleanText) as GameScenario;
      } catch (e) {
        console.error("JSON Parse Error", cleanText);
        throw new Error("AI returned invalid JSON.");
      }
    });
  }
};

export const nextTurn = async (userChoiceText: string): Promise<GameScenario> => {
  if (!activeConfig) throw new Error("Game not initialized");

  // GEMINI PATH
  if (activeConfig.provider === ModelProvider.GEMINI) {
    if (!geminiChatSession) throw new Error("Gemini session missing. Please restart.");

    return withRetry(async () => {
      // @ts-ignore - The SDK types might be strict but we are passing correct structure
      const result = await geminiChatSession.sendMessage({ message: userChoiceText });
      const text = result.text;
      if (!text) throw new Error("Empty response from AI");
      const cleanText = cleanJson(text);
      try {
        return JSON.parse(cleanText) as GameScenario;
      } catch (e) {
        // Graceful fallback for malformed JSON in mid-game
        console.error("Malformed JSON during turn:", text);
        return {
          phase: "System Error",
          description: "The simulation encountered a data error. Please try selecting your option again.",
          options: [{ id: "retry", text: "Retry Action" }],
          isGameOver: false
        };
      }
    });
  }

  // OPENAI COMPATIBLE PATH
  else {
    openaiHistory.push({ role: "user", content: userChoiceText });

    return withRetry(async () => {
      const responseText = await callOpenAICompatible(openaiHistory, true);
      openaiHistory.push({ role: "assistant", content: responseText });

      const cleanText = cleanJson(responseText);
      return JSON.parse(cleanText) as GameScenario;
    });
  }
};

export const getFinalEvaluation = async (): Promise<FinalEvaluation> => {
  if (!activeConfig) throw new Error("Game not initialized");
  if (!currentProfile) throw new Error("Profile not found");

  const simulationYears = currentProfile.simulationEndYear - currentProfile.simulationStartYear;

  const prompt = `
    【模拟结束 - ${currentProfile.simulationEndYear}年】
    请回顾这${simulationYears}年（${currentProfile.simulationStartYear}-${currentProfile.simulationEndYear}）的所有决策。
    请生成一份详细的《${simulationYears}年人生回顾报告》。
    报告内容应包含：
    1. 结局称号。
    2. 人生分数(0-100)。
    3. ${simulationYears}年大事记时间线（着重体现大时代背景下的个人浮沉）。
    4. 给年轻人的建议（基于刚才模拟中验证过的逻辑）。
    
    ${activeConfig.provider !== ModelProvider.GEMINI ? `Output Format: JSON matching ${JSON.stringify(evaluationSchema)}` : ''}
  `;

  // GEMINI PATH
  if (activeConfig.provider === ModelProvider.GEMINI) {
    if (!geminiChatSession) throw new Error("Gemini session missing");

    return withRetry(async () => {
      // Step 1: Get narrative
      // @ts-ignore
      const result = await geminiChatSession.sendMessage({ message: prompt });
      const text = result.text || "";
      const cleanText = cleanJson(text);

      // Try direct parse first
      try {
        return JSON.parse(cleanText) as FinalEvaluation;
      } catch (e) {
        // Fallback: Use a fresh content generation call to format the output if chat returns loose text
        const ai = new GoogleGenAI({ apiKey: activeConfig!.apiKey });
        const formatResponse = await ai.models.generateContent({
          model: activeConfig!.modelName || 'gemini-2.5-flash',
          contents: `Extract structured data from this text into JSON: ${text}`,
          config: {
            responseMimeType: 'application/json',
            responseSchema: evaluationSchema,
          }
        });
        return JSON.parse(cleanJson(formatResponse.text || "{}")) as FinalEvaluation;
      }
    });
  }

  // OPENAI COMPATIBLE PATH
  else {
    openaiHistory.push({ role: "user", content: prompt });

    return withRetry(async () => {
      const responseText = await callOpenAICompatible(openaiHistory, true);
      const cleanText = cleanJson(responseText);

      try {
        const json = JSON.parse(cleanText);
        // Basic validation
        if (json.score !== undefined) return json as FinalEvaluation;
        throw new Error("Invalid structure");
      } catch (e) {
        // Fallback repair
        const formattingHistory = [
          { role: "system", content: "You are a JSON formatter. Fix the JSON to match FinalEvaluation schema." },
          { role: "user", content: responseText }
        ];
        const formatText = await callOpenAICompatible(formattingHistory, true);
        return JSON.parse(cleanJson(formatText)) as FinalEvaluation;
      }
    });
  }
};