# 十年人生模拟器 (2025-2035) - 项目技术文档

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

## 🏗️ 技术架构

### 技术栈

#### 前端框架
- **React 19.2.0**: 最新版本的 React，使用函数组件和 Hooks
- **TypeScript 5.8.2**: 提供完整的类型安全
- **Vite 6.2.0**: 现代化的构建工具，快速的开发体验

#### 样式方案
- **Tailwind CSS**: 通过 CDN 引入，实用优先的 CSS 框架
- **自定义主题**: 学术风格的深色主题（academic 色系）
- **Google Fonts**: Merriweather（衬线字体）+ Inter（无衬线字体）

#### AI 集成
- **@google/genai 1.30.0**: Google Gemini SDK
- **OpenAI Compatible API**: 支持多个兼容 OpenAI 接口的 AI 提供商

### 项目结构

```
十年人生模拟器/
├── components/                 # React 组件目录
│   ├── Button.tsx             # 通用按钮组件（支持加载状态、多种样式）
│   └── ScenarioCard.tsx       # 场景展示卡片（左右分栏布局）
│
├── services/                   # 业务逻辑层
│   └── geminiService.ts       # AI 服务封装（966 行）
│       ├── AI 配置管理
│       ├── 多提供商适配器
│       ├── 游戏初始化逻辑
│       ├── 回合推进逻辑
│       ├── 最终评价生成
│       └── 错误处理与重试
│
├── App.tsx                     # 主应用组件（966 行）
│   ├── ErrorBoundary          # 错误边界组件
│   ├── ConfigModal            # AI 配置弹窗
│   ├── HistoryModal           # 人生履历弹窗
│   ├── ConfirmModal           # 确认对话框
│   └── GameContent            # 游戏主逻辑
│       ├── 角色创建界面
│       ├── 游戏进行界面
│       ├── 加载过渡界面
│       └── 游戏结束界面
│
├── types.ts                    # TypeScript 类型定义
│   ├── GameState              # 游戏状态枚举
│   ├── PlayerProfile          # 玩家档案接口
│   ├── GameScenario           # 游戏场景接口
│   ├── GameOption             # 选项接口
│   ├── FinalEvaluation        # 最终评价接口
│   ├── ModelProvider          # AI 提供商枚举
│   ├── AIConfig               # AI 配置接口
│   └── HistoryItem            # 历史记录接口
│
├── index.tsx                   # 应用入口
├── index.html                  # HTML 模板
├── vite.config.ts             # Vite 配置
├── tsconfig.json              # TypeScript 配置
├── package.json               # 项目依赖
└── .env.local                 # 环境变量配置

```

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
- **环境变量**: Gemini 支持从 `.env.local` 读取 `GEMINI_API_KEY`
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

## 🎨 UI/UX 设计

### 设计系统

#### 色彩方案
**Academic 色系（学术风格深色主题）**
```javascript
academic: {
  50: '#f4f6f8',   // 最浅
  100: '#e4e8eb',
  200: '#cdd5db',
  300: '#aab6c0',
  400: '#8193a0',
  500: '#647887',
  600: '#4f5f6c',
  700: '#414d58',
  800: '#38414a',
  900: '#31383e',
  950: '#1f2429',  // 最深
}
paper: '#fdfbf7'   // 纸质感背景
```

**强调色**
- 琥珀色（amber）: 主要操作、高亮
- 红色（red）: 危险操作、低分
- 绿色（green）: 成功状态、高分

#### 字体系统
- **衬线字体**: Merriweather（用于标题、正文）
- **无衬线字体**: Inter（用于 UI 元素）

#### 动画效果

- **淡入动画**: 页面切换时的渐显效果
- **悬停效果**: 按钮悬停时的位移和颜色变化
- **加载动画**: 旋转的圆环加载指示器
- **背景装饰**: 模糊的渐变圆形装饰

### 响应式布局

#### 断点设计
- **移动端**: < 768px
  - 单列布局
  - 简化导航
  - 隐藏部分文字
- **桌面端**: ≥ 768px
  - 双列布局（场景卡片左右分栏）
  - 完整导航
  - 显示完整文字

#### 关键组件布局

**场景卡片（ScenarioCard）**
- 左侧（60%）: 情境描述和反馈
- 右侧（40%）: 选项列表

**角色创建界面**
- 网格布局（grid）
- 自适应列数（1-4 列）
- MBTI 选择器采用 2x2 网格

---

## 🔧 技术实现细节

### AI 服务适配器

