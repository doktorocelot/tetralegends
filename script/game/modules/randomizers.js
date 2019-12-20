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
/*
export function* tetrax(pieces, unfavored = []) {
  let bag = [];
  const generateBag = () => {
    bag = [];
    bag = [...bag, ...pieces];
    bag = [...bag, pieces[Math.floor(Math.random() * pieces.length)]];
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
*/
export function* tetrax(pieces, unfavored = []) {
  /*
  const favored = pieces.filter((x) => !unfavored.includes(x));
  yield favored[Math.floor(Math.random() * favored.length)];
  */
  const history = {};
  const chances = {};
  const lastseen = [];
  const lastPieces = [null, null, null, null, null];
  let pieceSelection = [];
  let total = 0;
  for (const name of pieces) {
    history[name] = 0;
    chances[name] = 1;
    lastseen[name] = 0;
    pieceSelection.push(name);
  }
  while (true) {
    let canPass = false;
    let generated = null;
    while (!canPass) {
      generated = pieceSelection[Math.floor(Math.random() * pieceSelection.length)];
      let pieceTest = 0;
      for (let i = 0; i < lastPieces.length; i++) {
        if (generated === lastPieces[i]) {
          pieceTest++;
        }
      }
      if (pieceTest < 2) {
        canPass = true;
      }
    }
    for (const piece of Object.keys(lastseen)) {
      if (lastseen[piece] >= 13) {
        generated = piece;
        break;
      }
    }
    for (const piece of Object.keys(lastseen)) {
      if (piece === generated) {
        lastseen[piece] = 0;
      } else {
        lastseen[piece]++;
      }
    }
    history[generated]++;
    lastPieces.shift();
    lastPieces.push(generated);
    total++;
    yield generated;
    console.log('history', history);
    pieceSelection = [];
    for (const piece of Object.keys(history)) {
      chances[piece] = Math.round((total - history[piece]) / (total * (pieces.length - 1)) * 1000);
      for (let i = 0; i < chances[piece]; i++) {
        pieceSelection.push(piece);
      }
    }
    console.log('last', lastseen);
  }
}
