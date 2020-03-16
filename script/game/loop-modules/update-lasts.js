export default function updateLasts(arg) {
  const piece = arg.piece;
  piece.lastX = piece.x;
  piece.lastY = piece.y;
  piece.lastVisualY = piece.visualY;
  piece.lastOrientation = piece.orientation;
}
