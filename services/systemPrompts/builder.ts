/**
 * Prompt Builder
 * 组装模板 + profile + country + language 生成最终提示词
 */

import { PlayerProfile } from '../../types';
import { SupportedLanguage, SupportedCountry } from '../../src/i18n/types';
import { MBTI_NAMES, SCENARIO_SCHEMA_STRUCTURE } from './types';

/**
 * 获取语言指令
 */
export function getLanguageInstruction(language: SupportedLanguage, country: SupportedCountry): string {
  // 中国背景 + 英文输出
  if (country === 'CN' && language === 'en-US') {
    return `**IMPORTANT: Output Language**
- You MUST output ALL text in English
- This includes: phase, description, feedback, and all option texts
- The simulation is about Chinese society, but the output language is English
- Use English names for Chinese concepts (e.g., "gaokao" for 高考, "hukou" for 户籍)`;
  }
  
  // 美国背景 + 中文输出
  if (country === 'US' && language === 'zh-CN') {
    return `**重要：输出语言**
- 你必须使用中文输出所有内容
- 包括：phase、description、feedback 和所有选项文本
- 模拟的是美国社会背景，但输出语言是中文
- 美国特有概念请使用中文解释（如 "学生贷款"、"401k退休金"）`;
  }
  
  // 中国背景 + 中文输出
  if (country === 'CN' && language === 'zh-CN') {
    return `**输出语言**
- 请使用中文输出所有内容
- 包括：phase、description、feedback 和所有选项文本`;
  }
  
  // 美国背景 + 英文输出
  return `**Output Language**
- Output ALL text in English
- This includes: phase, description, feedback, and all option texts`;
}

/**
 * 构建角色档案部分
 */
export function buildProfileSection(profile: PlayerProfile, language: SupportedLanguage): string {
  const mbtiType = `${profile.mbti.energySource}${profile.mbti.perception}${profile.mbti.decision}${profile.mbti.lifestyle}`;
  const mbtiName = MBTI_NAMES[language][mbtiType] || mbtiType;
  const simulationYears = profile.simulationEndYear - profile.simulationStartYear;

  if (language === 'en-US') {
    return `## Character Profile

- Name: ${profile.name}
- Gender: ${profile.gender}
- Age: ${profile.age} years old (in ${profile.simulationStartYear})
- Current Status: ${profile.currentStatus}${profile.grade ? ` (${profile.grade})` : ''}
- Education Level: ${profile.education}${profile.universityTier ? ` (${profile.universityTier})` : ''}
- Family Background: ${profile.familyBackground}
- Parents' Occupation: ${profile.parentsOccupation}
- Hometown: ${profile.hometown.province} ${profile.hometown.city}
- Current Location: ${profile.currentLocation.province} ${profile.currentLocation.city}
- Personality Type: ${mbtiType} (${mbtiName})
- ${profile.currentStatus === '学生' || profile.currentStatus === 'Student' ? `Major: ${profile.major}` : `Profession: ${profile.profession}`}
- Skills: ${profile.skills}
${profile.customBio ? `\n**Special Notes/Settings**:\n${profile.customBio}\n` : ''}

## Simulation Period

- Start Year: ${profile.simulationStartYear}
- End Year: ${profile.simulationEndYear}
- Duration: ${simulationYears} years`;
  }

  return `## 角色档案

- 姓名：${profile.name}
- 性别：${profile.gender}
- 年龄：${profile.age}岁（${profile.simulationStartYear}年）
- 当前状态：${profile.currentStatus}${profile.grade ? ` (${profile.grade})` : ''}
- 学历水平：${profile.education}${profile.universityTier ? ` (${profile.universityTier})` : ''}
- 家庭背景：${profile.familyBackground}
- 父母职业：${profile.parentsOccupation}
- 籍贯：${profile.hometown.province} ${profile.hometown.city}
- 现居地：${profile.currentLocation.province} ${profile.currentLocation.city}
- 性格类型：${mbtiType} (${mbtiName})
- ${profile.currentStatus === '学生' ? `专业：${profile.major}` : `职业：${profile.profession}`}
- 特长技能：${profile.skills}
${profile.customBio ? `\n**用户特别备注/设定**：\n${profile.customBio}\n` : ''}

## 模拟时间段

- 起始年份：${profile.simulationStartYear}年
- 结束年份：${profile.simulationEndYear}年
- 模拟时长：${simulationYears}年`;
}

/**
 * 获取国家背景内容
 */
