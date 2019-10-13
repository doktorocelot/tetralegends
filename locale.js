import {lang} from './script/lang/langset.js';
/**
 * Change the locale
 * @param {string} localeName The exact name of the locale in the language set
 */
function setLocale(localeName) {
  window.locale = lang[localeName].locale;
}
setLocale('en');
