import input from '../../input.js';

export default function hyperSoftDrop(arg) {
  if (input.getGameDown('softDrop')) {
    arg.piece.gravityOverride = .00001;
  } else {
    arg.piece.gravityOverride = 0;
  }
}
