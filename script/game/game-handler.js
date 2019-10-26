import Game from './game.js';

class GameHandler {
  constructor() {
    this.game;
  }
  newGame(gametype) {
    this.game = new Game(gametype);
  }
  reset() {
    this.game = new Game(this.game.type);
  }
}
const gameHandler = new GameHandler();
export default gameHandler;
