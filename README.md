# 十年人生模拟器 (2025-2035) - 项目技术文档

<div align="center">
  <img src="assets/logo.png" alt="十年人生模拟器 Logo" width="200"/>
</div>

## 📖 项目概述

### 项目简介
一个基于 AI 大语言模型驱动的互动式人生模拟游戏，通过深度的社会洞察和第一性原理推演，模拟中国大学生在 2025-2035 年间的真实人生轨迹。用户通过一系列关键决策，体验不同选择带来的人生结果，最终获得个性化的十年人生评价报告。

### 核心价值
- **教育意义**：帮助年轻人思考未来规划、职业选择和人生决策
- **社会洞察**：基于真实的社会趋势（AI 发展、人口结构、经济转型、地缘政治）进行推演
- **个性化体验**：根据用户的教育背景、家庭条件、性格特质生成定制化剧情
- **技术创新**：展示 AI 在互动叙事和决策模拟领域的应用潜力

### 技术特点
- 支持多个主流 AI 提供商（Gemini、DeepSeek、Qwen、GLM、OpenAI 等）
- 完整的游戏状态管理和本地持久化
- 响应式设计，支持桌面和移动端
- 类型安全的 TypeScript 实现
- 优雅的错误处理和重试机制

---

## 🏗️ 系统架构

下图展示了十年人生模拟器的完整系统架构，包括用户界面、组件层、服务层、AI 提供商集成以及数据持久化等核心模块：

<div align="center">
  <img src="assets/project-architecture.svg" alt="系统架构图" width="100%"/>
</div>

**架构说明**：
- **用户层**：用户通过 Web 界面进行操作和输入
- **应用层**：`App.tsx` 作为主应用，负责状态管理和路由控制
- **组件层**：可复用的 UI 组件（按钮、场景卡片等）
- **服务层**：`geminiService.ts` 封装了与 AI 的交互逻辑
- **AI 提供商**：支持多个 AI 提供商（Gemini、DeepSeek、Qwen 等）
- **数据层**：使用 LocalStorage 进行游戏状态和配置的持久化
- **数据处理**：JSON 清理、重试机制和错误处理
- **状态机**：管理游戏的各个阶段（角色创建、游戏进行、加载、结束）

---

## 🎮 核心功能模块

### 1. 角色创建系统

#### 功能描述
用户创建个性化的角色档案，这些信息将影响 AI 生成的剧情走向。

#### 数据字段

**基础信息**
- 姓名（name）: 字符串
- 性别（gender）: 男/女
- 籍贯（hometown）: 字符串（到市级）

**教育背景**
- 院校层次（scoreTier）: 
  - Top 2（清北）
  - C9/华五
  - 985/211 重点大学
  - 普通一本/二本
  - 大专/职业院校

**家庭背景**
- 家庭经济状况（familyBackground）:
  - 富裕（家产丰厚/有矿）
  - 中产（衣食无忧/城市土著）
  - 工薪（普通家庭）
  - 贫困（寒门学子）
- 父母职业（parentsOccupation）:
  - 务农、小生意、白领、公务员、管理层、老板、专业人士、其他

**性格测试（MBTI）**
- 能量来源: E（外向）/ I（内向）
- 认知方式: S（实感）/ N（直觉）
- 决策方式: T（思考）/ F（情感）
- 生活方式: J（判断）/ P（感知）

**能力与兴趣**
- 专业/兴趣方向（majorInterest）: 字符串
- 特长与技能（skills）: 字符串

#### 技术实现
- 使用 React State 管理表单数据
- 实时显示 MBTI 类型和对应人格名称
- 表单验证：必填字段检查
- 自动聚焦到姓名输入框

---

### 2. AI 配置系统

#### 支持的 AI 提供商

| 提供商 | 默认模型 | Base URL | 特点 |
|--------|----------|----------|------|
| **Google Gemini** | gemini-2.5-flash | SDK 直连 | 推荐，支持环境变量 |
| **DeepSeek** | deepseek-chat | https://api.deepseek.com | 深度求索 |
| **Moonshot (Kimi)** | moonshot-v1-8k | https://api.moonshot.cn/v1 | 月之暗面 |
| **Qwen (阿里云)** | qwen-plus | https://dashscope.aliyuncs.com/compatible-mode/v1 | 通义千问 |
| **GLM (智谱)** | glm-4-flash | https://open.bigmodel.cn/api/paas/v4 | 智谱 AI |
| **OpenAI** | gpt-4o-mini | https://api.openai.com/v1 | ChatGPT |
| **Custom** | 自定义 | 自定义 | 自定义提供商 |

#### 配置管理
- **本地存储**: 配置保存在 `localStorage` 中（key: `life_sim_ai_config`）
- **预设配置**: 每个提供商有预设的 Base URL 和模型名称
- **配置界面**: 模态弹窗，支持动态切换提供商

#### 技术实现
```typescript
interface AIConfig {
  provider: ModelProvider;      // 提供商类型
  apiKey: string;               // API 密钥
  baseUrl: string;              // API 基础 URL
  modelName: string;            // 模型名称
}
```

