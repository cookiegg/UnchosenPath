# Requirements Document

## Introduction

本功能为"未择之路·人生推演"项目添加国际化支持，使应用能够服务不同国家的用户。核心目标是让用户能够选择自己的语言和国家背景，体验符合当地社会环境的人生推演。第一阶段聚焦中国和美国两个市场，架构设计需支持后续扩展到其他国家和语言。

## Glossary

- **Locale**: 语言和地区的组合标识符（如 zh-CN, en-US）
- **i18n**: Internationalization 的缩写，指国际化
- **Country Context**: 国家背景，包含该国特有的社会环境、教育体系、职业选项等
- **System Prompt**: 发送给 AI 的系统提示词，定义推演的背景和规则
- **UI Text**: 用户界面上显示的文本内容
- **Location Data**: 地理位置数据，如省市/州县信息

## Requirements

### Requirement 1: Language Selection

**User Story:** As a user, I want to select my preferred language, so that I can use the application in a language I understand.

#### Acceptance Criteria

1. WHEN the application loads THEN the System SHALL detect the browser's language preference and set it as the default language
2. WHEN a user clicks the language switcher THEN the System SHALL display available language options (Chinese, English)
3. WHEN a user selects a language THEN the System SHALL immediately update all UI text to the selected language
4. WHEN a user selects a language THEN the System SHALL persist the selection to localStorage
5. WHEN a user returns to the application THEN the System SHALL restore the previously selected language

### Requirement 2: UI Text Internationalization

**User Story:** As a user, I want all interface text displayed in my selected language, so that I can fully understand and interact with the application.

#### Acceptance Criteria

1. WHEN the language is set to Chinese THEN the System SHALL display all UI elements in Chinese
2. WHEN the language is set to English THEN the System SHALL display all UI elements in English
3. WHEN displaying form labels THEN the System SHALL use the current language for all labels and placeholders
4. WHEN displaying buttons and navigation THEN the System SHALL use the current language for all interactive elements
5. WHEN displaying error messages THEN the System SHALL use the current language for all error and status messages
6. WHEN displaying tooltips and help text THEN the System SHALL use the current language for all guidance content

### Requirement 3: Country Context Selection

**User Story:** As a user, I want to select which country's social environment to simulate, so that I can experience a life simulation relevant to my chosen context.

#### Acceptance Criteria

1. WHEN a user starts character creation THEN the System SHALL prompt the user to select a country context (China or USA)
2. WHEN a user selects China THEN the System SHALL load Chinese-specific options for education, careers, and locations
3. WHEN a user selects USA THEN the System SHALL load American-specific options for education, careers, and locations
4. WHEN a country context is selected THEN the System SHALL update the AI system prompt to reflect that country's social environment
5. WHEN a country context is selected THEN the System SHALL persist the selection for the current game session

### Requirement 4: Country-Specific Form Options

**User Story:** As a user, I want form options that reflect my selected country's reality, so that I can create a character that fits the simulation context.

#### Acceptance Criteria

1. WHEN China is selected THEN the System SHALL display Chinese provinces and cities in the location selector
2. WHEN USA is selected THEN the System SHALL display US states and major cities in the location selector
3. WHEN China is selected THEN the System SHALL display Chinese education levels (高中, 大专, 本科, 硕士, 博士)
4. WHEN USA is selected THEN the System SHALL display American education levels (High School, Associate, Bachelor's, Master's, PhD)
5. WHEN China is selected THEN the System SHALL display Chinese university tiers (清北, 985/211, 普通本科, etc.)
6. WHEN USA is selected THEN the System SHALL display American university tiers (Ivy League, Top 50, State University, Community College, etc.)
7. WHEN China is selected THEN the System SHALL display Chinese family background options
8. WHEN USA is selected THEN the System SHALL display American family background options adapted to US social context

### Requirement 5: Country-Specific AI System Prompts

**User Story:** As a user, I want the AI to generate scenarios based on my selected country's social reality, so that the simulation feels authentic and relevant.

#### Acceptance Criteria

1. WHEN China is selected THEN the System SHALL use a system prompt reflecting Chinese society (education system, job market, social trends)
2. WHEN USA is selected THEN the System SHALL use a system prompt reflecting American society (education system, job market, social trends)
3. WHEN generating scenarios THEN the AI SHALL use fictional company names appropriate to the selected country
4. WHEN generating scenarios THEN the AI SHALL reference social phenomena relevant to the selected country
5. WHEN the language is English and country is China THEN the AI SHALL output in English while describing Chinese social context
6. WHEN the language is Chinese and country is USA THEN the AI SHALL output in Chinese while describing American social context

### Requirement 6: Data Structure for Extensibility

**User Story:** As a developer, I want a modular data structure for country-specific content, so that adding new countries and languages is straightforward.

#### Acceptance Criteria

1. WHEN adding a new language THEN the System SHALL only require adding a new locale JSON file
2. WHEN adding a new country THEN the System SHALL only require adding a new country context module
3. WHEN country data is loaded THEN the System SHALL use a consistent interface across all countries
4. WHEN locale data is loaded THEN the System SHALL use a consistent key structure across all languages

### Requirement 7: Share Card Localization

**User Story:** As a user, I want shared content to display in my selected language, so that I can share my results with others in my preferred language.

#### Acceptance Criteria

1. WHEN generating a share card THEN the System SHALL use the current language for all static text
2. WHEN generating a share card THEN the System SHALL display the project name in the appropriate language
3. WHEN generating a share card THEN the System SHALL include the QR code regardless of language

### Requirement 8: Final Evaluation Localization

**User Story:** As a user, I want my final life evaluation displayed in my selected language, so that I can fully understand my simulation results.

#### Acceptance Criteria

1. WHEN displaying the final evaluation THEN the System SHALL show all labels and section titles in the current language
2. WHEN exporting results to Markdown THEN the System SHALL use the current language for all template text
3. WHEN displaying the score and title THEN the System SHALL use culturally appropriate terminology for the selected country
