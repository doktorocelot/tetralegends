import input from '../../input.js';

export default function hyperSoftDrop(arg) {
  if (input.getGameDown('softDrop')) {
    arg.piece.gravityMultiplier = 9999;
  } else {
    arg.piece.gravityMultiplier = 1;
  }
}
