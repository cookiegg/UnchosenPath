/**
 * Property Test: Export Localization
 *
 * **Feature: internationalization, Property 9: Export Uses Current Locale**
 * **Validates: Requirements 8.2**
 *
 * Property: For any language setting, the Markdown export should contain
 * localized template strings matching the current language.
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';

// Import locale files directly for testing
import zhCN from '../locales/zh-CN.json';
import enUS from '../locales/en-US.json';
import { SUPPORTED_LANGUAGES, type SupportedLanguage } from '../types';

// Type for locale data
type LocaleData = Record<string, unknown>;

// All supported locales mapped by language code
const LOCALES: Record<SupportedLanguage, LocaleData> = {
  'zh-CN': zhCN,
  'en-US': enUS,
};

/**
 * Get the value at a dot-notation path in a nested object
 */
function getValueAtPath(obj: LocaleData, path: string): unknown {
  const parts = path.split('.');
  let current: unknown = obj;

  for (const part of parts) {
    if (current === null || typeof current !== 'object') {
      return undefined;
    }
    current = (current as Record<string, unknown>)[part];
  }

  return current;
}

/**
 * Translation keys used in the Markdown export function (handleExport in App.tsx)
 * These are the keys that must be localized for the export to work correctly
 */
const EXPORT_TRANSLATION_KEYS = [
  'evaluation.generatedTime',
  'evaluation.finalEvaluation',
  'evaluation.score',
  'evaluation.personalProfile',
  'evaluation.lifeHistory',
  'evaluation.situation',
  'evaluation.choice',
  'evaluation.result',
  'evaluation.summary',
  'evaluation.lifeAdvice',
  'form.age',
  'form.education',
  'form.major',
  'form.profession',
  'form.student',
];

/**
 * Simulates the export content generation for a given language
 * This mirrors the logic in handleExport from App.tsx
 */
function generateExportLabels(language: SupportedLanguage): Record<string, string> {
  const locale = LOCALES[language];
  const isEnglish = language === 'en-US';

  const t = (key: string): string => {
    const value = getValueAtPath(locale, key);
    return typeof value === 'string' ? value : key;
  };

  return {
    yearsLife: isEnglish ? "TestName's 10-Year Life" : 'TestName的10年人生',
    generatedTime: t('evaluation.generatedTime'),
    finalEvaluation: t('evaluation.finalEvaluation'),
    score: t('evaluation.score'),
    personalProfile: t('evaluation.personalProfile'),
    age: t('form.age'),
    education: t('form.education'),
    major: t('form.major'),
    profession: t('form.profession'),
    lifeHistory: t('evaluation.lifeHistory'),
    situation: t('evaluation.situation'),
    choice: t('evaluation.choice'),
    result: t('evaluation.result'),
    summary: t('evaluation.summary'),
    lifeAdvice: t('evaluation.lifeAdvice'),
    student: t('form.student'),
    lifeSimulation: isEnglish ? 'Life_Simulation' : '人生模拟',
  };
}

/**
 * Generates a mock Markdown export content using the given language
 */
function generateMockExportContent(language: SupportedLanguage): string {
  const labels = generateExportLabels(language);
  const isEnglish = language === 'en-US';

  let content = `# ${labels.yearsLife} (2024-2034)\n\n`;
  content += `> ${labels.generatedTime}: 2024/1/1\n`;
  content += `> ${labels.finalEvaluation}: Test Title (${labels.score}: 85)\n\n`;

  content += `## ${labels.personalProfile}\n`;
  content += `- ${labels.age}: 25${isEnglish ? '' : '岁'}（2024${isEnglish ? '' : '年'}）\n`;
  content += `- ${labels.education}: Bachelor's\n`;
  content += `- ${labels.major}: Computer Science\n`;
  content += `- MBTI: INTJ\n\n`;

  content += `## ${labels.lifeHistory}\n\n`;
  content += `### Phase 1\n`;
  content += `**${labels.situation}**: Test situation\n\n`;
  content += `**${labels.choice}**: Test choice\n\n`;
  content += `**${labels.result}**: Test result\n\n`;
  content += `---\n\n`;

  content += `## ${labels.summary}\n\n`;
  content += `Test summary\n\n`;
  content += `## ${labels.lifeAdvice}\n\n`;
  content += `Test advice\n`;

  return content;
}

