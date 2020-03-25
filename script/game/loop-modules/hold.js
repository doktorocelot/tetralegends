import input from '../../input.js';

export default function hold(arg) {
  if (arg.hold.ihs) {
    arg.hold.ihs = false;
    return;
  }
  if (input.getGamePress('hold')) {
    arg.hold.hold();
  }
}
