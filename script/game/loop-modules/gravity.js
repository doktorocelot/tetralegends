import gameHandler from '../game-handler.js';
import {SCORE_TABLES} from '../../consts.js';
import sound from '../../sound.js';

function fallen(piece) {
  if (piece.manipulations >= piece.manipulationLimit) {
    piece.isDirty = true;
  }

  if (Math.floor(piece.visualY) > Math.floor(piece.lastVisualY)) {
    if (piece.gravityMultiplier !== 1 || piece.gravityOverride) {
      for (let i = 1; i <= (piece.yFloor - Math.floor(piece.lastY)); i++) {
        {gameHandler.game.addScore('softDrop');}
      }
      if (SCORE_TABLES[gameHandler.game.settings.scoreTable].updateSoftDropImmediately) {
        gameHandler.game.updateStats();
      }
    }
    piece.isDirty = true;
    if (piece.isLanded) {
      sound.add('land');
    }
  }
}

export function gravity(arg) {
  const piece = arg.piece;
  let distance = arg.ms / (piece.gravity / piece.gravityMultiplier);
  if (piece.gravityOverride) {
    distance = arg.ms / piece.gravityOverride;
  }
  if (!piece.isLanded) {
    if (piece.checkFall(distance)) {
      piece.y += Math.min(distance, piece.getDrop(distance + 1));
    } else {
      piece.genDropParticles();
      piece.sonicDrop();
    }
  } else {
    piece.y = Math.floor(piece.y);
  }
  fallen(piece);
}
export function classicGravity(arg) {
  const piece = arg.piece;
  if (piece.holdingTime < piece.holdingTimeLimit) {
    return;
  }
  let distance = arg.ms / (piece.gravity / piece.gravityMultiplier);
  if (piece.gravityOverride) {
    distance = arg.ms / piece.gravityOverride;
  }
  const oldY = piece.y;
  piece.y += Math.min(distance);
  if (!piece.isLanded) {
    if (!piece.checkFall(distance)) {
      piece.sonicDrop();
      piece.mustLock = true;
    }
  }
  if (piece.isStuck) {
    piece.y = oldY;
    piece.sonicDrop();
    piece.mustLock = true;
  }
  fallen(piece);
}
export function deluxeGravity(arg) {
  const piece = arg.piece;
  let distance = arg.ms / (piece.gravity / piece.gravityMultiplier);
  if (piece.gravityOverride) {
    distance = arg.ms / piece.gravityOverride;
  }
  if (!piece.mustLockRetro) {
    if (!piece.isLanded) {
      if (piece.checkFall(distance)) {
        piece.y += Math.min(distance, piece.getDrop(distance + 1));
      } else {
        piece.genDropParticles();
        piece.sonicDrop();
      }
    } else {
      piece.y = Math.floor(piece.y);
    }
  } else {
    const oldY = piece.y;
    piece.y += Math.min(distance);
    if (piece.isStuck) {
      piece.y = oldY;
      piece.sonicDrop();
      piece.mustLock = true;
    }
  }
  fallen(piece);
}
