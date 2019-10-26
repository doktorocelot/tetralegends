import $ from '../../shortcuts.js';

export default function extendedLockdown(arg) {
  const piece = arg.piece;
  if (piece.lockDelay >= piece.lockDelayLimit) {
    arg.stack.add(piece.x, piece.yFloor, piece.shape);
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
  $('#lockdown').max = piece.lockDelayLimit;
  $('#lockdown').value = piece.lockDelayLimit - piece.lockDelay;
}
