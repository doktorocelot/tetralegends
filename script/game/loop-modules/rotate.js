import input from '../../input.js';

export default function rotate(arg) {
  const piece = arg.piece;
  if (input.getGamePress('rotateLeft')) {
    piece.rotateLeft();
  }
  if (input.getGamePress('rotateRight')) {
    piece.rotateRight();
  }
}
