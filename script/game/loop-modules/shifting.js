import input from '../../input.js';
import {capitalizeFirstLetter, framesToMs} from '../../shortcuts.js';

export default function shifting(arg) {
  const piece = arg.piece;
  if (piece.isStuck) {
    return;
  }
  const resetShift = () => {
    piece.das = 0;
    piece.arr = piece.arrLimit;
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
    } else if (piece.das < piece.dasLimit) {
      piece.das += arg.ms;
    } else if (piece.das >= piece.dasLimit) {
      if (piece.arrLimit <= 0) {
        while (piece[`canShift${capitalizeFirstLetter(piece.shiftDir)}`]) {
          piece[`shift${capitalizeFirstLetter(piece.shiftDir)}`]();
          if (piece.gravity <= framesToMs(1 / 20)) {
            piece.sonicDrop();
          }
        }
      } else {
        while (piece.arr >= piece.arrLimit) {
          piece[`shift${capitalizeFirstLetter(piece.shiftDir)}`]();
          if (piece.gravity <= framesToMs(1 / 20)) {
            piece.sonicDrop();
          }
          piece.arr -= piece.arrLimit;
        }
      }
      piece.arr += arg.ms;
    }
  }
}