describe('Property 9: Export Uses Current Locale', () => {
  /**
   * Property: For any supported language, all export-related translation keys
   * should exist and return non-empty strings
   */
  it('should have all export-related translation keys for every supported language', () => {
    const languageArb = fc.constantFrom(...SUPPORTED_LANGUAGES);
    const keyArb = fc.constantFrom(...EXPORT_TRANSLATION_KEYS);

    fc.assert(
      fc.property(languageArb, keyArb, (language, key) => {
        const locale = LOCALES[language];
        const value = getValueAtPath(locale, key);

        // Value should exist
        expect(
          value,
          `Export key "${key}" is missing in locale "${language}"`
        ).toBeDefined();

        // Value should be a non-empty string
        expect(
          typeof value === 'string',
          `Export key "${key}" in locale "${language}" should be a string, got ${typeof value}`
        ).toBe(true);

        expect(
          (value as string).trim().length > 0,
          `Export key "${key}" in locale "${language}" should not be empty`
        ).toBe(true);
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property: For any supported language, the generated export content
   * should contain localized strings from that language's locale
   */
  it('should generate export content with localized strings for any language', () => {
    const languageArb = fc.constantFrom(...SUPPORTED_LANGUAGES);

    fc.assert(
      fc.property(languageArb, (language) => {
        const content = generateMockExportContent(language);
        const locale = LOCALES[language];

        // Check that key localized strings appear in the export
        const expectedStrings = [
          getValueAtPath(locale, 'evaluation.generatedTime'),
          getValueAtPath(locale, 'evaluation.finalEvaluation'),
          getValueAtPath(locale, 'evaluation.score'),
          getValueAtPath(locale, 'evaluation.personalProfile'),
          getValueAtPath(locale, 'evaluation.lifeHistory'),
          getValueAtPath(locale, 'evaluation.situation'),
          getValueAtPath(locale, 'evaluation.choice'),
          getValueAtPath(locale, 'evaluation.result'),
          getValueAtPath(locale, 'evaluation.summary'),
          getValueAtPath(locale, 'evaluation.lifeAdvice'),
          getValueAtPath(locale, 'form.age'),
          getValueAtPath(locale, 'form.education'),
        ];

        for (const expected of expectedStrings) {
          expect(
            content.includes(expected as string),
            `Export content for "${language}" should contain "${expected}"`
          ).toBe(true);
        }
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Chinese export should contain Chinese-specific strings
   * Validates that zh-CN export uses Chinese locale
   */
  it('should use Chinese strings when language is zh-CN', () => {
    const content = generateMockExportContent('zh-CN');

    // Chinese-specific strings that should appear
    const chineseStrings = [
      '生成时间',      // evaluation.generatedTime
      '最终评价',      // evaluation.finalEvaluation
      '人生满意度',    // evaluation.score
      '个人档案',      // evaluation.personalProfile
      '人生履历',      // evaluation.lifeHistory
      '情境',          // evaluation.situation
      '抉择',          // evaluation.choice
      '结果',          // evaluation.result
      '最终回顾',      // evaluation.summary
      '人生建议',      // evaluation.lifeAdvice
      '年龄',          // form.age
      '学历',          // form.education
    ];

    for (const str of chineseStrings) {
      expect(
        content.includes(str),
        `Chinese export should contain "${str}"`
      ).toBe(true);
    }

    // Should contain Chinese-specific formatting
    expect(content).toContain('岁');
    expect(content).toContain('年');
    // Title should be in Chinese format
    expect(content).toContain('年人生');
  });

  /**
   * Property: English export should contain English-specific strings
   * Validates that en-US export uses English locale
   */
  it('should use English strings when language is en-US', () => {
    const content = generateMockExportContent('en-US');

    // English-specific strings that should appear
    const englishStrings = [
      'Generated',           // evaluation.generatedTime
      'Final Evaluation',    // evaluation.finalEvaluation
      'Life Satisfaction',   // evaluation.score
      'Personal Profile',    // evaluation.personalProfile
      'Life History',        // evaluation.lifeHistory
      'Situation',           // evaluation.situation
      'Choice',              // evaluation.choice
      'Result',              // evaluation.result
      'Final Review',        // evaluation.summary
      'Life Advice',         // evaluation.lifeAdvice
      'Age',                 // form.age
      'Education',           // form.education
    ];

    for (const str of englishStrings) {
      expect(
        content.includes(str),
        `English export should contain "${str}"`
      ).toBe(true);
    }

    // Should contain English-specific formatting (no Chinese characters for age/year)
    expect(content).not.toContain('岁');
    expect(content).not.toContain('年人生');
    // Title should be in English format
    expect(content).toContain('-Year Life');
  });

  /**
   * Property: Export labels should be distinct between languages
   * This ensures translations are actually different
   */
  it('should have distinct export labels between zh-CN and en-US', () => {
    const zhLabels = generateExportLabels('zh-CN');
    const enLabels = generateExportLabels('en-US');

    // These labels should be different between languages
    const keysToCompare = [
      'generatedTime',
      'finalEvaluation',
      'score',
      'personalProfile',
      'lifeHistory',
      'situation',
      'choice',
      'result',
      'summary',
      'lifeAdvice',
      'age',
      'education',
      'lifeSimulation',
    ];

    for (const key of keysToCompare) {
      expect(
        zhLabels[key] !== enLabels[key],
        `Label "${key}" should be different between zh-CN ("${zhLabels[key]}") and en-US ("${enLabels[key]}")`
      ).toBe(true);
    }
  });
});
