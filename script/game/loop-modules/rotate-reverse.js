import input from '../../input.js';

export default function rotateReverse(arg) {
  const piece = arg.piece;
  if (input.getGamePress('rotateLeft')) {
    piece.rotateRight();
  }
  if (input.getGamePress('rotateRight')) {
    piece.rotateLeft();
  }
}
