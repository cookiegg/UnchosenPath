import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { SupportedCountry, SupportedLanguage, DEFAULT_COUNTRY } from '../src/i18n/types';
import { getCountryContext } from '../src/i18n/countries';

interface LocationValue {
    province: string;
    city: string;
}

interface LocationCascaderProps {
    value: LocationValue;
    onChange: (value: LocationValue) => void;
    disabled?: boolean;
    country?: SupportedCountry;
}

const LocationCascader: React.FC<LocationCascaderProps> = ({ 
    value, 
    onChange, 
    disabled = false,
    country = DEFAULT_COUNTRY
}) => {
    const { i18n, t } = useTranslation();
    const currentLanguage = i18n.language as SupportedLanguage;
    
    // Get country-specific location data
    const countryContext = getCountryContext(country, currentLanguage);
    const locationData = countryContext.locations;
    
    // Build regions map from country context
    const regions: Record<string, string[]> = {};
    locationData.provinces.forEach(province => {
        regions[province.name] = province.cities;
    });
    
    const [cities, setCities] = useState<string[]>(
        value.province ? regions[value.province] || [] : []
    );

    // Update cities when country or language changes
    useEffect(() => {
        if (value.province && regions[value.province]) {
            setCities(regions[value.province]);
        } else {
            setCities([]);
        }
    }, [country, currentLanguage, value.province]);

    const handleProvinceChange = (province: string) => {
        const newCities = regions[province] || [];
        setCities(newCities);
        onChange({
            province,
            city: newCities[0] || ''
        });
    };

    const handleCityChange = (city: string) => {
        onChange({
            ...value,
            city
        });
    };

    const provinceLabel = country === 'US' ? t('form.selectState') : t('form.selectProvince');
    const cityLabel = t('form.selectCity');

    return (
        <div className="grid grid-cols-2 gap-2">
            <div>
                <select
                    className="w-full bg-academic-900 border border-academic-600 text-academic-100 p-2 rounded focus:outline-none focus:border-amber-600 transition-colors appearance-none text-sm disabled:opacity-50"
                    value={value.province}
                    onChange={(e) => handleProvinceChange(e.target.value)}
                    disabled={disabled}
                >
                    <option value="">{provinceLabel}</option>
                    {Object.keys(regions).map((province) => (
                        <option key={province} value={province}>
                            {province}
                        </option>
                    ))}
                </select>
            </div>
            <div>
                <select
                    className="w-full bg-academic-900 border border-academic-600 text-academic-100 p-2 rounded focus:outline-none focus:border-amber-600 transition-colors appearance-none text-sm disabled:opacity-50"
                    value={value.city}
                    onChange={(e) => handleCityChange(e.target.value)}
                    disabled={disabled || !value.province}
                >
                    <option value="">{cityLabel}</option>
                    {cities.map((city) => (
                        <option key={city} value={city}>
                            {city}
                        </option>
                    ))}
                </select>
            </div>
        </div>
    );
};

export default LocationCascader;
