import input from '../../input.js';

export default function softDrop(arg) {
  if (input.getGameDown('softDrop')) {
    arg.piece.gravityMultiplier = 20;
    if (!arg.piece.isLanded) {
      arg.piece.genPieceParticles();
    }
  } else {
    arg.piece.gravityMultiplier = 1;
  }
}
