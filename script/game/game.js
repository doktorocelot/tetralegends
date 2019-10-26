import {loadGameType} from '../loaders.js';
import {PIECE_SETS} from '../consts.js';
import menu from '../menu/menu.js';
import Stack from './stack.js';
import Piece from './piece.js';
import $, {toCtx} from '../shortcuts.js';
import {loops} from './loops.js';
import gameHandler from './game-handler.js';

export default class Game {
  constructor(gametype) {
    const modules = ['stack'];
    this.type = gametype;
    this.pieceCanvas = $('#piece');
    this.stackCanvas = $('#stack');
    this.bufferPeek = .5;
    this.loop;
    this.now;
    this.deltaTime;
    this.last = this.timestamp();
    this.settings;

    loadGameType(gametype)
        .then((gameData) => {
          this.settings = gameData.settings;

          this.stack = new Stack(this, toCtx(this.stackCanvas));
          this.piece = new Piece(this, toCtx(this.pieceCanvas));

          menu.close();
          this.resize();
          this.makeSprite();
          this.loop = loops[gametype].update;
          this.piece.new('T');
          this.piece.draw();
          window.onresize = this.resize;
          requestAnimationFrame(this.gameLoop);
        });
  }
  timestamp() {
    return window.performance && window.performance.now ? window.performance.now() : new Date().getTime();
  }
  resize() {
    const game = gameHandler.game;
    const root = document.documentElement;
    root.style.setProperty('--cell-size', `${game.cellSize}px`);
    game.pieceCanvas.width = game.pieceCanvas.clientWidth;
    game.pieceCanvas.height = game.pieceCanvas.clientHeight;
    game.stackCanvas.width = game.pieceCanvas.width;
    game.stackCanvas.height = game.pieceCanvas.height;
    game.stack.draw();
  }
  get cellSize() {
    return Math.floor(window.innerHeight / 1.2 / this.settings.height);
  }
  gameLoop() {
    const game = gameHandler.game;
    if (typeof game.loop === 'function') {
      game.now = game.timestamp();
      game.deltaTime = (game.now - game.last) / 1000;
      game.loop({
        ms: game.deltaTime * 1000,
        piece: game.piece,
        stack: game.stack,
      });
      game.piece.draw();
      game.last = game.now;
      requestAnimationFrame(game.gameLoop);
    }
  }
  makeSprite() {
    const types = ['mino', 'ghost', 'stack'];
    const colors = ['red', 'orange', 'yellow', 'green', 'lightBlue', 'blue', 'purple', 'white', 'black'];
    for (const type of types) {
      for (const color of colors) {
        const img = document.createElement('img');
        img.src = `img/skin/standard/${type}-${color}.svg`;
        img.id = `${type}-${color}`;
        $('#sprite').appendChild(img);
      }
    }
  }
}
