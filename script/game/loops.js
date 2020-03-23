import $, {framesToMs, resetAnimation} from '../shortcuts.js';
import {gravity, classicGravity, deluxeGravity} from './loop-modules/gravity.js';
import {PIECE_COLORS} from '../consts.js';
import collapse from './loop-modules/collapse.js';
import gameHandler from './game-handler.js';
import handheldDasAre from './loop-modules/handheld-das-are.js';
import hardDrop from './loop-modules/hard-drop.js';
import hold from './loop-modules/hold.js';
import hyperSoftDrop from './loop-modules/hyper-soft-drop.js';
import initialDas from './loop-modules/initial-das.js';
import initialHold from './loop-modules/initial-hold.js';
import initialRotation from './loop-modules/initial-rotation.js';
import lockFlash from './loop-modules/lock-flash.js';
import respawnPiece from './loop-modules/respawn-piece.js';
import rotate from './loop-modules/rotate.js';
import rotate180 from './loop-modules/rotate-180.js';
import shifting from './loop-modules/shifting.js';
import shiftingRetro from './loop-modules/shifting-retro.js';
import softDrop from './loop-modules/soft-drop.js';
import softDropRetro from './loop-modules/soft-drop-retro.js';
import sound from '../sound.js';
import updateLasts from './loop-modules/update-lasts.js';
import {extendedLockdown, retroLockdown, classicLockdown} from './loop-modules/lockdown.js';
import updateFallSpeed from './loop-modules/update-fallspeed.js';
let lastLevel = 0;
let garbageTimer = 0;
let shown20GMessage = false;
const create4w = (grid) => {
  for (const x of [0, 1, 2, 7, 8, 9]) {
    for (let y = 22; y < grid[0].length; y++) {
      grid[x][y] = 'white';
    }
  }
};
const levelUpdate = (game) => {
  if (game.stat.level !== lastLevel) {
    sound.add('levelup');
    game.stack.levelUpAnimation = 0;
    if (game.stat.level % 5 === 0) {
      sound.add('levelupmajor');
    } else {
      sound.add('levelupminor');
    }
  }
  if (game.redrawOnLevelUp && false) {
    game.stack.makeAllDirty();
    game.stack.isDirty = true;
  }
  lastLevel = game.stat.level;
};
export const loops = {
  marathon: {
    update: (arg) => {
      collapse(arg);
      if (arg.piece.inAre) {
        initialDas(arg);
        initialRotation(arg);
        initialHold(arg);
        arg.piece.are += arg.ms;
      } else {
        rotate(arg);
        rotate180(arg);
        shifting(arg);
      }
      gravity(arg);
      softDrop(arg);
      hardDrop(arg);
      extendedLockdown(arg);
      if (!arg.piece.inAre) {
        respawnPiece(arg);
        hold(arg);
      }
      lockFlash(arg);
      updateLasts(arg);
    },
    onPieceSpawn: (game) => {
      game.stat.level = Math.floor(game.stat.line / 10 + 1);
      const x = game.stat.level;
      const gravityEquation = (0.8 - ((x - 1) * 0.007)) ** (x - 1);
      game.piece.gravity = Math.max(gravityEquation * 1000, framesToMs(1 / 20));
      if (game.stat.level >= 20) {
        game.piece.lockDelayLimit = ~~framesToMs((30 * Math.pow(0.93, (Math.pow(game.stat.level - 20, 0.8)))));
      } else {
        game.piece.lockDelayLimit = 500;
      }
      updateFallSpeed(game);
      levelUpdate(game);
    },
    onInit: (game) => {
      game.stat.level = 1;
      lastLevel = 1;
      game.piece.gravity = 1000;
      updateFallSpeed(game);
      game.updateStats();
    },
  },
  sprint: {
    update: (arg) => {
      const game = gameHandler.game;
      if (game.pps >= 2 && game.settings.hasPaceBgm) {
        if (!game.startedOnPaceEvent) {
          game.onPaceTime = game.timePassed;
          game.startedOnPaceEvent = true;
        }
        if (game.timePassed - game.onPaceTime >= 3000) {
          if (!sound.paceBgmIsRaised) {
            sound.add('onpace');
          }
          sound.raisePaceBgm();
          $('#timer').classList.add('pace');
        }
      } else {
        if (sound.paceBgmIsRaised) {
          sound.add('offpace');
        }
        game.startedOnPaceEvent = false;
        sound.lowerPaceBgm();
        $('#timer').classList.remove('pace');
      }
      collapse(arg);
      if (arg.piece.inAre) {
        initialDas(arg);
        initialRotation(arg);
        initialHold(arg);
        arg.piece.are += arg.ms;
      } else {
        rotate(arg);
        rotate180(arg);
        shifting(arg);
      }
      gravity(arg);
      softDrop(arg, 70);
      hardDrop(arg);
      extendedLockdown(arg);
      if (!arg.piece.inAre) {
        respawnPiece(arg);
        hold(arg);
      }
      lockFlash(arg);
      updateLasts(arg);
    },
    onPieceSpawn: (game) => {
    },
    onInit: (game) => {
      game.lineGoal = 40;
      game.isRaceMode = true;
      game.stat.level = 1;
      game.reverseLineStat = true;
      game.piece.gravity = 1000;
      updateFallSpeed(game);
      game.updateStats();
    },
  },
  ultra: {
    update: (arg) => {
      const game = gameHandler.game;
      if (game.timePassed >= game.timeGoal - 30000) {
        if (!game.playedHurryUp) {
          sound.add('hurryup');
          $('#timer').classList.add('hurry-up');
          game.playedHurryUp = true;
        }
        sound.raisePaceBgm();
      } else {
        game.playedHurryUp = false;
      }
      collapse(arg);
      if (arg.piece.inAre) {
        initialDas(arg);
        initialRotation(arg);
        initialHold(arg);
        arg.piece.are += arg.ms;
      } else {
        rotate(arg);
        rotate180(arg);
        shifting(arg);
      }
      gravity(arg);
      softDrop(arg, 70);
      hardDrop(arg);
      extendedLockdown(arg);
      if (!arg.piece.inAre) {
        respawnPiece(arg);
        hold(arg);
      }
      lockFlash(arg);
      updateLasts(arg);
    },
    onPieceSpawn: (game) => {
    },
    onInit: (game) => {
      game.timeGoal = 120000;
      game.isRaceMode = true;
      game.piece.gravity = 1000;
      updateFallSpeed(game);
      game.stat.level = 1;
      game.updateStats();
    },
  },
  combo: {
    update: (arg) => {
      const game = gameHandler.game;
      if (game.timePassed >= game.timeGoal - 10000) {
        if (!game.playedHurryUp) {
          sound.add('hurryup');
          $('#timer').classList.add('hurry-up');
          game.playedHurryUp = true;
        }
        sound.raisePaceBgm();
      } else {
        game.playedHurryUp = false;
      }
      collapse(arg);
      if (arg.piece.inAre) {
        initialDas(arg);
        initialRotation(arg);
        initialHold(arg);
        arg.piece.are += arg.ms;
      } else {
        rotate(arg);
        rotate180(arg);
        shifting(arg);
      }
      gravity(arg);
      softDrop(arg, 70);
      hardDrop(arg);
      extendedLockdown(arg);
      if (!arg.piece.inAre) {
        respawnPiece(arg);
        hold(arg);
      }
      lockFlash(arg);
      updateLasts(arg);
    },
    onPieceSpawn: (game) => {
    },
    onInit: (game) => {
      game.timeGoal = 30000;
      game.isRaceMode = true;
      game.piece.gravity = 1000;
      updateFallSpeed(game);
      game.stat.level = 1;
      game.updateStats();
      console.log(JSON.stringify(game.stack.grid));
      game.stack.grid[0][game.stack.height + game.stack.hiddenHeight - 1] = 'white';
      game.stack.grid[0][game.stack.height + game.stack.hiddenHeight - 2] = 'white';
      if (game.next.queue[0] === 'J') {
        game.stack.grid[1][game.stack.height + game.stack.hiddenHeight - 1] = 'white';
      } else {
        game.stack.grid[1][game.stack.height + game.stack.hiddenHeight - 2] = 'white';
      }
    },
  },
  standardx: {
    update: (arg) => {
      collapse(arg);
      if (arg.piece.inAre) {
        initialDas(arg);
        initialRotation(arg);
        initialHold(arg);
        arg.piece.are += arg.ms;
      } else {
        rotate(arg);
        rotate180(arg);
        shifting(arg);
      }
      gravity(arg);
      hyperSoftDrop(arg);
      hardDrop(arg);
      classicLockdown(arg);
      if (!arg.piece.inAre) {
        respawnPiece(arg);
        hold(arg);
      }
      lockFlash(arg);
      updateLasts(arg);
    },
    onPieceSpawn: (game) => {
      game.stat.level = Math.floor(game.stat.line / 10 + 1);
      const x = game.stat.level;
      const gravityEquation = (0.9 - ((x - 1) * 0.001)) ** (x - 1);
      game.piece.gravity = Math.max(gravityEquation * 1000, framesToMs(1 / 20));
      if (game.stat.level >= 40) {
        game.piece.lockDelayLimit = ~~framesToMs((30 * Math.pow(0.93, (Math.pow(game.stat.level - 40, 0.8)))));
      } else {
        game.piece.lockDelayLimit = 500;
      }
      updateFallSpeed(game);
      levelUpdate(game);
    },
    onInit: (game) => {
      game.stat.level = 1;
      lastLevel = 1;
      game.piece.gravity = 1000;
      updateFallSpeed(game);
      game.updateStats();
    },
  },
  survivalx: {
    update: (arg) => {
      collapse(arg);
      if (arg.piece.inAre) {
        initialDas(arg);
        initialRotation(arg);
        initialHold(arg);
        arg.piece.are += arg.ms;
      } else {
        garbageTimer += arg.ms;
        if (garbageTimer > 2000) {
          garbageTimer -= 2000;
          arg.stack.spawnBrokenLine();
        }
        rotate(arg);
        rotate180(arg);
        shifting(arg);
      }
      gravity(arg);
      hyperSoftDrop(arg);
      hardDrop(arg);
      classicLockdown(arg);
      if (!arg.piece.inAre) {
        respawnPiece(arg);
        hold(arg);
      }
      lockFlash(arg);
      updateLasts(arg);
    },
    onPieceSpawn: (game) => {
      game.stat.level = Math.floor(game.stat.line / 10 + 1);
      const x = game.stat.level;
      const gravityEquation = (0.8 - ((x - 1) * 0.007)) ** (x - 1);
      game.piece.gravity = Math.max(gravityEquation * 1000, framesToMs(1 / 20));
      if (game.stat.level >= 20) {
        game.piece.lockDelayLimit = ~~framesToMs((30 * Math.pow(0.93, (Math.pow(game.stat.level - 20, 0.8)))));
      } else {
        game.piece.lockDelayLimit = 500;
      }
      updateFallSpeed(game);
      levelUpdate(game);
    },
    onInit: (game) => {
      garbageTimer = 0;
      game.stat.level = 1;
      lastLevel = 1;
      game.piece.gravity = 1000;
      updateFallSpeed(game);
      game.updateStats();
    },
  },
  master: {
    update: (arg) => {
      collapse(arg);
      if (arg.piece.inAre) {
        initialDas(arg);
        initialRotation(arg);
        initialHold(arg);
        arg.piece.are += arg.ms;
      } else {
        rotate(arg);
        rotate180(arg);
        shifting(arg);
      }
      gravity(arg);
      softDrop(arg);
      hardDrop(arg);
      extendedLockdown(arg);
      if (!arg.piece.inAre) {
        respawnPiece(arg);
        hold(arg);
      }
      lockFlash(arg);
      updateLasts(arg);
    },
    onPieceSpawn: (game) => {
      game.stat.level = Math.floor(game.stat.line / 10 + 1);
      const calcLevel = Math.min(29, game.stat.level - 1);
      const DELAY_TABLE = [
        500, 480, 461, 442, 425,
        408, 391, 376, 361, 346,
        332, 319, 306, 294, 282,
        271, 260, 250, 240, 230,
        221, 212, 204, 196, 188,
        180, 173, 166, 159, 153];
      game.piece.lockDelayLimit = DELAY_TABLE[calcLevel];
      const ARE_TABLE = [
        400, 376, 353, 332, 312,
        294, 276, 259, 244, 229,
        215, 203, 190, 179, 168,
        158, 149, 140, 131, 123,
        116, 109, 103, 96, 91,
        85, 80, 75, 71, 65];
      game.piece.areLimit = ARE_TABLE[calcLevel];
      game.piece.areLineLimit = ARE_TABLE[calcLevel];
      game.stat.entrydelay = `${ARE_TABLE[calcLevel]}ms`;
      levelUpdate(game);
    },
    onInit: (game) => {
      game.lineGoal = 300;
      game.stat.level = 1;
      lastLevel = 1;
      game.prefixes.level = 'M';
      game.stat.entrydelay = '400ms';
      game.piece.gravity = framesToMs(1 / 20);
      updateFallSpeed(game);
      game.updateStats();
    },
  },
  prox: {
    update: (arg) => {
      collapse(arg);
      if (arg.piece.inAre) {
        initialDas(arg);
        initialRotation(arg);
        initialHold(arg);
        arg.piece.are += arg.ms;
      } else {
        rotate(arg);
        rotate180(arg);
        shifting(arg);
      }
      gravity(arg);
      hyperSoftDrop(arg);
      hardDrop(arg);
      classicLockdown(arg);
      if (!arg.piece.inAre) {
        respawnPiece(arg);
        hold(arg);
      }
      lockFlash(arg);
      updateLasts(arg);
    },
    onPieceSpawn: (game) => {
      game.stat.level = Math.min(10, Math.floor(game.stat.line / 20 + 1));
      const calcLevel = game.stat.level - 1;
      const SPEED_TABLE = [
        1, 1 / 2, 1 / 5, 1 / 20, 1 / 20,
        1 / 20, 1 / 20, 1 / 20, 1 / 20, 1 / 20];
      game.piece.gravity = framesToMs(SPEED_TABLE[calcLevel]);
      const DELAY_TABLE = [
        500, 475, 450, 375, 350,
        325, 300, 275, 250, 225];
      game.piece.lockDelayLimit = DELAY_TABLE[calcLevel];
      const NEXT_TABLE = [
        6, 5, 4, 3, 2,
        1, 1, 1, 1, 1];
      game.next.nextLimit = NEXT_TABLE[calcLevel];
      if (calcLevel >= 3 && !shown20GMessage) {
        $('#message').textContent = '20G';
        resetAnimation('#message', 'dissolve');
        shown20GMessage = true;
      }
      if (calcLevel >= 8 && !game.hold.isDisabled) {
        game.hold.isDisabled = true;
        game.hold.isDirty = true;
      }
      levelUpdate(game);
    },
    onInit: (game) => {
      shown20GMessage = false;
      game.lineGoal = 200;
      game.stat.level = 1;
      lastLevel = 1;
      game.prefixes.level = 'MACH ';
      game.smallStats.level = true;
      game.resize();
      updateFallSpeed(game);
      game.updateStats();
    },
  },
  deluxe: {
    update: (arg) => {
      collapse(arg);
      if (arg.piece.inAre) {
        handheldDasAre(arg, framesToMs(9), framesToMs(3));
        arg.piece.are += arg.ms;
      } else {
        rotate(arg);
        shiftingRetro(arg, framesToMs(9), framesToMs(3));
      }
      deluxeGravity(arg);
      softDropRetro(arg, framesToMs(2));
      classicLockdown(arg);
      if (!arg.piece.inAre) {
        respawnPiece(arg);
      }
      lockFlash(arg);
      updateLasts(arg);
    },
    onPieceSpawn: (game) => {
      game.stat.level = Math.floor(game.stat.line / 10);
      const SPEED_TABLE = [53, 49, 45, 41, 37, 33, 28, 22, 17, 11, 10, 9, 8, 7, 6, 6, 5, 5, 4, 4, 3];
      let levelAdd = 0;
      if (game.appends.level === '♥') {
        levelAdd = 10;
      }
      game.piece.gravity = framesToMs(SPEED_TABLE[Math.min(20, game.stat.level + levelAdd)]);
      levelUpdate(game);
    },
    onInit: (game) => {
      game.stat.level = 0;
      // game.appends.level = '♥';
      lastLevel = 0;
      gameHandler.game.makeSprite(
          [
            'i1', 'i2', 'i3', 'i4', 'i5', 'i6',
            'l', 'o',
            'z', 't', 'j',
            's', 'white', 'black',
          ],
          ['mino', 'stack'],
          'deluxe-special'
      );
      gameHandler.game.colors = PIECE_COLORS.handheldSpecial;
    },
  },
  handheld: {
    update: (arg) => {
      collapse(arg);
      if (arg.piece.inAre) {
        handheldDasAre(arg, framesToMs(23), 150);
        arg.piece.are += arg.ms;
      } else {
        rotate(arg);
        shiftingRetro(arg, framesToMs(23), 150);
      }
      classicGravity(arg);
      softDropRetro(arg, 50);
      retroLockdown(arg);
      if (!arg.piece.inAre) {
        respawnPiece(arg);
      }
      lockFlash(arg);
      updateLasts(arg);
    },
    onPieceSpawn: (game) => {
      game.stat.level = Math.floor(game.stat.line / 10);
      const SPEED_TABLE = [53, 49, 45, 41, 37, 33, 28, 22, 17, 11, 10, 9, 8, 7, 6, 6, 5, 5, 4, 4, 3];
      let levelAdd = 0;
      if (game.appends.level === '♥') {
        levelAdd = 10;
      }
      game.piece.gravity = framesToMs(SPEED_TABLE[Math.min(20, game.stat.level + levelAdd)]);
      levelUpdate(game);
    },
    onInit: (game) => {
      game.stat.level = 0;
      // game.appends.level = '♥';
      lastLevel = 0;
      gameHandler.game.makeSprite(
          [
            'i', 'i1', 'i2', 'i3', 'i4', 'i5', 'i6',
            'l', 'o',
            'z', 't', 'j',
            's', 'white', 'black',
          ],
          ['mino'],
          'handheld-special'
      );
      gameHandler.game.colors = PIECE_COLORS.handheldSpecial;
    },
  },
  retro: {
    update: (arg) => {
      collapse(arg);
      if (arg.stack.levelUpAnimation < arg.stack.levelUpAnimationLimit) {
        arg.stack.makeAllDirty();
        arg.stack.isDirty = true;
        arg.stack.levelUpAnimation += arg.ms;
      }
      if (arg.piece.inAre) {
        handheldDasAre(arg, framesToMs(16), framesToMs(6));
        arg.piece.are += arg.ms;
      } else {
        rotate(arg);
        shiftingRetro(arg, framesToMs(16), framesToMs(6));
      }
      classicGravity(arg);
      softDropRetro(arg, 33.3333333333);
      retroLockdown(arg, true);
      if (!arg.piece.inAre) {
        respawnPiece(arg);
      }
      lockFlash(arg);
      updateLasts(arg);
    },
    onPieceSpawn: (game) => {
      game.stat.level = Math.floor(game.stat.line / 10);
      const SPEED_TABLE = [
        48, 43, 38, 33, 28,
        23, 18, 13, 8, 5,
        5, 5, 5, 4, 4,
        4, 3, 3, 3, 2,
        2, 2, 2, 2, 2,
        2, 2, 2, 2, 1,
      ];
      game.piece.gravity = framesToMs(SPEED_TABLE[Math.min(29, game.stat.level)]);
      levelUpdate(game);
    },
    onInit: (game) => {
      game.stat.level = 0;
      game.redrawOnLevelUp = true;
      lastLevel = 0;
      gameHandler.game.makeSprite(
          [
            'x-0', 'l-0', 'r-0',
            'x-1', 'l-1', 'r-1',
            'x-2', 'l-2', 'r-2',
            'x-3', 'l-3', 'r-3',
            'x-4', 'l-4', 'r-4',
            'x-5', 'l-5', 'r-5',
            'x-6', 'l-6', 'r-6',
            'x-7', 'l-7', 'r-7',
            'x-8', 'l-8', 'r-8',
            'x-9', 'l-9', 'r-9',
          ],
          ['mino'],
          'retro-special'
      );
      game.stack.levelUpAnimation = 1000;
      game.stack.levelUpAnimationLimit = 450;
      game.piece.useRetroColors = true;
      gameHandler.game.colors = PIECE_COLORS.retroSpecial;
    },
  },
};
