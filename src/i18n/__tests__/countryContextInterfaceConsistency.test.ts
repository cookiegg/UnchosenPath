/**
 * Property Test: Country Context Interface Consistency
 *
 * **Feature: internationalization, Property 8: Country Context Interface Consistency**
 * **Validates: Requirements 6.3**
 *
 * Property: For any supported country, the country context should conform to
 * the CountryContext interface with all required fields.
 *
 * This test ensures that all country modules implement the same interface
 * consistently, making it straightforward to add new countries.
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { getCountryContext, getAllCountryContexts, CountryContext } from '../countries';
import { SUPPORTED_COUNTRIES, SUPPORTED_LANGUAGES, type SupportedCountry, type SupportedLanguage } from '../types';

/**
 * Required fields that must exist on every CountryContext
 * Based on the CountryContext interface in types.ts
 */
const REQUIRED_FIELDS: (keyof CountryContext)[] = [
  'id',
  'name',
  'flag',
  'locations',
  'educationLevels',
  'universityTiers',
  'familyBackgrounds',
  'parentsOccupations',
  'currentStatuses'
];

/**
 * Required array fields that must be string arrays
 */
const REQUIRED_STRING_ARRAY_FIELDS: (keyof CountryContext)[] = [
  'educationLevels',
  'universityTiers',
  'familyBackgrounds',
  'parentsOccupations',
  'currentStatuses'
];

describe('Property 8: Country Context Interface Consistency', () => {
  /**
   * Property: For any supported country and language combination,
   * the country context should have all required fields defined in the interface
   */
  it('should have all required interface fields for any country and language', () => {
    const countryArb = fc.constantFrom(...SUPPORTED_COUNTRIES) as fc.Arbitrary<SupportedCountry>;
    const languageArb = fc.constantFrom(...SUPPORTED_LANGUAGES) as fc.Arbitrary<SupportedLanguage>;

    fc.assert(
      fc.property(countryArb, languageArb, (country, language) => {
        const context = getCountryContext(country, language);

        // Verify all required fields exist
        for (const field of REQUIRED_FIELDS) {
          expect(
            context[field],
            `Field "${field}" should be defined for ${country}/${language}`
          ).toBeDefined();
        }
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property: For any supported country and language combination,
   * the id field should be a valid SupportedCountry type
   */
  it('should have valid id type for any country context', () => {
    const countryArb = fc.constantFrom(...SUPPORTED_COUNTRIES) as fc.Arbitrary<SupportedCountry>;
    const languageArb = fc.constantFrom(...SUPPORTED_LANGUAGES) as fc.Arbitrary<SupportedLanguage>;

    fc.assert(
      fc.property(countryArb, languageArb, (country, language) => {
        const context = getCountryContext(country, language);

        expect(typeof context.id).toBe('string');
        expect(SUPPORTED_COUNTRIES).toContain(context.id);
        expect(context.id).toBe(country);
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property: For any supported country and language combination,
   * string fields should be of type string
   */
  it('should have correct string field types for any country context', () => {
    const countryArb = fc.constantFrom(...SUPPORTED_COUNTRIES) as fc.Arbitrary<SupportedCountry>;
    const languageArb = fc.constantFrom(...SUPPORTED_LANGUAGES) as fc.Arbitrary<SupportedLanguage>;

    fc.assert(
      fc.property(countryArb, languageArb, (country, language) => {
        const context = getCountryContext(country, language);

        expect(typeof context.name).toBe('string');
        expect(typeof context.flag).toBe('string');
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property: For any supported country and language combination,
   * array fields should be arrays of strings
   */
  it('should have correct array field types for any country context', () => {
    const countryArb = fc.constantFrom(...SUPPORTED_COUNTRIES) as fc.Arbitrary<SupportedCountry>;
    const languageArb = fc.constantFrom(...SUPPORTED_LANGUAGES) as fc.Arbitrary<SupportedLanguage>;

    fc.assert(
      fc.property(countryArb, languageArb, (country, language) => {
        const context = getCountryContext(country, language);

        for (const field of REQUIRED_STRING_ARRAY_FIELDS) {
          const value = context[field];
          expect(
            Array.isArray(value),
            `Field "${field}" should be an array for ${country}/${language}`
          ).toBe(true);

          // Each element should be a string
          for (const item of value as string[]) {
            expect(
              typeof item,
              `Each item in "${field}" should be a string for ${country}/${language}`
            ).toBe('string');
          }
        }
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property: For any supported country and language combination,
   * the locations field should have the correct structure
   */
  it('should have correct locations structure for any country context', () => {
    const countryArb = fc.constantFrom(...SUPPORTED_COUNTRIES) as fc.Arbitrary<SupportedCountry>;
    const languageArb = fc.constantFrom(...SUPPORTED_LANGUAGES) as fc.Arbitrary<SupportedLanguage>;

    fc.assert(
      fc.property(countryArb, languageArb, (country, language) => {
        const context = getCountryContext(country, language);

        // locations should be an object with provinces array
        expect(typeof context.locations).toBe('object');
        expect(context.locations).not.toBeNull();
        expect(Array.isArray(context.locations.provinces)).toBe(true);

        // Each province should have name (string) and cities (string[])
        for (const province of context.locations.provinces) {
          expect(typeof province).toBe('object');
          expect(province).not.toBeNull();
          expect(typeof province.name).toBe('string');
          expect(Array.isArray(province.cities)).toBe(true);

          for (const city of province.cities) {
            expect(typeof city).toBe('string');
          }
        }
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property: All country contexts should have the same set of fields
   * This ensures interface consistency across all country modules
   */
  it('should have identical field sets across all country contexts', () => {
    const languageArb = fc.constantFrom(...SUPPORTED_LANGUAGES) as fc.Arbitrary<SupportedLanguage>;

    fc.assert(
      fc.property(languageArb, (language) => {
        const contexts = getAllCountryContexts(language);

        // Get field names from first context as reference
        const referenceFields = new Set(Object.keys(contexts[0]));

        // All other contexts should have the same fields
        for (const context of contexts.slice(1)) {
          const contextFields = new Set(Object.keys(context));

          // Check that all reference fields exist
          for (const field of referenceFields) {
            expect(
              contextFields.has(field),
              `Country ${context.id} should have field "${field}"`
            ).toBe(true);
          }

          // Check that no extra fields exist
          for (const field of contextFields) {
            expect(
              referenceFields.has(field),
              `Country ${context.id} has unexpected field "${field}"`
            ).toBe(true);
          }
        }
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Array field lengths should be consistent across countries
   * for the same language (ensuring comparable options)
   */
  it('should have comparable array field lengths across countries', () => {
    const languageArb = fc.constantFrom(...SUPPORTED_LANGUAGES) as fc.Arbitrary<SupportedLanguage>;

    fc.assert(
      fc.property(languageArb, (language) => {
        const contexts = getAllCountryContexts(language);

        for (const field of REQUIRED_STRING_ARRAY_FIELDS) {
          // All countries should have at least some options for each field
          for (const context of contexts) {
            const value = context[field] as string[];
            expect(
              value.length,
              `${context.id} should have at least one ${field} option`
            ).toBeGreaterThan(0);
          }
        }
      }),
      { numRuns: 100 }
    );
  });
});
