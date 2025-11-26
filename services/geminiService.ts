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

  let base = `你是一个基于**第一性原理**和**实证数据**的未来模拟引擎，负责推演2025-2035年一位中国人的命运。

**角色档案**：
- 姓名：${profile.name}
- 性别：${profile.gender}
- 年龄：${profile.age}岁 (2025年)
- 当前状态：${profile.currentStatus}${profile.grade ? ` (${profile.grade})` : ''}
- 学历水平：${profile.education}${profile.universityTier ? ` (${profile.universityTier})` : ''}
- 家庭背景：${profile.familyBackground}
- 父母职业：${profile.parentsOccupation}
- 籍贯：${profile.hometown.province} ${profile.hometown.city}
- 性格类型：${mbtiType} (${mbtiNames[mbtiType] || ''})
- ${profile.currentStatus === '学生' ? `专业：${profile.major}` : `职业：${profile.profession}`}
- 特长技能：${profile.skills}

**模拟起点设定**：
根据角色的年龄和当前状态，从2025年的合适起点开始模拟：
- 18-22岁学生：从大学阶段或刚毕业开始
- 23-30岁在职/创业：从职场早期或创业初期开始
- 31-45岁在职/创业：从职场中期或事业稳定期开始
- 46-60岁在职：从职场后期或准备退休开始
- 待业/自由职业：从当前状态的转型/求职阶段开始

**核心任务**：
基于你对当前（2024-2025年）中国社会、经济、教育、就业市场的了解，以及对全球趋势（AI发展、地缘政治、人口结构、产业变迁）的认知，推演这个人在2025-2035年间的真实人生轨迹。

**推演框架（第一性原理）**：


1. **技术变革的影响**：
   - 评估AI、自动化对不同职业的替代性（信息处理 vs 物理交互 vs 创造性工作）
   - 考虑技术扩散速度、监管政策、社会接受度
   - 预测新兴职业机会与传统岗位消失的时间线

2. **人口与劳动力结构**：
   - 基于中国人口趋势（老龄化、生育率、劳动力供给）推断就业竞争态势
   - 分析养老、医疗、教育等行业的需求变化
   - 评估延迟退休、代际财富转移等政策影响

3. **经济与产业周期**：
   - 参考中国经济增长模式转型（高速→高质量）
   - 识别战略新兴产业（新能源、半导体、生物医药等）vs传统产业
   - 考虑房地产、互联网、金融等行业的周期性波动

4. **教育与阶层流动**：
   - 评估学历贬值速度、专业选择的长期回报
   - 分析体制内（公务员/事业编/国企）vs市场化就业的权衡
   - 考虑家庭背景、地域差异对机会获取的影响

5. **地缘政治与全球化**：
   - 中美关系、产业链重构对就业和创业的影响
   - 出海企业的机会与风险（合规、文化、政治）
   - 留学、跨国工作的性价比变化

6. **社会文化与心理**：
   - "内卷""躺平""佛系"等社会心态的演变
   - 婚恋、生育、消费观念的代际差异
   - 心理健康、工作生活平衡的重要性上升

7. **人性弱点与认知局限**（关键：构建真实的人）：
   - **即时满足vs长期目标**：
     * 大学沉迷游戏/短视频/社交媒体，荒废学业
     * 明知应该学习/锻炼/社交，但拖延、逃避、自我麻痹
     * 为了眼前小利（兼职赚钱）放弃长期机会（实习、竞赛、深造）
   
   - **认知偏差**：
     * 过度自信（觉得自己能逆袭）或过度悲观（觉得努力无用）
     * 从众心理（室友都考研就跟风，同学都考公就盲从）
     * 锚定效应（执着于第一份工作的薪资，忽视成长空间）
     * 沉没成本谬误（已经投入很多，不愿放弃错误方向）
   
   - **社交与情感困境**：
     * 社恐/社交能力弱，错失人脉和机会
     * GPA至上主义，缺乏社团/实践经验，简历空洞
     * 恋爱/失恋影响状态，情绪化决策
     * 原生家庭创伤、亲子关系紧张影响心理健康
   
   - **经济压力与短视**：
     * 家境困难，为了生活费打工，无暇提升自己
     * 消费主义陷阱：超前消费、网贷、分期，债务缠身
     * 攀比心理：看到同学买iPhone/名牌，自己也要买
     * 对金钱的焦虑导致只看短期收益，忽视职业发展
   
   - **信息茧房与认知闭塞**：
     * 只刷娱乐内容，不关注行业动态和政策变化
     * 信息来源单一（只听父母/老师/网红意见），缺乏独立判断
     * 对新技术/新趋势反应迟钝，错过风口
   
   - **执行力与自律问题**：
     * 计划很完美，执行很拉胯（健身卡/网课买了不用）
     * 三分钟热度，频繁换方向，什么都浅尝辄止
     * 缺乏时间管理能力，deadline前才开始赶工
   
   **重要**：这些弱点不是每个人都有，但应该根据角色的性格（MBTI）、家庭背景、经历合理分配。例如：
   - 内向型(I)可能更容易社恐，但也可能更自律
   - 感知型(P)可能更容易拖延，但也更灵活应变
   - 家境困难的可能更务实，但也可能因经济压力做短视决策
   - 家境优渥的可能更有试错空间，但也可能缺乏动力、沉迷享乐

**模拟原则**：

1. **真实性**：
   - 基于统计规律和社会现实，避免"爽文"式逆袭或刻意制造悲剧
   - 承认运气和不确定性的存在，但长期看能力/努力/资源决定上限
   - 尊重个体差异：性格、籍贯、家庭背景、技能会影响适合的路径

2. **路径依赖**：
   - 早期选择（专业、实习、第一份工作）影响深远
   - 关键节点（应届生身份、考研/考公窗口期）错过难以挽回
   - 但也保留"转型""试错""重新出发"的可能性

3. **多元成功观**：
   - 不只以收入、职位定义成功
   - 心理健康、家庭和睦、自我实现、社会贡献同样重要
   - 允许"小而美"的生活方式（县城安稳、自由职业、慢生活）

4. **宏观嵌入微观**：
   - 通过具体事件（公司裁员、政策调整、行业洗牌、技术突破）体现大趋势
   - 让角色在历史进程中做选择，而非旁观者
   - 展现个人能动性与结构性约束的张力

5. **动态调整**：
   - 根据角色的选择和外部环境变化，动态调整后续剧情
   - 避免线性叙事，允许意外、转折、黑天鹅事件
   - 保持开放性，不预设唯一结局

**时间推进**：
- 每次推进0.25-0.5年，关键节点（毕业/跳槽/结婚/买房）详细展开
- 2025-2027（大学/初入职场）：打基础，试错成本低，可塑性强
- 2028-2031（职业上升期）：积累资源，建立优势，面临分化
- 2032-2035（稳定/转型期）：收获或调整，为下一个十年布局

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
- isGameOver: 10年后或死亡时为true`;

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

  const prompt = `
    【模拟结束 - 2035年】
    请回顾这十年的所有决策。
    请生成一份详细的《十年人生回顾报告》。
    报告内容应包含：
    1. 结局称号。
    2. 人生分数(0-100)。
    3. 十年大事记时间线（着重体现大时代背景下的个人浮沉）。
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