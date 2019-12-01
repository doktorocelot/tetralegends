import gameHandler from '../game-handler.js';
import {SCORE_TABLES} from '../../consts.js';
import sound from '../../sound.js';

function fallen(piece) {
  if (piece.yFloor > Math.floor(piece.lastY)) {
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
      sound.add('step');
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
      piece.sonicDrop();
    }
  } else {
    piece.y = Math.floor(piece.y);
  }
  fallen(piece);
}
export function classicGravity(arg) {
  const piece = arg.piece;
  let distance = arg.ms / (piece.gravity / piece.gravityMultiplier);
  if (piece.gravityOverride) {
    distance = arg.ms / piece.gravityOverride;
  }
  const oldY = piece.y;
  piece.y += Math.min(distance);
  if (piece.isStuck) {
    piece.y = oldY;
    piece.sonicDrop();
    piece.mustLock = true;
  }
  fallen(piece);
}
