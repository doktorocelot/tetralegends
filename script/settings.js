import menu from './menu/menu.js';
import sound from './sound.js';
import locale from './lang.js';
const SETTINGS_VERSION = 5;
class Settings {
  constructor() {
    this.defaultSettings = {
      language: 'en_US',
      // Tuning
      DAS: 170,
      ARR: 30,
      IRS: 'tap',
      IHS: 'tap',
      IAS: true,
      rotationSystem: 'auto',
      // Graphics
      theme: 'default',
      size: 100,
      nextLength: 6,
      skin: 'auto',
      color: 'auto',
      colorI: 'auto',
      colorL: 'auto',
      colorO: 'auto',
      colorZ: 'auto',
      colorT: 'auto',
      colorJ: 'auto',
      colorS: 'auto',
      outline: 'on',
      ghost: 'color',
      backgroundOpacity: 30,
      gridStyle: 'cross',
      lockFlash: 'shine',
      actionText: true,
      matrixSwayScale: 50,
      matrixSwaySpeed: 50,
      visualInitial: true,
      particles: true,
      particleLimit: 1500,
      particleSize: 3,
      particleScale: 2,
      useLockdownBar: true,
      displayActionText: true,
      // Audio
      sfxVolume: 50,
      musicVolume: 50,
      voiceVolume: 50,
      soundbank: 'auto',
      nextSoundbank: 'auto',
      voicebank: 'off',
    };
    switch (navigator.language.substr(0, 2)) {
      case 'fr':
        this.defaultSettings.language = 'fr_FR';
        break;
      case 'nl':
        this.defaultSettings.language = 'nl_NL';
        break;
      case 'de':
        this.defaultSettings.language = 'de_DE';
        break;
      case 'vi':
        this.defaultSettings.language = 'vi_VN';
        break;
      case 'it':
        this.defaultSettings.language = 'it_IT';
        break;
      case 'zh':
        this.defaultSettings.language = 'zh_CN';
        break;
      case 'es':
        this.defaultSettings.language = 'es_ES';
        break;
      case 'ja':
        this.defaultSettings.language = 'ja_JP';
        break;
      case 'ko':
        this.defaultSettings.language = 'ko_KR';
        break;
      case 'pl':
        this.defaultSettings.language = 'pl_PL';
        break;
      case 'ru':
        this.defaultSettings.language = 'ru_RU';
        break;
    }
    switch (this.defaultSettings.language) {
      case 'en_US':
      case 'en_GB':
        this.defaultSettings.voicebank = 'soraen';
        break;
      case 'ja_JP':
        this.defaultSettings.voicebank = 'sorajp';
        break;
    }
    this.defaultControls = {
      moveLeft: ['ArrowLeft'],
      moveRight: ['ArrowRight'],
      hardDrop: ['Space'],
      softDrop: ['ArrowDown'],
      rotateLeft: ['KeyZ', 'ControlLeft'],
      rotateRight: ['KeyX', 'ArrowUp'],
      rotate180: ['KeyD'],
      hold: ['KeyC', 'ShiftLeft'],
      retry: ['KeyR'],
      pause: ['Escape', 'KeyP'],
    };
    this.defaultGame = {
      marathon: {
        startingLevel: 1,
        lineGoal: 150,
        levelCap: -1,
      },
      sprint: {
        lineGoal: 40,
        regulationMode: false,
      },
      ultra: {
        timeLimit: 120000,
        useRta: false,
      },
      master: {
        startingLevel: 1,
        lockdownMode: 'extended',
      },
      survival: {
        startingLevel: 1,
        difficulty: 3,
        matrixWidth: 'narrow',
      },
      combo: {
        holdType: 'skip',
      },
      retro: {
        startingLevel: 0,
        mechanics: 'accurate',
      },
      prox: {
        startingLevel: 1,
      },
      handheld: {
        startingLevel: 0,
      }
    };
    this.settings = {};
    this.controls = {};
    this.game = {};
  }
  resetSettings() {
    this.settings = JSON.parse(JSON.stringify(this.defaultSettings));
  }
  resetControls() {
    this.controls = JSON.parse(JSON.stringify(this.defaultControls));
  }
  resetGame() {
    this.game = JSON.parse(JSON.stringify(this.defaultGame));
  }
  load() {
    for (const index of ['Settings', 'Controls', 'Game']) {
      const loaded = JSON.parse(localStorage.getItem(`tetra${index}`));
      if (loaded === null || parseInt(localStorage.getItem('tetraVersion')) !== SETTINGS_VERSION) {
        this[`reset${index}`]();
      } else {
        this[index.toLowerCase()] = JSON.parse(JSON.stringify(loaded));
        if (index === 'Game') {
          this[index.toLowerCase()] = {...JSON.parse(JSON.stringify(this[`default${index}`])), ...JSON.parse(JSON.stringify(this[index.toLowerCase()]))};
          for (const key of Object.keys(this.defaultGame)) {
            this[index.toLowerCase()][key] = {...JSON.parse(JSON.stringify(this[`default${index}`][key])), ...JSON.parse(JSON.stringify(this[index.toLowerCase()][key]))};
          }
          continue;
        }
        this[index.toLowerCase()] = {...JSON.parse(JSON.stringify(this[`default${index}`])), ...JSON.parse(JSON.stringify(this[index.toLowerCase()]))};
      }
    }
    this.saveAll();
  }
  saveSettings() {
    localStorage.setItem('tetraSettings', JSON.stringify(this.settings));
  }
  saveControls() {
    localStorage.setItem('tetraControls', JSON.stringify(this.controls));
  }
  saveGame() {
    localStorage.setItem('tetraGame', JSON.stringify(this.game));
  }
  saveVersion() {
    localStorage.setItem('tetraVersion', SETTINGS_VERSION);
  }
  saveAll() {
    this.saveSettings();
    this.saveControls();
    this.saveGame();
    this.saveVersion();
  }
  resetGameSpecific(mode) {
    this.game[mode] = this.defaultGame[mode];
  }
  changeSetting(setting, value, game) {
    if (game) {
      this.game[game][setting] = value;
    } else {
      this.settings[setting] = value;
    }
    sound.updateVolumes();
    if (game) {
      this.saveGame();
    }
    this.saveSettings();
  }
  getConflictingControlNames() {
    const keyFrequency = {};
    const duplicates = [''];
    for (const key of Object.keys(this.controls)) {
      for (const name of this.controls[key]) {
        if (keyFrequency[name] == null) {
          keyFrequency[name] = 1;
        } else {
          keyFrequency[name]++;
          duplicates.unshift(name);
        }
      }
    }
    return duplicates;
  }
  addControl(key, control) {
    const array = this.controls[key];
    const index = array.indexOf(control);
    if (index === -1) {
      array.push(control);
    }
    this.saveControls();
    menu.drawControls();
  }
  removeControl(key, control) {
    const array = this.controls[key];
    const index = array.indexOf(control);
    if (index !== -1) {
      array.splice(index, 1);
    }
    this.saveControls();
    menu.drawControls();
  }
}
const settings = new Settings();
export default settings;
