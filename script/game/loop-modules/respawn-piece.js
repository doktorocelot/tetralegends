import input from '../../input.js';

export default function respawnPiece(arg) {
  if (arg.piece.isDead) {
    const irsCarry = arg.piece.ire;
    arg.piece.new();
    if (arg.hold.ihs && !arg.hold.isDisabled) {
      arg.piece.ire = irsCarry;
      arg.hold.hold();
      return;
    }
  }
}
