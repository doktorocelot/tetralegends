import input from '../../input.js';

export default function rotate180(arg) {
  const piece = arg.piece;
  if (input.getGamePress('rotate180')) {
    piece.rotate180();
  }
}
