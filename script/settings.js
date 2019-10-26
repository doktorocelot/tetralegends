class Settings {
  constructor() {
    this.defaultSettings = {
      // Tuning
      DAS: 12,
      ARR: 2,
      IRS: 'tap',
      IHS: 'tap',
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
      grid: true,
      actionText: true,
      matrixSway: true,
      visualInitial: true,
    };
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
  load() {
    for (const index of ['Settings', 'Controls', 'Game']) {
      const loaded = JSON.parse(localStorage.getItem(`tetra${index}`));
      if (loaded === null) {
        this[`reset${index}()`];
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
  saveAll() {
    this.saveSettings();
    this.saveControls();
    this.saveGame();
  }
  resetSettings() {
    this.settings = this.defaultSettings;
  }
  resetControls() {
    this.controls = this.defaultControls;
  }
  resetGame() {
    this.game = this.defaultGame;
  }
  resetGameSpecific(mode) {
    this.game[mode] = this.defaultGame[mode];
  }
  changeSetting(setting, value) {
    this.settings[setting] = value;
  }
}
const settings = new Settings();
export default settings;
