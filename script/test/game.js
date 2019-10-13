import {loadGameType} from '../loaders.js';
import {test} from '../../app.js';
import {Piece} from './piece.js';
import {Stack} from './stack.js';
export default class Game {
  constructor() {
    console.log(this);
    this.stack = new Stack();
    this.piece = new Piece(this);
  }
  start() {
    console.log(this.piece);
    this.piece.getStack();
    /*
    loadGameType('marathon')
        .then((game) => {
          console.log(game);
        });
        */
  }
}
