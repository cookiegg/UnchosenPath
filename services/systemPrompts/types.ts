/**
 * System Prompt Types
 * 定义系统提示词相关的类型
 */

import { PlayerProfile } from '../../types';
import { SupportedLanguage, SupportedCountry } from '../../src/i18n/types';

/**
 * 生成系统提示词的配置
 */
export interface SystemPromptConfig {
  profile: PlayerProfile;
  language?: SupportedLanguage;
  country?: SupportedCountry;
  templateId?: string;
  customTemplate?: string;
  isJsonModeForOpenAI?: boolean;
}

/**
 * MBTI 类型名称（双语）
 */
export const MBTI_NAMES: Record<SupportedLanguage, Record<string, string>> = {
  'zh-CN': {
    INTJ: '建筑师',
    INTP: '逻辑学家',
    ENTJ: '指挥官',
    ENTP: '辩论家',
    INFJ: '提倡者',
    INFP: '调停者',
    ENFJ: '主人公',
    ENFP: '竞选者',
    ISTJ: '物流师',
    ISFJ: '守卫者',
    ESTJ: '总经理',
    ESFJ: '执政官',
    ISTP: '鉴赏家',
    ISFP: '探险家',
    ESTP: '企业家',
    ESFP: '表演者',
  },
  'en-US': {
    INTJ: 'Architect',
    INTP: 'Logician',
    ENTJ: 'Commander',
    ENTP: 'Debater',
    INFJ: 'Advocate',
    INFP: 'Mediator',
    ENFJ: 'Protagonist',
    ENFP: 'Campaigner',
    ISTJ: 'Logistician',
    ISFJ: 'Defender',
    ESTJ: 'Executive',
    ESFJ: 'Consul',
    ISTP: 'Virtuoso',
    ISFP: 'Adventurer',
    ESTP: 'Entrepreneur',
    ESFP: 'Entertainer',
  },
};

/**
 * JSON Schema 结构（用于 OpenAI 兼容模式）
 */
export const SCENARIO_SCHEMA_STRUCTURE = {
  type: 'object',
  properties: {
    phase: { type: 'string', description: 'Current Time and Status' },
    description: {
      type: 'string',
      description: 'Detailed narrative of the situation',
    },
    feedback: {
      type: 'string',
      description: 'Immediate consequence of previous action',
    },
    isGameOver: {
      type: 'boolean',
      description: 'True only after simulation end or critical failure',
    },
    options: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          text: { type: 'string', description: 'Action choice' },
        },
        required: ['id', 'text'],
      },
    },
  },
  required: ['phase', 'description', 'options', 'isGameOver'],
};
