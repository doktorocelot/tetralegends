import Menu from './script/menu/menu.js';
import Input from './script/input.js';

const menu = new Menu();
const input = new Input();
input.addMany([
  'menuUp',
  'menuDown',
  'menuOk',
  'menuBack',
], [
  () => {menu.up();},
  () => {menu.down();},
  () => {menu.ok();},
  () => {menu.back();},
]);
document.addEventListener('DOMContentLoaded', () => {
  menu.load('root');
  menu.show();
});
function $(selector) {
  const selection = document.querySelectorAll(selector);
  switch (selection.length) {
    case 0:
      return undefined;
      break;
    case 1:
      return selection[0];
      break;
    default:
      return selection;
  }
}

function hideHints() {
  $('#button-hint-container').classList.add('hidden');
}
function showHints() {
  $('#button-hint-container').classList.remove('hidden');
}
function changeHints(type) {
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
}
/*
document.addEventListener('keydown', (event) => {
  document.body.requestPointerLock();
  mouseLimit = 0;
  showHints();
  changeHints('keyboard');
  if (event.keyCode === 38) {
    menu.up();
  }
  if (event.keyCode === 40) {
    menu.down();
  }
  if (event.keyCode === 13) {
    menu.ok();
  }
  if (event.keyCode === 8) {
    menu.back();
  }
});
*/
/*
document.addEventListener('mousemove', (e) => {
  mouseLimit++;

  if (mouseLimit > 3) {
    document.exitPointerLock();
    hideHints();
  }
});
*/
const gamepad = new Gamepad();
gamepad.bind(Gamepad.Event.BUTTON_DOWN, (e) => {
  // e.control of gamepad e.gamepad pressed down
  console.log(e.control);
  showHints();
  changeHints('controller');
  if (e.control === 'DPAD_UP') {
    menu.up();
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
