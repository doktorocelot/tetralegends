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
  sound.loadBgm(['menu'], 'menu');
  sound.playBgm(['menu'], 'menu');

  locale.loadLang(settings.settings.language)
      .then((test) => {
        locale.updateFonts();
        menu.load('root');
        menu.show();
        window.onblur = () => {
          try {
            gameHandler.game.pause();
          } catch (error) {
            // game isn't running yet; no big deal
          } finally {
            Howler.volume(0);
          }
        };
        window.onfocus = () => {
          Howler.volume(1);
        };
      });
});
