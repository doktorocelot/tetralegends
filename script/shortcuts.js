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

export function resetAnimation(selector, className) {
  $(selector).classList.remove(className);
  void $(selector).offsetWidth;
  $(selector).classList.add(className);
}
function pad(num, size) {
  const s = '000000000' + num;
  return s.substr(s.length - size);
}
export function msToTime(duration) {
  const milliseconds = pad(parseInt((duration % 1000) / 10), 2);
  let seconds = Math.floor((duration / 1000) % 60);
  let minutes = Math.floor((duration / (1000 * 60)) % 60);
  let hours = Math.floor((duration / (1000 * 60 * 60)) % 24);

  hours = (hours < 10) ? '0' + hours : hours;
  minutes = (minutes < 10) ? '0' + minutes : minutes;
  seconds = (seconds < 10) ? '0' + seconds : seconds;

  return hours + ':' + minutes + ':' + seconds + '.' + milliseconds;
}
