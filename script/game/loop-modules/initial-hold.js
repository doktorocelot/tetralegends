import input from '../../input.js';
import sound from '../../sound.js';

export default function initialHold(arg) {
  if (input.getGamePress('hold')) {
    arg.piece.isDirty = true;
    sound.add('initialuse');
    arg.hold.ihs = true;
  }
}
