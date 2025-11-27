/**
 * Property Test: Country Context Data Completeness
 *
 * **Feature: internationalization, Property 4: Country Context Data Completeness**
 * **Validates: Requirements 3.2, 3.3, 4.1-4.8**
 *
 * Property: For any supported country, the country context should contain valid,
 * non-empty arrays for locations, education levels, university tiers, family
 * backgrounds, and parent occupations.
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { getCountryContext, getAllCountryContexts } from '../countries';
import { SUPPORTED_COUNTRIES, SUPPORTED_LANGUAGES, type SupportedCountry, type SupportedLanguage } from '../types';

describe('Property 4: Country Context Data Completeness', () => {
  /**
   * Property: For any supported country and language combination,
   * the country context should have all required fields with non-empty data
   */
  it('should have complete data for any country and language combination', () => {
    const countryArb = fc.constantFrom(...SUPPORTED_COUNTRIES) as fc.Arbitrary<SupportedCountry>;
    const languageArb = fc.constantFrom(...SUPPORTED_LANGUAGES) as fc.Arbitrary<SupportedLanguage>;

    fc.assert(
      fc.property(countryArb, languageArb, (country, language) => {
        const context = getCountryContext(country, language);

        // Verify id matches the requested country
        expect(context.id).toBe(country);

        // Verify name is a non-empty string
        expect(typeof context.name).toBe('string');
        expect(context.name.trim().length).toBeGreaterThan(0);

        // Verify flag is a non-empty string
        expect(typeof context.flag).toBe('string');
        expect(context.flag.trim().length).toBeGreaterThan(0);

        // Verify locations has provinces with cities
        expect(Array.isArray(context.locations.provinces)).toBe(true);
        expect(context.locations.provinces.length).toBeGreaterThan(0);

        // Verify educationLevels is a non-empty array of strings
        expect(Array.isArray(context.educationLevels)).toBe(true);
        expect(context.educationLevels.length).toBeGreaterThan(0);

        // Verify universityTiers is a non-empty array of strings
        expect(Array.isArray(context.universityTiers)).toBe(true);
        expect(context.universityTiers.length).toBeGreaterThan(0);

        // Verify familyBackgrounds is a non-empty array of strings
        expect(Array.isArray(context.familyBackgrounds)).toBe(true);
        expect(context.familyBackgrounds.length).toBeGreaterThan(0);

        // Verify parentsOccupations is a non-empty array of strings
        expect(Array.isArray(context.parentsOccupations)).toBe(true);
        expect(context.parentsOccupations.length).toBeGreaterThan(0);

        // Verify currentStatuses is a non-empty array of strings
        expect(Array.isArray(context.currentStatuses)).toBe(true);
        expect(context.currentStatuses.length).toBeGreaterThan(0);
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property: For any province in any country context,
   * it should have a non-empty name and at least one city
   * Validates: Requirements 4.1, 4.2
   */
  it('should have valid provinces with cities for any country', () => {
    const countryArb = fc.constantFrom(...SUPPORTED_COUNTRIES) as fc.Arbitrary<SupportedCountry>;
    const languageArb = fc.constantFrom(...SUPPORTED_LANGUAGES) as fc.Arbitrary<SupportedLanguage>;

    fc.assert(
      fc.property(countryArb, languageArb, (country, language) => {
        const context = getCountryContext(country, language);

        for (const province of context.locations.provinces) {
          // Province name should be non-empty
          expect(typeof province.name).toBe('string');
          expect(
            province.name.trim().length,
            `Province name should not be empty in ${country}/${language}`
          ).toBeGreaterThan(0);

          // Province should have at least one city
          expect(Array.isArray(province.cities)).toBe(true);
          expect(
            province.cities.length,
            `Province "${province.name}" should have at least one city`
          ).toBeGreaterThan(0);

          // Each city should be a non-empty string
          for (const city of province.cities) {
            expect(typeof city).toBe('string');
            expect(
              city.trim().length,
              `City name should not be empty in province "${province.name}"`
            ).toBeGreaterThan(0);
          }
        }
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property: For any education level in any country context,
   * it should be a non-empty string
   * Validates: Requirements 4.3, 4.4
   */
  it('should have valid education levels for any country', () => {
    const countryArb = fc.constantFrom(...SUPPORTED_COUNTRIES) as fc.Arbitrary<SupportedCountry>;
    const languageArb = fc.constantFrom(...SUPPORTED_LANGUAGES) as fc.Arbitrary<SupportedLanguage>;

    fc.assert(
      fc.property(countryArb, languageArb, (country, language) => {
        const context = getCountryContext(country, language);

        for (const level of context.educationLevels) {
          expect(typeof level).toBe('string');
          expect(
            level.trim().length,
            `Education level should not be empty in ${country}/${language}`
          ).toBeGreaterThan(0);
        }
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property: For any university tier in any country context,
   * it should be a non-empty string
   * Validates: Requirements 4.5, 4.6
   */
  it('should have valid university tiers for any country', () => {
    const countryArb = fc.constantFrom(...SUPPORTED_COUNTRIES) as fc.Arbitrary<SupportedCountry>;
    const languageArb = fc.constantFrom(...SUPPORTED_LANGUAGES) as fc.Arbitrary<SupportedLanguage>;

    fc.assert(
      fc.property(countryArb, languageArb, (country, language) => {
        const context = getCountryContext(country, language);

        for (const tier of context.universityTiers) {
          expect(typeof tier).toBe('string');
          expect(
            tier.trim().length,
            `University tier should not be empty in ${country}/${language}`
          ).toBeGreaterThan(0);
        }
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property: For any family background in any country context,
   * it should be a non-empty string
   * Validates: Requirements 4.7, 4.8
   */
  it('should have valid family backgrounds for any country', () => {
    const countryArb = fc.constantFrom(...SUPPORTED_COUNTRIES) as fc.Arbitrary<SupportedCountry>;
    const languageArb = fc.constantFrom(...SUPPORTED_LANGUAGES) as fc.Arbitrary<SupportedLanguage>;

    fc.assert(
      fc.property(countryArb, languageArb, (country, language) => {
        const context = getCountryContext(country, language);

        for (const background of context.familyBackgrounds) {
          expect(typeof background).toBe('string');
          expect(
            background.trim().length,
            `Family background should not be empty in ${country}/${language}`
          ).toBeGreaterThan(0);
        }
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property: For any parent occupation in any country context,
   * it should be a non-empty string
   */
  it('should have valid parent occupations for any country', () => {
    const countryArb = fc.constantFrom(...SUPPORTED_COUNTRIES) as fc.Arbitrary<SupportedCountry>;
    const languageArb = fc.constantFrom(...SUPPORTED_LANGUAGES) as fc.Arbitrary<SupportedLanguage>;

    fc.assert(
      fc.property(countryArb, languageArb, (country, language) => {
        const context = getCountryContext(country, language);

        for (const occupation of context.parentsOccupations) {
          expect(typeof occupation).toBe('string');
          expect(
            occupation.trim().length,
            `Parent occupation should not be empty in ${country}/${language}`
          ).toBeGreaterThan(0);
        }
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property: getAllCountryContexts should return contexts for all supported countries
   */
  it('should return all country contexts via getAllCountryContexts', () => {
    const languageArb = fc.constantFrom(...SUPPORTED_LANGUAGES) as fc.Arbitrary<SupportedLanguage>;

    fc.assert(
      fc.property(languageArb, (language) => {
        const contexts = getAllCountryContexts(language);

        // Should return contexts for all supported countries
        expect(contexts.length).toBe(SUPPORTED_COUNTRIES.length);

        // Each context should have a unique id
        const ids = contexts.map(c => c.id);
        const uniqueIds = new Set(ids);
        expect(uniqueIds.size).toBe(SUPPORTED_COUNTRIES.length);

        // All supported countries should be represented
        for (const country of SUPPORTED_COUNTRIES) {
          expect(ids).toContain(country);
        }
      }),
      { numRuns: 100 }
    );
  });
});
