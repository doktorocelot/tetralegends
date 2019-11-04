import menu from './script/menu/menu.js';
import input from './script/input.js';
import settings from './script/settings.js';
import gameHandler from './script/game/game-handler.js';

import * as randomizer from './script/game/modules/randomizers.js';
import {PIECE_SETS} from './script/consts.js';
import $, {hzToMs, framesToMs} from './script/shortcuts.js';


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
  settings.load();
  menu.load('root');
  menu.show();
  // TEMP BELOW
  gameHandler.newGame('marathon');
});


