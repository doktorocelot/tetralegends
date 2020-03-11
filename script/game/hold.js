import GameModule from './game-module.js';
import $, {clearCtx, resetAnimation} from '../shortcuts.js';
import * as randomizer from './modules/randomizers.js';
import {PIECE_SETS, PIECES} from '../consts.js';
import sound from '../sound.js';

export default class Hold extends GameModule {
  constructor(parent, ctx) {
    super(parent);
    this.ctx = ctx;
    this.pieceName = null;
    this.isLocked = false;
    this.ihs = false;
    this.isDisabled = false;
  }
  hold() {
    if (this.isLocked) {
      return;
    }
    if (this.ihs) {
      sound.add('initialhold');
    } else {
      sound.add('hold');
    }
    this.ihs = false;
    const swapPiece = this.pieceName;
    this.pieceName = this.parent.piece.name;
    if (swapPiece == null) {
      this.parent.piece.new();
    } else {
      this.parent.piece.new(swapPiece);
    }
    this.isDirty = true;
    this.isLocked = true;
    resetAnimation('#hold-container', 'flash');
  }
  draw() {
    if (this.pieceName === null) {
      return;
    }
    if (this.isLocked) {
      $('#hold').classList.add('locked');
    } else {
      $('#hold').classList.remove('locked');
    }
    const shape = PIECES[this.pieceName].shape[0];
    const cellSize = this.parent.cellSize;
    const offset = this.parent.nextOffsets[this.pieceName];
    const ctx = this.ctx;
    clearCtx(this.ctx);
    for (let y = 0; y < shape.length; y++) {
      for (let x = 0; x < shape[y].length; x++) {
        const color = this.parent.colors[this.pieceName];
        const img = document.getElementById(`mino-${color}`);
        const isFilled = shape[y][x];
        if (isFilled) {
          const xPos = x * cellSize + offset[0] * cellSize;
          const yPos = y * cellSize + offset[1] * cellSize;
          img.height = cellSize;
          ctx.drawImage(img, xPos, Math.floor(yPos), cellSize, cellSize);
        }
      }
    }
  }
}