#### Gemini SDK 路径
```typescript
// 使用官方 SDK
const ai = new GoogleGenAI({ apiKey });
const chat = ai.chats.create({
  model: 'gemini-2.5-flash',
  config: {
    systemInstruction: prompt,
    responseMimeType: 'application/json',
  }
});
const result = await chat.sendMessage({ message });
```

#### OpenAI Compatible 路径
```typescript
// 使用标准 HTTP 请求
const response = await fetch(`${baseUrl}/chat/completions`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${apiKey}`
  },
  body: JSON.stringify({
    model: modelName,
    messages: history,
    response_format: { type: "json_object" }
  })
});
```

### 会话管理

#### Gemini 会话

- 使用 SDK 的 Chat 对象维护会话
- 自动管理上下文历史
- 无需手动维护消息数组

#### OpenAI Compatible 会话
- 手动维护消息历史数组 `openaiHistory`
- 每次请求包含完整历史
- 格式: `[{role: 'system'|'user'|'assistant', content: string}]`

### 环境变量处理

#### Vite 配置
```typescript
// vite.config.ts
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    define: {
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
    }
  };
});
```

#### 优先级
1. 用户在配置界面输入的 API Key
2. `.env.local` 中的 `GEMINI_API_KEY`
3. 环境变量 `VITE_API_KEY`

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

### 环境变量配置

#### .env.local 示例
```bash
# Google Gemini API Key
GEMINI_API_KEY=AIzaSy...

