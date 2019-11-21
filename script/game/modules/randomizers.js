import {shuffle} from '../../shortcuts.js';
import {PIECE_BINARIES} from '../../consts.js';

export function* memoryless(pieces, unfavored = []) {
  const favored = pieces.filter((x) => !unfavored.includes(x));
  yield favored[Math.floor(Math.random() * favored.length)];
  while (true) {
    yield pieces[Math.floor(Math.random() * pieces.length)];
  }
}
export function* handheld(pieces) {
  const history = [0, 0];
  const calc = () => {
    return Math.floor(Math.random() * pieces.length);
  };
  while (true) {
    for (let i = 0; i < 3; i++) {
      const gen = pieces[calc()];
      const genBinary = PIECE_BINARIES[gen];
      let orCalculation = genBinary;
      for (const index of history) {
        orCalculation |= index;
      }
      if (orCalculation !== history[1] || i === 2) {
        history.unshift(genBinary);
        history.pop();
        yield gen;
        break;
      }
    }
  }
}
export function* bag(pieces, unfavored = [], bagMultiplier = 1) {
  let bag = [];
  const generateBag = () => {
    bag = [];
    for (let i = 0; i < bagMultiplier; i++) {
      bag = [...bag, ...pieces];
    }
    bag = shuffle(bag);
  };
  generateBag();
  if (unfavored.indexOf(bag[0]) !== -1) {
    for (let i = 0; i < bag.length; i++) {
      if (unfavored.indexOf(bag[i]) === -1) {
        [bag[0], bag[i]] = [bag[i], bag[0]];
        break;
      }
    }
  }
  while (true) {
    if (bag.length === 0) {
      generateBag();
    }
    yield bag.shift();
  }
}
