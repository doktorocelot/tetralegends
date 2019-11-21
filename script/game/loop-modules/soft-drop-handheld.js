import input from '../../input.js';
import {framesToMs} from '../../shortcuts.js';

export default function softDropHandheld(arg) {
  if (input.getGameDown('softDrop') && !arg.piece.softDropIsLocked) {
    arg.piece.gravityOverride = 50;
  } else {
    arg.piece.gravityOverride = 0;
  }
  if (!input.getGameDown('softDrop')) {
    arg.piece.softDropIsLocked = false;
  }
}
