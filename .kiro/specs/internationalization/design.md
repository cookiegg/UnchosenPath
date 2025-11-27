# Design Document: Internationalization

## Overview

本设计为"未择之路·人生推演"项目实现国际化支持，包括多语言 UI 和多国家背景推演。采用 react-i18next 作为国际化框架，设计模块化的国家上下文系统，使语言和国家背景可以独立配置。

核心设计原则：
1. **语言与国家分离** - 用户可以用英文体验中国背景，或用中文体验美国背景
2. **模块化扩展** - 添加新语言只需添加 locale 文件，添加新国家只需添加 country context 模块
3. **最小侵入** - 尽量复用现有组件结构，通过 hook 注入翻译能力

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Application Layer                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │ App.tsx     │  │ Components  │  │ Services                │  │
│  │ (useI18n)   │  │ (useI18n)   │  │ (getSystemPrompt)       │  │
│  └──────┬──────┘  └──────┬──────┘  └───────────┬─────────────┘  │
│         │                │                      │                │
│  ┌──────▼────────────────▼──────────────────────▼─────────────┐ │
│  │                    i18n Context                             │ │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │ │
│  │  │ Language    │  │ Country     │  │ Translation         │ │ │
│  │  │ (zh-CN/en)  │  │ (CN/US)     │  │ Function (t)        │ │ │
│  │  └─────────────┘  └─────────────┘  └─────────────────────┘ │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        ▼                     ▼                     ▼
┌───────────────┐    ┌───────────────┐    ┌───────────────────┐
│ Locale Files  │    │ Country Data  │    │ System Prompts    │
│ ├─ zh-CN.json │    │ ├─ china.ts   │    │ ├─ china.ts       │
│ └─ en-US.json │    │ └─ usa.ts     │    │ └─ usa.ts         │
└───────────────┘    └───────────────┘    └───────────────────┘
```

## Components and Interfaces

### 1. i18n Configuration Module

```typescript
// src/i18n/index.ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

export type SupportedLanguage = 'zh-CN' | 'en-US';
export type SupportedCountry = 'CN' | 'US';

export interface I18nConfig {
  language: SupportedLanguage;
  country: SupportedCountry;
}

// Initialize i18next with language detection and React binding
```

### 2. Language Switcher Component

```typescript
// components/LanguageSwitcher.tsx
interface LanguageSwitcherProps {
  className?: string;
}

// Renders a dropdown/button group for language selection
// Persists selection to localStorage
// Triggers immediate UI update via i18next
```

### 3. Country Context Module Interface

```typescript
// src/i18n/countries/types.ts
export interface LocationData {
  provinces: Array<{
    name: string;
    cities: string[];
  }>;
}

export interface CountryContext {
  id: SupportedCountry;
  name: string;                    // Display name in current locale
  locations: LocationData;
  educationLevels: string[];
  universityTiers: string[];
  familyBackgrounds: string[];
  parentsOccupations: string[];
  currentStatuses: string[];
  systemPromptTemplate: string;    // Template for AI system prompt
}

export interface CountryContextModule {
  getContext: (language: SupportedLanguage) => CountryContext;
}
```

### 4. Country Selector Component

```typescript
// components/CountrySelector.tsx
interface CountrySelectorProps {
  value: SupportedCountry;
  onChange: (country: SupportedCountry) => void;
  className?: string;
}

// Renders country selection UI (flags + names)
// Called at the start of character creation
```

### 5. Updated PlayerProfile Interface

```typescript
// types.ts (extended)
export interface PlayerProfile {
  // ... existing fields ...
  country: SupportedCountry;  // NEW: Selected country context
}
```

### 6. System Prompt Generator Interface

```typescript
// services/systemPrompt.ts (refactored)
export interface SystemPromptConfig {
  profile: PlayerProfile;
  language: SupportedLanguage;
  country: SupportedCountry;
}

