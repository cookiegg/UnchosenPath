# 十年人生模拟器 - 架构图生成文档

## 1. 系统架构概览

### 技术栈层次
```
展示层 (Presentation Layer)
├── React 19.2.0 (UI 框架)
├── TypeScript 5.8.2 (类型系统)
└── Tailwind CSS (样式框架)

构建层 (Build Layer)
└── Vite 6.2.0 (构建工具)

服务层 (Service Layer)
└── AI Service (多提供商适配)
    ├── Google Gemini SDK
    └── OpenAI Compatible API

数据层 (Data Layer)
└── Browser LocalStorage (本地持久化)
```

---

## 2. 项目文件结构

```
项目根目录/
│
├── 【组件层】components/
│   ├── Button.tsx              # 通用按钮组件
│   └── ScenarioCard.tsx        # 场景展示卡片
│
├── 【服务层】services/
│   └── geminiService.ts        # AI 服务核心
│       ├── setAIConfig()       # 配置管理
│       ├── initializeGame()    # 游戏初始化
│       ├── nextTurn()          # 回合推进
│       ├── getFinalEvaluation() # 最终评价
│       ├── withRetry()         # 重试机制
│       └── cleanJson()         # JSON 清理
│
├── 【应用层】App.tsx           # 主应用 (966 行)
│   ├── ErrorBoundary           # 错误边界
│   ├── ConfigModal             # 配置弹窗
│   ├── HistoryModal            # 履历弹窗
│   ├── ConfirmModal            # 确认对话框
│   └── GameContent             # 游戏主逻辑
│       ├── renderIntro()       # 角色创建界面
│       ├── renderGameOver()    # 结束界面
│       └── 状态管理 Hooks
│
├── 【类型层】types.ts          # TypeScript 定义
│   ├── GameState (枚举)
│   ├── PlayerProfile (接口)
│   ├── GameScenario (接口)
│   ├── FinalEvaluation (接口)
│   ├── AIConfig (接口)
│   └── ModelProvider (枚举)
│
├── 【入口】index.tsx           # 应用入口
├── 【配置】vite.config.ts     # 构建配置
└── 【环境】.env.local          # 环境变量
```

---

## 3. 核心模块关系图

### 模块依赖关系
```
index.tsx (入口)
    ↓
App.tsx (主应用)
    ↓
    ├─→ components/ (UI 组件)
    │   ├─→ Button
    │   └─→ ScenarioCard
    │
    ├─→ services/ (业务逻辑)
    │   └─→ geminiService
    │       ├─→ Google Gemini SDK
    │       └─→ OpenAI API
    │
    └─→ types.ts (类型定义)
```

### 数据流向
```
用户输入 → App.tsx → geminiService → AI 提供商
                ↓                        ↓
         LocalStorage ←─────────── AI 响应
                ↓
         状态更新 → UI 渲染
```

---

## 4. 游戏状态机

### 状态转换图
```
INTRO (角色创建)
    ↓ [点击开始]
PLAYING (游戏进行)
    ↓ [选择选项]
PLAYING (下一场景)
    ↓ [重复选择]
LOADING_TURN (加载评价)
    ↓ [生成报告]
GAME_OVER (游戏结束)
    ↓ [重新开始]
INTRO (返回创建)
```

### 状态与界面映射
```
GameState.INTRO        → 角色创建表单
GameState.PLAYING      → 场景卡片 + 选项
GameState.LOADING_TURN → 加载动画
GameState.GAME_OVER    → 最终报告
GameState.ERROR        → 错误提示
```

---

## 5. AI 服务架构

### 多提供商适配器模式
```
geminiService.ts (统一接口)
    ↓
    ├─→ Gemini 路径
    │   └─→ GoogleGenAI SDK
    │       └─→ Chat Session (自动管理上下文)
    │
    └─→ OpenAI Compatible 路径
        └─→ HTTP Fetch API
            └─→ 手动维护消息历史
```

### AI 调用流程
```
1. 用户操作
    ↓
2. 调用 geminiService 函数
    ↓
3. 检查 activeConfig (提供商类型)
    ↓
4. 分支处理
    ├─→ Gemini: 使用 SDK
    └─→ Others: 使用 HTTP
    ↓
5. 发送请求 (带重试机制)
    ↓
6. 接收响应
    ↓
7. cleanJson() 清理
    ↓
8. JSON.parse() 解析
    ↓
9. 返回类型化数据
```

---

## 6. 数据流详解

### 游戏初始化流程
```
[用户] 填写角色信息
    ↓
[App] 收集 PlayerProfile
    ↓
[App] 调用 initializeGame(profile)
    ↓
[Service] 构建系统提示词
    ↓
[Service] 创建 AI 会话
    ↓
[AI] 生成初始场景 JSON
    ↓
[Service] 清理并解析 JSON
    ↓
[Service] 返回 GameScenario
    ↓
[App] 更新状态 → PLAYING
    ↓
[UI] 渲染 ScenarioCard
```