# 可选：其他提供商的 API Key
# DEEPSEEK_API_KEY=sk-...
# OPENAI_API_KEY=sk-...
```

---

## 🔐 安全考虑

### API Key 管理
- **客户端存储**: API Key 存储在浏览器 localStorage 中
- **风险**: 用户可以通过开发者工具查看
- **建议**: 
  - 生产环境应使用后端代理
  - 限制 API Key 的权限和配额
  - 使用环境变量而非硬编码

### 数据隐私
- **本地存储**: 所有游戏数据仅存储在用户浏览器中
- **无服务器**: 不收集或上传用户数据
- **AI 提供商**: 用户输入会发送到选择的 AI 提供商

### 内容安全
- **虚构名称**: 避免使用真实公司名称
- **敏感话题**: AI 提示词中包含内容审查指导
- **用户输入**: 前端验证，防止注入攻击

---

## 📈 性能优化

### 已实现的优化

1. **Vite 构建**: 快速的开发和生产构建
2. **代码分割**: React 组件按需加载
3. **本地缓存**: 游戏状态和配置持久化
4. **重试机制**: 减少因网络波动导致的失败
5. **错误边界**: 防止单个组件错误导致整体崩溃

### 可优化的方向
1. **组件拆分**: App.tsx 文件较大（966 行），可进一步拆分
2. **懒加载**: 使用 React.lazy 和 Suspense 延迟加载模态框
3. **虚拟滚动**: 历史记录较多时使用虚拟滚动
4. **图片优化**: 添加图片资源时使用 WebP 格式
5. **CDN 优化**: 考虑自托管 React 和 Tailwind

---

## 🧪 测试建议

### 单元测试
- AI 服务的 JSON 清理函数
- 重试机制的逻辑
- 类型转换和验证

### 集成测试
- 完整的游戏流程（创建角色 → 游戏 → 结束）
- 不同 AI 提供商的切换
- 本地存储的读写

### E2E 测试
- 用户完整游戏流程
- 错误处理和恢复
- 响应式布局在不同设备上的表现

---

## 🐛 已知问题与限制

### 技术限制
1. **AI 响应不稳定**: 不同提供商的 JSON 格式可能不一致
2. **网络依赖**: 依赖 CDN 加载 React 和 Tailwind
3. **浏览器兼容性**: 需要支持 ES2022 的现代浏览器
4. **移动端体验**: 长文本在小屏幕上可能不够友好

### 功能限制
1. **无多人模式**: 仅支持单人游戏
2. **无存档管理**: 只能保存一个存档
3. **无分支回溯**: 不能回到之前的选择点
4. **语言单一**: 仅支持中文

---

## 🔮 未来扩展方向

### 功能扩展

1. **多存档系统**: 支持保存和加载多个游戏存档
2. **分支回溯**: 允许玩家回到之前的决策点
3. **成就系统**: 解锁特定结局获得成就
4. **社交分享**: 分享最终报告到社交媒体
5. **数据可视化**: 用图表展示人生轨迹
6. **多语言支持**: 英文、日文等其他语言版本
7. **自定义剧本**: 允许用户创建自定义场景

### 技术改进
1. **后端服务**: 
   - API Key 代理
   - 用户认证
   - 云端存档
2. **数据库集成**: 
   - 存储用户数据
   - 统计分析
   - 排行榜
3. **实时通信**: 
   - WebSocket 支持
   - 多人协作模式
4. **PWA 支持**: 
   - 离线可用
   - 安装到桌面
5. **AI 优化**: 
   - 本地模型支持
   - 流式输出
   - 更精细的提示词工程

---

## 📚 关键代码示例

### 1. AI 服务初始化

```typescript
export const initializeGame = async (
  profile: PlayerProfile
): Promise<GameScenario> => {
  if (!activeConfig) throw new Error("Please configure API settings first.");
  
  const apiKey = activeConfig?.apiKey || import.meta.env.VITE_API_KEY || '';
  const systemPrompt = getSystemInstruction(profile);
  
  // Gemini 路径
  if (activeConfig.provider === ModelProvider.GEMINI) {
    const ai = new GoogleGenAI({ apiKey });
    geminiChatSession = ai.chats.create({
      model: activeConfig.modelName,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json',
      },
    });
    
    return withRetry(async () => {
      const result = await geminiChatSession.sendMessage({
        message: "开始模拟 (Start Simulation)"
      });
      return JSON.parse(cleanJson(result.text)) as GameScenario;
    });
  }
  
  // OpenAI Compatible 路径
  else {
    openaiHistory = [
      { role: "system", content: systemPrompt },
      { role: "user", content: "Start Simulation." }
    ];
    
    return withRetry(async () => {
      const responseText = await callOpenAICompatible(openaiHistory, true);
      openaiHistory.push({ role: "assistant", content: responseText });
      return JSON.parse(cleanJson(responseText)) as GameScenario;
    });
  }
};
```

### 2. 重试机制实现

```typescript
const withRetry = async <T>(
  fn: () => Promise<T>, 
  retries = 3, 
  delay = 2000
): Promise<T> => {
  let lastError: any;
  
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;
      console.warn(`Attempt ${i + 1} failed. Retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
    }
  }
  
  throw new Error(`Action failed after ${retries} attempts. Error: ${lastError.message}`);
};
```

### 3. 游戏状态管理

```typescript
// 保存游戏状态
useEffect(() => {
  if (gameState === GameState.INTRO) return;
  
  const stateToSave = {
    gameState,
    profile,
    currentScenario,
    finalResult,
    history
  };
  localStorage.setItem('life_sim_game_state', JSON.stringify(stateToSave));
}, [gameState, profile, currentScenario, finalResult, history]);

// 加载游戏状态
useEffect(() => {
  const savedState = localStorage.getItem('life_sim_game_state');
  if (savedState) {
    try {
      const parsed = JSON.parse(savedState);
      if (parsed.gameState && parsed.gameState !== GameState.INTRO) {
        setGameState(parsed.gameState);
        setProfile(parsed.profile);
        setCurrentScenario(parsed.currentScenario);
        setFinalResult(parsed.finalResult);
        setHistory(parsed.history || []);
      }
    } catch (e) {
      console.error("Failed to load game state");
    }
  }
}, []);
```

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

## 🎯 项目亮点总结

### 技术亮点
1. ✅ **多 AI 提供商支持**: 灵活切换不同的大语言模型
2. ✅ **完善的错误处理**: 重试机制 + 错误边界 + 降级策略
3. ✅ **类型安全**: 完整的 TypeScript 类型定义
4. ✅ **状态持久化**: 自动保存，断点续玩
5. ✅ **响应式设计**: 适配桌面和移动端

### 产品亮点
1. 🎓 **教育价值**: 帮助年轻人思考未来规划
2. 🌍 **社会洞察**: 基于真实趋势的深度推演
3. 🎭 **个性化体验**: 根据用户档案定制剧情
4. 📊 **数据导出**: 生成完整的人生报告
5. 🎨 **精美设计**: 学术风格的视觉体验

### 创新点
1. 💡 **第一性原理推演**: 不是简单的随机事件，而是基于社会规律
2. 💡 **人性弱点模拟**: 考虑拖延、认知偏差等真实人性
3. 💡 **虚构名称系统**: 避免法律风险的同时保持真实感
4. 💡 **多维度评价**: 不只看收入，还看心理健康、自我实现等

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
- Email: [联系邮箱]
- 文档: [在线文档地址]

---

## 📄 许可证

[根据实际情况填写许可证信息]

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
