import input from '../../input.js';

export default function respawnPiece(arg) {
  if (arg.piece.isDead) {
    arg.piece.new();
  }
}
