import input from '../../input.js';

export default function initialHold(arg) {
  if (input.getGamePress('hold')) {
    arg.hold.ihs = true;
  }
}
