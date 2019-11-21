import GameModule from './game-module.js';
import {PIECES, SPAWN_OFFSETS, KICK_TABLES, PIECE_COLORS, INITIAL_ORIENTATION, PIECE_OFFSETS} from '../consts.js';
import $, {clearCtx, framesToMs, hzToMs, toCtx} from '../shortcuts.js';
import settings from '../settings.js';
import gameHandler from './game-handler.js';
import sound from '../sound.js';
export default class Piece extends GameModule {
  constructor(parent, ctx) {
    super(parent);
    this.x;
    this.lastX;
    this.y;
    this.lastY;
    this.lowestY;
    this.name;
    this.piece;
    this.shape;
    this.gravity = 1000;
    this.gravityMultiplier = 1;
    this.gravityOverride = 0;
    this.ctx = ctx;
    this.orientation = 0;
    this.lastOrientation;
    this.lockDelay = 0;
    this.lockDelayLimit = 500;
    this.last = '';
    this.kicks;
    this.shiftDir = 'none';
    this.das = 0;
    this.dasLimit = settings.settings.DAS;
    this.shiftReleased = false;
    this.didInitialMove = false;
    this.arr = 0;
    this.arrLimit = settings.settings.ARR;
    this.manipulations = 0;
    this.manipulationLimit = 15;
    this.mustLock = false;
    this.color = 'white';
    this.are = 0;
    this.areLimit = 0;
    this.areLineLimit = 0;
    this.areLimitLineModifier = 0;
    this.isDead = true;
    this.ire = 0;
    this.hasIas = false;
    this.hasLineDelay = false;
    this.hasHardDropped = false;
    this.startingAre = 0;
    this.startingAreLimit = 1500;
    this.ghostIsVisible = true;
    this.softDropIsLocked = false;
    this.useSpecialI = false;
  }
  new(name = this.parent.next.next()) {
    const rotSys = this.parent.rotationSystem;
    if (this.parent.stat.piece === 0) {
      sound.add('start');
      $('#message').textContent = 'START';
      $('#message').classList.add('dissolve');
      sound.playBgm(this.parent.settings.music, this.parent.type);
    }
    this.parent.onPieceSpawn(this.parent);
    this.parent.updateStats();
    $('#delay').innerHTML = `${this.lockDelayLimit} <b>ms</b>`;
    this.hasLineDelay = false;
    this.isDead = false;
    this.are = this.areLimit;
    this.mustLock = false;
    this.hasHardDropped = false;
    this.lockDelay = 0;
    this.name = name;
    this.orientation = INITIAL_ORIENTATION[rotSys][name];
    if (this.ire !== 0) {
      sound.add('initialrotate');
    }
    this.orientation = (this.orientation + this.ire) % 4;
    this.ire = 0;
    this.piece = PIECES[name].shape;
    this.shape = this.piece[this.orientation];
    this.x = 0 + SPAWN_OFFSETS[rotSys][name][0] + PIECE_OFFSETS[rotSys][name][this.orientation][0];
    this.y = 0 + SPAWN_OFFSETS[rotSys][name][1] + PIECE_OFFSETS[rotSys][name][this.orientation][0];
    this.lowestY = this.y;
    this.kicks = KICK_TABLES[rotSys][name];
    for (let i = 0; i < SPAWN_OFFSETS[rotSys].downShift; i++) {
      this.shiftDown();
    }
    this.manipulations = 0;
    if (this.gravity <= framesToMs(1 / 20)) {
      this.sonicDrop();
    }
    if (this.isStuck) {
      sound.add('ko');
      gameHandler.reset();
    }
    this.color = this.parent.colors[this.name];
  }
  die() {
    this.isDead = true;
    this.are = 0;
  }
  get yFloor() {
    return Math.floor(this.y);
  }
  drawMino(x, y, buffer, type, number) {
    const cellSize = this.parent.cellSize;
    const ctx = this.ctx;
    const xPos = x * cellSize;
    const yPos = y * cellSize + cellSize * buffer;
    // spriteCtx.drawImage(img, 0, 0, cellSize * 9, cellSize);
    let img;
    switch (type) {
      case 'ghost':
        img = document.getElementById(`ghost-${this.color}`);
        break;
      case 'piece':
        let suffix = '';
        if (this.useSpecialI && this.name === 'I') {
          suffix = number;
        }
        img = document.getElementById(`mino-${this.color}${suffix}`);
      default:
        break;
    }
    img.height = cellSize;
    // ctx.clearRect(xPos, yPos, cellSize, cellSize);
    ctx.globalCompositeOperation = 'source-over';

    ctx.drawImage(img, xPos, Math.floor(yPos), cellSize, cellSize);

    const darkness = ('0' + (Math.floor(this.lockDelay / this.lockDelayLimit * 255)).toString(16)).slice(-2);
    if (type === 'piece' && this.isLanded) {
      ctx.globalCompositeOperation = 'saturation';

      ctx.fillStyle = `#000000${darkness}`;
      ctx.fillRect(xPos, Math.floor(yPos), cellSize, cellSize);
    }

    // ctx.fillRect(x * cellSize, y * cellSize + cellSize * buffer, cellSize, cellSize);
  }
  drawPiece(shape, offsetX = 0, offsetY = 0, type) {
    for (let y = 0; y < shape.length; y++) {
      for (let x = 0; x < shape[y].length; x++) {
        const isFilled = shape[y][x];
        if (isFilled) {
          this.drawMino(this.x + x + offsetX, this.yFloor + y + offsetY, this.parent.bufferPeek, type, shape[y][x]);
        }
      }
    }
  }
  draw() {
    const ctx = this.ctx;
    clearCtx(ctx);
    if (this.isDead) {
      return;
    }
    if (this.ghostIsVisible) {
      this.drawPiece(this.shape, 0, this.getDrop(), 'ghost');
    }
    this.drawPiece(this.shape, 0, 0, 'piece');
    if (this.manipulations >= this.manipulationLimit && false) {
      const cellSize = this.parent.cellSize;
      ctx.beginPath();
      const y = cellSize * Math.floor(this.lowestY) + cellSize * this.parent.bufferPeek + this.shape.length * cellSize;
      ctx.moveTo(0, y);
      ctx.lineTo(this.parent.settings.width * cellSize, y);
      ctx.lineWidth = cellSize / 20;
      ctx.strokeStyle = '#f00';
      ctx.stroke();
      ctx.strokeRect(this.x * cellSize, this.yFloor * cellSize + cellSize * this.parent.bufferPeek, this.shape.length * cellSize, this.shape.length * cellSize);
    }
  }
  moveValid(passedX, passedY, shape) {
    if (this.isDead) {
      return false;
    }
    passedX += this.x;
    passedY += this.yFloor;
    for (let y = 0; y < shape.length; y++) {
      for (let x = 0; x < shape[y].length; x++) {
        const currentX = passedX + x;
        const currentY = passedY + y;
        if (shape[y][x] && (
          (currentX < 0 || currentX >= this.parent.settings.width || currentY >= this.parent.settings.height) ||
          (this.parent.stack.grid[currentX][currentY + this.parent.settings.hiddenHeight])
        )) {
          return false;
        }
      }
    }
    return true;
  }
  get isLanded() {
    return !this.moveValid(0, 1, this.shape);
  }
  get isStuck() {
    return !this.moveValid(0, 0, this.shape);
  }
  get canShiftLeft() {
    return this.moveValid(-1, 0, this.shape);
  }
  get canShiftRight() {
    return this.moveValid(1, 0, this.shape);
  }
  getDrop(distance = (this.parent.settings.height + this.parent.settings.hiddenHeight) * 2) {
    if (this.isStuck) {
      return 0;
    }
    let currentDistance = 0;
    for (currentDistance = 1; currentDistance <= distance; currentDistance++) {
      if (!this.moveValid(0, currentDistance, this.shape)) {
        return currentDistance - 1;
      }
    }
    return currentDistance - 1;
  }
  checkFall(distance) {
    if (distance < 1) {
      return true;
    }
    if (this.getDrop(distance) === Math.floor(distance)) {
      return true;
    }

    return false;
  }
  sonicDrop() {
    this.y += this.getDrop();
    this.isDirty = true;
  }
  hardDrop() {
    const score = this.getDrop();
    this.sonicDrop();
    this.hasHardDropped = true;
    this.mustLock = true;
    if (!this.inAre) {
      this.parent.addScore('hardDrop', score);
      sound.add('harddrop');
    }
  }
  shift(direction, amount, condition) {
    if (condition) {
      this[direction] += amount;
      this.manipulations++;
      this.isDirty = true;
      if (direction === 'x') {
        sound.add('move');
      }
    }
  }
  shiftLeft() {
    this.shift('x', -1, this.canShiftLeft);
  }
  shiftRight() {
    this.shift('x', 1, this.canShiftRight);
  }
  shiftDown() {
    this.shift('y', 1, !this.isLanded);
  }
  rotate(amount, direction) {
    const newOrientation = (this.orientation + amount) % 4;
    const rotatedShape = this.piece[newOrientation];
    const kickTable = this.kicks[direction][this.orientation];
    for (let i = 0; i <= kickTable.length; i++) {
      if (i === kickTable.length) {
        // Rotation Failed
        break;
      }
      const offset = PIECE_OFFSETS[this.parent.rotationSystem][this.name];
      const kickX = kickTable[i][0] + offset[newOrientation][0] - offset[this.orientation][0];
      const kickY = kickTable[i][1] + offset[newOrientation][1] - offset[this.orientation][1];
      if (this.moveValid(kickX, kickY, rotatedShape)) {
        this.x += kickX;
        this.y += kickY;
        this.orientation = newOrientation;
        this.shape = rotatedShape;
        this.manipulations++;
        this.isDirty = true;
        sound.add('rotate');
        break;
      }
    }
  }
  rotateLeft() {
    this.rotate(3, 'left');
  }
  rotateRight() {
    this.rotate(1, 'right');
  }
  rotate180() {
    this.rotate(2, 'double');
  }
  get inAre() {
    let areMod = 0;
    if (this.hasLineDelay) {
      areMod += this.areLineLimit;
      areMod += this.areLimitLineModifier;
    }
    return (this.are < this.areLimit + areMod) || this.startingAre < this.startingAreLimit;
  }
}
