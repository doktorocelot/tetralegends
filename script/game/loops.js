import {framesToMs} from '../shortcuts.js';
import {gravity, classicGravity} from './loop-modules/gravity.js';
import {KICK_TABLES, PIECE_COLORS} from '../consts.js';
import classicLockdown from './loop-modules/classic-lockdown.js';
import collapse from './loop-modules/collapse.js';
import extendedLockdown from './loop-modules/extended-lockdown.js';
import gameHandler from './game-handler.js';
import handheldDasAre from './loop-modules/handheld-das-are.js';
import hardDrop from './loop-modules/hard-drop.js';
import hold from './loop-modules/hold.js';
import hyperSoftDrop from './loop-modules/hyper-soft-drop.js';
import infiniteLockdown from './loop-modules/infinite-lockdown.js';
import initialDas from './loop-modules/initial-das.js';
import initialHold from './loop-modules/initial-hold.js';
import initialRotation from './loop-modules/initial-rotation.js';
import lockFlash from './loop-modules/lock-flash.js';
import reset from './loop-modules/reset.js';
import respawnPiece from './loop-modules/respawn-piece.js';
import retroLockdown from './loop-modules/retro-lockdown.js';
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
let lastLevel = 0;
export const loops = {
  marathon: {
    update: (arg) => {
      collapse(arg);
      if (arg.piece.inAre) {
        initialDas(arg);
        initialRotation(arg);
        initialHold(arg);
        arg.piece.are += arg.ms;
      }
      else {
        shifting(arg);
        rotate(arg);
        rotate180(arg);
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
      const gravityInFrames = 1 / ((game.piece.gravity / 1000) * 60);
      const gravityVisual = () => {
        if (gravityInFrames < 1) {
          return `1/${Math.round(1 / gravityInFrames * 1000) / 1000} <b>G</b>
          <br><b>${Math.round(game.piece.gravity) / 1000}</b> sec/row`;
        } else {
          return `${Math.round(gravityInFrames * 1000) / 1000} <b>G</b>
          <br><b>${Math.round(game.piece.gravity) / 1000}</b> sec/row`;
        }
      };
      if (game.stat.level >= 20) {
        game.piece.lockDelayLimit = ~~framesToMs((30 * Math.pow(0.93, (Math.pow(game.stat.level - 20, 0.8)))));
      } else {
        game.piece.lockDelayLimit = 500;
      }
      game.stat.fallspeed = gravityVisual();
      if (game.stat.level !== lastLevel) {
        sound.add('levelup');
        if (game.stat.level % 5 === 0) {
          sound.add('levelupmajor');
        } else {
          sound.add('levelupminor');
        }
      }
      lastLevel = game.stat.level;
    },
    onInit: (game) => {
      game.stat.level = 1;
      lastLevel = 1;
    },
  },
  handheld: {
    update: (arg) => {
      collapse(arg);
      if (arg.piece.inAre) {
        handheldDasAre(arg);
        arg.piece.are += arg.ms;
      }
      else {
        shiftingHandheld(arg);
        rotate(arg);
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
      if (game.stat.level !== lastLevel) {
        sound.add('levelup');
      }
      lastLevel = game.stat.level;
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
