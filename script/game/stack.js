import GameModule from './game-module.js';
import {clearCtx} from '../shortcuts.js';
export default class Stack extends GameModule {
  constructor(parent, ctx) {
    super(parent);
    this.width = this.parent.settings.width;
    this.height = this.parent.settings.height;
    this.hiddenHeight = this.parent.settings.hiddenHeight;
    this.new();
    // Object.seal(this.grid);
    this.ctx = ctx;
  }
  add(passedX, passedY, shape) {
    for (let y = 0; y < shape.length; y++) {
      for (let x = 0; x < shape[y].length; x++) {
        const isFilled = shape[y][x];
        if (isFilled) {
          this.grid[x + passedX][y + passedY + this.hiddenHeight] = 'white';
        }
      }
    }

    for (let y = 0; y < this.grid[0].length; y++) {
      for (let x = 0; x <= this.grid.length; x++) {
        if (x === this.grid.length) {
          for (let x = 0; x < this.grid.length; x++) {
            // this.grid[x].splice(y);
            for (let shiftY = y; shiftY >= 0; shiftY--) {
              this.grid[x][shiftY] = this.grid[x][shiftY - 1];
            }
          }
          break;
        }
        if (this.grid[x][y] == null) {
          break;
        }
      }
    }
  }
  new() {
    const cells = new Array(this.width);
    for (let i = 0; i < this.width; i++) {
      cells[i] = new Array(this.height + this.hiddenHeight);
    }
    this.grid = cells;
  }
  draw() {
    const cellSize = this.parent.cellSize;
    const ctx = this.ctx;
    const img = document.getElementById('mino-white');
    clearCtx(this.ctx);
    for (let x = 0; x < this.grid.length; x++) {
      for (let y = 0; y < this.grid[x].length; y++) {
        const isFilled = this.grid[x][y];
        if (isFilled) {
          const buffer = this.parent.bufferPeek;
          const xPos = x * cellSize;
          const yPos = y * cellSize + cellSize * buffer - cellSize * this.hiddenHeight;
          img.height = cellSize;
          ctx.drawImage(img, xPos, Math.floor(yPos), cellSize, cellSize);
        }
      }
    }
  }
}
