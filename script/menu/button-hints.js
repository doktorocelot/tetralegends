import $ from '../shortcuts.js';
import gameHandler from '../game/game-handler.js';
import menu from './menu.js';
class ButtonHints {
  constructor() {}
  change(type) {

    /*
    switch (type) {
      case 'keyboard':
        $('#select-button').src = 'img/buttons/keyboard-arrows.svg';
        $('#confirm-button').src = 'img/buttons/keyboard-enter.svg';
        $('#back-button').src = 'img/buttons/keyboard-backspace.svg';
        break;
      default: {
        $('#select-button').src = 'img/buttons/general-dpad.svg';
        $('#confirm-button').src = 'img/buttons/general-a.svg';
        $('#back-button').src = 'img/buttons/general-b.svg';
      }
    }
    */
  }
  hide() {
    // $('#button-hint-container').classList.add('hidden');
  }
  show() {
    $('#button-hint-container').classList.remove('hidden');
  }
  clear() {
    $('#button-hint-container').innerHTML = '';
  }
  add(keys, label) {
    const table = document.createElement('table');
  }
  draw() {
    // this.clear();
    if (menu.isEnabled) {
      console.log('menu on');
    } else {
      console.log('menu off');
    }
    if (gameHandler.game == null) {

    }
  }
}
const buttonHints = new ButtonHints;
export default buttonHints;
