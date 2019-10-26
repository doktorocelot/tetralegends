import $ from '../shortcuts.js';
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
}
const buttonHints = new ButtonHints;
export default buttonHints;