---

### 3. 游戏状态管理

#### 游戏状态枚举
```typescript
enum GameState {
  INTRO = 'INTRO',              // 角色创建
  PLAYING = 'PLAYING',          // 游戏进行中
  LOADING_TURN = 'LOADING_TURN', // 加载下一回合
  GAME_OVER = 'GAME_OVER',      // 游戏结束
  ERROR = 'ERROR'               // 错误状态
}
```

#### 状态持久化
- **自动保存**: 游戏状态变化时自动保存到 `localStorage`
- **断点续玩**: 刷新页面后自动恢复进度
- **存储内容**:
  - 当前游戏状态
  - 玩家档案
  - 当前场景
  - 最终评价
  - 历史记录

#### 存储键名
- `life_sim_ai_config`: AI 配置
- `life_sim_game_state`: 游戏状态

---

### 4. AI 剧情生成系统

#### 系统提示词设计

**推演框架（基于第一性原理）**

1. **技术变革影响**: AI、自动化对职业的替代性
2. **人口与劳动力**: 老龄化、生育率、就业竞争
3. **经济与产业周期**: 增长模式转型、新兴产业
4. **教育与阶层流动**: 学历贬值、体制内 vs 市场化
5. **地缘政治**: 中美关系、产业链重构
6. **社会文化**: 内卷、躺平、婚恋观念
7. **人性弱点**: 即时满足、认知偏差、社交困境、执行力问题

**模拟原则**
- 真实性：基于统计规律，避免"爽文"式逆袭
- 路径依赖：早期选择影响深远
- 多元成功观：不只以收入定义成功
- 宏观嵌入微观：通过具体事件体现大趋势
- 动态调整：根据选择和环境变化调整剧情

**虚构名称规则**
- 禁止使用真实公司名称（避免法律风险）
- 使用虚构但真实感的名称
- 行业特征明显

#### 场景生成流程

```
用户创建角色 
    ↓
调用 initializeGame(profile)
    ↓
AI 生成初始场景（2025年，大学阶段）
    ↓
用户选择选项
    ↓
调用 nextTurn(choiceText)
    ↓
AI 生成下一场景（时间推进 0.5-2 年）
    ↓
重复直到 isGameOver = true
    ↓
调用 getFinalEvaluation()
    ↓
生成十年人生报告
```

#### 场景数据结构
```typescript
interface GameScenario {
  phase: string;                // 时间节点（如"2026年春季 - 大一下学期"）
  description: string;          // 详细的情境描述
  options: GameOption[];        // 3-4 个选择
  feedback?: string;            // 对上一次选择的反馈
  isGameOver: boolean;          // 是否游戏结束
  gameOverReason?: string;      // 结束原因
}
```

---

### 5. 错误处理与重试机制

#### 重试策略

- **自动重试**: 失败后自动重试 3 次
- **指数退避**: 每次重试延迟时间递增（2s, 4s, 6s）
- **错误提取**: 提取有用的错误信息展示给用户

```typescript
const withRetry = async <T>(
  fn: () => Promise<T>, 
  retries = 3, 
  delay = 2000
): Promise<T>
```

#### JSON 清理机制
AI 返回的内容可能包含 Markdown 代码块或额外文本，需要清理：

```typescript
const cleanJson = (text: string): string => {
  // 提取第一个 '{' 到最后一个 '}' 之间的内容
  const firstBrace = text.indexOf('{');
  const lastBrace = text.lastIndexOf('}');
  return text.substring(firstBrace, lastBrace + 1);
}
```

#### 错误边界
使用 React ErrorBoundary 捕获组件崩溃：
- 显示友好的错误页面
- 提供重新加载按钮
- 防止整个应用崩溃

---

### 6. 历史记录系统

#### 功能描述
记录用户在游戏中的每一次选择和结果，形成完整的人生履历。

#### 数据结构
```typescript
interface HistoryItem {
  phase: string;           // 阶段（如"2026年春季"）
  description: string;     // 情境描述
  choiceText: string;      // 用户的选择
  feedback?: string;       // AI 的反馈
  timestamp: number;       // 时间戳
}
```

#### 展示方式
- 时间轴样式的垂直布局
- 每个节点显示阶段、情境、选择、反馈
- 支持滚动查看完整历史

---

### 7. 最终评价系统

#### 评价维度

```typescript
interface FinalEvaluation {
  score: number;           // 人生满意度评分（0-100）
  title: string;           // 结局称号（如"A7 公务员"、"全球游民"）
  summary: string;         // 深度分析十年路径
  timeline: string;        // 十年大事记（关键里程碑）
  advice: string;          // 给年轻人的建议
}
```

#### 评分颜色
- 80-100 分: 绿色（成功）
- 60-79 分: 琥珀色（中等）
- 0-59 分: 红色（需改进）

#### 导出功能
- 生成 Markdown 格式的完整报告
- 包含个人档案、人生履历、最终回顾、人生建议
- 文件名格式: `{姓名}_人生模拟_{时间戳}.md`

