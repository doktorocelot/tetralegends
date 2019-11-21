import input from '../../input.js';
import {capitalizeFirstLetter, framesToMs} from '../../shortcuts.js';

export default function shiftingRetro(arg) {
  const piece = arg.piece;
  const DAS_LIMIT = framesToMs(10);
  const ARR_LIMIT = framesToMs(6);
  const resetShift = () => {
    piece.das = 0;
    piece.arr = 0;
    piece.shiftReleased = true;
  };
  if (input.getGamePress('moveLeft')) {
    resetShift();
    piece.shiftDir = 'left';
  } else if (input.getGamePress('moveRight')) {
    resetShift();
    piece.shiftDir = 'right';
  }
  if (
    piece.shiftDir === 'right' &&
    input.getGameRelease('moveRight') &&
    input.getGameDown('moveLeft')
  ) {
    resetShift();
    piece.shiftDir = 'left';
  } else if (
    piece.shiftDir === 'left' &&
    input.getGameRelease('moveLeft') &&
    input.getGameDown('moveRight')
  ) {
    resetShift();
    piece.shiftDir = 'right';
  } else if (
    input.getGameRelease('moveRight') &&
    input.getGameDown('moveLeft')
  ) {
    piece.shiftDir = 'left';
  } else if (
    input.getGameRelease('moveLeft') &&
    input.getGameDown('moveRight')
  ) {
    piece.shiftDir = 'right';
  } else if (
    input.getGameRelease('moveLeft') ||
    input.getGameRelease('moveRight')
  ) {
    resetShift();
    piece.shiftDir = 'none';
  }

  if (piece.shiftDir !== 'none') {
    if (piece.shiftReleased) {
      piece[`shift${capitalizeFirstLetter(piece.shiftDir)}`]();
      piece.das += arg.ms;
      piece.shiftReleased = false;
    } else if (piece.das < DAS_LIMIT) {
      piece.das += arg.ms;
    } else if (piece.das >= DAS_LIMIT) {
      piece.arr += arg.ms;
      if (ARR_LIMIT === 0) {
        while (piece[`canShift${capitalizeFirstLetter(piece.shiftDir)}`]) {
          piece[`shift${capitalizeFirstLetter(piece.shiftDir)}`]();
        }
      } else {
        while (piece.arr >= ARR_LIMIT) {
          piece[`shift${capitalizeFirstLetter(piece.shiftDir)}`]();
          piece.arr -= ARR_LIMIT;
        }
      }
    }
  }
  if (
    (
      (input.getGameDown('moveLeft') && !piece.canShiftLeft) ||
      (input.getGameDown('moveRight') && !piece.canShiftRight)
    ) && !piece.isStuck
  ) {
    piece.das = DAS_LIMIT;
    piece.arr = ARR_LIMIT;
  }
}
