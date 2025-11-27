/**
 * Country Context Type Definitions
 * Defines interfaces for country-specific data used in life simulation
 * Requirements: 6.3 - Consistent interface across all countries
 */

import { SupportedCountry, SupportedLanguage } from '../types';

/**
 * Province/State with associated cities
 */
export interface Province {
  name: string;
  cities: string[];
}

/**
 * Geographic location data for a country
 */
export interface LocationData {
  provinces: Province[];
}

/**
 * Complete country context containing all country-specific data
 * This interface must be implemented consistently by all country modules
 */
export interface CountryContext {
  /** Country identifier */
  id: SupportedCountry;
  /** Display name in current locale */
  name: string;
  /** Flag emoji for display */
  flag: string;
  /** Geographic locations (provinces/states and cities) */
  locations: LocationData;
  /** Education level options */
  educationLevels: string[];
  /** University tier/ranking options */
  universityTiers: string[];
  /** Family background options */
  familyBackgrounds: string[];
  /** Parent occupation options */
  parentsOccupations: string[];
  /** Current life status options */
  currentStatuses: string[];
}

/**
 * Module interface for country context providers
 * Each country module must export a function that returns CountryContext
 * based on the requested language
 */
export interface CountryContextModule {
  getContext: (language: SupportedLanguage) => CountryContext;
}
