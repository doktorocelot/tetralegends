import input from '../../input.js';

export default function softDrop(arg, multiplier = 20) {
  if (input.getGameDown('softDrop')) {
    arg.piece.gravityMultiplier = multiplier;
    if (!arg.piece.isLanded) {
      arg.piece.genPieceParticles();
    }
  } else {
    arg.piece.gravityMultiplier = 1;
  }
}
