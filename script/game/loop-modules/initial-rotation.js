import input from '../../input.js';
import sound from '../../sound.js';

export default function initialRotation(arg) {
  if (input.getGamePress('rotateLeft')) {
    sound.add('initialuse');
    arg.piece.ire = 3;
  } else if (input.getGamePress('rotateRight')) {
    sound.add('initialuse');
    arg.piece.ire = 1;
  } else if (input.getGamePress('rotate180')) {
    sound.add('initialuse');
    arg.piece.ire = 2;
  }
}
