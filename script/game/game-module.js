// eslint-disable-next-line no-unused-vars
import Game from './game.js';

export default class GameModule {
  constructor(parent) {
    /** @type {Game} */
    this.parent = parent;
    this.isDirty = true;
  }
}
