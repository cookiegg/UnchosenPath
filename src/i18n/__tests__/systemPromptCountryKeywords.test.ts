/**
 * Property Test: System Prompt Country Keywords
 *
 * **Feature: internationalization, Property 5: Country System Prompt Contains Country Keywords**
 * **Validates: Requirements 5.1, 5.2**
 *
 * Property: For any supported country, the generated system prompt should contain
 * keywords specific to that country's social context.
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { getSystemPrompt } from '../../../services/systemPrompts';
import { SUPPORTED_COUNTRIES, SUPPORTED_LANGUAGES, type SupportedCountry, type SupportedLanguage } from '../types';
import type { PlayerProfile } from '../../../types';

/**
 * Country-specific keywords for testing
 * These keywords should appear in prompts for the respective countries
 */
const COUNTRY_KEYWORDS: Record<SupportedCountry, Record<SupportedLanguage, string[]>> = {
  'CN': {
    'zh-CN': ['中国', '高考', '985', '211', '内卷', '躺平', '户籍', '公务员', '北上广深', '一线城市'],
    'en-US': ['Chinese', 'Gaokao', 'hukou', 'involution', 'lying flat', 'civil service', 'Beijing', 'Shanghai', 'tier-1']
  },
  'US': {
    'zh-CN': ['美国', '学生贷款', '401k', '硅谷', '华尔街', '常春藤', '美国梦', '纽约', '加州'],
    'en-US': ['American', 'student loan', '401(k)', 'Silicon Valley', 'Wall Street', 'Ivy League', 'American Dream', 'New York', 'California']
  }
};

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

describe('Property 5: Country System Prompt Contains Country Keywords', () => {
  /**
   * Property: For any supported country and language combination,
   * the system prompt should contain at least some country-specific keywords
   */
  it('should contain country-specific keywords for any country and language combination', () => {
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

        // Get the country-specific keywords for this language
        const keywords = COUNTRY_KEYWORDS[country][language];

        // The prompt should contain at least one of the country-specific keywords
        const containsKeyword = keywords.some(keyword => 
          prompt.toLowerCase().includes(keyword.toLowerCase())
        );

        expect(
          containsKeyword,
          `System prompt for ${country}/${language} should contain at least one of: ${keywords.join(', ')}`
        ).toBe(true);
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property: For any supported country, keywords should be defined for all supported languages
   */
  it('should have keywords defined for all supported languages', () => {
    const countryArb = fc.constantFrom(...SUPPORTED_COUNTRIES) as fc.Arbitrary<SupportedCountry>;

    fc.assert(
      fc.property(countryArb, (country) => {
        // Should have keywords for all supported languages
        for (const language of SUPPORTED_LANGUAGES) {
          expect(
            COUNTRY_KEYWORDS[country][language],
            `Country ${country} should have keywords for ${language}`
          ).toBeDefined();

          expect(
            Array.isArray(COUNTRY_KEYWORDS[country][language]),
            `Keywords for ${country}/${language} should be an array`
          ).toBe(true);

          expect(
            COUNTRY_KEYWORDS[country][language].length,
            `Keywords for ${country}/${language} should not be empty`
          ).toBeGreaterThan(0);
        }
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property: For any supported country, the system prompt should NOT contain
   * keywords from OTHER countries (to ensure country-specific content)
   * Validates: Requirements 5.1, 5.2 - ensuring prompts are country-specific
   */
  it('should not contain keywords from other countries', () => {
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

        // Get keywords from OTHER countries
        const otherCountries = SUPPORTED_COUNTRIES.filter(c => c !== country);
        
        for (const otherCountry of otherCountries) {
          const otherKeywords = COUNTRY_KEYWORDS[otherCountry][language];

          // Check that the prompt doesn't contain keywords unique to other countries
          // We check for exact matches to avoid false positives
          for (const keyword of otherKeywords) {
            // Skip generic keywords that might appear in both contexts
            const genericKeywords = ['student', 'loan', 'university', 'college', '大学', '学生'];
            if (genericKeywords.some(g => keyword.toLowerCase().includes(g.toLowerCase()))) {
              continue;
            }

            const containsOtherKeyword = prompt.toLowerCase().includes(keyword.toLowerCase());
            expect(
              containsOtherKeyword,
              `System prompt for ${country}/${language} should not contain "${keyword}" from ${otherCountry}`
            ).toBe(false);
          }
        }
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property: All supported countries should have keyword definitions
   */
  it('should have keyword definitions for all supported countries', () => {
    // Should have keywords for all supported countries
    expect(Object.keys(COUNTRY_KEYWORDS).length).toBe(SUPPORTED_COUNTRIES.length);

    for (const country of SUPPORTED_COUNTRIES) {
      expect(COUNTRY_KEYWORDS[country]).toBeDefined();
    }
  });
});
