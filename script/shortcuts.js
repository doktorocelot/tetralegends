export default function $(selector) {
  const selection = document.querySelectorAll(selector);
  switch (selection.length) {
    case 0:
      return undefined;
      break;
    case 1:
      return selection[0];
      break;
    default:
      return selection;
  }
}
