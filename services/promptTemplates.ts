import { PlayerProfile } from "../types";

export interface PromptTemplate {
  id: string;
  name: string;
  description: string;
  template: string;
}

// 默认提示词模板
export const defaultTemplates: PromptTemplate[] = [
  {
    id: 'v1',
    name: '经典版',
    description: '注重中国社会现实约束和人之常情',
    template: `你是一个拥有**渊博知识,第一性原理驱动,同时有科学,技术,文学洞察力**和**社会学深度**的未来模拟引擎。你的任务不仅是推演{{startYear}}-{{endYear}}年（共{{years}}年）一位中国人的命运，更是要讲述一个**跌宕起伏、引人入胜、细节丰满**的人生故事。

**角色档案**：
{{profileSection}}

**模拟时间段**：
- 起始年份：{{startYear}}年
- 结束年份：{{endYear}}年
- 模拟时长：{{years}}年

**核心指令（Tone & Style）**：
1. **拒绝平铺直叙**：不要写成流水账。每一回合都是人生剧本的一幕。要有**画面感**、**情绪张力**和**细节描写**。
2. **全景式叙事**：每次剧情必须包含【职业/学业】【生活/情感】【经济/消费】【时代/社会】四个维度。
3. **细节为王**：不要说"同事"，要说"发际线后移的王组长"。
4. **字数要求**：每次剧情描述保持在500-700字。

**事件生成约束**：
1. **中国社会现实约束**：符合中国社会的实际运作方式（高校住宿制度、户籍制度等）
2. **人之常情约束**：符合普通人的心理和行为逻辑
3. **因果合理性约束**：事件必须有合理的前因后果
4. **阶层与资源约束**：严格遵守角色的家庭背景和经济条件

**时间推进**：每次推进0.25-0.5年，关键节点详细展开。

**虚构名称规则**：禁止使用真实公司名称，使用虚构但真实感的名称。

**输出格式**：Strict JSON，description必须分段（用\\n\\n分隔）。`
  },
  {
    id: 'v2',
    name: 'AI时代版',
    description: '基于物质-能量-信息三元论，强调AI冲击',
    template: `你是一个基于**第一性原理**的未来推演引擎。模拟{{startYear}}-{{endYear}}年（共{{years}}年）一位中国人在快速变革时代中的命运轨迹。

## 世界观框架

世界由**物质、能量、信息**三元素构成：
- **物质**：具有唯一性，不可无限复制，改造需要时间和能量
- **能量**：驱动物质转化和信息处理的基础
- **信息**：数字化后可无限复制分发，边际成本趋近于零

**AI革命的本质**：
- AI是信息处理能力的指数级放大器
- 数字化工作（编程、设计、文案）最先被AI替代或增强
- 物理世界改造相对滞后，但机器人+AI正在加速

## 角色档案
{{profileSection}}

## 模拟时间段
- 起始：{{startYear}}年 | 结束：{{endYear}}年 | 时长：{{years}}年

## 推演原则

### 稀缺性原则
- 时间、注意力、物质稀缺 vs 信息过剩
- 筛选和应用信息的能力成为新的稀缺资源

### AI冲击差异化
- **高危**：初级程序员、翻译、客服、基础设计
- **转型**：需要学会与AI协作
- **相对安全**：需要物理在场或深度人际信任的工作

### 多智能体博弈
- 内卷本质：当大家都提升，优势就消失
- 信息差套利：早期采用者获得超额收益，但窗口期越来越短

### 中国社会现实
- 高校学生基本住校，体制内仍是稳定代名词
- 婚恋市场：房子、车子、彩礼仍是重要筹码

## 叙事要求
画面感、情绪张力、细节为王、时代印记、分段输出（\\n\\n分隔）

## 时间推进
每次0.25-0.5年，关键节点详细展开，接近{{endYear}}年时isGameOver=true

**虚构名称**：禁止真实公司名，用虚构名称。

**输出**：Strict JSON，description必须分段。`
  }
];

// 生成角色档案部分
const generateProfileSection = (profile: PlayerProfile): string => {
  const mbtiType = `${profile.mbti.energySource}${profile.mbti.perception}${profile.mbti.decision}${profile.mbti.lifestyle}`;
  const mbtiNames: Record<string, string> = {
    'INTJ': '建筑师', 'INTP': '逻辑学家', 'ENTJ': '指挥官', 'ENTP': '辩论家',
    'INFJ': '提倡者', 'INFP': '调停者', 'ENFJ': '主人公', 'ENFP': '竞选者',
    'ISTJ': '物流师', 'ISFJ': '守卫者', 'ESTJ': '总经理', 'ESFJ': '执政官',
    'ISTP': '鉴赏家', 'ISFP': '探险家', 'ESTP': '企业家', 'ESFP': '表演者'
  };

  return `- 姓名：${profile.name}
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
- 特长技能：${profile.skills}${profile.customBio ? `\n- 特别备注：${profile.customBio}` : ''}`;
};

// JSON Schema 结构
const scenarioSchemaStructure = {
  type: "object",
  properties: {
    phase: { type: "string", description: "Current Time and Status" },
    description: { type: "string", description: "Detailed narrative" },
    feedback: { type: "string", description: "Consequence of previous action" },
    isGameOver: { type: "boolean", description: "True at end" },
    options: {
      type: "array",
      items: {
        type: "object",
        properties: {
          id: { type: "string" },
          text: { type: "string" },
        },
        required: ["id", "text"],
      },
    },
  },
  required: ["phase", "description", "options", "isGameOver"],
};

// 根据模板和角色生成最终提示词
export const generatePromptFromTemplate = (
  template: string,
  profile: PlayerProfile,
  isJsonModeForOpenAI = false
): string => {
  const years = profile.simulationEndYear - profile.simulationStartYear;
  const profileSection = generateProfileSection(profile);

  let result = template
    .replace(/\{\{startYear\}\}/g, String(profile.simulationStartYear))
    .replace(/\{\{endYear\}\}/g, String(profile.simulationEndYear))
    .replace(/\{\{years\}\}/g, String(years))
    .replace(/\{\{profileSection\}\}/g, profileSection);

  if (isJsonModeForOpenAI) {
    result += `\n\nSchema: ${JSON.stringify(scenarioSchemaStructure)}`;
  }

  return result;
};

// 获取保存的自定义模板
export const getSavedTemplates = (): PromptTemplate[] => {
  try {
    const saved = localStorage.getItem('life_sim_custom_templates');
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Failed to load custom templates');
  }
  return [];
};

// 保存自定义模板
export const saveCustomTemplate = (template: PromptTemplate): void => {
  const existing = getSavedTemplates();
  const index = existing.findIndex(t => t.id === template.id);
  if (index >= 0) {
    existing[index] = template;
  } else {
    existing.push(template);
  }
  localStorage.setItem('life_sim_custom_templates', JSON.stringify(existing));
};

// 删除自定义模板
export const deleteCustomTemplate = (id: string): void => {
  const existing = getSavedTemplates().filter(t => t.id !== id);
  localStorage.setItem('life_sim_custom_templates', JSON.stringify(existing));
};

// 获取所有模板（默认 + 自定义）
export const getAllTemplates = (): PromptTemplate[] => {
  return [...defaultTemplates, ...getSavedTemplates()];
};
