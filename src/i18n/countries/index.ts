/**
 * Country Context Module Index
 * Exports all country modules and provides the getCountryContext loader function
 * Requirements: 3.2, 3.3
 */

import { SupportedCountry, SupportedLanguage, DEFAULT_COUNTRY, DEFAULT_LANGUAGE } from '../types';
import { CountryContext, CountryContextModule } from './types';
import { chinaContext } from './china';
import { usaContext } from './usa';

// Re-export types for convenience
export * from './types';

/**
 * Registry of all available country context modules
 */
const countryModules: Record<SupportedCountry, CountryContextModule> = {
  CN: chinaContext,
  US: usaContext
};

/**
 * Get country context for a specific country and language combination
 * 
 * @param country - The country to get context for (defaults to CN)
 * @param language - The language for display names (defaults to zh-CN)
 * @returns CountryContext with all country-specific data
 * 
 * @example
 * // Get China context in Chinese
 * const chinaZh = getCountryContext('CN', 'zh-CN');
 * 
 * // Get USA context in English
 * const usaEn = getCountryContext('US', 'en-US');
 * 
 * // Get China context in English (for English speakers learning about China)
 * const chinaEn = getCountryContext('CN', 'en-US');
 */
export function getCountryContext(
  country: SupportedCountry = DEFAULT_COUNTRY,
  language: SupportedLanguage = DEFAULT_LANGUAGE
): CountryContext {
  const module = countryModules[country];
  
  if (!module) {
    console.warn(`Country "${country}" not supported, falling back to ${DEFAULT_COUNTRY}`);
    return countryModules[DEFAULT_COUNTRY].getContext(language);
  }
  
  return module.getContext(language);
}

/**
 * Get all available country contexts for a given language
 * Useful for displaying country selection options
 * 
 * @param language - The language for display names
 * @returns Array of CountryContext for all supported countries
 */
export function getAllCountryContexts(language: SupportedLanguage = DEFAULT_LANGUAGE): CountryContext[] {
  return Object.values(countryModules).map(module => module.getContext(language));
}

/**
 * Check if a country is supported
 * 
 * @param country - Country code to check
 * @returns true if the country is supported
 */
export function isCountrySupported(country: string): country is SupportedCountry {
  return country in countryModules;
}
