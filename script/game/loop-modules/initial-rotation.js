import input from '../../input.js';
import sound from '../../sound.js';
import settings from '../../settings.js';
import {negativeMod} from '../../shortcuts.js';

export default function initialRotation(arg) {
  if (settings.settings.IRS === 'hold' || settings.settings.IRS === 'off') {
    return;
  }
  if (settings.settings.IRS === 'absolute') {
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
  } else {
    if (input.getGamePress('rotateLeft')) {
      sound.add('initialuse');
      arg.piece.ire = negativeMod(arg.piece.ire - 1, 4);
    } else if (input.getGamePress('rotateRight')) {
      sound.add('initialuse');
      arg.piece.ire = negativeMod(arg.piece.ire + 1, 4);
    } else if (input.getGamePress('rotate180')) {
      sound.add('initialuse');
      arg.piece.ire = negativeMod(arg.piece.ire + 2, 4);
    }
  }
}
