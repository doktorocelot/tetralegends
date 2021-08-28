import input from '../../input.js';

export default function hold(arg) {
  if (arg.hold.ihs) {
    return;
  }
  if (input.getGamePress('hold') && !arg.piece.isFrozen) {
    arg.hold.hold();
  }
}
