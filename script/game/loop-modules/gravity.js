export default function gravity(arg) {
  const piece = arg.piece;
  const distance = arg.ms / (piece.gravity / piece.gravityMultiplier);
  if (!piece.isLanded) {
    if (piece.checkFall(distance)) {
      piece.y += distance;
    } else {
      piece.sonicDrop();
    }
  } else {
    piece.y = Math.floor(piece.y);
  }
}
