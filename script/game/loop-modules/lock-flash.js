export default function lockFlash(arg) {
  const stack = arg.stack;
  if (stack.flashTime < stack.flashLimit) {
    stack.flashTime += arg.ms;
    stack.draw();
  }
}
