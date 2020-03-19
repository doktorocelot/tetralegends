import { loadLanguage } from "./loaders.js";
import $ from "./shortcuts.js";

class Locale {
  constructor() {
    // this.languages = ['en_US', 'en_GB', 'es_ES', 'ja_JP', 'pl_PL', 'zh_CN']
    this.languages = ['en_US']
    this.files = ['ui', 'menu_general', 'menu_root', 'menu_guideline', 'menu_tetrax', 'menu_retro', 'menu_controls', 'menu_tuning', 'menu_daspresets', 'menu_audio', 'menu_video'];
    this.test = new Promise(
      function (resolve, reject) {
        resolve('test');
      }
    )
    this.currentLanguage = 'en_US';
  }
  getString(file, name) {
    return this[file][this.currentLanguage][name].message
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
                console.log(languageFile)
                this[file][language] = languageFile;
                loaded++
                if (loaded >= toLoad) {
                  resolve('done!')
                }
              })
        }
      }
    })
    return load
        .then((string) => {
          return string;
        })
  }
  changeLang(locale) {
    this.currentLanguage = locale;
  }
}
const locale = new Locale();
export default locale;