/**
 * Venago: remember the language chosen in the language menu across page reloads.
 * Browser storage can be unavailable (private mode, blocked site data), so every
 * access is wrapped in try/catch and the editor works without it.
 */
const KEY = 'venago.locale';

/**
 * @param {Array.<string>} supportedLocales - locale codes the editor supports.
 * @return {?string} the saved locale, if it is still supported.
 */
const getSavedLocale = supportedLocales => {
    try {
        const locale = window.localStorage.getItem(KEY);
        return locale && supportedLocales.includes(locale) ? locale : null;
    } catch (e) {
        return null;
    }
};

/** @param {string} locale - the chosen locale code. */
const saveLocale = locale => {
    try {
        window.localStorage.setItem(KEY, locale);
    } catch (e) {
        // storage unavailable: the choice just won't be remembered
    }
};

export {getSavedLocale, saveLocale};
