/**
 * Property Test: Locale Key Consistency
 *
 * **Feature: internationalization, Property 7: Locale Key Consistency**
 * **Validates: Requirements 6.4**
 *
 * Property: For any two supported locales, they should have exactly the same
 * set of translation keys.
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';

// Import locale files directly for testing
import zhCN from '../locales/zh-CN.json';
import enUS from '../locales/en-US.json';

// Type for locale data
type LocaleData = Record<string, unknown>;

// All supported locales
const LOCALES: Record<string, LocaleData> = {
  'zh-CN': zhCN,
  'en-US': enUS,
};

const LOCALE_NAMES = Object.keys(LOCALES);

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
 * Get keys that exist in source but not in target
 */
function getMissingKeys(sourceKeys: string[], targetKeys: string[]): string[] {
  const targetSet = new Set(targetKeys);
  return sourceKeys.filter((key) => !targetSet.has(key));
}

describe('Property 7: Locale Key Consistency', () => {
  // Pre-extract keys for all locales
  const localeKeys: Record<string, string[]> = {};
  for (const [name, data] of Object.entries(LOCALES)) {
    localeKeys[name] = extractAllKeys(data);
  }

  /**
   * Property: For any pair of locales, they should have the same keys
   */
  it('should have identical keys across all locale pairs', () => {
    // Generate all pairs of locales
    const localePairArb = fc.tuple(
      fc.constantFrom(...LOCALE_NAMES),
      fc.constantFrom(...LOCALE_NAMES)
    );

    fc.assert(
      fc.property(localePairArb, ([locale1, locale2]) => {
        const keys1 = localeKeys[locale1];
        const keys2 = localeKeys[locale2];

        // Keys missing in locale2 that exist in locale1
        const missingInLocale2 = getMissingKeys(keys1, keys2);
        // Keys missing in locale1 that exist in locale2
        const missingInLocale1 = getMissingKeys(keys2, keys1);

        // Both should be empty for consistency
        expect(missingInLocale2).toEqual([]);
        expect(missingInLocale1).toEqual([]);
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property: For any key in any locale, all other locales should have that key
   */
  it('should have every key present in all locales', () => {
    // Get all unique keys across all locales
    const allKeys = new Set<string>();
    for (const keys of Object.values(localeKeys)) {
      for (const key of keys) {
        allKeys.add(key);
      }
    }

    // Arbitrary for any key from any locale
    const keyArb = fc.constantFrom(...Array.from(allKeys));

    fc.assert(
      fc.property(keyArb, (key) => {
        // Every locale should have this key
        for (const [localeName, keys] of Object.entries(localeKeys)) {
          expect(
            keys.includes(key),
            `Key "${key}" is missing in locale "${localeName}"`
          ).toBe(true);
        }
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property: All locales should have the same number of keys
   */
  it('should have the same number of keys in all locales', () => {
    const keyCounts = Object.entries(localeKeys).map(([name, keys]) => ({
      name,
      count: keys.length,
    }));

    // All counts should be equal
    const firstCount = keyCounts[0].count;
    for (const { name, count } of keyCounts) {
      expect(
        count,
        `Locale "${name}" has ${count} keys, expected ${firstCount}`
      ).toBe(firstCount);
    }
  });

  /**
   * Diagnostic test: List any missing keys for debugging
   */
  it('should report missing keys between zh-CN and en-US', () => {
    const zhKeys = localeKeys['zh-CN'];
    const enKeys = localeKeys['en-US'];

    const missingInEn = getMissingKeys(zhKeys, enKeys);
    const missingInZh = getMissingKeys(enKeys, zhKeys);

    if (missingInEn.length > 0) {
      console.log('Keys in zh-CN but missing in en-US:', missingInEn);
    }
    if (missingInZh.length > 0) {
      console.log('Keys in en-US but missing in zh-CN:', missingInZh);
    }

    expect(missingInEn).toEqual([]);
    expect(missingInZh).toEqual([]);
  });
});
