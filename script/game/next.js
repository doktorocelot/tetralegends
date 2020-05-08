import GameModule from './game-module.js';
import $, {clearCtx} from '../shortcuts.js';
import * as randomizer from './modules/randomizers.js';
import {PIECE_SETS, PIECES, INITIAL_ORIENTATION} from '../consts.js';
import sound from '../sound.js';

export default class Next extends GameModule {
  constructor(parent, ctx, ctxSub, seed) {
    super(parent);
    this.ctx = ctx;
    this.subCtx = ctxSub;
    this.nextLength = this.parent.userSettings.nextLength;
    this.nextLimit = 6;
    this.queue = [];
    this.stats = {};
    this.seed = seed;
    this.rng = new Math.seedrandom(this.seed);
    this.reset();
    for (const piece of Object.keys(PIECES)) {
      this.stats[piece] = 0;
    }
    for (let i = 0; i < 9; i++) {
      this.generate();
    }
  }
  reset() {
    this.gen = randomizer[this.parent.settings.randomizer](PIECE_SETS[this.parent.settings.pieces], PIECE_SETS[this.parent.settings.unfavored], this.rng);
  }
  next() {
    this.generate();
    this.isDirty = true;
    sound.add(`piece${this.queue[1]}`);
    return this.queue.shift();
  }
  generate() {
    const generated = this.gen.next().value;
    this.queue.push(generated);
    this.stats[generated]++;
  }
  drawMino(x, y) {
    const cellSize = this.parent.cellSize;
    const ctx = this.ctx;
    const xPos = x * cellSize;
    const yPos = y * cellSize;
    const img = document.getElementById(`mino-${this.color}`);
    img.height = cellSize;
    ctx.globalCompositeOperation = 'source-over';

    ctx.drawImage(img, xPos, Math.floor(yPos), cellSize, cellSize);
  }

  draw() {
    this.nextLength = Math.min(this.nextLength, this.nextLimit);
    clearCtx(this.ctx);
    clearCtx(this.subCtx);
    if (this.nextLength <= 0) {
      $('#main-next-container').classList.add('hidden');
      return;
    } else {
      $('#main-next-container').classList.remove('hidden');
    }
    const piece = this.queue[0];
    const shape = PIECES[piece].shape[INITIAL_ORIENTATION[this.parent.rotationSystem][piece]];
    let cellSize = this.parent.cellSize;
    const offset = this.parent.nextOffsets[piece];
    let ctx = this.ctx;

    for (let y = 0; y < shape.length; y++) {
      for (let x = 0; x < shape[y].length; x++) {
        const color = this.parent.colors[piece];
        let suffix = '';
        if (this.parent.piece.useSpecialI && piece === 'I') {
          suffix = shape[y][x];
        }
        if (this.parent.piece.useRetroColors) {
          suffix = `-${this.parent.stat.level % 10}`;
        }
        const img = document.getElementById(`mino-${color}${suffix}`);
        const isFilled = shape[y][x];
        if (isFilled) {
          const xPos = x * cellSize + offset[0] * cellSize;
          const yPos = y * cellSize + offset[1] * cellSize;
          img.height = cellSize;
          ctx.drawImage(img, xPos, Math.floor(yPos), cellSize, cellSize);
        }
      }
    }
    cellSize = Math.floor(cellSize * .62);
    ctx = this.subCtx;
    const nextCount = this.nextLength - 1;
    const multiplier = 3;
    for (let nextSpace = 0; nextSpace < nextCount; nextSpace++) {
      const piece = this.queue[nextSpace + 1];
      const shape = PIECES[piece].shape[INITIAL_ORIENTATION[this.parent.rotationSystem][piece]];
      const offset = this.parent.nextOffsets[piece];
      for (let y = 0; y < shape.length; y++) {
        for (let x = 0; x < shape[y].length; x++) {
          const color = this.parent.colors[piece];
          const img = document.getElementById(`mino-${color}`);
          const isFilled = shape[y][x];
          if (isFilled) {
            const xPos = x * cellSize + offset[0] * cellSize;
            const yPos = y * cellSize + offset[1] * cellSize + nextSpace * cellSize * multiplier;
            img.height = cellSize;
            ctx.drawImage(img, Math.floor(xPos), Math.floor(yPos), cellSize, cellSize);
          }
        }
      }
    }
  }
}
