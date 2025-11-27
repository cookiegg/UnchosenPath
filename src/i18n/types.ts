/**
 * i18n Type Definitions
 * Defines supported languages and countries for internationalization
 */

/** Supported UI languages */
export type SupportedLanguage = 'zh-CN' | 'en-US';

/** Supported country contexts for life simulation */
export type SupportedCountry = 'CN' | 'US';

/** Supported prompt styles for narrative tone */
export type PromptStyle = 'classic' | 'ai-era' | 'optimistic';

/** i18n configuration state */
export interface I18nConfig {
  language: SupportedLanguage;
  country: SupportedCountry;
}

/** Default language when browser language is not supported */
export const DEFAULT_LANGUAGE: SupportedLanguage = 'zh-CN';

/** Default country context */
export const DEFAULT_COUNTRY: SupportedCountry = 'CN';

/** List of all supported languages */
export const SUPPORTED_LANGUAGES: SupportedLanguage[] = ['zh-CN', 'en-US'];

/** List of all supported countries */
export const SUPPORTED_COUNTRIES: SupportedCountry[] = ['CN', 'US'];

/** List of all supported prompt styles */
export const SUPPORTED_PROMPT_STYLES: PromptStyle[] = ['classic', 'ai-era', 'optimistic'];

/** Default prompt style */
export const DEFAULT_PROMPT_STYLE: PromptStyle = 'classic';

/** localStorage key for persisting prompt style preference */
export const PROMPT_STYLE_STORAGE_KEY = 'selectedPromptStyle';

/** localStorage key for persisting language preference */
export const LANGUAGE_STORAGE_KEY = 'i18nextLng';

/** localStorage key for persisting country preference */
export const COUNTRY_STORAGE_KEY = 'selectedCountry';