export function getSystemPrompt(config: SystemPromptConfig): string;
```

## Data Models

### Locale File Structure

```json
// src/i18n/locales/zh-CN.json
{
  "app": {
    "title": "未择之路·人生推演",
    "subtitle": "当信息变得廉价，什么才是你的核心资产？"
  },
  "nav": {
    "history": "人生履历",
    "settings": "设置",
    "restart": "重启人生"
  },
  "form": {
    "name": "姓名",
    "gender": "性别",
    "age": "年龄",
    "country": "推演背景",
    "selectCountry": "选择国家背景"
  },
  "buttons": {
    "start": "开始模拟",
    "save": "保存",
    "share": "分享",
    "confirm": "确认",
    "cancel": "取消"
  },
  "errors": {
    "apiError": "API 调用失败",
    "networkError": "网络连接失败"
  },
  "game": {
    "yourChoice": "你的选择",
    "customInput": "自定义输入",
    "loading": "推演中..."
  },
  "evaluation": {
    "title": "人生总结",
    "score": "人生满意度",
    "timeline": "十年轨迹",
    "advice": "给年轻人的建议"
  },
  "share": {
    "title": "分享你的人生",
    "scanQR": "扫码体验"
  }
}
```

```json
// src/i18n/locales/en-US.json
{
  "app": {
    "title": "The Road Not Taken",
    "subtitle": "Life Simulation in the AI Era"
  },
  "nav": {
    "history": "Life History",
    "settings": "Settings",
    "restart": "Restart"
  },
  "form": {
    "name": "Name",
    "gender": "Gender",
    "age": "Age",
    "country": "Simulation Context",
    "selectCountry": "Select Country"
  },
  "buttons": {
    "start": "Start Simulation",
    "save": "Save",
    "share": "Share",
    "confirm": "Confirm",
    "cancel": "Cancel"
  },
  "errors": {
    "apiError": "API call failed",
    "networkError": "Network connection failed"
  },
  "game": {
    "yourChoice": "Your choice",
    "customInput": "Custom input",
    "loading": "Simulating..."
  },
  "evaluation": {
    "title": "Life Summary",
    "score": "Life Satisfaction",
    "timeline": "Decade Timeline",
    "advice": "Advice for the Young"
  },
  "share": {
    "title": "Share Your Life",
    "scanQR": "Scan to try"
  }
}
```

### Country Context Data Structure

```typescript
// src/i18n/countries/china.ts
export const chinaContext: CountryContextModule = {
  getContext: (language) => ({
    id: 'CN',
    name: language === 'zh-CN' ? '中国' : 'China',
    locations: {
      provinces: [
        { name: '北京', cities: ['北京市'] },
        { name: '上海', cities: ['上海市'] },
        // ... more provinces
      ]
    },
    educationLevels: language === 'zh-CN' 
      ? ['无', '高中', '大专', '本科', '硕士', '博士']
      : ['None', 'High School', 'Associate', 'Bachelor\'s', 'Master\'s', 'PhD'],
    universityTiers: language === 'zh-CN'
      ? ['Top 2 (清北)', 'C9/华五', '985/211', '普通一本/二本', '大专/职业院校', '海外名校', '普通海外高校']
      : ['Top 2 (Tsinghua/Peking)', 'C9/Top Chinese', '985/211 Universities', 'Regular Universities', 'Vocational Colleges', 'Top Overseas', 'Regular Overseas'],
    familyBackgrounds: language === 'zh-CN'
      ? ['富裕 (家产丰厚/有矿)', '中产 (衣食无忧/城市土著)', '工薪 (普通家庭)', '贫困 (寒门学子)']
      : ['Wealthy', 'Upper Middle Class', 'Working Class', 'Low Income'],
    parentsOccupations: language === 'zh-CN'
      ? ['务农', '小生意', '白领', '基层公务员', '中高层管理', '老板/企业家', '专业人士', '其他']
      : ['Farmers', 'Small Business', 'White Collar', 'Civil Servant', 'Management', 'Business Owner', 'Professional', 'Other'],
    currentStatuses: language === 'zh-CN'
      ? ['学生', '在职', '创业', '待业', '自由职业', '退休']
      : ['Student', 'Employed', 'Entrepreneur', 'Unemployed', 'Freelancer', 'Retired'],
    systemPromptTemplate: getChinaSystemPrompt(language)
  })
};
```

```typescript
// src/i18n/countries/usa.ts
export const usaContext: CountryContextModule = {
  getContext: (language) => ({
    id: 'US',
    name: language === 'zh-CN' ? '美国' : 'United States',
    locations: {
      provinces: [
        { name: 'California', cities: ['Los Angeles', 'San Francisco', 'San Diego'] },
        { name: 'New York', cities: ['New York City', 'Buffalo', 'Albany'] },
        { name: 'Texas', cities: ['Houston', 'Dallas', 'Austin'] },
        // ... more states
      ]
    },
    educationLevels: language === 'zh-CN'
      ? ['无', '高中', '副学士', '学士', '硕士', '博士']
      : ['None', 'High School', 'Associate', 'Bachelor\'s', 'Master\'s', 'PhD'],
    universityTiers: language === 'zh-CN'
      ? ['常春藤联盟', 'Top 20 名校', 'Top 50 大学', '州立大学', '社区学院', '其他']
      : ['Ivy League', 'Top 20', 'Top 50', 'State University', 'Community College', 'Other'],
    familyBackgrounds: language === 'zh-CN'
      ? ['富裕 (上层阶级)', '中上阶层', '中产阶级', '工薪阶层', '低收入']
      : ['Wealthy (Upper Class)', 'Upper Middle Class', 'Middle Class', 'Working Class', 'Low Income'],
    parentsOccupations: language === 'zh-CN'
      ? ['蓝领工人', '服务业', '白领', '政府雇员', '管理层', '企业主', '专业人士', '其他']
      : ['Blue Collar', 'Service Industry', 'White Collar', 'Government', 'Management', 'Business Owner', 'Professional', 'Other'],
    currentStatuses: language === 'zh-CN'
      ? ['学生', '在职', '创业', '待业', '自由职业', '退休']
      : ['Student', 'Employed', 'Entrepreneur', 'Unemployed', 'Freelancer', 'Retired'],
    systemPromptTemplate: getUSASystemPrompt(language)
  })
};
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

