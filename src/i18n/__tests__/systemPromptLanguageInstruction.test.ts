/**
 * Property Test: System Prompt Language Instruction
 *
 * **Feature: internationalization, Property 6: System Prompt Language Instruction**
 * **Validates: Requirements 5.5, 5.6**
 *
 * Property: For any language and country combination, the system prompt should
 * contain an instruction specifying the output language.
 *
 * Requirements:
 * - 5.5: WHEN the language is English and country is China THEN the AI SHALL output in English
 * - 5.6: WHEN the language is Chinese and country is USA THEN the AI SHALL output in Chinese
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { getSystemPrompt } from '../../../services/systemPrompts';
import { SUPPORTED_COUNTRIES, SUPPORTED_LANGUAGES, type SupportedCountry, type SupportedLanguage } from '../types';
import type { PlayerProfile } from '../../../types';

/**
 * Create a minimal valid PlayerProfile for testing
 */
function createTestProfile(): PlayerProfile {
  return {
    name: 'Test User',
    gender: 'Male',
    age: 22,
    currentStatus: 'Student',
    education: "Bachelor's",
    familyBackground: 'Middle Class',
    parentsOccupation: 'Professional',
    hometown: { province: 'Test Province', city: 'Test City' },
    currentLocation: { province: 'Test Province', city: 'Test City' },
    mbti: {
      energySource: 'I',
      perception: 'N',
      decision: 'T',
      lifestyle: 'J'
    },
    major: 'Computer Science',
    skills: 'Programming',
    simulationStartYear: 2024,
    simulationEndYear: 2034
  };
}

/**
 * Language instruction keywords that should appear in the system prompt
 * based on the output language
 */
const LANGUAGE_INSTRUCTION_KEYWORDS: Record<SupportedLanguage, string[]> = {
  'zh-CN': ['中文', '输出'],
  'en-US': ['English', 'output']
};

describe('Property 6: System Prompt Language Instruction', () => {
  /**
   * Property: For any supported language and country combination,
   * the system prompt should contain language instruction keywords
   */
  it('should contain language instruction for any language and country combination', () => {
    const countryArb = fc.constantFrom(...SUPPORTED_COUNTRIES) as fc.Arbitrary<SupportedCountry>;
    const languageArb = fc.constantFrom(...SUPPORTED_LANGUAGES) as fc.Arbitrary<SupportedLanguage>;

    fc.assert(
      fc.property(countryArb, languageArb, (country, language) => {
        const profile = createTestProfile();
        const prompt = getSystemPrompt({
          profile,
          language,
          country,
          isJsonModeForOpenAI: false
        });

        const keywords = LANGUAGE_INSTRUCTION_KEYWORDS[language];

        // The prompt should contain at least one language instruction keyword
        const containsLanguageInstruction = keywords.some(keyword =>
          prompt.toLowerCase().includes(keyword.toLowerCase())
        );

        expect(
          containsLanguageInstruction,
          `System prompt for ${country}/${language} should contain language instruction keywords: ${keywords.join(', ')}`
        ).toBe(true);
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property: When language is English and country is China,
   * the prompt should instruct AI to output in English
   * Validates: Requirement 5.5
   */
  it('should instruct English output when language is en-US regardless of country', () => {
    const countryArb = fc.constantFrom(...SUPPORTED_COUNTRIES) as fc.Arbitrary<SupportedCountry>;

    fc.assert(
      fc.property(countryArb, (country) => {
        const profile = createTestProfile();
        const prompt = getSystemPrompt({
          profile,
          language: 'en-US',
          country,
          isJsonModeForOpenAI: false
        });

        // Should contain English output instruction
        const hasEnglishInstruction = 
          prompt.toLowerCase().includes('english') &&
          (prompt.toLowerCase().includes('output') || prompt.toLowerCase().includes('language'));

        expect(
          hasEnglishInstruction,
          `System prompt for ${country}/en-US should contain English output instruction`
        ).toBe(true);
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property: When language is Chinese and country is USA,
   * the prompt should instruct AI to output in Chinese
   * Validates: Requirement 5.6
   */
  it('should instruct Chinese output when language is zh-CN regardless of country', () => {
    const countryArb = fc.constantFrom(...SUPPORTED_COUNTRIES) as fc.Arbitrary<SupportedCountry>;

    fc.assert(
      fc.property(countryArb, (country) => {
        const profile = createTestProfile();
        const prompt = getSystemPrompt({
          profile,
          language: 'zh-CN',
          country,
          isJsonModeForOpenAI: false
        });

        // Should contain Chinese output instruction
        const hasChineseInstruction = 
          prompt.includes('中文') &&
          (prompt.includes('输出') || prompt.includes('语言'));

        expect(
          hasChineseInstruction,
          `System prompt for ${country}/zh-CN should contain Chinese output instruction`
        ).toBe(true);
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Cross-country language instruction should be explicit
   * When using a different language than the country's native language,
   * the instruction should be more explicit about the output language
   * Validates: Requirements 5.5, 5.6
   */
  it('should have explicit language instruction for cross-country scenarios', () => {
    // Test specific cross-country scenarios
    const crossCountryScenarios: Array<{ country: SupportedCountry; language: SupportedLanguage }> = [
      { country: 'CN', language: 'en-US' }, // English output for Chinese context
      { country: 'US', language: 'zh-CN' }  // Chinese output for American context
    ];

    for (const scenario of crossCountryScenarios) {
      const profile = createTestProfile();
      const prompt = getSystemPrompt({
        profile,
        language: scenario.language,
        country: scenario.country,
        isJsonModeForOpenAI: false
      });

      if (scenario.language === 'en-US') {
        // For English output, should mention "English" and "output"
        expect(
          prompt.toLowerCase().includes('english'),
          `Cross-country prompt for ${scenario.country}/${scenario.language} should mention "English"`
        ).toBe(true);
      } else {
        // For Chinese output, should mention "中文" and "输出"
        expect(
          prompt.includes('中文'),
          `Cross-country prompt for ${scenario.country}/${scenario.language} should mention "中文"`
        ).toBe(true);
      }
    }
  });

  /**
   * Property: Language instruction section should exist in all prompts
   * The prompt should have a dedicated section for language instructions
   */
  it('should have a language instruction section marker', () => {
    const countryArb = fc.constantFrom(...SUPPORTED_COUNTRIES) as fc.Arbitrary<SupportedCountry>;
    const languageArb = fc.constantFrom(...SUPPORTED_LANGUAGES) as fc.Arbitrary<SupportedLanguage>;

    fc.assert(
      fc.property(countryArb, languageArb, (country, language) => {
        const profile = createTestProfile();
        const prompt = getSystemPrompt({
          profile,
          language,
          country,
          isJsonModeForOpenAI: false
        });

        // Should have some form of language instruction header/marker
        const hasLanguageSection = 
          prompt.includes('Output Language') ||
          prompt.includes('输出语言') ||
          prompt.includes('IMPORTANT: Output Language') ||
          prompt.includes('重要：输出语言');

        expect(
          hasLanguageSection,
          `System prompt for ${country}/${language} should have a language instruction section`
        ).toBe(true);
      }),
      { numRuns: 100 }
    );
  });
});
