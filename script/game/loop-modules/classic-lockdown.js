import $ from '../../shortcuts.js';

export default function classicLockdown(arg) {
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
    piece.lockDelay += arg.ms;
    piece.isDirty = true;
  }
  $('#lockdown').max = piece.lockDelayLimit;
  $('#lockdown').value = piece.lockDelayLimit - piece.lockDelay;
  piece.lowestY = Math.max(piece.y, piece.lowestY);
}
