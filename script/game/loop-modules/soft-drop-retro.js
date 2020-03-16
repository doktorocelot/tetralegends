import input from '../../input.js';
import {framesToMs} from '../../shortcuts.js';

export default function softDropRetro(arg, override) {
  if (input.getGameDown('softDrop') && !arg.piece.softDropIsLocked) {
    arg.piece.gravityOverride = override;
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
