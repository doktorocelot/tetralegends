import {loadGameType} from '../loaders.js';
import {PIECE_SETS, PIECE_COLORS, NEXT_OFFSETS} from '../consts.js';
import menu from '../menu/menu.js';
import Stack from './stack.js';
import Piece from './piece.js';
import $, {toCtx} from '../shortcuts.js';
import {loops} from './loops.js';
import gameHandler from './game-handler.js';
import Next from './next.js';
import settings from '../settings.js';
import updateKeys from './loop-modules/update-keys.js';
import input from '../input.js';
import Hold from './hold.js';
export default class Game {
  constructor(gametype) {
    this.userSettings = {...settings.settings};
    const modules = ['stack'];
    this.type = gametype;
    this.pieceCanvas = $('#piece');
    this.stackCanvas = $('#stack');
    this.nextCanvas = $('#next-main');
    this.nextSubCanvas = $('#next-sub');
    this.holdCanvas = $('#hold');
    this.bufferPeek = .5;
    this.loop;
    this.now;
    this.deltaTime;
    this.last = this.timestamp();
    this.stats = [];
    this.request;
    this.isDead = false;
    this.isPaused = false;
    this.isDirty = true;
    this.stat = {
      level: 0,
      score: 0,
      line: 0,
      piece: 0,
    };
    this.smallStats = {
      score: true,
      fallspeed: true,
    };
    loadGameType(gametype)
        .then((gameData) => {
          this.settings = gameData.settings;
          this.stats = gameData.stats;
          this.stack = new Stack(this, toCtx(this.stackCanvas));
          this.piece = new Piece(this, toCtx(this.pieceCanvas));
          this.next = new Next(this, toCtx(this.nextCanvas), toCtx(this.nextSubCanvas));
          this.hold = new Hold(this, toCtx(this.holdCanvas));
          this.rotationSystem = this.settings.rotationSystem;
          this.colors = PIECE_COLORS[this.settings.rotationSystem];
          this.nextOffsets = NEXT_OFFSETS[this.settings.rotationSystem];
          menu.close();
          this.resize();
          this.makeSprite();
          this.loop = loops[gametype].update;
          this.onPieceSpawn = loops[gametype].onPieceSpawn;
          this.piece.new();
          this.piece.draw();
          window.onresize = this.resize;
          this.request = requestAnimationFrame(this.gameLoop);
        });
  }
  timestamp() {
    return window.performance && window.performance.now ? window.performance.now() : new Date().getTime();
  }
  kill() {
    cancelAnimationFrame(this.request);
    this.isDead = true;
  }
  resize() {
    const game = gameHandler.game;
    const root = document.documentElement;
    root.style.setProperty('--cell-size', `${game.cellSize}px`);
    root.style.setProperty('--matrix-width', game.settings.width);
    root.style.setProperty('--matrix-height-base', game.settings.height);
    // TODO Really?!
    game.pieceCanvas.width = game.pieceCanvas.clientWidth;
    game.pieceCanvas.height = game.pieceCanvas.clientHeight;
    game.stackCanvas.width = game.pieceCanvas.width;
    game.stackCanvas.height = game.pieceCanvas.height;
    game.nextCanvas.width = game.nextCanvas.clientWidth;
    game.nextCanvas.height = game.nextCanvas.clientHeight;
    game.nextSubCanvas.width = game.nextSubCanvas.clientWidth;
    game.nextSubCanvas.height = game.nextSubCanvas.clientHeight;
    game.holdCanvas.width = game.holdCanvas.clientWidth;
    game.holdCanvas.height = game.holdCanvas.clientHeight;
    game.isDirty = true;
    $('#stats').innerHTML = '';
    for (const statName of game.stats) {
      const stat = document.createElement('div');
      stat.classList.add('stat-group');
      const label = document.createElement('label');
      const number = document.createElement('div');
      label.textContent = statName;
      number.innerHTML = game.stat[statName];
      number.id = `stat-${statName}`;
      if (!game.smallStats[statName]) {
        number.classList.add('big');
      }
      stat.appendChild(label);
      stat.appendChild(number);
      $('#stats').appendChild(stat);
    }
  }
  updateStats() {
    for (const statName of this.stats) {
      $(`#stat-${statName}`).innerHTML = this.stat[statName];
    }
  }
  get cellSize() {
    const base = Math.min(window.innerWidth, window.innerHeight);
    return Math.floor(base / 1.2 / this.settings.height * this.userSettings.size / 100);
  }
  gameLoop() {
    const game = gameHandler.game;
    if (!game.isDead) {
      game.request = requestAnimationFrame(game.gameLoop);
      if (typeof game.loop === 'function') {
        game.now = game.timestamp();
        game.deltaTime = (game.now - game.last) / 1000;
        if (!game.isPaused) {
          game.loop({
            ms: game.deltaTime * 1000,
            piece: game.piece,
            stack: game.stack,
            hold: game.hold,
          });
          const modules = ['piece', 'stack', 'next', 'hold'];
          for (const moduleName of modules) {
            const currentModule = game[moduleName];
            if (currentModule.isDirty || game.isDirty) {
              currentModule.draw();
              currentModule.isDirty = false;
            }
          }
          game.isDirty = false;
        }
        if (input.getGamePress('pause')) {
          if (game.isPaused) {
            game.isPaused = false;
            $('.game').classList.remove('paused');
          } else {
            game.isPaused = true;
            $('.game').classList.add('paused');
          }
        } else {
        }

        updateKeys();
        if (game.mustReset) {
          game.isDead = true;
        }
        game.last = game.now;
      }
    } else {
      if (game.mustReset) {
        gameHandler.reset();
      }
    }
  }
  makeSprite(colors = [
    'red', 'orange', 'yellow',
    'green', 'lightBlue', 'blue',
    'purple', 'white', 'black',
  ]) {
    const types = ['mino', 'ghost', 'stack'];
    for (const type of types) {
      for (const color of colors) {
        const img = document.createElement('img');
        img.src = `img/skin/standard/${type}-${color}.svg`;
        img.id = `${type}-${color}`;
        $('#sprite').appendChild(img);
        const loaded = () => {
          this.isDirty = true;
        };

        if (img.complete) {
          loaded();
        } else {
          img.addEventListener('load', loaded);
          img.addEventListener('error', function() {
            // alert('error');
          });
        }
      }
    }
  }
}