Based on the prework analysis, the following correctness properties have been identified:

### Property 1: Language Detection Consistency
*For any* browser language setting, the i18n system should initialize with a supported language (defaulting to zh-CN if unsupported).
**Validates: Requirements 1.1**

### Property 2: Language Switching Updates All Text
*For any* supported language, when selected, all translation keys should return non-empty strings in that language.
**Validates: Requirements 1.3, 2.1, 2.2**

### Property 3: Language Persistence Round Trip
*For any* language selection, saving to localStorage and then restoring should return the same language.
**Validates: Requirements 1.4, 1.5**

### Property 4: Country Context Data Completeness
*For any* supported country, the country context should contain valid, non-empty arrays for locations, education levels, university tiers, family backgrounds, and parent occupations.
**Validates: Requirements 3.2, 3.3, 4.1-4.8**

### Property 5: Country System Prompt Contains Country Keywords
*For any* supported country, the generated system prompt should contain keywords specific to that country's social context.
**Validates: Requirements 5.1, 5.2**

### Property 6: System Prompt Language Instruction
*For any* language and country combination, the system prompt should contain an instruction specifying the output language.
**Validates: Requirements 5.5, 5.6**

### Property 7: Locale Key Consistency
*For any* two supported locales, they should have exactly the same set of translation keys.
**Validates: Requirements 6.4**

### Property 8: Country Context Interface Consistency
*For any* supported country, the country context should conform to the CountryContext interface with all required fields.
**Validates: Requirements 6.3**

### Property 9: Export Uses Current Locale
*For any* language setting, the Markdown export should contain localized template strings matching the current language.
**Validates: Requirements 8.2**

## Error Handling

1. **Missing Translation Key**: Return the key itself as fallback, log warning in development
2. **Unsupported Language**: Default to zh-CN with console warning
3. **Unsupported Country**: Default to CN with console warning
4. **localStorage Unavailable**: Use in-memory storage, warn user that preferences won't persist
5. **Country Data Load Failure**: Show error message, allow retry

## Testing Strategy

### Unit Testing

使用 Vitest 进行单元测试：

1. **i18n 初始化测试**
   - 测试默认语言检测
   - 测试语言切换功能
   - 测试 localStorage 持久化

2. **Country Context 测试**
   - 测试各国数据加载
   - 测试数据结构完整性

3. **System Prompt 测试**
   - 测试不同国家/语言组合的提示词生成
   - 测试提示词包含正确的语言指令

### Property-Based Testing

使用 fast-check 进行属性测试：

1. **Locale Completeness Property**
   - 生成随机 locale key，验证所有 locale 都有该 key
   
2. **Country Context Validity Property**
   - 对所有支持的国家，验证数据结构符合接口

3. **Language Persistence Property**
   - 随机选择语言，保存后恢复，验证一致性

4. **System Prompt Language Property**
   - 对所有语言/国家组合，验证提示词包含语言指令

### Integration Testing

1. **语言切换流程**
   - 切换语言后验证 UI 更新
   
2. **国家选择流程**
   - 选择国家后验证表单选项更新

3. **完整游戏流程**
   - 使用不同语言/国家组合完成游戏
