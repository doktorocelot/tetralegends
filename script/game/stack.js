import GameModule from './game-module.js';
import {clearCtx} from '../shortcuts.js';
import sound from '../sound.js';
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
    this.toCollapse = [];
    this.ctx = ctx;
    this.lineClear = 0;
    this.flashLineClear = false;
    this.flashClearRate = 50;
    this.fadeLineClear = true;
    this.useMinoSkin = false;
  }
  add(passedX, passedY, shape, color) {
    if (!this.parent.piece.hasHardDropped) {
      sound.add('locknohd');
    }
    const checkSpin = this.parent.piece.checkSpin();
    let isSpin = false;
    let isMini = false;
    if (
      this.parent.piece.x === this.parent.piece.rotatedX &&
      this.parent.piece.yFloor === this.parent.piece.rotatedY &&
      this.parent.piece.checkSpin().isSpin
    ) {
      isSpin = checkSpin.isSpin;
      isMini = checkSpin.isMini;
    }
    sound.add('lock');
    this.parent.shiftMatrix('down');
    this.parent.stat.piece++;
    this.parent.piece.last = this.parent.piece.name;
    this.parent.updateStats();
    this.lineClear = 0;
    this.parent.hold.isLocked = false;
    this.flashX = [];
    this.flashY = [];
    this.flashTime = 0;
    for (let y = 0; y < shape.length; y++) {
      for (let x = 0; x < shape[y].length; x++) {
        const isFilled = shape[y][x];
        if (isFilled) {
          const xLocation = x + passedX;
          const yLocation = y + passedY + this.hiddenHeight;
          if (this.parent.piece.useSpecialI && this.parent.piece.name === 'I') {
            this.grid[xLocation][yLocation] = 'i' + shape[y][x];
          } else {
            this.grid[xLocation][yLocation] = color;
          }
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

          for (let x = 0; x < this.grid.length; x++) {
            delete this.grid[x][y];
          }
          this.parent.piece.hasLineDelay = true;
          this.lineClear++;
          this.toCollapse.push(y);
          break;
        }
        if (this.grid[x][y] == null) {
          break;
        }
      }
    }
    if (isSpin) {
      sound.add('tspinbonus');
    }
    if (this.lineClear > 0) {
      this.parent.combo++;
      let type = 'erase';
      if (isSpin) {
        type = 'tspin';
        this.parent.b2b++;
      } else if (this.lineClear < 4) {
        this.parent.b2b = 0;
      }
      sound.add(`${type}`);
      sound.add(`${type}${this.lineClear}`);
      if (this.lineClear < 4) {
        sound.add(`${type}not4`);
      } else {
        this.parent.b2b++;
      }
      if (this.parent.b2b > 1) {
        sound.add('b2b');
      }
      if (this.parent.combo > 0) {
        sound.add(`ren${this.parent.combo}`);
      }
    } else {
      this.parent.combo = -1;
      if (isSpin) {
        sound.add('tspin0');
      }
    }
    if (this.parent.piece.areLineLimit === 0) {
      this.collapse();
    }
  }
  collapse() {
    if (this.toCollapse.length === 0) {
      return;
    }
    for (const y of this.toCollapse) {
      for (let x = 0; x < this.grid.length; x++) {
        for (let shiftY = y; shiftY >= 0; shiftY--) {
          this.grid[x][shiftY] = this.grid[x][shiftY - 1];
        }
      }
      for (let i = 0; i < this.flashY.length; i++) {
        if (this.flashY[i] < y) {
          this.flashY[i]++;
        }
      }
    }
    this.parent.stat.line += this.lineClear;
    this.parent.addScore(`erase${this.lineClear}`);
    this.parent.updateStats();
    sound.add('collapse');
    this.parent.particle.generate({
      amount: 100,
      x: 0,
      y: (this.toCollapse[this.toCollapse.length - 1] - this.hiddenHeight + 1) * this.parent.cellSize,
      xRange: this.width * this.parent.cellSize,
      yRange: 0,
      xVelocity: 0,
      yVelocity: 1,
      xVariance: 5,
      yVariance: 2,
      gravity: .3,
      gravityAccceleration: 1.05,
    });
    this.toCollapse = [];
    this.lineClear = 0;
    this.isDirty = true;
  }
  new() {
    const cells = new Array(this.width);
    for (let i = 0; i < this.width; i++) {
      cells[i] = new Array(this.height + this.hiddenHeight);
    }
    this.grid = cells;
  }
  get highest() {
    let highest = 0;
    for (const currentY of this.grid) {
      for (let i = 0; i < currentY.length; i++) {
        if (currentY[i] != null) {
          const iReverse = currentY.length - i;
          highest = Math.max(highest, iReverse);
          break;
        }
      }
    }
    return highest;
  }
  isFilled(x, y) {
    if (this.grid[x] != null) {
      if (y < this.height + this.hiddenHeight) {
        if (this.grid[x][y] != null) {
          return true;
        } else {
          return false;
        }
      } else {
        return true;
      }
    } else {
      return true;
    }
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
          let name = 'stack';
          if (this.useMinoSkin) {
            name = 'mino';
          }
          const img = document.getElementById(`${name}-${color}`);
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
    if (this.toCollapse.length > 0) {
      const brightness = Math.max(0, 1 - this.parent.piece.are / (this.parent.piece.areLimit + this.parent.piece.areLimitLineModifier));
      let brightnessHex = ('0' + Math.round(brightness * 255).toString(16)).slice(-2);
      if (!this.fadeLineClear) {
        brightnessHex = 'ff';
      }
      ctx.fillStyle = `#ffffff${brightnessHex}`;
      for (let i = 0; i < this.toCollapse.length; i++) {
        this.parent.particle.generate({
          amount: 2,
          x: 0,
          y: (this.toCollapse[i] - this.hiddenHeight + buffer) * cellSize,
          xRange: this.width * cellSize,
          yRange: cellSize,
          xVelocity: 0,
          yVelocity: 0,
          xVariance: 10,
          yVariance: 10,
          xDampening: 1.03,
          yDampening: 1.03,
        });
        if (Math.round(this.parent.piece.are / this.flashClearRate) % 2 !== 1 || !this.flashLineClear) {
          ctx.fillRect(0, (this.toCollapse[i] - this.hiddenHeight) * cellSize + buffer * cellSize, cellSize * this.width, cellSize);
        }
      }
    }
  }
}
