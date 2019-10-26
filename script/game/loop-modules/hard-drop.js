import input from '../../input.js';

export default function hardDrop(arg) {
  if (input.getGamePress('hardDrop')) {
    arg.piece.hardDrop();
  }
}
