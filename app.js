import Game from './script/test/game.js';

let game = null;
export let test = 'CHEESE';
function newGame(type) {
  game = new Game();
}
newGame('marathon');
game.start();
setTimeout(() => {
  test = 'MONEY';
}, 1000);
setTimeout(() => {
  game.start();
}, 2000);
