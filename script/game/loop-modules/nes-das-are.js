import input from '../../input.js';

export default function nesDasAre(arg) {
  const piece = arg.piece;
  if (input.getGameDown('moveLeft')) {
    piece.shiftReleased = false;
    piece.shiftDir = 'left';
  } else if (input.getGameDown('moveRight')) {
    piece.shiftReleased = false;
    piece.shiftDir = 'right';
  } else {
    // piece.shiftReleased = true;
    piece.shiftDir = 'none';
  }
}
