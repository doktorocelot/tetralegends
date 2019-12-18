import {framesToMs} from '../shortcuts.js';
import {gravity, classicGravity} from './loop-modules/gravity.js';
import {KICK_TABLES, PIECE_COLORS} from '../consts.js';
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
import reset from './loop-modules/reset.js';
import respawnPiece from './loop-modules/respawn-piece.js';
import rotate from './loop-modules/rotate.js';
import rotate180 from './loop-modules/rotate-180.js';
import shifting from './loop-modules/shifting.js';
import shiftingHandheld from './loop-modules/shifting-handheld.js';
import shiftingRetro from './loop-modules/shifting-retro.js';
import softDrop from './loop-modules/soft-drop.js';
import softDropHandheld from './loop-modules/soft-drop-handheld.js';
import softDropRetro from './loop-modules/soft-drop-retro.js';
import sound from '../sound.js';
import updateKeys from './loop-modules/update-keys.js';
import updateLasts from './loop-modules/update-lasts.js';
import {extendedLockdown, retroLockdown, infiniteLockdown, classicLockdown} from './loop-modules/lockdown.js';
import updateFallSpeed from './loop-modules/update-fallspeed.js';
let lastLevel = 0;
const levelUpdate = (game) => {
  if (game.stat.level !== lastLevel) {
    sound.add('levelup');
    if (game.stat.level % 5 === 0) {
      sound.add('levelupmajor');
    } else {
      sound.add('levelupminor');
    }
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
      game.stat.level = 1;
      lastLevel = 1;
      game.prefixes.level = 'M';
      game.piece.gravity = framesToMs(1 / 20);
      updateFallSpeed(game);
      game.updateStats();
    },
  },
  handheld: {
    update: (arg) => {
      collapse(arg);
      if (arg.piece.inAre) {
        handheldDasAre(arg);
        arg.piece.are += arg.ms;
      } else {
        rotate(arg);
        shiftingHandheld(arg);
      }
      classicGravity(arg);
      softDropHandheld(arg);
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
};
