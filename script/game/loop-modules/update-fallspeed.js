export default function updateFallSpeed(game) {
  const gravityInFrames = 1 / ((game.piece.gravity / 1000) * 60);
  const gravityVisual = () => {
    if (gravityInFrames < 1) {
      return `1/${Math.round(1 / gravityInFrames * 1000) / 1000} <b>G</b>
          <br><b>${Math.round(game.piece.gravity) / 1000}</b> sec/row`;
    } else {
      return `${Math.round(gravityInFrames * 1000) / 1000} <b>G</b>
          <br><b>${Math.round(game.piece.gravity) / 1000}</b> sec/row`;
    }
  };
  game.stat.fallspeed = gravityVisual();
}
