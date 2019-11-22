import gameHandler from '../../game-handler.js';
import {SCORE_TABLES} from '../../../consts.js';
import sound from '../../../sound.js';

export function fallen(piece) {
  if (piece.yFloor > Math.floor(piece.lastY)) {
    if (piece.gravityMultiplier !== 1 || piece.gravityOverride) {
      for (let i = 1; i <= (piece.yFloor - Math.floor(piece.lastY)); i++) {
        {gameHandler.game.addScore('softDrop');}
      }
      if (SCORE_TABLES[gameHandler.game.settings.scoreTable].updateSoftDropImmediately) {
        gameHandler.game.updateStats();
      }
    }
    piece.isDirty = true;
    if (piece.isLanded) {
      sound.add('step');
    }
  }
}
