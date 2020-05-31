import input from '../../input.js';
import settings from '../../settings.js';

export default function respawnPiece(arg) {
  if (arg.piece.isDead) {
    const irsCarry = arg.piece.ire;
    arg.piece.new();
    if (input.getGameDown('hold') && settings.settings.IHS === 'hold') {
      arg.hold.ihs = true;
    }
    if (arg.hold.ihs && !arg.hold.isDisabled) {
      arg.piece.ire = irsCarry;
      arg.hold.hold();
      return;
    }
  }
}
