import input from '../../input.js';

export default function hold(arg) {
  if (input.getGamePress('hold')) {
    arg.hold.hold();
  }
}
