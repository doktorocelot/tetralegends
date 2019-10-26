import input from '../../input.js';
import gameHandler from '../game-handler.js';

export default function reset() {
  if (input.getGamePress('retry')) {
    gameHandler.reset();
  }
}
