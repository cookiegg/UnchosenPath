/**
 * Property Test: Language Persistence Round Trip
 * 
 * **Feature: internationalization, Property 3: Language Persistence Round Trip**
 * **Validates: Requirements 1.4, 1.5**
 * 
 * Property: For any language selection, saving to localStorage and then 
 * restoring should return the same language.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import * as fc from 'fast-check';
import {
  saveLanguagePreference,
  loadLanguagePreference,
  SUPPORTED_LANGUAGES,
  LANGUAGE_STORAGE_KEY,
  type SupportedLanguage,
} from '../index';

describe('Property 3: Language Persistence Round Trip', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  /**
   * Property: For any supported language, saving and loading should be idempotent
   * save(lang) -> load() === lang
   */
  it('should persist and restore any supported language correctly', () => {
    // Arbitrary generator for supported languages
    const supportedLanguageArb = fc.constantFrom(...SUPPORTED_LANGUAGES) as fc.Arbitrary<SupportedLanguage>;

    fc.assert(
      fc.property(supportedLanguageArb, (language) => {
        // Clear localStorage before each iteration
        localStorage.clear();

        // Save the language preference
        saveLanguagePreference(language);

        // Load the language preference
        const loadedLanguage = loadLanguagePreference();

        // The loaded language should match the saved language
        expect(loadedLanguage).toBe(language);
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Multiple saves should result in the last saved value being loaded
   */
  it('should return the most recently saved language', () => {
    const supportedLanguageArb = fc.constantFrom(...SUPPORTED_LANGUAGES) as fc.Arbitrary<SupportedLanguage>;

    fc.assert(
      fc.property(
        fc.array(supportedLanguageArb, { minLength: 1, maxLength: 10 }),
        (languages) => {
          // Clear localStorage before each iteration
          localStorage.clear();

          // Save each language in sequence
          for (const lang of languages) {
            saveLanguagePreference(lang);
          }

          // Load should return the last saved language
          const loadedLanguage = loadLanguagePreference();
          const lastSavedLanguage = languages[languages.length - 1];

          expect(loadedLanguage).toBe(lastSavedLanguage);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Loading without saving should return null
   */
  it('should return null when no language has been saved', () => {
    localStorage.clear();
    const loadedLanguage = loadLanguagePreference();
    expect(loadedLanguage).toBeNull();
  });

  /**
   * Property: Saved language should be stored under the correct key
   */
  it('should store language under the correct localStorage key', () => {
    const supportedLanguageArb = fc.constantFrom(...SUPPORTED_LANGUAGES) as fc.Arbitrary<SupportedLanguage>;

    fc.assert(
      fc.property(supportedLanguageArb, (language) => {
        localStorage.clear();

        saveLanguagePreference(language);

        // Verify the value is stored under the correct key
        const storedValue = localStorage.getItem(LANGUAGE_STORAGE_KEY);
        expect(storedValue).toBe(language);
      }),
      { numRuns: 100 }
    );
  });
});
