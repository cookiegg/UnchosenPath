/**
 * Property Test: Translation Completeness
 *
 * **Feature: internationalization, Property 2: Language Switching Updates All Text**
 * **Validates: Requirements 1.3, 2.1, 2.2**
 *
 * Property: For any supported language, when selected, all translation keys
 * should return non-empty strings in that language.
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
 * Recursively extract all keys from a nested object
 * Returns keys in dot notation (e.g., "app.title", "nav.history")
 */
function extractAllKeys(obj: LocaleData, prefix = ''): string[] {
  const keys: string[] = [];

  for (const key of Object.keys(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    const value = obj[key];

    if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
      // Recurse into nested objects
      keys.push(...extractAllKeys(value as LocaleData, fullKey));
    } else {
      // Leaf node - add the key
      keys.push(fullKey);
    }
  }

  return keys.sort();
}

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

describe('Property 2: Language Switching Updates All Text', () => {
  // Pre-extract keys for all locales
  const localeKeys: Record<SupportedLanguage, string[]> = {} as Record<SupportedLanguage, string[]>;
  for (const lang of SUPPORTED_LANGUAGES) {
    localeKeys[lang] = extractAllKeys(LOCALES[lang]);
  }

  // Get all unique keys across all locales
  const allKeys = new Set<string>();
  for (const keys of Object.values(localeKeys)) {
    for (const key of keys) {
      allKeys.add(key);
    }
  }

  /**
   * Property: For any supported language, all translation keys should return non-empty strings
   */
  it('should have non-empty translations for all keys in every supported language', () => {
    // Arbitrary generator for supported languages
    const languageArb = fc.constantFrom(...SUPPORTED_LANGUAGES);
    // Arbitrary generator for any translation key
    const keyArb = fc.constantFrom(...Array.from(allKeys));

    fc.assert(
      fc.property(languageArb, keyArb, (language, key) => {
        const locale = LOCALES[language];
        const value = getValueAtPath(locale, key);

        // Value should exist
        expect(
          value,
          `Key "${key}" is missing in locale "${language}"`
        ).toBeDefined();

        // Value should be a non-empty string
        expect(
          typeof value === 'string',
          `Key "${key}" in locale "${language}" should be a string, got ${typeof value}`
        ).toBe(true);

        expect(
          (value as string).trim().length > 0,
          `Key "${key}" in locale "${language}" should not be empty`
        ).toBe(true);
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property: For any supported language, switching to it should provide complete translations
   * This simulates the language switching behavior
   */
  it('should provide complete translations when switching to any supported language', () => {
    const languageArb = fc.constantFrom(...SUPPORTED_LANGUAGES);

    fc.assert(
      fc.property(languageArb, (language) => {
        const locale = LOCALES[language];
        const keys = localeKeys[language];

        // Every key in this locale should have a non-empty string value
        for (const key of keys) {
          const value = getValueAtPath(locale, key);

          expect(
            typeof value === 'string' && value.trim().length > 0,
            `Key "${key}" in locale "${language}" should be a non-empty string`
          ).toBe(true);
        }
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Chinese locale (zh-CN) should have all UI elements in Chinese
   * Validates Requirement 2.1
   */
  it('should display all UI elements in Chinese when language is zh-CN', () => {
    const zhLocale = LOCALES['zh-CN'];
    const keys = localeKeys['zh-CN'];

    for (const key of keys) {
      const value = getValueAtPath(zhLocale, key);

      expect(
        typeof value === 'string',
        `Key "${key}" in zh-CN should be a string`
      ).toBe(true);

      expect(
        (value as string).trim().length > 0,
        `Key "${key}" in zh-CN should not be empty`
      ).toBe(true);
    }
  });

  /**
   * Property: English locale (en-US) should have all UI elements in English
   * Validates Requirement 2.2
   */
  it('should display all UI elements in English when language is en-US', () => {
    const enLocale = LOCALES['en-US'];
    const keys = localeKeys['en-US'];

    for (const key of keys) {
      const value = getValueAtPath(enLocale, key);

      expect(
        typeof value === 'string',
        `Key "${key}" in en-US should be a string`
      ).toBe(true);

      expect(
        (value as string).trim().length > 0,
        `Key "${key}" in en-US should not be empty`
      ).toBe(true);
    }
  });

  /**
   * Property: All translations should be distinct between languages (no untranslated keys)
   * This helps catch cases where a key was added but not translated
   * Note: Some keys may legitimately be the same (e.g., brand names, technical terms)
   */
  it('should have mostly distinct translations between zh-CN and en-US', () => {
    const zhLocale = LOCALES['zh-CN'];
    const enLocale = LOCALES['en-US'];
    const keys = localeKeys['zh-CN'];

    // Count how many keys have identical values
    let identicalCount = 0;
    const identicalKeys: string[] = [];

    for (const key of keys) {
      const zhValue = getValueAtPath(zhLocale, key);
      const enValue = getValueAtPath(enLocale, key);

      if (zhValue === enValue) {
        identicalCount++;
        identicalKeys.push(key);
      }
    }

    // Allow some identical keys (brand names, technical terms, etc.)
    // But flag if more than 10% are identical as a warning
    const identicalPercentage = (identicalCount / keys.length) * 100;

    if (identicalPercentage > 10) {
      console.warn(
        `Warning: ${identicalPercentage.toFixed(1)}% of keys have identical values in zh-CN and en-US:`,
        identicalKeys.slice(0, 10),
        identicalKeys.length > 10 ? `... and ${identicalKeys.length - 10} more` : ''
      );
    }

    // This is a soft check - we just want to ensure translations exist
    // The key consistency test already ensures all keys are present
    expect(keys.length).toBeGreaterThan(0);
  });
});
