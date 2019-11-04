import $ from '../../shortcuts.js';

export default function infiniteLockdown(arg) {
  const piece = arg.piece;
  if (piece.isDead) {
    $('#lockdown').value = 0;
    return;
  }
  piece.manipulations = 0;
  if (piece.yFloor > Math.floor(piece.lowestY)) {
    piece.lockDelay = 0;
  }
  if (
    (piece.lockDelay >= piece.lockDelayLimit && piece.isLanded) ||
    piece.mustLock
  ) {
    arg.stack.add(piece.x, piece.yFloor, piece.shape, piece.color);
    arg.stack.isDirty = true;
    piece.die();
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
    piece.isDirty = true;
  } else {
    piece.lockDelay = 0;
  }

  $('#lockdown').max = piece.lockDelayLimit;
  $('#lockdown').value = piece.lockDelayLimit - piece.lockDelay;
  piece.lowestY = Math.max(piece.y, piece.lowestY);
}
