import GameModule from './game-module.js';
import $, {clearCtx, negativeMod, resetAnimation} from '../shortcuts.js';
import sound from '../sound.js';
import locale from '../lang.js';
import settings from '../settings.js';
import {SCORE_TABLES} from '../consts.js';
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
    this.dirtyCells = [];
    this.levelUpAnimation = 0;
    this.levelUpAnimationLimit = 0;
    this.flashOnTetris = false;
    this.alarmIsOn = false;
    this.isInvisible = false;
    this.waitingGarbage = 0;
  }
  makeAllDirty() {
    for (let x = 0; x < this.grid.length; x++) {
      for (let y = 0; y < this.grid[x].length; y++) {
        this.dirtyCells.push([x, y]);
      }
    }
  }
  wouldCauseLineClear() {
    const finalBlocks = this.parent.piece.getFinalBlockLocations();
    const newGrid = JSON.parse(JSON.stringify(this.grid));
    let lineClear = 0;
    for (const finalBlock of finalBlocks) {
      newGrid[finalBlock[0]][finalBlock[1] + this.hiddenHeight] = 'test';
    }
    for (let y = 0; y < newGrid[0].length; y++) {
      for (let x = 0; x <= newGrid.length; x++) {
        if (x === newGrid.length) {
          lineClear++;
          break;
        }
        if (newGrid[x][y] == null) {
          break;
        }
      }
    }
    return lineClear;
  }
  add(passedX, passedY, shape, color) {
    let garbageToClear = 0;
    sound.syncBgm();
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
    this.lineClear = 0;
    if (this.parent.hold.isLocked) {
      this.parent.hold.isLocked = false;
      this.parent.hold.isDirty = true;
    }
    if (this.parent.hold.gainHoldOnPlacement &&
      this.parent.hold.holdAmount < this.parent.hold.holdAmountLimit) {
      this.parent.hold.holdAmount++;
      this.parent.hold.isDirty = true;
    }
    for (let i = 0; i < this.flashX.length; i++) {
      this.dirtyCells.push([this.flashX[i], this.flashY[i]]);
    }
    this.flashX = [];
    this.flashY = [];
    this.flashTime = 0;
    let passedLockOut = shape.length;
    for (let y = 0; y < shape.length; y++) {
      for (let x = 0; x < shape[y].length; x++) {
        const isFilled = shape[y][x];
        if (isFilled) {
          this.parent.particle.generate({
            amount: 5,
            x: x * this.parent.cellSize + passedX * this.parent.cellSize,
            y: y * this.parent.cellSize + passedY * this.parent.cellSize + this.parent.bufferPeek * this.parent.cellSize,
            xRange: this.parent.cellSize,
            yRange: this.parent.cellSize,
            xVelocity: 0,
            yVelocity: 2,
            xVariance: 4,
            yVariance: 2,
            xDampening: 1.03,
            yDampening: 1.03,
            gravity: 0,
            maxlife: 70,
            lifeVariance: 40,
          });
          const xLocation = x + passedX;
          const yLocation = y + passedY + this.hiddenHeight;
          if (yLocation - this.hiddenHeight >= 0) {
            passedLockOut--;
          }
          if (this.parent.piece.useSpecialI && this.parent.piece.name === 'I') {
            this.grid[xLocation][yLocation] = 'i' + shape[y][x];
          } else {
            this.grid[xLocation][yLocation] = color;
          }
          this.dirtyCells.push([xLocation, yLocation]);
          this.flashX.unshift(xLocation);
          this.flashY.unshift(yLocation);
        }
      }
    }
    if (passedLockOut >= shape.length) {
      $('#kill-message').textContent = locale.getString('ui', 'lockOut');
      this.parent.end();
      return;
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
    let version = '';
    if (isMini) {
      version = 'mini';
    }
    if (this.lineClear >= 4 && this.flashOnTetris) {
      resetAnimation('#stack', 'tetris-flash');
    }
    if (this.lineClear > 0) { // TODO mini tspin and clean this up
      if (SCORE_TABLES[this.parent.settings.scoreTable].hasCombo) {
        this.parent.combo++;
        this.parent.stat.maxcombo = Math.max(this.parent.combo, this.parent.stat.maxcombo);
      }
      let type = 'erase';
      if (isSpin) {
        type = 'tspin';
        this.parent.b2b++;
      } else if (this.lineClear < 4) {
        this.parent.b2b = 0;
      }
      sound.add(`${type}${version}`);
      sound.add(`${type}${this.lineClear}${version}`);
      if (this.lineClear < 4) {
        sound.add(`${type}not4${version}`);
      } else {
        this.parent.b2b++;
      }
      if (this.parent.b2b > 1) {
        sound.add('b2b');
      }

      if (isSpin) {
        this.parent.addScore(`tspin${this.lineClear}`);
      }
    } else {
      this.parent.combo = -1;
      if (isSpin) {
        sound.add(`tspin0${version}`);
        this.parent.addScore('tspin0');
      }
    }
    if (this.parent.combo > 0) {
      sound.add(`ren${this.parent.combo}`);
      this.parent.addScore('combo', this.parent.combo);
      if (settings.settings.displayActionText) {
        $('#combo-counter-container').classList.remove('hidden');
        $('#combo-counter').innerHTML = locale.getString('action-text', 'combo', [`<b>${this.parent.combo}</b>`]);
        document.documentElement.style.setProperty('--combo-flash-speed', Math.max(0.5 - (0.485 * ((this.parent.combo) / 18)), 0.041) + 's');
      }
    } else {
      $('#combo-counter-container').classList.add('hidden');
    }
    if (this.parent.piece.areLineLimit === 0) {
      this.collapse();
    }
    // console.log(this.highest, this.skyToFloor);
    // console.log(this.skyToFloor);
    this.parent.calculateActionText(this.lineClear, isSpin, isMini, this.parent.b2b);
    let pc = true;
    for (let x = 0; x < this.grid.length; x++) {
      if (!pc) {
        break;
      }
      for (let y = 0; y < this.grid[x].length; y++) {
        const isFilled = this.grid[x][y];
        if (isFilled) {
          pc = false;
          break;
        }
      }
    }
    if (this.useGarbageSending) {
      garbageToClear += [0, 0, 1, 2, 4][this.lineClear];
      if (isSpin && !isMini) {
        garbageToClear += [0, 2, 3, 4, 5][this.lineClear];
      }
      if (this.parent.b2b > 1 && this.lineClear) {
        garbageToClear++;
      }
      const comboIncreaseTable = [2, 5, 7, 9, 12];
      for (const condition of comboIncreaseTable) {
        if (this.parent.combo >= condition) {
          garbageToClear++;
        }
      }
      if (pc) {
        sound.add('bravo');
        this.parent.displayActionText('<br><br>' + locale.getString('action-text', 'pc'));
        garbageToClear += 10;
      }
    }
    if (Math.max(0, this.waitingGarbage) - garbageToClear < 0 && this.showGarbageSendAnimation) {
      const selectedStartingType = Math.floor(Math.random() * 2);
      const element = document.createElement('div');
      switch (selectedStartingType) {
        case 0:
          element.style.setProperty('--starting-value-left', '0%');
          break;
        case 1:
          element.style.setProperty('--starting-value-right', '100%');
          break;
      }
      const startingPositionOpposite = Math.random() * 100;
      element.style.setProperty('--starting-value-top', `${startingPositionOpposite}%`);
      const id = `gb-${performance.now()}`;
      element.classList.add('garbage-particle');
      element.classList.add('send');
      element.id = id;
      $('#game').appendChild(element);
      sound.add('garbagesend');
      setTimeout(() => {
        element.parentNode.removeChild(element);
      }, 330);
    }
    this.waitingGarbage = Math.max(-4, this.waitingGarbage - garbageToClear);
    if (this.waitingGarbage > 0 && !this.lineClear) {
      this.spawnBrokenLine(this.waitingGarbage);
      this.waitingGarbage = 0;
    }
    this.alarmCheck();
    this.parent.updateStats();
  }
  alarmCheck() {
    if (
      this.height - this.highest - Math.max(0, this.waitingGarbage) < 2 ||
      (
        (this.height - this.highest - Math.max(0, this.waitingGarbage) < 5 && !this.alarmIsOn ||
        this.height - this.highest - Math.max(0, this.waitingGarbage) < 8 && this.alarmIsOn) &&
        this.skyToFloor - this.hiddenHeight < this.height - 4
      )
    ) {
      this.startAlarm();
    } else {
      this.endAlarm();
    }
  }
  startAlarm() {
    if (this.alarmIsOn) {
      return;
    }
    sound.raiseDangerBgm();
    sound.startSeLoop('alarm');
    document.documentElement.style.setProperty('--grid-image', 'url("../img/tetrion/grid-bg-cross-danger.svg")');
    document.documentElement.style.setProperty('--tetrion-color', '#f00');
    this.alarmIsOn = true;
  }
  endAlarm() {
    sound.lowerDangerBgm();
    sound.stopSeLoop('alarm');
    this.alarmIsOn = false;
    document.documentElement.style.setProperty('--grid-image', 'url("../img/tetrion/grid-bg-cross.svg")');
    document.documentElement.style.setProperty('--tetrion-color', '#fff');
  }
  addGarbageToCounter(amount = 1) {
    const selectedStartingType = Math.floor(Math.random() * 2);
    const element = document.createElement('div');
    switch (selectedStartingType) {
      case 0:
        element.style.setProperty('--starting-value-left', '0%');
        break;
      case 1:
        element.style.setProperty('--starting-value-right', '100%');
        break;
    }
    const startingPositionOpposite = Math.random() * 100;
    element.style.setProperty('--starting-value-top', `${startingPositionOpposite}%`);
    const id = `gb-${performance.now()}`;
    element.classList.add('garbage-particle');
    element.id = id;
    $('#game').appendChild(element);
    sound.add('garbagefly');
    setTimeout(() => {
      this.waitingGarbage += amount;
      this.parent.piece.isDirty = true;
      this.parent.shakeMatrix();
      sound.add('garbagereceive');
      this.alarmCheck();
      element.parentNode.removeChild(element);
    }, 330);
  }
  spawnBrokenLine(amount = 1) {
    sound.add('garbage');
    this.parent.shiftMatrix('up');
    let topOut = false;
    const randomHole = Math.floor(Math.random() * this.grid.length);
    for (let i = 0; i < amount; i++) {
      for (let i = 0; i < this.flashY.length; i++) {
        this.flashY[i]--;
      }
      for (let x = 0; x < this.grid.length; x++) {
        if (this.grid[x][0]) {
          topOut = true;
        }
        for (let shiftY = 0; shiftY < this.grid[0].length; shiftY++) {
          this.grid[x][shiftY] = this.grid[x][shiftY + 1];
        }

        if (x === randomHole) {
          continue;
        }
        this.grid[x][this.grid[0].length - 1] = 'black';
      }
      if (this.parent.piece.isStuck) {
        this.parent.piece.y--;
      }
      this.alarmCheck();
    }
    this.makeAllDirty();
    this.isDirty = true;
    this.parent.piece.isDirty = true;
    if (topOut) {
      $('#kill-message').textContent = locale.getString('ui', 'topOut');
      this.parent.end();
      return;
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
          this.dirtyCells.push([x, shiftY + 1]);
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
    if (this.toCollapse.length >= 4) {
      sound.add('collapse4');
    } else {
      sound.add('collapsenot4');
    }
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
      lifeVariance: 80,
    });
    this.toCollapse = [];
    this.lineClear = 0;
    this.alarmCheck();
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
  getHighestOfColumn(x) {
    let highest = 0;
    for (let i = 0; i < this.grid[x].length; i++) {
      if (this.grid[x][i] != null) {
        const iReverse = this.grid[x].length - i;
        highest = Math.max(highest, iReverse);
        break;
      }
    }
    return highest;
  }
  get skyToFloor() {
    let amount = 0;
    for (const currentY of this.grid) {
      let passed = true;
      for (let i = 0; i < currentY.length; i++) {
        if (currentY[i] != null) {
          amount = Math.max(amount, i);
          passed = false;
          break;
        }
      }
      if (passed) {
        amount = Math.max(amount, this.height + this.hiddenHeight);
      }
    }
    return amount;
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
    // clearCtx(this.ctx);
    this.dirtyCells = Array.from(new Set(this.dirtyCells.map(JSON.stringify)), JSON.parse);
    for (const cell of this.dirtyCells) {
      const x = cell[0] * cellSize;
      const y = (cell[1] - this.hiddenHeight) * cellSize + buffer * cellSize;
      ctx.clearRect(x, Math.floor(y), cellSize, cellSize);
    }
    /*
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
    */
    const levelUpLength = this.height * this.levelUpAnimation / this.levelUpAnimationLimit;
    for (const cell of this.dirtyCells) {
      const x = cell[0];
      const y = cell[1];
      const isFilled = this.grid[x][y];
      if (isFilled && !this.isInvisible) {
        const color = this.grid[x][y];
        let name = 'stack';
        if (this.useMinoSkin) {
          name = 'mino';
        }
        let suffix = '';
        if (this.parent.piece.useRetroColors) {
          let modifier = 0;
          if (this.levelUpAnimation < this.levelUpAnimationLimit) {
            if (y - 3 <= (this.height - levelUpLength)) {
              modifier--;
            }
          }
          suffix = `-${negativeMod((this.parent.stat.level + modifier), 10)}`;
        }
        const img = document.getElementById(`${name}-${color}${suffix}`);
        const xPos = x * cellSize;
        const yPos = y * cellSize + cellSize * buffer - cellSize * this.hiddenHeight;
        img.height = cellSize;
        ctx.drawImage(img, xPos, Math.floor(yPos), cellSize, cellSize);
        ctx.globalCompositeOperation = 'multiply';
        ctx.fillStyle = '#0003';
        ctx.fillRect(xPos, Math.floor(yPos), cellSize, cellSize);
      }
    }
    if (this.flashTime < this.flashLimit) {
      for (let i = 0; i < this.flashX.length; i++) {
        ctx.globalCompositeOperation = 'overlay';
        const x = this.flashX[i] * cellSize;
        const y = this.flashY[i] * cellSize + cellSize * buffer - cellSize * this.hiddenHeight;
        ctx.fillStyle = `#ffffff${flash}`;
        ctx.fillRect(x, Math.floor(y), cellSize, cellSize);

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
        ctx.moveTo(x + distance1x, Math.floor(y + distance1y));
        ctx.lineTo(x + cellSize - distance1y, Math.floor(y + cellSize - distance1x));
        ctx.lineTo(x + cellSize - cornerY, Math.floor(y + cellSize - cornerX));
        ctx.lineTo(x + cellSize - distance2y, Math.floor(y + cellSize - distance2x));
        ctx.lineTo(x + distance2x, Math.floor(y + distance2y));
        ctx.lineTo(x + cornerX, Math.floor(y + cornerY));
        ctx.fillStyle = '#fff';
        ctx.fill();
        if (this.flashTime < 50) {
          ctx.globalCompositeOperation = 'source-over';
          ctx.fillStyle = `#fff`;
          ctx.fillRect(x, Math.floor(y), cellSize, cellSize);
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
        ctx.clearRect(0, Math.floor((this.toCollapse[i] - this.hiddenHeight) * cellSize + buffer * cellSize), cellSize * this.width, cellSize);
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
          lifeVariance: 80,
        });
        if (Math.round(this.parent.piece.are / this.flashClearRate) % 2 !== 1 || !this.flashLineClear) {
          ctx.fillRect(0, Math.floor((this.toCollapse[i] - this.hiddenHeight) * cellSize + buffer * cellSize), cellSize * this.width, cellSize);
        }
      }
    }
    this.dirtyCells = [];
  }
}
