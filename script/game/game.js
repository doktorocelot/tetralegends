import {loadGameType} from '../loaders.js';
import {PIECE_SETS, PIECE_COLORS, NEXT_OFFSETS, SCORE_TABLES} from '../consts.js';
import menu from '../menu/menu.js';
import Stack from './stack.js';
import Piece from './piece.js';
import $, {toCtx, msToTime} from '../shortcuts.js';
import {loops} from './loops.js';
import gameHandler from './game-handler.js';
import Next from './next.js';
import settings from '../settings.js';
import updateKeys from './loop-modules/update-keys.js';
import input from '../input.js';
import Hold from './hold.js';
import sound from '../sound.js';
import Particle from './particle.js';
import GameModule from './game-module.js';
import locale from '../lang.js';
let endScreenTimeout = null;
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
    this.particleCanvas = $('#particle');
    this.bufferPeek = .25;
    this.loop;
    this.now;
    this.deltaTime;
    this.last = this.timestamp();
    this.stats = [];
    this.request;
    this.noUpdate = false;
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
    this.prefixes = {};
    this.smallStats = {
      score: true,
      fallspeed: true,
      entrydelay: true,
    };
    this.endingStats = {
      score: true,
      level: true,
      piece: true,
      line: true,
    };
    this.b2b = 0;
    this.combo = -1;
    this.matrix = {
      position: {
        x: 0,
        y: 0,
      },
      velocity: {
        left: 0,
        right: 0,
        up: 0,
        down: 0,
      },
    };
    this.startingTime = 0;
    this.timePassed = 0;
    loadGameType(gametype)
        .then((gameData) => {
          this.show();
          menu.close();
          this.startingTime = this.timestamp();
          clearTimeout(endScreenTimeout);
          $('#game').classList.remove('dead');
          $('#end-message-container').classList.add('hidden');
          $('#kill-message-container').classList.add('hidden');
          this.settings = gameData.settings;
          this.stats = gameData.stats;
          sound.load(this.settings.soundbank);
          // SET UP MODULES
          this.stack = new Stack(this, toCtx(this.stackCanvas));
          this.piece = new Piece(this, toCtx(this.pieceCanvas));
          this.next = new Next(this, toCtx(this.nextCanvas), toCtx(this.nextSubCanvas));
          this.hold = new Hold(this, toCtx(this.holdCanvas));
          this.particle = new Particle(this, toCtx(this.particleCanvas));
          // SET UP SETTINGS
          this.makeSprite();
          this.rotationSystem = this.settings.rotationSystem;
          this.colors = PIECE_COLORS[this.settings.rotationSystem];
          this.nextOffsets = NEXT_OFFSETS[this.settings.rotationSystem];
          this.loop = loops[gametype].update;
          this.onPieceSpawn = loops[gametype].onPieceSpawn;
          for (const element of ['piece', 'stack', 'next', 'hold']) {
            if (gameData[element] != null) {
              for (const property of Object.keys(gameData[element])) {
                this[element][property] = gameData[element][property];
              }
            }
          }
          this.resize();
          loops[gametype].onInit(this);
          sound.killBgm();
          sound.loadBgm(this.settings.music, gametype);
          sound.add('ready');
          $('#message').textContent = locale.getString('ui', 'ready');
          $('#message').classList.remove('dissolve');
          this.onPieceSpawn(this);
          window.onresize = this.resize;
          $('.game').classList.remove('paused');
          this.request = requestAnimationFrame(this.gameLoop);
          document.documentElement.style.setProperty('--current-background', `url("../img/bg/${this.settings.background}")`);
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
    if (this.isPaused || this.noUpdate) {return;}
    $('#pause-label').textContent = locale.getString('ui', 'pause');
    sound.add('pause');
    sound.playSeQueue();
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
  end() {
    this.noUpdate = true;
    $('#end-stats').innerHTML = '';
    for (const statName of this.stats) {
      if (this.endingStats[statName]) {
        $('#end-stats').innerHTML += `<b>${locale.getString('ui', statName)}:</b> ${this.stat[statName]}<br>`;
      }
    }
    if (this.timeGoal == null) {
      $('#end-stats').innerHTML += `<b>${locale.getString('ui', 'time')}:</b> ${msToTime(this.timePassed)}<br>`;
    }
    $('#kill-message-container').classList.remove('hidden');
    sound.add('ko');
    sound.killBgm();
    $('#game').classList.add('dead');
    endScreenTimeout = setTimeout(() => {
      $('#kill-message-container').classList.add('hidden');
      $('#end-message').textContent = locale.getString('ui', 'gameover');
      $('#end-message-container').classList.remove('hidden');
      $('#return-to-menu').textContent = locale.getString('ui', 'returnToMenu');
    }, 1000);
  }
  resize() {
    const game = gameHandler.game;
    const root = document.documentElement;
    root.style.setProperty('--cell-size', `${game.cellSize}px`);
    root.style.setProperty('--matrix-width', game.settings.width);
    root.style.setProperty('--matrix-height-base', game.settings.height);
    for (const element of ['pieceCanvas', 'stackCanvas', 'nextCanvas', 'nextSubCanvas', 'holdCanvas', 'particleCanvas']) {
      game[element].width = game[element].clientWidth;
      game[element].height = game[element].clientHeight;
    }
    $('#hold-label').textContent = locale.getString('ui', 'hold');
    $('#next-label').textContent = locale.getString('ui', 'next');
    game.stack.makeAllDirty();
    game.isDirty = true;
    $('#stats').innerHTML = '';
    for (const statName of game.stats) {
      const stat = document.createElement('div');
      stat.classList.add('stat-group');
      const label = document.createElement('label');
      const number = document.createElement('div');
      label.textContent = locale.getString('ui', statName);
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
  drawLockdown() {
    $('#pip-grid').innerHTML = '';
    for (let i = this.piece.manipulationLimit; i > 0; i--) {
      const pip = document.createElement('div');
      pip.classList.add('manip-pip');
      pip.id = `pip-${i}`;
      $('#pip-grid').appendChild(pip);
    }
    if (!this.userSettings.useLockdownBar) {
      $('#pip-grid').classList.add('hidden');
      $('#lockdown').classList.add('hidden');
      $('#delay').classList.add('hidden');
      return;
    }
    switch (this.piece.lockdownType) {
      case 'extended':
        $('#pip-grid').classList.remove('hidden');
        $('#lockdown').classList.remove('hidden');
        $('#delay').classList.remove('hidden');
        break;
      case 'infinite':
      case 'classic':
        $('#pip-grid').classList.add('hidden');
        $('#lockdown').classList.remove('hidden');
        $('#delay').classList.remove('hidden');
        break;
      default:
        $('#pip-grid').classList.add('hidden');
        $('#lockdown').classList.add('hidden');
        $('#delay').classList.add('hidden');
        break;
    }
  }
  updateStats() {
    for (const statName of this.stats) {
      let prefix = '';
      let append = '';
      if (this.prefixes[statName]) {
        prefix = this.prefixes[statName];
      }
      if (this.appends[statName]) {
        append = this.appends[statName];
      }
      let value = this.stat[statName];
      if (statName === 'line' && this.lineGoal != null && this.reverseLineStat != null) {
        value = this.lineGoal - value;
      }
      $(`#stat-${statName}`).innerHTML = `${prefix}${value}${append}`;
    }
  }
  shiftMatrix(direction) {
    if (settings.settings.matrixSwayScale <= 0) {
      return;
    }
    switch (direction) {
      case 'left':
        this.matrix.velocity.left = 1;
        this.matrix.velocity.right = 0;
        break;
      case 'right':
        this.matrix.velocity.right = 1;
        this.matrix.velocity.left = 0;
        break;
      case 'up':
        this.matrix.velocity.up = 1;
        this.matrix.velocity.down = 0;
        break;
      case 'down':
        this.matrix.velocity.down = 1;
        this.matrix.velocity.up = 0;
        break;
      default:
        throw new Error('Matrix shift direction undefined or incorrect');
        break;
    }
  }
  updateMatrix() {
    const matrixPush = (direction) => {
      const axis =
        direction === 'right' || direction === 'left' ?
          'x' : 'y';
      const modifier =
        direction === 'right' || direction === 'down' ?
          1 : -1;
      this.matrix.velocity[direction] = Math.min(this.matrix.velocity[direction], 1);
      if (Math.abs(this.matrix.position[axis]) < 0.5) {
        this.matrix.position[axis] += 0.2 * modifier;
      }
      this.matrix.velocity[direction] -= 0.2;
      this.matrix.velocity[direction] = Math.max(this.matrix.velocity[direction], 0);
    };
    for (const direction of ['x', 'y']) {
      if (Math.abs(this.matrix.position[direction]) < 0.0001) {
        this.matrix.position[direction] = 0;
      }
    }
    for (const directions of [['left', 'right', 'x'], ['up', 'down', 'y']]) {
      if (
        this.matrix.velocity[directions[0]] === 0 &&
        this.matrix.velocity[directions[1]] === 0
      ) {
        const speed = 1.033 + ((settings.settings.matrixSwaySpeed / 100) ** 2) / 3.75;
        this.matrix.position[directions[2]] /= speed;
      } else {
        for (let i = 0; i < 2; i++) {
          const direction = directions[i];
          if (this.matrix.velocity[direction] !== 0) {
            matrixPush(direction);
          }
        }
      }
    }
    for (const element of ['#game-center', '#stats']) {
      const scale = 6 - Math.sqrt(25 *(settings.settings.matrixSwayScale / 100));
      $(element).style.transform = `translate(${this.matrix.position.x / scale}em, ${this.matrix.position.y / scale}em)`;
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
          if (!game.noUpdate) {
            if (!game.piece.inAre) {
              game.timePassed += game.deltaTime * 1000;
            }
            // GOALS
            if (game.lineGoal != null) {
              if (game.stat.line >= game.lineGoal) {
                $('#kill-message').textContent = locale.getString('ui', 'excellent');
                game.end();
              }
            }
            if (game.timeGoal != null) {
              if (game.timePassed >= game.timeGoal) {
                game.timePassed = 0;
                game.timeGoal = null;
                $('#kill-message').textContent = locale.getString('ui', 'timeOut');
                game.end();
              }
            }

            game.loop({
              ms: game.deltaTime * 1000,
              piece: game.piece,
              stack: game.stack,
              hold: game.hold,
              particle: game.particle,
            });
          }
          game.particle.update();
          game.updateMatrix();
          const modules = ['piece', 'stack', 'next', 'hold', 'particle'];
          for (const moduleName of modules) {
            const currentModule = game[moduleName];
            if (currentModule.isDirty || game.isDirty) {
              if (moduleName === 'stack' && game.isDirty) {
                game.stack.makeAllDirty();
              }
              currentModule.draw();
              currentModule.isDirty = false;
            }
          }
          game.isDirty = false;
        }
        if (game.piece.lockdownTypeLast !== game.piece.lockdownType) {
          game.drawLockdown();
        }
        game.piece.lockdownTypeLast = game.piece.lockdownType;
        if (input.getGamePress('pause') && !game.noUpdate) {
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
        if (game.piece.inAre || game.isPaused) {
          $('#timer').classList.add('paused');
        } else {
          $('#timer').classList.remove('paused');
        }
        if (game.timeGoal != null) {
          $('#timer').textContent = msToTime(game.timeGoal - game.timePassed);
        } else {
          $('#timer').textContent = msToTime(game.timePassed);
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
    if (score != null) {
      score *= multiplier;
      if (scoreTable.levelMultiplied.indexOf(name) !== -1) {
        score *= this.stat.level + scoreTable.levelAdditive;
      }
      if (scoreTable.b2bMultiplied.indexOf(name) !== -1 && this.b2b > 1) {
        score *= scoreTable.b2bMultiplier;
      }
      this.stat.score += score;
    }
  }
}
