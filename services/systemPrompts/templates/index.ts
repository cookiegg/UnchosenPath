/**
 * Template Registry
 * 管理所有预设模板和自定义模板
 */

import { SupportedLanguage } from '../../../src/i18n/types';
import { classicTemplate } from './classic';
import { aiEraTemplate } from './ai-era';
import { optimisticTemplate } from './optimistic';

export interface PromptTemplate {
  id: string;
  name: Record<SupportedLanguage, string>;
  description: Record<SupportedLanguage, string>;
  template: string;
  isCustom?: boolean;
}

// 预设模板
export const builtInTemplates: PromptTemplate[] = [
  classicTemplate,
  aiEraTemplate,
  optimisticTemplate,
];

// localStorage key
const CUSTOM_TEMPLATES_KEY = 'life_sim_custom_templates';
const SELECTED_TEMPLATE_KEY = 'life_sim_selected_template';

/**
 * 获取所有自定义模板
 */
export function getCustomTemplates(): PromptTemplate[] {
  try {
    const saved = localStorage.getItem(CUSTOM_TEMPLATES_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Failed to load custom templates:', e);
  }
  return [];
}

/**
 * 保存自定义模板
 */
export function saveCustomTemplate(template: PromptTemplate): void {
  const templates = getCustomTemplates();
  const index = templates.findIndex(t => t.id === template.id);
  
  const templateToSave = { ...template, isCustom: true };
  
  if (index >= 0) {
    templates[index] = templateToSave;
  } else {
    templates.push(templateToSave);
  }
  
  localStorage.setItem(CUSTOM_TEMPLATES_KEY, JSON.stringify(templates));
}

/**
 * 删除自定义模板
 */
export function deleteCustomTemplate(id: string): void {
  const templates = getCustomTemplates().filter(t => t.id !== id);
  localStorage.setItem(CUSTOM_TEMPLATES_KEY, JSON.stringify(templates));
}

/**
 * 获取所有模板（预设 + 自定义）
 */
export function getAllTemplates(): PromptTemplate[] {
  return [...builtInTemplates, ...getCustomTemplates()];
}

/**
 * 根据 ID 获取模板
 */
export function getTemplateById(id: string): PromptTemplate | undefined {
  return getAllTemplates().find(t => t.id === id);
}

/**
 * 获取保存的选中模板 ID
 */
export function getSelectedTemplateId(): string {
  try {
    return localStorage.getItem(SELECTED_TEMPLATE_KEY) || 'classic';
  } catch {
    return 'classic';
  }
}

/**
 * 保存选中的模板 ID
 */
export function setSelectedTemplateId(id: string): void {
  localStorage.setItem(SELECTED_TEMPLATE_KEY, id);
}

/**
 * 获取模板的本地化名称
 */
export function getTemplateName(template: PromptTemplate, language: SupportedLanguage): string {
  return template.name[language] || template.name['zh-CN'];
}

/**
 * 获取模板的本地化描述
 */
export function getTemplateDescription(template: PromptTemplate, language: SupportedLanguage): string {
  return template.description[language] || template.description['zh-CN'];
}

// Re-export individual templates for direct access
export { classicTemplate } from './classic';
export { aiEraTemplate } from './ai-era';
export { optimisticTemplate } from './optimistic';