export function getCountryContext(country: SupportedCountry, language: SupportedLanguage): string {
  if (country === 'CN') {
    if (language === 'en-US') {
      return `## Chinese Society Context

### Education System
- Gaokao (高考): The national college entrance examination that determines university admission
- University Tiers: Top 2 (Tsinghua/Peking), C9 League, 985/211 Projects, Regular Universities
- Graduate School: Increasingly competitive, many pursue master's degrees for better job prospects

### Job Market
- Tech Industry: BAT and emerging giants, 996 work culture
- Civil Service (公务员): Highly sought after for stability, extremely competitive exams
- State-Owned Enterprises: Good benefits, slower pace, requires connections
- Gig Economy: Food delivery, ride-sharing becoming common fallback options

### Social Phenomena
- Housing Pressure: Sky-high prices in tier-1 cities, mortgage burden
- Marriage Market: Bride price (彩礼), matchmaking pressure from parents
- Hukou System: Restricts access to local education and healthcare
- Involution (内卷): Intense competition leading to diminishing returns
- Lying Flat (躺平): Youth movement rejecting rat race

### Economic Reality
- Tier-1 Cities: Beijing, Shanghai, Guangzhou, Shenzhen - high salaries but higher costs
- New First-Tier: Hangzhou, Chengdu, Wuhan - emerging opportunities
- Tier-2/3 Cities: Lower costs, fewer opportunities, closer to family`;
    }
    
    return `## 中国社会背景

### 教育体系
- 高考：决定命运的全国统一考试
- 高校层次：清北 > C9/华五 > 985/211 > 普通一本/二本 > 大专
- 考研热：学历贬值，越来越多人选择读研
- 留学：富裕家庭的选择，海归面临水土不服

### 就业市场
- 互联网大厂：高薪但996，35岁危机
- 体制内：公务员、国企、事业单位，稳定但竞争激烈
- 私企：薪资灵活但缺乏保障
- 灵活就业：外卖、网约车成为兜底选择

### 社会现象
- 房价压力：一线城市天价，房贷压力山大
- 婚恋市场：彩礼、房子、车子，父母催婚
- 户籍制度：限制教育、医疗资源获取
- 内卷：激烈竞争，边际收益递减
- 躺平：年轻人对抗内卷的方式
- 独生子女：赡养父母的压力

### 经济现实
- 一线城市：北上广深，机会多但成本高
- 新一线：杭州、成都、武汉，新兴机会
- 二三线：成本低，机会少，离家近`;
  }
  
  // USA
  if (language === 'zh-CN') {
    return `## 美国社会背景

### 教育体系
- SAT/ACT：大学入学标准化考试
- 高校层次：常春藤联盟 > Top 20 > Top 50 > 州立大学 > 社区学院
- 学生贷款：沉重的债务负担，平均毕业生负债数万美元
- 研究生院：MBA、法学院、医学院是职业跳板

### 就业市场
- 科技行业：硅谷、西雅图、奥斯汀，高薪但竞争激烈
- 华尔街：金融、投行、对冲基金，高压高薪
- 医疗行业：稳定需求，但需要长期培训
- 零工经济：Uber、DoorDash、自由职业
- 远程工作：疫情后普及，改变工作方式

### 社会现象
- 美国梦：努力工作就能成功的信念，但现实复杂
- 学生债务危机：影响购房、结婚、生育决策
- 医疗保险：与工作绑定，失业意味着失去保障
- 政治极化：红州蓝州，社会撕裂
- 心理健康：焦虑、抑郁普遍，治疗费用高昂

### 经济现实
- 沿海城市：纽约、旧金山、洛杉矶，机会多但生活成本极高
- 中西部：生活成本低，但机会相对较少
- 阳光地带：德州、佛罗里达，新兴机会，税收优惠
- 401(k)：退休储蓄，雇主匹配是重要福利`;
  }
  
  return `## American Society Context

### Education System
- SAT/ACT: Standardized college entrance exams
- University Tiers: Ivy League > Top 20 > Top 50 > State Universities > Community Colleges
- Student Loans: Heavy debt burden, average graduate owes tens of thousands
- Graduate School: MBA, Law School, Medical School as career springboards

### Job Market
- Tech Industry: Silicon Valley, Seattle, Austin - high pay but intense competition
- Wall Street: Finance, investment banking, hedge funds - high pressure, high reward
- Healthcare: Stable demand but requires extensive training
- Gig Economy: Uber, DoorDash, freelancing as fallback options
- Remote Work: Post-pandemic normalization, changing work patterns

### Social Phenomena
- The American Dream: Belief that hard work leads to success, but reality is complex
- Student Debt Crisis: Affects decisions on housing, marriage, having children
- Healthcare Insurance: Tied to employment, losing job means losing coverage
- Political Polarization: Red states vs blue states, social division
- Mental Health: Anxiety and depression common, treatment expensive

### Economic Reality
- Coastal Cities: NYC, SF, LA - many opportunities but extremely high cost of living
- Midwest: Lower cost of living but fewer opportunities
- Sun Belt: Texas, Florida - emerging opportunities, tax advantages
- 401(k): Retirement savings, employer matching is crucial benefit`;
}


/**
 * 构建完整的系统提示词
 */
export interface BuildPromptOptions {
  template: string;
  profile: PlayerProfile;
  language: SupportedLanguage;
  country: SupportedCountry;
  isJsonModeForOpenAI?: boolean;
}

export function buildPrompt(options: BuildPromptOptions): string {
  const { template, profile, language, country, isJsonModeForOpenAI = false } = options;
  
  const simulationYears = profile.simulationEndYear - profile.simulationStartYear;
  
  // 替换变量
  let result = template
    .replace(/\{\{startYear\}\}/g, String(profile.simulationStartYear))
    .replace(/\{\{endYear\}\}/g, String(profile.simulationEndYear))
    .replace(/\{\{years\}\}/g, String(simulationYears))
    .replace(/\{\{languageInstruction\}\}/g, getLanguageInstruction(language, country))
    .replace(/\{\{profileSection\}\}/g, buildProfileSection(profile, language))
    .replace(/\{\{countryContext\}\}/g, getCountryContext(country, language));
  
  // 添加 JSON Schema（如果需要）
  if (isJsonModeForOpenAI) {
    result += `\n\nSchema: ${JSON.stringify(SCENARIO_SCHEMA_STRUCTURE)}`;
  }
  
  return result;
}

/**
 * 预览模板（不替换变量，只显示占位符）
 */
export function previewTemplate(template: string): string {
  return template;
}

/**
 * 获取模板中使用的变量列表
 */
export function getTemplateVariables(): string[] {
  return [
    '{{startYear}}',
    '{{endYear}}',
    '{{years}}',
    '{{languageInstruction}}',
    '{{profileSection}}',
    '{{countryContext}}'
  ];
}
