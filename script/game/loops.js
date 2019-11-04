import classicLockdown from './loop-modules/classic-lockdown.js';
import extendedLockdown from './loop-modules/extended-lockdown.js';
import gravity from './loop-modules/gravity.js';
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
import softDrop from './loop-modules/soft-drop.js';
import updateKeys from './loop-modules/update-keys.js';
import updateLasts from './loop-modules/update-lasts.js';
import infiniteLockdown from './loop-modules/infinite-lockdown.js';
import collapse from './loop-modules/collapse.js';
import {framesToMs} from '../shortcuts.js';

export const loops = {
  marathon: {
    update: (arg) => {
      // arg.ms = 1 / 60 * 1000;
      reset();
      if (arg.piece.inAre) {
        initialDas(arg);
        initialRotation(arg);
        initialHold(arg);
        collapse(arg);
        arg.piece.are += arg.ms;
      }
      else {
        hold(arg);
        shifting(arg);
      }
      rotate(arg);
      rotate180(arg);
      gravity(arg);
      softDrop(arg);
      hardDrop(arg);
      extendedLockdown(arg);
      if (!arg.piece.inAre) {
        respawnPiece(arg);
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
      game.updateStats();
    },
  },
};
