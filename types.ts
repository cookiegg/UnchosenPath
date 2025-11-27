
export enum GameState {
  INTRO = 'INTRO',
  PLAYING = 'PLAYING',
  LOADING_TURN = 'LOADING_TURN',
  GAME_OVER = 'GAME_OVER',
  ERROR = 'ERROR'
}

import { SupportedCountry } from './src/i18n/types';

export interface PlayerProfile {
  name: string;
  gender: string;
  age: number; // 年龄 (18-65)
  currentStatus: string; // 当前状态: 学生/在职/创业/待业/退休等
  education: string; // 学历水平: 高中/本科/硕士/博士/无
  familyBackground: string; // e.g. "Wealthy", "Middle Class", "Working Class", "Poor"
  parentsOccupation: string; // 父母职业
  hometown: {
    province: string;
    city: string;
  }; // 籍贯（省市结构化数据）
  currentLocation: {
    province: string;
    city: string;
  }; // 当前所在地
  grade?: string; // 年级 (仅当 currentStatus 为 '学生' 时使用)
  universityTier?: string; // 高校层次 (仅当 grade 为大学/研究生时使用)
  mbti: {
    energySource: 'E' | 'I';      // 外向/内向
    perception: 'S' | 'N';        // 实感/直觉
    decision: 'T' | 'F';          // 思考/情感
    lifestyle: 'J' | 'P';         // 判断/感知
  };
  profession?: string; // 职业 (非学生状态)
  major?: string; // 专业 (学生状态)
  skills: string; // 特长和技能
  customBio?: string; // 自定义备注/故事设定
  simulationStartYear: number; // 模拟起始年份
  simulationStartMonth: number; // 模拟起始月份 (1-12)
  simulationEndYear: number; // 模拟结束年份
  simulationEndMonth: number; // 模拟结束月份 (1-12)
  country: SupportedCountry; // 推演背景国家
}

export interface GameOption {
  id: string;
  text: string;
}

export interface HistoryItem {
  phase: string;
  description: string;
  choiceText: string;
  feedback?: string;
  timestamp: number;
}

// 树形历史节点（支持分支回溯）
export interface HistoryNode {
  id: string;
  parentId: string | null;
  phase: string;
  description: string;
  choiceText: string;
  feedback?: string;
  scenario: GameScenario;  // 保存完整场景用于回溯
  children: string[];      // 子节点ID
  timestamp: number;
}

export interface GameTree {
  nodes: Record<string, HistoryNode>;
  currentNodeId: string | null;
  rootId: string | null;
}

export interface GameScenario {
  phase: string; // e.g., "2025年 秋季 (大一上)", "2029年 夏季 (毕业季)"
  description: string;
  options: GameOption[];
  feedback?: string; // Reaction to the previous choice
  isGameOver: boolean;
  gameOverReason?: string;
}

export interface FinalEvaluation {
  score: number; // Survival/Success score
  title: string; // e.g., "A7 Civil Servant", "Global Nomad", "Debt-ridden Youth"
  summary: string;
  timeline: string; // A quick summary of the 10 years
  advice: string;
}

export enum ModelProvider {
  GEMINI = 'gemini',
  DEEPSEEK = 'deepseek',
  OPENAI = 'openai',
  MOONSHOT = 'moonshot', // Kimi
  ALIYUN = 'aliyun', // Qwen
  ZHIPU = 'zhipu', // GLM
  CUSTOM = 'custom'
}

export interface AIConfig {
  provider: ModelProvider;
  apiKey: string;
  baseUrl: string;
  modelName: string;
}
