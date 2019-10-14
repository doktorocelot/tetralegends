export default class Input {
  constructor() {
    this.menu = {};
    for (const name of [
      'menuUp',
      'menuDown',
      'menuOk',
      'menuBack',
    ]) {
      this.menu[name] = new Event(name);
    }
    let mouseLimit = 0;
    document.addEventListener('keydown', (event) => {
      document.body.requestPointerLock();
      mouseLimit = 0;
      // showHints();
      // changeHints('keyboard');
      if (event.keyCode === 38) {
        document.dispatchEvent(this.menu.menuUp);
      }
      if (event.keyCode === 40) {
        document.dispatchEvent(this.menu.menuDown);
      }
      if (event.keyCode === 13) {
        document.dispatchEvent(this.menu.menuOk);
      }
      if (event.keyCode === 8) {
        document.dispatchEvent(this.menu.menuBack);
      }
    });
    document.addEventListener('mousemove', (e) => {
      mouseLimit++;

      if (mouseLimit > 3) {
        document.exitPointerLock();
      }
    });
  }
}
