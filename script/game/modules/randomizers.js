import {shuffle} from '../../shortcuts.js';

export function* memoryless(pieces, unfavored = []) {
  const favored = pieces.filter((x) => !unfavored.includes(x));
  yield favored[Math.floor(Math.random() * favored.length)];
  while (true) {
    yield pieces[Math.floor(Math.random() * pieces.length)];
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
