export default function updateLasts(arg) {
  const piece = arg.piece;
  piece.lastX = piece.x;
  piece.lastY = piece.y;
  piece.lastOrientation = piece.orientation;
}
