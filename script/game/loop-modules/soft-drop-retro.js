import input from '../../input.js';
import {framesToMs} from '../../shortcuts.js';

export default function softDropRetro(arg) {
  if (input.getGameDown('softDrop')) {
    arg.piece.gravityOverride = 33.3333333333;
  } else {
    arg.piece.gravityOverride = 0;
  }
}
