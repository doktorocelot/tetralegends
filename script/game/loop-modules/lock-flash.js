import settings from '../../settings.js';

export default function lockFlash(arg) {
  const stack = arg.stack;
  if (settings.settings.lockFlash === 'off' && !stack.lineClear) {
    return;
  }
  if (settings.settings.lockFlash === 'flash' && stack.flashTime >= 50 && !stack.lineClear) {
    return;
  }
  if (stack.flashTime < stack.flashLimit || arg.piece.inAre) {
    for (let i = 0; i < stack.flashX.length; i++) {
      stack.dirtyCells.push([stack.flashX[i], stack.flashY[i]]);
    }
    stack.flashTime += arg.ms;
    stack.isDirty = true;
  }
}
