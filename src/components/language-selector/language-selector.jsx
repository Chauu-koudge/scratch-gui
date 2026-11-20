import PropTypes from 'prop-types';
import React from 'react';

import openblockLocales from 'openblock-l10n';
import {venagoLocaleNames} from '../../lib/venago-locales';

// Venago: openblock-l10n languages, then the Indian languages.
const locales = Object.assign({}, openblockLocales);
Object.keys(venagoLocaleNames).forEach(code => {
    locales[code] = {name: venagoLocaleNames[code]};
});
import styles from './language-selector.css';

// supported languages to exclude from the menu, but allow as a URL option
const ignore = [];

const LanguageSelector = ({currentLocale, label, onChange}) => (
    <select
        aria-label={label}
        className={styles.languageSelect}
        value={currentLocale}
        onChange={onChange}
    >
        {
            Object.keys(locales)
                .filter(l => !ignore.includes(l))
                .map(locale => (
                    <option
                        key={locale}
                        value={locale}
                    >
                        {locales[locale].name}
                    </option>
                ))
        }
    </select>
);

LanguageSelector.propTypes = {
    currentLocale: PropTypes.string,
    label: PropTypes.string,
    onChange: PropTypes.func
};

export default LanguageSelector;
