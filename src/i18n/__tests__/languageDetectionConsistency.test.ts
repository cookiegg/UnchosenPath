/**
 * Property Test: Language Detection Consistency
 * 
 * **Feature: internationalization, Property 1: Language Detection Consistency**
 * **Validates: Requirements 1.1**
 * 
 * Property: For any browser language setting, the i18n system should initialize 
 * with a supported language (defaulting to zh-CN if unsupported).
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import {
  normalizeLanguage,
  isSupportedLanguage,
  SUPPORTED_LANGUAGES,
  DEFAULT_LANGUAGE,
} from '../index';

describe('Property 1: Language Detection Consistency', () => {
  /**
   * Property: For any browser language string, normalizeLanguage should always 
   * return a supported language
   */
  it('should always return a supported language for any input', () => {
    // Generate arbitrary strings that could represent browser language codes
    const browserLanguageArb = fc.oneof(
      // Common browser language formats
      fc.constantFrom('zh', 'zh-CN', 'zh-TW', 'zh-Hans', 'zh-Hant'),
      fc.constantFrom('en', 'en-US', 'en-GB', 'en-AU', 'en-CA'),
      // Other languages that should fall back to default
      fc.constantFrom('fr', 'de', 'es', 'ja', 'ko', 'pt', 'ru', 'ar'),
      // Language with region codes
      fc.constantFrom('fr-FR', 'de-DE', 'es-ES', 'ja-JP', 'ko-KR'),
      // Random strings
      fc.string({ minLength: 0, maxLength: 10 }),
      // Edge cases
      fc.constantFrom('', ' ', 'unknown', 'xx-XX', '123')
    );

    fc.assert(
      fc.property(browserLanguageArb, (browserLang) => {
        const result = normalizeLanguage(browserLang);
        
        // Result should always be a supported language
        expect(SUPPORTED_LANGUAGES).toContain(result);
        expect(isSupportedLanguage(result)).toBe(true);
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Supported languages should be returned as-is
   */
  it('should return supported languages unchanged', () => {
    const supportedLanguageArb = fc.constantFrom(...SUPPORTED_LANGUAGES);

    fc.assert(
      fc.property(supportedLanguageArb, (lang) => {
        const result = normalizeLanguage(lang);
        expect(result).toBe(lang);
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Chinese language variants should normalize to zh-CN
   */
  it('should normalize Chinese variants to zh-CN', () => {
    const chineseVariantsArb = fc.constantFrom(
      'zh', 'zh-CN', 'zh-TW', 'zh-Hans', 'zh-Hant', 'zh-HK', 'zh-SG'
    );

    fc.assert(
      fc.property(chineseVariantsArb, (lang) => {
        const result = normalizeLanguage(lang);
        expect(result).toBe('zh-CN');
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property: English language variants should normalize to en-US
   */
  it('should normalize English variants to en-US', () => {
    const englishVariantsArb = fc.constantFrom(
      'en', 'en-US', 'en-GB', 'en-AU', 'en-CA', 'en-NZ', 'en-IE'
    );

    fc.assert(
      fc.property(englishVariantsArb, (lang) => {
        const result = normalizeLanguage(lang);
        expect(result).toBe('en-US');
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Unsupported languages should fall back to default language
   */
  it('should fall back to default language for unsupported languages', () => {
    const unsupportedLanguagesArb = fc.constantFrom(
      'fr', 'de', 'es', 'ja', 'ko', 'pt', 'ru', 'ar', 'it', 'nl',
      'fr-FR', 'de-DE', 'es-ES', 'ja-JP', 'ko-KR', 'pt-BR', 'ru-RU'
    );

    fc.assert(
      fc.property(unsupportedLanguagesArb, (lang) => {
        const result = normalizeLanguage(lang);
        expect(result).toBe(DEFAULT_LANGUAGE);
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property: isSupportedLanguage should correctly identify supported languages
   */
  it('should correctly identify supported vs unsupported languages', () => {
    // Test that all supported languages are recognized
    for (const lang of SUPPORTED_LANGUAGES) {
      expect(isSupportedLanguage(lang)).toBe(true);
    }

    // Test that unsupported languages are not recognized
    const unsupportedArb = fc.constantFrom(
      'fr', 'de', 'es', 'ja', 'ko', 'zh', 'en', 'unknown', ''
    );

    fc.assert(
      fc.property(unsupportedArb, (lang) => {
        // These are not in the exact supported format
        if (!SUPPORTED_LANGUAGES.includes(lang as any)) {
          expect(isSupportedLanguage(lang)).toBe(false);
        }
      }),
      { numRuns: 100 }
    );
  });
});
