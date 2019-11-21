import $ from '../../shortcuts.js';

export default function retroLockdown(arg) {
  const piece = arg.piece;
  if (piece.isDead) {
    $('#lockdown').value = 0;
    return;
  }
  if (piece.mustLock) {
    arg.stack.add(piece.x, piece.yFloor, piece.shape, piece.color);
    arg.stack.isDirty = true;
    piece.softDropIsLocked = true;
    piece.die();
  }

  if (piece.manipulations >= piece.manipulationLimit) {
    piece.lockDelay = piece.lockDelayLimit;
  }
  $('#lockdown').max = piece.lockDelayLimit;
  $('#lockdown').value = piece.lockDelayLimit;
  piece.lowestY = Math.max(piece.y, piece.lowestY);
}
