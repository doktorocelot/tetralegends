import Game from './game.js';

class GameHandler {
  constructor() {
    this.game;
  }
  newGame(gametype) {
    this.game = new Game(gametype);
  }
}
const gameHandler = new GameHandler();
export default gameHandler;
