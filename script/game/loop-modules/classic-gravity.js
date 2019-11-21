import {fallen} from './shared/gravity.js';

export default function classicGravity(arg) {
  const piece = arg.piece;
  let distance = arg.ms / (piece.gravity / piece.gravityMultiplier);
  if (piece.gravityOverride) {
    distance = arg.ms / piece.gravityOverride;
  }
  const oldY = piece.y;
  piece.y += Math.min(distance);
  if (piece.isStuck) {
    piece.y = oldY;
    piece.sonicDrop();
    piece.mustLock = true;
  }
  fallen(piece);
}
