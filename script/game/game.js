import {loadGameType} from '../loaders.js';
import {PIECE_COLORS, NEXT_OFFSETS, SCORE_TABLES, SKIN_SETS} from '../consts.js';
import menu from '../menu/menu.js';
import Stack from './stack.js';
import Piece from './piece.js';
import $, {toCtx, msToTime} from '../shortcuts.js';
import {loops} from './loops.js';
import gameHandler from './game-handler.js';
import Next from './next.js';
import settings from '../settings.js';
import input from '../input.js';
import Hold from './hold.js';
import sound from '../sound.js';
import Particle from './particle.js';
import locale from '../lang.js';
let endScreenTimeout = null;
export default class Game {
  constructor(gametype) {
    this.userSettings = {...settings.settings};
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
    this.loadFinished = false;
    this.noUpdate = false;
    this.isDead = false;
    this.isPaused = false;
    this.isDirty = true;
    this.isVisible = false;
    this.musicLinePointCleared = [];
    this.onPaceTime = 0;
    this.startedOnPaceEvent = false;
    this.background = '';
    this.stat = {
      level: 0,
      score: 0,
      line: 0,
      piece: 0,
      maxcombo: 0,
    };
    this.appends = {};
    this.prefixes = {};
    this.smallStats = {
      score: true,
      fallspeed: true,
      entrydelay: true,
      pace: true,
    };
    this.endingStats = {
      score: true,
      level: true,
      piece: true,
      line: true,
      maxcombo: true,
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
      shakeVelocity: {
        x: 0,
        y: 0,
      },
    };
    this.startingTime = 0;
    this.timePassed = 0;
    this.timePassedAre = 0;
    loadGameType(gametype)
        .then((gameData) => {
          gtag('event', 'play', {
            'event_category': 'Game',
            'event_label': gametype,
          });
          this.show();
          menu.close();
          this.startingTime = this.timestamp();
          clearTimeout(endScreenTimeout);
          $('#combo-counter-container').classList.add('hidden');
          $('#garbage-counter').textContent = '';
          $('#timer').classList.remove('pace');
          $('#timer-real').classList.remove('pace');
          $('#timer').classList.remove('hurry-up');
          $('#timer-real').classList.remove('hurry-up');
          $('#game').classList.remove('dead');
          $('#ready-meter').classList.remove('hidden');
          $('#end-message-container').classList.add('hidden');
          $('#kill-message-container').classList.add('hidden');
          this.settings = gameData.settings;
          this.stats = gameData.stats;
          sound.load(this.settings.soundbank);
          // SET UP MODULES
          this.stack = new Stack(this, toCtx(this.stackCanvas));
          this.piece = new Piece(this, toCtx(this.pieceCanvas));
          let randomseed = new Math.seedrandom()();
          if ($('#queuerand').value !== '') {
            randomseed = $('#queuerand').value;
          }
          this.next = new Next(this, toCtx(this.nextCanvas), toCtx(this.nextSubCanvas), randomseed);
          this.hold = new Hold(this, toCtx(this.holdCanvas));
          this.particle = new Particle(this, toCtx(this.particleCanvas));
          this.stack.endAlarm();
          // SET UP SETTINGS

          if (this.userSettings.rotationSystem === 'auto') {
            this.rotationSystem = this.settings.rotationSystem;
          } else {
            this.settings.rotationSystem = this.userSettings.rotationSystem;
            this.rotationSystem = this.userSettings.rotationSystem;
          }
          if (!this.settings.disableDefaultSkinLoad) {
            this.makeSprite();
          }
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
          if (this.settings.musicLinePoints != null) {
            // eslint-disable-next-line no-unused-vars
            for (const point of this.settings.musicLinePoints) {
              this.musicLinePointCleared.push(false);
            }
          }
          {if (typeof this.settings.music === 'string') {
            const string = this.settings.music;
            this.settings.music = [string];
          }}
          sound.loadBgm(this.settings.music, gametype);
          sound.add('ready');
          $('#message').classList.remove('dissolve');
          $('#message').textContent = locale.getString('ui', 'ready');
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
  die() {
    cancelAnimationFrame(this.request);
    this.isDead = true;
  }
  end(victory = false) {
    $('#combo-counter-container').classList.add('hidden');
    this.stack.endAlarm();
    this.noUpdate = true;
    $('#end-stats').innerHTML = '';
    for (const statName of this.stats) {
      if (this.endingStats[statName]) {
        $('#end-stats').innerHTML += `<b>${locale.getString('ui', statName)}:</b> ${this.stat[statName]}<br>`;
      }
    }
    if (this.timeGoal == null) {
      $('#end-stats').innerHTML += `<b>${locale.getString('ui', 'inGameTime', [`<span style="font-weight: normal">${msToTime(this.timePassed)}</span>`])}</b><br>`;
      $('#end-stats').innerHTML += `<b>${locale.getString('ui', 'realTimeAttack', [`<span style="font-weight: normal">${msToTime(this.timePassed + this.timePassedAre)}</span>`])}</b><br>`;
    }
    $('#kill-message-container').classList.remove('hidden');
    if (victory) {
      sound.add('excellent');
    } else {
      sound.add('ko');
    }
    sound.killBgm();
    sound.killAllLoops();
    $('#game').classList.add('dead');
    endScreenTimeout = setTimeout(() => {
      sound.stopSeLoop('alarm');
      $('#kill-message-container').classList.add('hidden');
      sound.add('gameover');
      $('#end-message').textContent = locale.getString('ui', 'gameover');
      $('#end-message-container').classList.remove('hidden');
      $('#return-to-menu').textContent = locale.getString('ui', 'returnToMenu');
    }, 1700);
  }
  calculateActionText(lineClear, isSpin, isMini, b2b) {
    if (!settings.settings.displayActionText) {
      return;
    }
    const clearName = ['', 'single', 'double', 'triple', 'tetra'][lineClear];
    let spinName = '';
    let miniName = '';
    let b2bName = '';
    if (isSpin) {
      spinName = 'spin';
    }
    if (isMini) {
      miniName = 'mini';
    }
    if (b2b > 1) {
      b2bName = `<br>${locale.getString('action-text', 'b2b')}`;
    }
    const finalLabel = `${spinName}${clearName}${miniName}`;
    if (finalLabel === '') {
      return;
    }
    this.displayActionText(locale.getString('action-text', finalLabel, [`<b>${this.piece.name}</b>`]) + b2bName);
  }
  displayActionText(text) {
    if (!settings.settings.displayActionText) {
      return;
    }
    const id = `at-${performance.now()}`;
    const element = document.createElement('div');
    element.innerHTML = text;
    element.classList.add('action-text');
    element.id = id;
    $('#game-center').appendChild(element);
    setTimeout(() => {
      element.parentNode.removeChild(element);
    }, 2000);
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
    let holdLabelSelection = 'hold';
    if (game.hold.useSkip) {holdLabelSelection = 'skip';}
    $('#hold-label').textContent = locale.getString('ui', holdLabelSelection);
    $('#next-label').textContent = locale.getString('ui', 'next');
    $('#load-message').textContent = locale.getString('ui', 'loading');
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
        $('#infinity-symbol').classList.add('hidden');
        break;
      case 'infinite':
        $('#pip-grid').classList.add('hidden');
        $('#lockdown').classList.remove('hidden');
        $('#delay').classList.remove('hidden');
        $('#infinity-symbol').classList.remove('hidden');
        break;
      case 'classic':
        $('#pip-grid').classList.add('hidden');
        $('#lockdown').classList.remove('hidden');
        $('#delay').classList.remove('hidden');
        $('#infinity-symbol').classList.add('hidden');

        break;
      default:
        $('#pip-grid').classList.add('hidden');
        $('#lockdown').classList.add('hidden');
        $('#delay').classList.add('hidden');
        $('#infinity-symbol').classList.add('hidden');
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
  shakeMatrix(power = 1) {
    this.matrix.shakeVelocity.x = power;
    this.matrix.shakeVelocity.y = power / 2;
  }
  updateMatrix(ms) {
    const multiplier = ms / 16.666666666666;
    const matrixPush = (direction) => {
      const axis =
        direction === 'right' || direction === 'left' ?
          'x' : 'y';
      const modifier =
        direction === 'right' || direction === 'down' ?
          1 : -1;
      this.matrix.velocity[direction] = Math.min(this.matrix.velocity[direction], 1);
      if (Math.abs(this.matrix.position[axis]) < 0.5) {
        this.matrix.position[axis] += 0.2 * modifier * multiplier;
      }
      this.matrix.velocity[direction] -= 0.2 * multiplier;
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
        this.matrix.position[directions[2]] /= 1 + (speed - 1) * multiplier;
      } else {
        for (let i = 0; i < 2; i++) {
          const direction = directions[i];
          if (this.matrix.velocity[direction] !== 0) {
            matrixPush(direction);
          }
        }
      }
    }
    for (const direction of ['x', 'y']) {
      const modifier = Math.random() * 2 - 1;
      this.matrix.position[direction] += this.matrix.shakeVelocity[direction] * modifier;
      this.matrix.shakeVelocity[direction] /= 1 + (1.1 - 1) * multiplier;
      if (Math.abs(this.matrix.shakeVelocity[direction]) < 0.0001) {
        this.matrix.shakeVelocity[direction] = 0;
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
  updateMusic() {
    if (this.settings.musicLinePoints != null) {
      for (let i = 0; i < this.musicLinePointCleared.length; i++) {
        const bool = this.musicLinePointCleared[i];
        if (!bool) {
          if (this.stat.line >= this.settings.musicLinePoints[i]) {
            sound.killBgm();
            sound.playBgm(this.settings.music[i + 1], this.type);
            this.musicLinePointCleared[i] = true;
            continue;
          }
          break;
        }
      }
    }
  }
  gameLoop() {
    const game = gameHandler.game;
    if (!game.isDead) {
      game.request = requestAnimationFrame(game.gameLoop);
      if (typeof game.loop === 'function') {
        game.now = game.timestamp();
        game.deltaTime = (game.now - game.last) / 1000;
        const msPassed = game.deltaTime * 1000;
        if (!game.isPaused) {
          if (game.piece.startingAre < game.piece.startingAreLimit && game.loadFinished) {
            $('#ready-meter').max = game.piece.startingAreLimit;
            $('#ready-meter').value = game.piece.startingAreLimit - game.piece.startingAre;
            game.piece.startingAre += msPassed;
          }
          if (!game.noUpdate) {
            if (!game.piece.inAre) {
              game.timePassed += msPassed;
            } else if (game.piece.startingAre >= game.piece.startingAreLimit) {
              game.timePassedAre += msPassed;
            }

            // GOALS
            if (game.lineGoal != null) {
              if (game.stat.line >= game.lineGoal) {
                $('#kill-message').textContent = locale.getString('ui', 'excellent');
                game.end(true);
              }
            }
            if (game.timeGoal != null) {
              if (((game.rtaLimit) ? game.timePassed + game.timePassedAre : game.timePassed) >=
                game.timeGoal) {
                game.timeGoal = null;
                $('#kill-message').textContent = locale.getString('ui', 'timeOut');
                game.end();
              }
            }
            game.pps = game.stat.piece / (game.timePassed / 1000);
            if (game.stack.alarmIsOn) {
              const cellSize = game.cellSize;
              const redLineParticleSettings = {
                amount: 1,
                y: cellSize * game.bufferPeek,
                xRange: 1,
                yRange: 1,
                yVelocity: 0,
                xVariance: 2,
                yVariance: .2,
                yFlurry: .2,
                xDampening: .99,
                lifeVariance: 80,
                red: 255,
                blue: 51,
                green: 28,
              };
              game.particle.generate({
                x: 0,
                xVelocity: 2,
                ...redLineParticleSettings,
              });
              game.particle.generate({
                x: game.stack.width * cellSize,
                xVelocity: -2,
                ...redLineParticleSettings,
              });
              game.particle.generate({
                amount: 1,
                x: 0,
                y: cellSize * (game.bufferPeek + game.stack.height),
                xRange: game.stack.width * cellSize,
                yRange: 1,
                xVelocity: 0,
                yVelocity: 2,
                xVariance: 3,
                yVariance: 1,
                xFlurry: .2,
                yFlurry: .2,
                lifeVariance: 80,
                maxlife: 500,
              });
            }
            game.loop({
              ms: msPassed,
              piece: game.piece,
              stack: game.stack,
              hold: game.hold,
              particle: game.particle,
            });
          }
          game.particle.update(msPassed);
          game.updateMatrix(msPassed);
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
        input.updateGameInput();
        if (game.mustReset) {
          game.isDead = true;
        }
        if (game.isPaused) {
          $('#timer').classList.add('paused');
          $('#timer-real').classList.add('paused');
        } else {
          if (game.piece.inAre) {
            $('#timer').classList.add('paused');
          } else {
            $('#timer').classList.remove('paused');
          }
          if (game.piece.startingAre < game.piece.startingAreLimit) {
            $('#timer-real').classList.add('paused');
          } else {
            $('#timer-real').classList.remove('paused');
          }
        }
        if (game.timeGoal != null) {
          if (game.rtaLimit) {
            $('#timer').innerHTML = locale.getString('ui', 'inGameTime', [msToTime(game.timePassed)]);
            $('#timer-real').innerHTML = locale.getString('ui', 'realTimeAttack', [msToTime(game.timeGoal - game.timePassed - game.timePassedAre)]);
          } else {
            $('#timer').innerHTML = locale.getString('ui', 'inGameTime', [msToTime(game.timeGoal - game.timePassed)]);
            $('#timer-real').innerHTML = locale.getString('ui', 'realTimeAttack', [msToTime(game.timePassed + game.timePassedAre)]);
          }
        } else {
          $('#timer').innerHTML = locale.getString('ui', 'inGameTime', [msToTime(game.timePassed)]);
          $('#timer-real').innerHTML = locale.getString('ui', 'realTimeAttack', [msToTime(game.timePassed + game.timePassedAre)]);
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
      skin = SKIN_SETS[this.settings.rotationSystem]
  ) {
    this.loadFinished = false;
    $('#sprite').innerHTML = '';
    $('#load-message').classList.remove('hidden');
    const toLoad = colors.length * types.length;
    let loaded = 0;
    for (const type of types) {
      for (const color of colors) {
        const img = document.createElement('img');
        img.src = `img/skin/${skin}/${type}-${color}.svg`;
        img.id = `${type}-${color}`;
        $('#sprite').appendChild(img);
        const onLoad = () => {
          loaded++;
          if (loaded >= toLoad) {
            this.loadFinished = true;
            $('#load-message').classList.add('hidden');
          }
          this.isDirty = true;
        };

        if (img.complete) {
          onLoad();
        } else {
          img.addEventListener('load', onLoad);
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
