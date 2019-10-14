import buttonHints from './menu/button-hints.js';
export default class Input {
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
    });
    document.addEventListener('mousemove', (event) => {
      mouseLimit++;
      if (mouseLimit > 3) {
        buttonHints.hide();
        document.exitPointerLock();
      }
    });
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
}
