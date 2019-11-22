import Game from './game.js';

class GameHandler {
  constructor() {
    this.game = null;
  }
  newGame(gametype) {
    if (this.game != null) {
      this.game.kill();
    }
    this.game = null;
    this.game = new Game(gametype);
  }
  reset() {
    this.game.kill();
    const type = this.game.type;
    // this.game = null;
    this.game = new Game(type);
  }
}
const gameHandler = new GameHandler();
export default gameHandler;
