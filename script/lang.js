import {loadLanguage} from './loaders.js';
import settings from './settings.js';
import gameHandler from './game/game-handler.js';
import $ from './shortcuts.js'

class Locale {
  constructor() {
    this.languages = ['en_US', 'en_GB', 'es_ES', 'ja_JP', 'pl_PL', 'zh_CN', 'it_IT', 'vi_VN', 'de_DE', 'fr_FR', 'nl_NL', 'ko_KR', 'pl_PL', 'ru_RU'];
    // this.languages = ['en_US'];
    this.files = ['ui', 'menu_general', 'menu_root', 'menu_guideline', 'menu_tetrax',
      'menu_retro', 'menu_controls', 'menu_tuning', 'menu_daspresets', 'menu_audio',
      'menu_video', 'action-text', 'mode-options'];
    this.test = new Promise(
        function(resolve, reject) {
          resolve('test');
        },
    );
    this.currentLanguage = 'en_US';
    this.loaded = {};
    for (const file of this.files) {
      this[file] = {};
    }
  }
  getString(file, name, vars = []) {
    if (this.currentLanguage === 'blank') {
      return '⠀⠀⠀⠀⠀⠀';
    }
    try {
      let str = this[file][this.currentLanguage][name].message;
      for (let i = 0; i < vars.length; i++) {
        const replacement = vars[i];
        const placeholderString = `%${i + 1}`;
        const placeholder = new RegExp(placeholderString, 'g');
        str = str.replace(placeholder, replacement);
      }
      return str;
    } catch (error) {
      return '?UNKNOWN';
    }
  }
  loadAll() {
    const load = new Promise((resolve) => {
      const toLoad = this.languages.length * this.files.length;
      let loaded = 0;
      for (const file of this.files) {
        this[file] = {};
        for (const language of this.languages) {
          loadLanguage(language, file)
              .then((languageFile) => {
                this[file][language] = languageFile;
                loaded++;
                if (loaded >= toLoad) {
                  resolve('done!');
                }
              });
        }
      }
    });
    return load
        .then((string) => {
          this.currentLanguage = settings.settings.language;
          return string;
        });
  }
  loadLang(language) {
    const load = new Promise((resolve) => {
      if (this.loaded[language] || language === 'blank') {
        resolve('done!');
      } else {
        const toLoad = this.files.length;
        let loaded = 0;
        for (const file of this.files) {
          loadLanguage(language, file)
              .then((languageFile) => {
                this[file][language] = languageFile;
                loaded++;
                if (loaded >= toLoad) {
                  this.loaded[language] = true;
                  resolve('done!');
                }
              });
        }
      }
    });
    return load
        .then((string) => {
          this.currentLanguage = settings.settings.language;
          return string;
        });
  }
  changeLang(locale) {
    this.currentLanguage = locale;
    settings.settings.language = locale;
    this.updateFonts();
    this.updateTitle();
    this.updateLightWarning()
    settings.saveSettings();
  }

  updateLightWarning() {
    const str = this.getString('ui', 'flashingLights')
    $('#lights-warning').innerHTML = `<img src="img/tetrion/warning.svg" alt=""> ${str} ${(str.toLowerCase() === 'flashing lights') ? '' : ' (Flashing Lights)'}`
  }

  updateTitle() {
    switch (this.currentLanguage) {
      case 'ja_JP':
        document.title = 'テトラレジェンズ';
        document.documentElement.style.setProperty('--logo-image', `url("../img/brand/logo/ja_JP.svg")`);
        break;
      case 'ko_KR':
        document.title = '테트라 레전즈';
        document.documentElement.style.setProperty('--logo-image', `url("../img/brand/logo/ko_KR.svg")`);
        break;
      case 'ru_RU':
        document.title = 'Тетра Легенды';
        document.documentElement.style.setProperty('--logo-image', `url("../img/brand/logo/ru_RU.svg")`);
        break;
      default:
        document.title = 'Тetra Legends';
        document.documentElement.style.setProperty('--logo-image', `url("../img/brand/logo/default.svg")`);
        break;
    }
  }
  updateFonts() {
    const root = document.documentElement;
    switch (this.currentLanguage) {
      case 'zh_CN':
        root.style.setProperty('--main-font', '"Roboto", "Noto Sans SC", "Microsoft Yahei","微软雅黑", STXihei, "华文细黑", sans-serif');
        break;
      case 'ja_JP':
        root.style.setProperty('--main-font', '"Roboto", "Noto Sans JP", "ヒラギノ角ゴ Pro W3", "Hiragino Kaku Gothic Pro", Osaka, メイリオ, Meiryo, "ＭＳ Ｐゴシック", "MS PGothic", "ＭＳ ゴシック" , "MS Gothic", "Noto Sans CJK JP", TakaoPGothic, sans-serif');
        break;
      case 'ko_KR':
        root.style.setProperty('--main-font', '"Roboto", "Noto Sans KR", sans-serif');
        break;
      default:
        root.style.setProperty('--main-font', '"Roboto", sans-serif');
        break;
    }
  }
}
const locale = new Locale();
export default locale;
