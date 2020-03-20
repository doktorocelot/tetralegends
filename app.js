import menu from './script/menu/menu.js';
import input from './script/input.js';
import settings from './script/settings.js';
import gameHandler from './script/game/game-handler.js';

import * as randomizer from './script/game/modules/randomizers.js';
import {PIECE_SETS} from './script/consts.js';
import $, {hzToMs, framesToMs} from './script/shortcuts.js';
import locale from './script/lang.js';


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
  locale.loadAll()
      .then((test) => {
        console.log(locale.getString('ui', 'level'));
        menu.load('root');
        menu.show();
        window.onblur = () => {
          gameHandler.game.pause();
        };
      });
  // TEMP BELOW
  // gameHandler.newGame('marathon');
});


