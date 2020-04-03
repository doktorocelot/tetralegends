import input from '../../input.js';
import sound from '../../sound.js';

export default function initialHold(arg) {
  if (input.getGamePress('hold')) {
    sound.add('initialuse');
    arg.hold.ihs = true;
  }
}
