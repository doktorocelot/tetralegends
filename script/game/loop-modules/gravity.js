import {fallen} from './shared/gravity.js';

export default function gravity(arg) {
  const piece = arg.piece;
  let distance = arg.ms / (piece.gravity / piece.gravityMultiplier);
  if (piece.gravityOverride) {
    distance = arg.ms / piece.gravityOverride;
  }
  if (!piece.isLanded) {
    if (piece.checkFall(distance)) {
      piece.y += Math.min(distance, piece.getDrop(distance + 1));
    } else {
      piece.sonicDrop();
    }
  } else {
    piece.y = Math.floor(piece.y);
  }
  fallen(piece);
}
