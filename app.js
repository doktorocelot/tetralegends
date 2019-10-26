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

const gen = randomizer.bag(PIECE_SETS.standard, PIECE_SETS.standardUnfavored);
const piecez = {};
export {gen};
for (const index of PIECE_SETS.standard) {
  piecez[index] = 0;
}
let generated = '';
for (let i = 0; i < 140; i++) {
  const piece = gen.next().value;
  piecez[piece]++;
  generated += `${piece} `;
  if (i % 7 === 6) {
    generated += '\n';
  }
}
// console.log(generated);
// console.log(piecez);
//
// const c = $('#sprite');
// const ctx = c.getContext('2d');
// ctx.fillRect(0, 0, 50, 50);

