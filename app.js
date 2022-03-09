import menu from './script/menu/menu.js';
import input from './script/input.js';
import settings from './script/settings.js';
import gameHandler from './script/game/game-handler.js';

import * as randomizer from './script/game/modules/randomizers.js';
import {PIECE_SETS} from './script/consts.js';
import $, {hzToMs, framesToMs} from './script/shortcuts.js';
import locale from './script/lang.js';
import sound from './script/sound.js';

input.addMany([
  'menuUp',
  'menuDown',
  'menuLeft',
  'menuRight',
  'menuOk',
  'menuBack',
], [
  () => {menu.up();},
  () => {menu.down();},
  () => {menu.left();},
  () => {menu.right();},
  () => {menu.ok();},
  () => {},
]);
window.onerror = (msg, url, lineNo, columnNo, error) => {
  try {
    const id = performance.now();
    const element = document.createElement('div');
    const elementHeader = document.createElement('div');
    const elementBody = document.createElement('div');
    element.id = `error-${id}`;
    elementHeader.id = `error-header-${id}`;
    elementBody.id = `error-body-${id}`;
    element.classList.add('error');
    elementHeader.classList.add('url');
    elementBody.classList.add('msg');
    elementHeader.textContent = `${url} @ ${lineNo}`;
    elementBody.textContent = msg;
    element.appendChild(elementHeader);
    element.appendChild(elementBody);
    element.onclick = () => {
      element.parentNode.removeChild(element);
    };
    $('#error-stack').appendChild(element);
    sound.playMenuSe('error');
  } catch (e) {
  // We don't want an infinite loop of errors
    console.log(e);
  }
};
document.addEventListener('DOMContentLoaded', () => {
  settings.load();
  sound.loadMenu();
  sound.loadMenuVoice();
  sound.loadBgm(['menu'], 'menu');
  menu.isLocked = true;
  locale.loadLang(settings.settings.language)
      .then((test) => {
        locale.updateFonts();
        locale.updateTitle();
        locale.updateLightWarning();
        $('#press-container').innerHTML = locale.getString('ui', 'pressKeyboardKey', ['<img src="img/ui/keyboard-enter.svg" class="press-key">']);
        $('#press-container').classList.remove('hidden');
        window.onblur = () => {
          try {
            gameHandler.game.pause();
          } catch (error) {
            // game isn't running yet; no big deal
          } finally {
            input.holdingCtrl = false
            input.holdingShift = false
            Howler.volume(0);
          }
        };
        const menuOpenTest = (e) => {
          if (e.code === 'Enter') {
            menuOpen();
          }
        };
        const menuOpen = (e) => {
          $('#title-container').classList.add('hidden');
          sound.playMenuSe('select');
          menu.load('root');
          menu.show();
          sound.playBgm(['menu'], 'menu');
          document.removeEventListener('keydown', menuOpenTest);
          document.removeEventListener('mousedown', menuOpen);
        };
        document.addEventListener('keydown', menuOpenTest);
        document.addEventListener('mousedown', menuOpen);
        window.onfocus = () => {
          Howler.volume(1);
        };
      });
});
