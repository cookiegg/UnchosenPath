import { GoogleGenAI, Type, Chat, Schema } from "@google/genai";
import { GameScenario, FinalEvaluation, PlayerProfile, AIConfig, ModelProvider } from "../types";

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

export const setAIConfig = (config: AIConfig) => {
  activeConfig = config;
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

// --- PROMPTS ---

const getSystemInstruction = (profile: PlayerProfile, isJsonModeForOpenAI = false) => {
  const mbtiType = `${profile.mbti.energySource}${profile.mbti.perception}${profile.mbti.decision}${profile.mbti.lifestyle}`;
  const mbtiNames: Record<string, string> = {
    'INTJ': '建筑师', 'INTP': '逻辑学家', 'ENTJ': '指挥官', 'ENTP': '辩论家',
    'INFJ': '提倡者', 'INFP': '调停者', 'ENFJ': '主人公', 'ENFP': '竞选者',
    'ISTJ': '物流师', 'ISFJ': '守卫者', 'ESTJ': '总经理', 'ESFJ': '执政官',
    'ISTP': '鉴赏家', 'ISFP': '探险家', 'ESTP': '企业家', 'ESFP': '表演者'
  };

  const simulationYears = profile.simulationEndYear - profile.simulationStartYear;
  
  let base = `你是一个拥有**文学洞察力**和**社会学深度**的未来模拟引擎。你的任务不仅是推演${profile.simulationStartYear}-${profile.simulationEndYear}年（共${simulationYears}年）一位中国人的命运，更是要讲述一个**跌宕起伏、引人入胜、细节丰满**的人生故事。

**角色档案**：
- 姓名：${profile.name}
- 性别：${profile.gender}
- 年龄：${profile.age}岁（${profile.simulationStartYear}年）
- 当前状态：${profile.currentStatus}${profile.grade ? ` (${profile.grade})` : ''}
- 学历水平：${profile.education}${profile.universityTier ? ` (${profile.universityTier})` : ''}
- 家庭背景：${profile.familyBackground}
- 父母职业：${profile.parentsOccupation}
- 籍贯：${profile.hometown.province} ${profile.hometown.city}
- 现居地：${profile.currentLocation.province} ${profile.currentLocation.city}
- 性格类型：${mbtiType} (${mbtiNames[mbtiType] || ''})
- ${profile.currentStatus === '学生' ? `专业：${profile.major}` : `职业：${profile.profession}`}
- 特长技能：${profile.skills}
${profile.customBio ? `\n**用户特别备注/设定**：\n${profile.customBio}\n` : ''}

**模拟时间段**：
- 起始年份：${profile.simulationStartYear}年
- 结束年份：${profile.simulationEndYear}年
- 模拟时长：${simulationYears}年
- 根据角色的年龄和当前状态，从${profile.simulationStartYear}年的合适起点开始模拟。

**核心指令（Tone & Style）**：
1.  **拒绝平铺直叙**：不要写成流水账。每一回合都是人生剧本的一幕。要有**画面感**、**情绪张力**和**细节描写**。
2.  **全景式叙事**：每次剧情必须包含以下**四个维度**的描写，缺一不可：
    *   **【职业/学业】**：具体的工作内容、项目挑战、办公室政治、考试压力、学术瓶颈。
    *   **【生活/情感】**：租房/买房的烦恼、恋爱/婚姻的甜蜜与争吵、原生家庭的羁绊、孤独感或归属感。
    *   **【经济/消费】**：具体的收入变化、物价感受、消费降级或升级、理财焦虑、房贷压力。
    *   **【时代/社会】**：新闻里在播什么？流行什么？大家在讨论什么？（如AI失业潮、养老金改革、新一轮疫情、局部战争等）。
3.  **细节为王**：不要说"同事"，要说"发际线后移的王组长"；不要说"吃得不好"，要说"连续吃了一周的打折预制菜外卖"。
4.  **字数要求**：每次剧情描述（description）请保持在**500-700字**之间，内容必须充实丰满。

**推演框架（第一性原理 + 戏剧法则）**：

1.  **时代洪流下的个人命运**：
    -   将宏观趋势（AI替代、经济周期、地缘政治）具体化为角色身边的事件。
    -   例如：不是说"经济下行"，而是"公司裁员名单贴在玻璃门上，你看到了熟悉的同事名字"。

2.  **人性弱点与挣扎**：
    -   根据MBTI和背景，让角色表现出人性的弱点（贪婪、恐惧、虚荣、懒惰）。
    -   **关键**：给出的选项中，不要全是理性的最优解，要包含**诱人的陷阱**或**情绪化的宣泄**。

3.  **随机性与命运感**：
    -   引入随机事件：突然的生病、意外的横财、久别重逢的故人、错过的末班车。
    -   好运和厄运交替出现，模拟真实的无常。

**时间推进**：
- 每次推进0.25-0.5年（根据模拟总时长${simulationYears}年灵活调整）。
- 关键节点（毕业、跳槽、结婚、买房、生病、裁员）请详细展开，放慢节奏。
- 当接近${profile.simulationEndYear}年时，准备收尾并将isGameOver设为true。

**特别提醒**：
- 请基于你的知识库（截至训练数据的最新信息）判断当前中国的宏观环境
- 如果某些数据不确定，基于合理推理而非臆测
- 优先考虑结构性趋势（人口、技术、制度）而非短期波动
- 尊重角色的性格（MBTI）、籍贯、家庭背景等个性化因素

**重要：虚构名称规则**（避免法律风险）：
- **禁止使用真实公司名称**：不要出现腾讯、阿里、字节、华为、比亚迪等真实企业
- **使用虚构但真实感的名称**：
  - 互联网公司：如"鹏图科技""云帆互联""星辰网络"
  - 制造业：如"华鼎精密""东方智造""天工重工"
  - 金融机构：如"中信银行"→"中泰银行"，"平安保险"→"安泰保险"
  - 政府机构：可用真实层级（如"市人社局""区教育局"），但具体地名可虚构
- **行业特征明显**：虚构名称应能体现行业属性（如"XX新能源""XX半导体""XX生物"）
- **避免影射**：不要用谐音或明显暗示真实公司的名称

**输出格式**：Strict JSON.
- phase: 时间节点
- description: 剧情
- options: 3-4个具体抉择(如"利用信息差套利","回归实体")
- isGameOver: 到达${profile.simulationEndYear}年或死亡时为true`;

  if (isJsonModeForOpenAI) {
    base += `\n\nSchema: ${JSON.stringify(scenarioSchemaStructure)}`;
  }

  return base;
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

  // 1. Get API Key
  // Prioritize config key, then env var (Vite uses import.meta.env)
  const apiKey = activeConfig?.apiKey || (import.meta as any).env.VITE_API_KEY || '';

  if (!apiKey && activeConfig?.provider === ModelProvider.GEMINI) {
    console.warn("No API Key found for Gemini. Please set VITE_API_KEY or configure in settings.");
  }

  const systemPrompt = getSystemInstruction(profile, activeConfig.provider !== ModelProvider.GEMINI);

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
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
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