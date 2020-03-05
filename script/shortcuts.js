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
/**
 * Shuffles array in place.
 * @param {Array} a items An array containing the items.
 * @return {Array} shuffled array
 */
export function shuffle(a) {
  let j; let x; let i;
  for (i = a.length - 1; i > 0; i--) {
    j = Math.floor(Math.random() * (i + 1));
    x = a[i];
    a[i] = a[j];
    a[j] = x;
  }
  return a;
}


export function framesToMs(amount) {
  // assume fps is 60
  return amount / 60 * 1000;
}

export function hzToMs(amount) {
  return 60 / amount / 60 * 1000;
}

export function roundMsToFrames(amount) {
  // assume fps is 60
  return Math.round(amount / 1000 * 60);
}

export function roundMsToHz(amount) {
  return Math.round(60 / (amount / 1000 * 60));
}

export function toCtx(canvas) {
  return canvas.getContext('2d');
}

export function clearCtx(ctx) {
  ctx.clearRect(0, 0, ctx.canvas.clientWidth, ctx.canvas.clientHeight);
}

export function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

export function negativeMod(n, m) {
  return ((n % m) + m) % m;
}
