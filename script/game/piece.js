import GameModule from './game-module.js';
import {PIECES, SPAWN_OFFSETS, KICK_TABLES, PIECE_COLORS} from '../consts.js';
import $, {clearCtx, framesToMs, hzToMs, toCtx} from '../shortcuts.js';
import settings from '../settings.js';
import {gen} from '../../app.js';
import gameHandler from './game-handler.js';
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
    this.gravity = framesToMs(1 / 0.01667);
    this.gravityMultiplier = 1;
    this.ctx = ctx;
    this.orientation = 0;
    this.lastOrientation;
    this.lockDelay = 0;
    this.lockDelayLimit = framesToMs(30);
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
  }
  new(name) {
    name = gen.next().value;
    this.mustLock = false;
    this.lockDelay = 0;
    this.name = name;
    this.orientation = 0;
    this.piece = PIECES[name].shape;
    this.shape = this.piece[this.orientation];
    this.x = 0 + SPAWN_OFFSETS.srs[name][0];
    this.y = 0 + SPAWN_OFFSETS.srs[name][1];
    this.lowestY = this.y;
    this.kicks = KICK_TABLES.srs[name];
    this.shiftDown();
    this.manipulations = 0;
    if (this.gravity <= framesToMs(1 / 20)) {
      this.sonicDrop();
    }
    if (this.isStuck) {
      gameHandler.reset();
    }
    this.color = PIECE_COLORS.srs[this.name];
  }
  get yFloor() {
    return Math.floor(this.y);
  }
  drawMino(x, y, buffer, type) {
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
        img = document.getElementById(`mino-${this.color}`);
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
          this.drawMino(this.x + x + offsetX, this.yFloor + y + offsetY, this.parent.bufferPeek, type);
        }
      }
    }
  }
  draw() {
    const ctx = this.ctx;
    clearCtx(ctx);
    this.drawPiece(this.shape, 0, this.getDrop(), 'ghost');
    this.drawPiece(this.shape, 0, 0, 'piece');
    if (this.manipulations >= this.manipulationLimit) {
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
  }
  hardDrop() {
    this.sonicDrop();
    this.mustLock = true;
  }
  shift(direction, amount, condition) {
    if (condition) {
      this[direction] += amount;
      this.manipulations++;
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
      const kickX = kickTable[i][0];
      const kickY = kickTable[i][1];
      if (this.moveValid(kickX, kickY, rotatedShape)) {
        this.x += kickX;
        this.y += kickY;
        this.orientation = newOrientation;
        this.shape = rotatedShape;
        this.manipulations++;
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
}
