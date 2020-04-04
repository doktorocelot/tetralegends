import input from '../../input.js';
import gameHandler from '../game-handler.js';

export default function initialDas(arg) {
  const piece = arg.piece;
  const ias = gameHandler.game.userSettings.IAS;
  if (input.getGameDown('moveLeft')) {
    if (ias) {
      piece.das = piece.dasLimit;
    } else {
      piece.das += arg.ms;
    }

    piece.shiftReleased = false;
    piece.shiftDir = 'left';
  } else if (input.getGameDown('moveRight')) {
    if (ias) {
      piece.das = piece.dasLimit;
    } else {
      piece.das += arg.ms;
    }
    piece.shiftReleased = false;
    piece.shiftDir = 'right';
  } else {
    piece.das = 0;
    piece.shiftReleased = true;
    piece.shiftDir = 'none';
  }
  piece.arr = piece.arrLimit;
}