### 回合推进流程
```
[用户] 点击选项
    ↓
[App] 获取 option.text
    ↓
[App] 调用 nextTurn(choiceText)
    ↓
[Service] 发送选择到 AI
    ↓
[AI] 基于历史生成下一场景
    ↓
[Service] 返回新 GameScenario
    ↓
[App] 记录到 history[]
    ↓
[App] 检查 isGameOver
    ├─→ false: 渲染新场景
    └─→ true: 调用 getFinalEvaluation()
```

### 数据持久化流程
```
[App] 状态变化 (useEffect 监听)
    ↓
[App] 序列化游戏状态
    ↓
[LocalStorage] 保存 JSON
    ↓
[页面刷新]
    ↓
[App] 从 LocalStorage 读取
    ↓
[App] 反序列化并恢复状态
    ↓
[UI] 渲染恢复的界面
```

---

## 7. 组件层次结构

### React 组件树
```
<App> (错误边界包裹)
  │
  ├─ <header> (固定顶栏)
  │   ├─ Logo
  │   └─ 操作按钮
  │       ├─ 人生履历
  │       ├─ 重启人生
  │       └─ 设置
  │
  ├─ <ConfigModal> (AI 配置)
  │   ├─ 提供商选择
  │   ├─ API Key 输入
  │   ├─ Base URL 输入
  │   └─ 模型名称输入
  │
  ├─ <HistoryModal> (历史记录)
  │   └─ 时间轴列表
  │       └─ HistoryItem × N
  │
  ├─ <ConfirmModal> (确认对话框)
  │
  └─ <GameContent> (主内容区)
      │
      ├─ [INTRO 状态]
      │   └─ 角色创建表单
      │       ├─ 基础信息输入
      │       ├─ 教育背景选择
      │       ├─ 家庭背景选择
      │       ├─ MBTI 选择器
      │       └─ <Button> 开始游戏
      │
      ├─ [PLAYING 状态]
      │   └─ <ScenarioCard>
      │       ├─ 左侧: 情境描述
      │       └─ 右侧: 选项列表
      │           └─ <Button> × 3-4
      │
      ├─ [LOADING_TURN 状态]
      │   └─ 加载动画
      │
      └─ [GAME_OVER 状态]
          └─ 最终报告
              ├─ 评分展示
              ├─ 结局称号
              ├─ 总结文本
              ├─ 十年轨迹
              ├─ 人生建议
              └─ 操作按钮
                  ├─ <Button> 重启
                  └─ <Button> 导出
```

---

## 8. 关键接口定义

### PlayerProfile (玩家档案)
```typescript
{
  name: string              // 姓名
  gender: string            // 性别
  scoreTier: string         // 院校层次
  familyBackground: string  // 家庭背景
  parentsOccupation: string // 父母职业
  hometown: string          // 籍贯
  mbti: {                   // MBTI 性格
    energySource: 'E'|'I'
    perception: 'S'|'N'
    decision: 'T'|'F'
    lifestyle: 'J'|'P'
  }
  majorInterest: string     // 专业兴趣
  skills: string            // 特长技能
}
```

### GameScenario (游戏场景)
```typescript
{
  phase: string             // 时间节点
  description: string       // 情境描述
  options: GameOption[]     // 选项列表
  feedback?: string         // 上次反馈
  isGameOver: boolean       // 是否结束
  gameOverReason?: string   // 结束原因
}
```

### AIConfig (AI 配置)
```typescript
{
  provider: ModelProvider   // 提供商类型
  apiKey: string           // API 密钥
  baseUrl: string          // API 地址
  modelName: string        // 模型名称
}
```

---

## 9. 技术特性总结

### 核心技术特性
1. **多 AI 提供商支持**: 适配器模式统一接口
2. **状态持久化**: LocalStorage 自动保存/恢复
3. **错误处理**: 重试机制 + 错误边界 + 降级策略
4. **类型安全**: 完整的 TypeScript 类型系统
5. **响应式设计**: Tailwind CSS + 移动端适配

### 架构模式
- **分层架构**: 展示层 → 服务层 → 数据层
- **适配器模式**: 多 AI 提供商统一接口
- **状态机模式**: 游戏状态转换
- **组件化**: React 组件复用
- **单向数据流**: React Hooks 状态管理

---

## 10. 建议的框架图类型

### 推荐生成的图表类型

1. **系统架构图** (System Architecture)
   - 展示层、服务层、数据层的关系
   - 技术栈的层次结构

2. **模块依赖图** (Module Dependency)
   - 文件之间的依赖关系
   - 组件、服务、类型的引用关系

3. **数据流图** (Data Flow Diagram)
   - 用户操作 → 数据处理 → UI 更新
   - 三大核心流程的可视化

4. **状态机图** (State Machine)
   - 游戏状态的转换
   - 触发条件和转换动作

5. **组件树图** (Component Tree)
   - React 组件的层次结构
   - 父子组件关系

6. **时序图** (Sequence Diagram)
   - AI 调用的时序
   - 用户交互的时序

---

## 使用建议

将以上内容输入给 AI 绘图工具（如 Claude、ChatGPT、Mermaid 等），并指定需要生成的图表类型，例如：

**提示词示例**：
```
请根据以下架构文档，生成一个系统架构图，包括：
1. 技术栈的层次结构
2. 主要模块及其关系
3. 数据流向
4. 使用 Mermaid 语法或其他可视化格式

[粘贴本文档相关章节]
```
