import React from 'react';
import { useTranslation } from 'react-i18next';
import { SupportedCountry, SUPPORTED_COUNTRIES } from '../src/i18n/types';

interface CountrySelectorProps {
  value: SupportedCountry;
  onChange: (country: SupportedCountry) => void;
  className?: string;
}

/** Country display configuration with flags and translation keys */
const COUNTRY_CONFIG: Record<SupportedCountry, { flag: string; translationKey: string }> = {
  'CN': { flag: '🇨🇳', translationKey: 'countries.china' },
  'US': { flag: '🇺🇸', translationKey: 'countries.usa' },
};

/**
 * CountrySelector Component
 * Displays country options with flags for selecting simulation context
 */
const CountrySelector: React.FC<CountrySelectorProps> = ({ 
  value, 
  onChange, 
  className = '' 
}) => {
  const { t } = useTranslation();

  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCountry = e.target.value as SupportedCountry;
    onChange(newCountry);
  };

  return (
    <select
      value={value}
      onChange={handleCountryChange}
      className={`
        bg-academic-800 text-academic-100 
        border border-academic-600 rounded-lg 
        px-3 py-2 text-sm
        hover:bg-academic-700 hover:border-academic-500
        focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent
        cursor-pointer transition-all duration-200
        ${className}
      `}
      aria-label={t('form.selectCountry')}
    >
      {SUPPORTED_COUNTRIES.map((country) => {
        const config = COUNTRY_CONFIG[country];
        return (
          <option key={country} value={country}>
            {config.flag} {t(config.translationKey)}
          </option>
        );
      })}
    </select>
  );
};

export default CountrySelector;
