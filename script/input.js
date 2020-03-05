import buttonHints from './menu/button-hints.js';
import settings from './settings.js';
import menu from './menu/menu.js';
import gameHandler from './game/game-handler.js';

class Input {
  constructor() {
    const keys = {
      menuUp: 'ArrowUp',
      menuDown: 'ArrowDown',
      menuLeft: 'ArrowLeft',
      menuRight: 'ArrowRight',
      menuOk: 'Enter',
      menuBack: 'Backspace',
    };
    this.controller = {
      moveLeft: ['DPAD_LEFT'],
      moveRight: ['DPAD_RIGHT'],
      hardDrop: ['DPAD_UP'],
      softDrop: ['DPAD_DOWN'],
      rotateLeft: ['FACE_1'],
      rotateRight: ['FACE_2'],
      rotate180: ['FACE_4'],
      hold: ['LEFT_TOP_SHOULDER', 'RIGHT_TOP_SHOULDER'],
      retry: ['SELECT_BACK'],
      pause: ['START_FORWARD'],
    };


    this.events = {};
    for (const name of Object.keys(keys)) {
      this.events[name] = new Event(name);
    }

    this.mouseLimit = 0;

    this.currentGameKeys = {};
    this.lastGameKeys = {};
    for (const control of Object.keys(settings.defaultControls)) {
      this.currentGameKeys[control] = false;
      this.lastGameKeys[control] = {};
    }

    document.addEventListener('keydown', (event) => {
      if (event.key !== 'Escape') {
        buttonHints.change('keyboard');
        buttonHints.show();
      }
      if (event.code === 'Backspace' && gameHandler.game != null) {
        if (gameHandler.game.isVisible) {
          gameHandler.game.hide();
          gameHandler.game.pause();
          menu.open();
        }
      }
      this.mouseLimit = 0;
      for (const name of Object.keys(keys)) {
        if (event.key === keys[name]) {
          document.dispatchEvent(this.events[name]);
        }
      }
      for (const key of Object.keys(settings.controls)) {
        if (settings.controls[key].indexOf(event.code) !== -1) {
          this.currentGameKeys[key] = true;
        }
      }
    });
    document.addEventListener('keyup', (event) => {
      for (const key of Object.keys(settings.controls)) {
        if (settings.controls[key].indexOf(event.code) !== -1) {
          this.currentGameKeys[key] = false;
        }
      }
    });
    document.addEventListener('mousemove', (event) => {
      this.mouseLimit++;
      if (this.mouseLimit > 3) {
        buttonHints.hide();
      }
    });

    this.gamepad = new Gamepad();
    this.gamepad.bind(Gamepad.Event.BUTTON_DOWN, (e) => {
      // e.control of gamepad e.gamepad pressed down
      buttonHints.change('controller');
      buttonHints.show();

      if (e.control === 'DPAD_UP') {
        // document.dispatchEvent()
      }
      if (e.control === 'DPAD_DOWN') {
        menu.down();
      }
      if (e.control === 'FACE_1') {
        menu.ok();
      }
      if (e.control === 'FACE_2') {
        menu.back();
      }
    });
    if (!this.gamepad.init()) {
      // Your browser does not support gamepads, get the latest Google Chrome or Firefox
    }
  }
  add(event, func) {
    document.addEventListener(event, func);
  }
  addMany(eventArr, funcArr) {
    for (let i = 0; i < funcArr.length; i++) {
      const event = eventArr[i];
      const func = funcArr[i];
      this.add(event, func);
    }
  }
  updateGameInput() {
    this.lastGameKeys = {...this.currentGameKeys};
  }
  getGameDown(name) {
    if (this.currentGameKeys[name]) {
      return true;
    }
    return false;
  }
  getGamePress(name) {
    if (this.currentGameKeys[name] && !this.lastGameKeys[name]) {
      return true;
    }
    return false;
  }
  getGameRelease(name) {
    if (!this.currentGameKeys[name] && this.lastGameKeys[name]) {
      return true;
    }
    return false;
  }
}
const input = new Input();
export default input;
