import menu from './menu/menu.js';
import sound from './sound.js';
import locale from './lang.js';
const SETTINGS_VERSION = 4;
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
      size: 100,
      nextLength: 6,
      skin: 'auto',
      color: 'auto',
      colorOverride: {
        I: 'light blue',
        L: 'blue',
        O: 'yellow',
        Z: 'red',
        T: 'purple',
        J: 'orange',
        S: 'green',
      },
      outline: 'on',
      ghost: 'color',
      backgroundOpacity: 30,
      grid: true,
      actionText: true,
      matrixSwayScale: 50,
      matrixSwaySpeed: 50,
      visualInitial: true,
      particles: true,
      particleLimit: 1500,
      particleSize: 3,
      particleScale: 2,
      useLockdownBar: true,
      // Audio
      sfxVolume: 50,
      musicVolume: 50,
    };
    console.log(navigator.language.substr(0, 2));
    switch (navigator.language.substr(0, 2)) {
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
    }
    this.settingInfo = {
      // Tuning
      DAS: {
        name: 'Autoshift Delay',
        description: 'Length of time before autoshift begins',
        category: 'tuning',
        type: 'range',
        min: 0,
        max: 30,
      },
      ARR: {
        name: 'Autoshift Rate',
        description: 'How fast the autoshift applies',
        category: 'tuning',
        type: 'range',
        min: 0,
        max: 10,
      },
      IRS: {
        name: 'Initial Rotation',
        description: 'Allow the rotation of a tetromino before it appears',
        category: 'tuning',
        type: 'select',
        options: ['off', 'tap', 'hold', 'additive'],
      },
      IHS: {
        name: 'Initial Hold',
        description: 'Allow the holding of a tetromino before it appears',
        category: 'tuning',
        type: 'select',
        options: ['off', 'tap', 'hold'],
      },
      rotationSystem: {
        name: 'Rotation System',
        description: 'How a tetromino acts when rotated',
        category: 'tuning',
        type: 'select',
        options: ['auto', 'srs'],
      },
      // Graphics
      size: {
        name: 'Game Size',
        description: 'Adjust how big the game appears',
        category: 'graphics',
        type: 'range',
        min: 20,
        max: 100,
      },
      nextLength: {
        name: 'Next Queue Length',
        description: 'Adjust how many tetrominoes will appear in the next queue',
        category: 'graphics',
        type: 'range',
        min: 0,
        max: 6,
      },
      skin: {
        name: 'Monomino Skin',
        description: 'The skin of the monominoes that make up the tetrominoes',
        category: 'graphics',
        type: 'list',
      },
      /*  color: {
          name: 'Tetromino Color',
          description: 'The color of each unique tetromino',
          category: 'graphics',
         // type: ''
        }*/
    };
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

      },
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
        this[index.toLowerCase()] = loaded;
        this[index.toLowerCase()] = {...this[`default${index}`], ...this[index.toLowerCase()]};
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
  changeSetting(setting, value) {
    this.settings[setting] = value;
    sound.updateVolumes();
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
