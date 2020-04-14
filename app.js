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
document.addEventListener('DOMContentLoaded', () => {
  settings.load();
  sound.loadMenu();
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
          }
        };
      });
  // TEMP BELOW
  // gameHandler.newGame('marathon');
});


