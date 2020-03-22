import input from '../../input.js';
import gameHandler from '../game-handler.js';

export default function handheldDasAre(arg, dasLimit, arrLimit) {
  const piece = arg.piece;
  if (input.getGamePress('moveLeft') || input.getGamePress('moveRight')) {
    piece.das = dasLimit;
    piece.arr = arrLimit;
  }
  if (input.getGameDown('moveLeft')) {
    piece.shiftReleased = false;
    piece.shiftDir = 'left';
  } else if (input.getGameDown('moveRight')) {
    piece.shiftReleased = false;
    piece.shiftDir = 'right';
  } else {
    piece.shiftReleased = true;
    piece.shiftDir = 'none';
  }
}
