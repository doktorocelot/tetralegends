import GameModule from './game-module.js';
import {clearCtx} from '../shortcuts.js';
export default class Stack extends GameModule {
  constructor(parent, ctx) {
    super(parent);
    this.width = this.parent.settings.width;
    this.height = this.parent.settings.height;
    this.hiddenHeight = this.parent.settings.hiddenHeight;
    this.flashX = [];
    this.flashY = [];
    this.flashTime = 0;
    this.flashLimit = 400;
    this.new();
    // Object.seal(this.grid);
    this.ctx = ctx;
  }
  add(passedX, passedY, shape, color) {
    this.flashX = [];
    this.flashY = [];
    this.flashTime = 0;
    for (let y = 0; y < shape.length; y++) {
      for (let x = 0; x < shape[y].length; x++) {
        const isFilled = shape[y][x];
        if (isFilled) {
          const xLocation = x + passedX;
          const yLocation = y + passedY + this.hiddenHeight;
          this.grid[xLocation][yLocation] = color;
          this.flashX.unshift(xLocation);
          this.flashY.unshift(yLocation);
        }
      }
    }

    for (let y = 0; y < this.grid[0].length; y++) {
      for (let x = 0; x <= this.grid.length; x++) {
        if (x === this.grid.length) {
          for (let i = 0; i < this.flashY.length; i++) {
            if (this.flashY[i] === y) {
              this.flashY.splice(i, 1);
              this.flashX.splice(i, 1);
              i--;
            }
          }
          for (let i = 0; i < this.flashY.length; i++) {
            if (this.flashY[i] < y) {
              this.flashY[i]++;
            }
          }
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
    const buffer = this.parent.bufferPeek;
    const ctx = this.ctx;
    const flash = ('0' + (Math.floor((1 - this.flashTime / this.flashLimit) * 255)).toString(16)).slice(-2);
    clearCtx(this.ctx);
    for (let x = 0; x < this.grid.length; x++) {
      for (let y = 0; y < this.grid[x].length; y++) {
        const isFilled = this.grid[x][y];
        if (isFilled) {
          const color = this.grid[x][y];
          const img = document.getElementById(`stack-${color}`);
          const xPos = x * cellSize;
          const yPos = y * cellSize + cellSize * buffer - cellSize * this.hiddenHeight;
          img.height = cellSize;
          ctx.drawImage(img, xPos, Math.floor(yPos), cellSize, cellSize);
        }
      }
    }

    if (this.flashTime < this.flashLimit) {
      for (let i = 0; i < this.flashX.length; i++) {
        ctx.globalCompositeOperation = 'overlay';
        const x = this.flashX[i] * cellSize;
        const y = this.flashY[i] * cellSize + cellSize * buffer - cellSize * this.hiddenHeight;
        ctx.fillStyle = `#ffffff${flash}`;
        ctx.fillRect(x, y, cellSize, cellSize);

        const float = this.flashTime * 2 / this.flashLimit;
        const beforeFloat = Math.min(float * 2, 1);
        const afterFloat = Math.max(0, float * 2 - 1);
        const mod = 0.2;
        const getDistanceX = (modifier = 0) => {
          return Math.min(Math.min(Math.max(Math.max(0, float * 2 - 1 + modifier), 0), 1) * cellSize, cellSize);
        };
        const getDistanceY = (modifier = 0) => {
          return Math.min(cellSize - Math.min(Math.max(Math.min(float * 2 + modifier, 1), 0), 1) * cellSize, cellSize);
        };
        const distance1x = getDistanceX(-mod);
        const distance1y = getDistanceY(-mod);
        const distance2x = getDistanceX(+mod);
        const distance2y = getDistanceY(+mod);
        const cornerX = Math.min(distance1x, distance2x);
        const cornerY = Math.min(distance1y, distance2y);

        ctx.beginPath();
        ctx.moveTo(x + distance1x, y + distance1y);
        ctx.lineTo(x + cellSize - distance1y, y + cellSize - distance1x);
        ctx.lineTo(x + cellSize - cornerY, y + cellSize - cornerX);
        ctx.lineTo(x + cellSize - distance2y, y + cellSize - distance2x);
        ctx.lineTo(x + distance2x, y + distance2y);
        ctx.lineTo(x + cornerX, y + cornerY);
        ctx.fillStyle = '#fff';
        ctx.fill();
        if (this.flashTime < 50) {
          ctx.globalCompositeOperation = 'source-over';
          ctx.fillRect(x, y, cellSize, cellSize);
        }
      }
    }
  }
}