---



## 📊 数据流图

### 游戏初始化流程
```
用户填写角色信息
    ↓
点击"开始模拟人生"
    ↓
检查 AI 配置是否完整
    ↓
调用 initializeGame(profile)
    ↓
构建系统提示词（包含角色信息）
    ↓
创建 AI 会话（Gemini 或 OpenAI）
    ↓
发送初始化消息
    ↓
AI 返回 JSON 格式的初始场景
    ↓
清理和解析 JSON
    ↓
更新游戏状态为 PLAYING
    ↓
渲染场景卡片
```

### 回合推进流程
```
用户点击选项
    ↓
调用 nextTurn(choiceText)
    ↓
发送用户选择到 AI
    ↓
AI 基于历史和选择生成下一场景
    ↓
返回 JSON 格式的场景数据
    ↓
清理和解析 JSON
    ↓
记录到历史数组
    ↓
检查 isGameOver 标志
    ↓
如果游戏结束 → 调用 getFinalEvaluation()
如果继续 → 渲染新场景
```

### 最终评价流程

```
游戏结束（isGameOver = true）
    ↓
更新状态为 LOADING_TURN
    ↓
调用 getFinalEvaluation()
    ↓
发送评价请求到 AI
    ↓
AI 回顾所有历史决策
    ↓
生成评分、称号、总结、时间线、建议
    ↓
返回 JSON 格式的评价数据
    ↓
清理和解析 JSON
    ↓
更新状态为 GAME_OVER
    ↓
渲染最终报告页面
```

---

## 🚀 部署与运行

### 开发环境

#### 前置要求
- Node.js 16+ 
- npm 或 yarn

#### 安装步骤
```bash
# 1. 克隆项目
git clone <repository-url>
cd life-simulator

# 2. 安装依赖
npm install

# 3. 配置环境变量
# 编辑 .env.local 文件
GEMINI_API_KEY=your_actual_api_key_here

# 4. 启动开发服务器
npm run dev

# 5. 访问应用
# 浏览器打开 http://localhost:3000
```

### 生产构建

```bash
# 构建生产版本
npm run build

# 预览生产构建
npm run preview
```

构建产物位于 `dist/` 目录。

---

## 🔐 安全考虑

### API Key 管理
- **客户端存储**: API Key 存储在浏览器 localStorage 中

### 数据隐私
- **本地存储**: 所有游戏数据仅存储在用户浏览器中
- **无服务器**: 不收集或上传用户数据
- **AI 提供商**: 用户输入会发送到选择的 AI 提供商

### 内容安全
- **虚构名称**: 避免使用真实公司名称
- **敏感话题**: AI 提示词中包含内容审查指导
- **用户输入**: 前端验证，防止注入攻击

---

## 📖 使用指南

### 用户操作流程

#### 1. 首次使用
1. 打开应用，进入角色创建界面
2. 点击右上角设置按钮，配置 AI 提供商和 API Key
3. 填写个人信息（姓名、性别、籍贯等）
4. 选择教育背景和家庭背景
5. 完成 MBTI 性格测试
6. 填写专业兴趣和特长技能
7. 点击"开始模拟人生"

#### 2. 游戏进行
1. 阅读当前场景描述
2. 查看 AI 对上一次选择的反馈
3. 从 3-4 个选项中选择一个
4. 等待 AI 生成下一场景
5. 重复步骤 1-4，直到游戏结束

#### 3. 查看结果
1. 游戏结束后自动显示最终报告
2. 查看人生满意度评分
3. 阅读结局称号和总结
4. 查看十年轨迹时间线
5. 阅读给年轻人的建议
6. 可选：导出完整报告或重新开始

#### 4. 其他功能
- **查看履历**: 点击顶部"人生履历"按钮
- **重启游戏**: 点击"重启人生"按钮
- **修改配置**: 随时点击设置按钮修改 AI 配置
- **清除存档**: 在角色创建界面点击"清除存档"

---

## 📞 技术支持

### 常见问题

**Q: AI 返回错误或无响应？**
A: 检查 API Key 是否正确，网络是否畅通，尝试切换其他 AI 提供商。

**Q: 游戏进度丢失？**
A: 检查浏览器是否禁用了 localStorage，避免使用无痕模式。

**Q: 移动端显示异常？**
A: 确保使用现代浏览器（Chrome、Safari、Firefox 最新版）。

**Q: 如何获取 API Key？**
A: 访问对应 AI 提供商的官网注册并获取 API Key。

### 开发者联系方式
- GitHub Issues: [项目仓库]
- Email: [mymcywxf@mail.ustc.edu.cn]
- 文档: [在线文档地址]

---

## 📄 许可证

[到时候填写]

---

## 🙏 致谢

感谢以下技术和服务：
- Google Gemini AI
- React 团队
- Vite 团队
- Tailwind CSS
- 所有开源贡献者

---

**文档版本**: v1.0  
**最后更新**: 2025-11-25  
**适用项目版本**: 0.0.0
