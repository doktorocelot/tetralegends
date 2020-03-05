export default function lockFlash(arg) {
  const stack = arg.stack;
  if (stack.flashTime < stack.flashLimit || arg.piece.inAre) {
    for (let i = 0; i < stack.flashX.length; i++) {
      stack.dirtyCells.push([stack.flashX[i], stack.flashY[i]]);
    }
    stack.flashTime += arg.ms;
    stack.isDirty = true;
  }
}
