/**
 * System Prompts Entry Point
 * 提供模板管理和提示词生成功能
 */

import { PlayerProfile } from '../../types';
import {
  SupportedLanguage,
  SupportedCountry,
  DEFAULT_LANGUAGE,
  DEFAULT_COUNTRY,
} from '../../src/i18n/types';
import { SystemPromptConfig } from './types';
import { buildPrompt } from './builder';
import {
  getAllTemplates,
  getTemplateById,
  getSelectedTemplateId,
  setSelectedTemplateId,
  saveCustomTemplate,
  deleteCustomTemplate,
  getTemplateName,
  getTemplateDescription,
  PromptTemplate,
} from './templates';

/**
 * 获取系统提示词
 * 使用选中的模板 + profile + country + language 生成
 */
export function getSystemPrompt(config: SystemPromptConfig): string {
  const {
    profile,
    language = DEFAULT_LANGUAGE,
    country = DEFAULT_COUNTRY,
    templateId,
    customTemplate,
    isJsonModeForOpenAI = false,
  } = config;

  // 优先使用自定义模板内容
  let templateContent: string;

  if (customTemplate) {
    templateContent = customTemplate;
  } else {
    const selectedId = templateId || getSelectedTemplateId();
    const template = getTemplateById(selectedId);
    templateContent = template?.template || getTemplateById('classic')!.template;
  }

  return buildPrompt({
    template: templateContent,
    profile,
    language,
    country,
    isJsonModeForOpenAI,
  });
}

/**
 * 获取当前选中的模板
 */
export function getCurrentTemplate(): PromptTemplate | undefined {
  const id = getSelectedTemplateId();
  return getTemplateById(id);
}

// Re-export template management functions
export {
  getAllTemplates,
  getTemplateById,
  getSelectedTemplateId,
  setSelectedTemplateId,
  saveCustomTemplate,
  deleteCustomTemplate,
  getTemplateName,
  getTemplateDescription,
  getCustomTemplates,
  builtInTemplates,
} from './templates';

// Re-export builder functions
export { buildPrompt, getTemplateVariables } from './builder';

// Re-export types
export type { PromptTemplate } from './templates';
export type { SystemPromptConfig } from './types';
export { MBTI_NAMES, SCENARIO_SCHEMA_STRUCTURE } from './types';
