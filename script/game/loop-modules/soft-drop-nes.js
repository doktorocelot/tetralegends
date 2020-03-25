import input from '../../input.js';
import {framesToMs} from '../../shortcuts.js';

export default function softDropNes(arg) {
  if (input.getGameDown('softDrop') && !arg.piece.softDropIsLocked) {
    if (arg.piece.breakHoldingTimeOnSoftDrop) {
      arg.piece.holdingTime = arg.piece.holdingTimeLimit;
    }
    if (input.getGameDown('moveLeft') || input.getGameDown('moveRight')) {
      arg.piece.softDropIsLocked = true;
      return;
    }
    arg.piece.gravityOverride = 33.33;
    arg.piece.genPieceParticles();
    arg.piece.mustLockRetro = true;
  } else {
    arg.piece.gravityOverride = 0;
    arg.piece.mustLockRetro = false;
  }
  if (!input.getGameDown('softDrop')) {
    arg.piece.softDropIsLocked = false;
  }
}
