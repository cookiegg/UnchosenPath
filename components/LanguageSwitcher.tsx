import React from 'react';
import { useTranslation } from 'react-i18next';
import { 
  SupportedLanguage, 
  SUPPORTED_LANGUAGES, 
  changeLanguage, 
  getCurrentLanguage,
  saveLanguagePreference 
} from '../src/i18n';

interface LanguageSwitcherProps {
  className?: string;
}

/** Display names for each supported language */
const LANGUAGE_DISPLAY_NAMES: Record<SupportedLanguage, string> = {
  'zh-CN': '中文',
  'en-US': 'English',
};

/**
 * LanguageSwitcher Component
 * Renders a dropdown for language selection with persistence to localStorage
 */
const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ className = '' }) => {
  useTranslation(); // Hook to trigger re-render on language change
  const currentLanguage = getCurrentLanguage();

  const handleLanguageChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLanguage = e.target.value as SupportedLanguage;
    await changeLanguage(newLanguage);
    saveLanguagePreference(newLanguage);
  };

  return (
    <select
      value={currentLanguage}
      onChange={handleLanguageChange}
      className={`
        bg-academic-800 text-academic-100 
        border border-academic-600 rounded-lg 
        px-3 py-2 text-sm
        hover:bg-academic-700 hover:border-academic-500
        focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent
        cursor-pointer transition-all duration-200
        ${className}
      `}
      aria-label="Select language"
    >
      {SUPPORTED_LANGUAGES.map((lang) => (
        <option key={lang} value={lang}>
          {LANGUAGE_DISPLAY_NAMES[lang]}
        </option>
      ))}
    </select>
  );
};

export default LanguageSwitcher;
