import buttonHints from './menu/button-hints.js';
import settings from './settings.js';
class Input {
  constructor() {
    const keys = {
      menuUp: 'ArrowUp',
      menuDown: 'ArrowDown',
      menuOk: 'Enter',
      menuBack: 'Backspace',
    };

    this.events = {};
    for (const name of Object.keys(keys)) {
      this.events[name] = new Event(name);
    }

    let mouseLimit = 0;

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
        document.body.requestPointerLock();
      }
      mouseLimit = 0;
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
      mouseLimit++;
      if (mouseLimit > 3) {
        buttonHints.hide();
        document.exitPointerLock();
      }
    });

    const gamepad = new Gamepad();
    gamepad.bind(Gamepad.Event.BUTTON_DOWN, (e) => {
      // e.control of gamepad e.gamepad pressed down
      console.log(e.control);
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
    if (!gamepad.init()) {
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
