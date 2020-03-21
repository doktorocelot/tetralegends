import locale from '../../lang.js';

export default function updateFallSpeed(game) {
  const gravityInFrames = 1 / ((game.piece.gravity / 1000) * 60);
  const gravityVisual = () => {
    if (gravityInFrames < 1) {
      return `1/${Math.round(1 / gravityInFrames * 1000) / 1000} <b>G</b>
          <br>${locale.getString('ui', 'secrow', [`<b>${Math.round(game.piece.gravity) / 1000}</b>`])}`;
    } else {
      return `${Math.round(gravityInFrames * 1000) / 1000} <b>G</b>
          <br>${locale.getString('ui', 'secrow', [`<b>${Math.round(game.piece.gravity) / 1000}</b>`])}`;
    }
  };
  game.stat.fallspeed = gravityVisual();
}
