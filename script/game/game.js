import {loadGameType} from '../loaders.js';
import {PIECE_SETS, PIECE_COLORS, NEXT_OFFSETS, SCORE_TABLES} from '../consts.js';
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
import sound from '../sound.js';
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
    this.bufferPeek = .25;
    this.loop;
    this.now;
    this.deltaTime;
    this.last = this.timestamp();
    this.stats = [];
    this.request;
    this.isDead = false;
    this.isPaused = false;
    this.isDirty = true;
    this.isVisible = false;
    this.background = '';
    this.stat = {
      level: 0,
      score: 0,
      line: 0,
      piece: 0,
    };
    this.appends = {};
    this.smallStats = {
      score: true,
      fallspeed: true,
    };
    loadGameType(gametype)
        .then((gameData) => {
          this.show();
          menu.close();

          this.settings = gameData.settings;
          this.stats = gameData.stats;
          this.background = this.settings.background;
          sound.load(this.settings.soundbank);
          // SET UP MODULES
          this.stack = new Stack(this, toCtx(this.stackCanvas));
          this.piece = new Piece(this, toCtx(this.pieceCanvas));
          this.next = new Next(this, toCtx(this.nextCanvas), toCtx(this.nextSubCanvas));
          this.hold = new Hold(this, toCtx(this.holdCanvas));
          // SET UP SETTINGS
          this.makeSprite();
          this.rotationSystem = this.settings.rotationSystem;
          this.colors = PIECE_COLORS[this.settings.rotationSystem];
          this.nextOffsets = NEXT_OFFSETS[this.settings.rotationSystem];
          this.resize();
          this.loop = loops[gametype].update;
          this.onPieceSpawn = loops[gametype].onPieceSpawn;
          for (const element of ['piece', 'stack', 'next']) {
            if (gameData[element] != null) {
              for (const property of Object.keys(gameData[element])) {
                this[element][property] = gameData[element][property];
              }
            }
          }
          loops[gametype].onInit(this);
          sound.killBgm();
          sound.loadBgm(this.settings.music, gametype);
          sound.add('ready');
          $('#message').textContent = 'READY';
          $('#message').classList.remove('dissolve');
          this.onPieceSpawn(this);
          window.onresize = this.resize;
          $('.game').classList.remove('paused');
          this.request = requestAnimationFrame(this.gameLoop);
        });
  }
  unpause() {
    if (!this.isPaused) {return;}
    sound.add('pause');
    this.isDirty = true;
    this.isPaused = false;
    $('.game').classList.remove('paused');
  }
  pause() {
    if (this.isPaused) {return;}
    sound.add('pause');
    this.isPaused = true;
    $('.game').classList.add('paused');
  }
  hide() {
    $('#game-container').classList.add('hidden');
    this.isVisible = false;
  }
  show() {
    $('#game-container').classList.remove('hidden');
    this.isVisible = true;
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
    root.style.setProperty('--matrix-width', `url("../img/bg/${this.background}");`);
    // console.log(`url("../img/bg/${this.background}");`);
    for (const element of ['pieceCanvas', 'stackCanvas', 'nextCanvas', 'nextSubCanvas', 'holdCanvas']) {
      game[element].width = game[element].clientWidth;
      game[element].height = game[element].clientHeight;
    }
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
      let append = '';
      if (this.appends[statName]) {
        append = this.appends[statName];
      }
      $(`#stat-${statName}`).innerHTML = `${this.stat[statName]}${append}`;
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
          if (game.piece.startingAre < game.piece.startingAreLimit) {
            game.piece.startingAre += game.deltaTime * 1000;
          }
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
            game.unpause();
          } else {
            game.pause();
          }
          if (!game.isVisible) {
            game.show();
            menu.close();
            game.unpause();
          }
        } else {}
        if (input.getGamePress('retry')) {
          game.mustReset = true;
        }
        sound.playSeQueue();
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
  makeSprite(
      colors = [
        'red', 'orange', 'yellow',
        'green', 'lightBlue', 'blue',
        'purple', 'white', 'black',
      ],
      types = ['mino', 'ghost', 'stack'],
      skin = this.settings.skin
  ) {
    $('#sprite').innerHTML = '';
    for (const type of types) {
      for (const color of colors) {
        const img = document.createElement('img');
        img.src = `img/skin/${skin}/${type}-${color}.svg`;
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
  addScore(name, multiplier = 1) {
    const scoreTable = SCORE_TABLES[this.settings.scoreTable];
    let score = scoreTable[name];
    score *= multiplier;
    if (score != null) {
      if (scoreTable.levelMultiplied.indexOf(name) !== -1) {
        score *= this.stat.level + scoreTable.levelAdditive;
      }
      this.stat.score += score;
    }
  }
}
