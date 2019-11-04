import input from '../../input.js';

export default function initialRotation(arg) {
  if (input.getGamePress('rotateLeft')) {
    arg.piece.ire = 3;
  } else if (input.getGamePress('rotateRight')) {
    arg.piece.ire = 1;
  } else if (input.getGamePress('rotate180')) {
    arg.piece.ire = 2;
  }
}
