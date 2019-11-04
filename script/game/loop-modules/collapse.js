export default function collapse(arg) {
  if (arg.piece.are >= arg.piece.areLimit + arg.piece.areLimitLineModifier) {
    arg.stack.collapse();
  }
}
