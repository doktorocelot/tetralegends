import $ from '../../shortcuts.js';

export default function extendedLockdown(arg) {
  const piece = arg.piece;
  if (piece.yFloor > Math.floor(piece.lowestY)) {
    piece.manipulations = 0;
    piece.lockDelay = 0;
  }
  if (
    (piece.lockDelay >= piece.lockDelayLimit && piece.isLanded) ||
    piece.mustLock
  ) {
    arg.stack.add(piece.x, piece.yFloor, piece.shape, piece.color);
    arg.stack.draw();
    piece.new('T');
  }
  if (piece.isLanded) {
    if (
      piece.lastX !== piece.x ||
      piece.lastY !== piece.y ||
      piece.lastOrientation !== piece.orientation
    ) {
      piece.lockDelay = 0;
    }
    piece.lockDelay += arg.ms;
  } else {
    piece.lockDelay = 0;
  }

  if (piece.manipulations >= piece.manipulationLimit) {
    piece.lockDelay = piece.lockDelayLimit;
  }
  $('#lockdown').max = piece.lockDelayLimit;
  $('#lockdown').value = piece.lockDelayLimit - piece.lockDelay;
  piece.lowestY = Math.max(piece.y, piece.lowestY);
  for (let i = 1; i <= piece.manipulationLimit; i++) {
    $(`#pip-${i}`).classList.remove('disabled');
  }
  for (let i = 1; i <= Math.min(piece.manipulations, piece.manipulationLimit); i++) {
    $(`#pip-${i}`).classList.add('disabled');
  }
}
