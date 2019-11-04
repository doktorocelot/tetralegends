export default function gravity(arg) {
  const piece = arg.piece;
  const distance = arg.ms / (piece.gravity / piece.gravityMultiplier);
  if (!piece.isLanded) {
    if (piece.checkFall(distance)) {
      piece.y += Math.min(distance, piece.getDrop(distance + 1));
    } else {
      console.log('sonic');
      piece.sonicDrop();
    }
  } else {
    piece.y = Math.floor(piece.y);
  }
  if (piece.yFloor > Math.floor(piece.lowestY)) {
    piece.isDirty = true;
  }
}
