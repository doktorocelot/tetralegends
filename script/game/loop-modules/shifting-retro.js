import input from '../../input.js';
import {capitalizeFirstLetter, framesToMs} from '../../shortcuts.js';

export default function shiftingRetro(arg, dasLimit, arrLimit) {
  const piece = arg.piece;
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
    } else if (piece.das < dasLimit) {
      piece.das += arg.ms;
    } else if (piece.das >= dasLimit) {
      piece.arr += arg.ms;
      if (arrLimit === 0) {
        while (piece[`canShift${capitalizeFirstLetter(piece.shiftDir)}`]) {
          piece[`shift${capitalizeFirstLetter(piece.shiftDir)}`]();
        }
      } else {
        while (piece.arr >= arrLimit) {
          piece[`shift${capitalizeFirstLetter(piece.shiftDir)}`]();
          piece.arr -= arrLimit;
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
    piece.das = dasLimit;
    piece.arr = arrLimit;
  }
}
