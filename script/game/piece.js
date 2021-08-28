import GameModule from './game-module.js';
import {PIECES, SPAWN_OFFSETS, KICK_TABLES, INITIAL_ORIENTATION, PIECE_OFFSETS, SPIN_POINTS} from '../consts.js';
import $, {clearCtx, framesToMs} from '../shortcuts.js';
import settings from '../settings.js';
import sound from '../sound.js';
import locale from '../lang.js';
import input from '../input.js';
export default class Piece extends GameModule {
  constructor(parent, ctx, nextCtx) {
    super(parent);
    this.x;
    this.lastX;
    this.y;
    this.lastY;
    this.lastVisualY;
    this.lowestY;
    this.lowestVisualY;
    this.name;
    this.piece;
    this.shape;
    this.gravity = 1000;
    this.gravityMultiplier = 1;
    this.gravityOverride = 0;
    this.ctx = ctx;
    this.nextCtx = nextCtx;
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
    this.xSpawnOffset = 0;
    this.lockdownType = null;
    this.lockdownTypeLast = null;
    this.spinDetectionType = null;
    this.lastKickIndex = 0;
    this.resetGravityOnKick = false;
    this.resetDelayOnKick = false;
    this.retroDas = 0;
    this.holdingTime = 0;
    this.holdingTimeLimit = 0;
    this.breakHoldingTimeOnSoftDrop = true;
    this.resetHoldingTime = false;
    this.killLockDelayOnRotate = false;
    this.lastSpinDirection = null;
  }
  new(name = this.parent.next.next()) {
    this.isFrozen = false;
    const rotSys = this.parent.rotationSystem;
    this.killLockDelayOnRotate = false;
    if (this.parent.stat.piece === 0 && !this.parent.hold.hasHeld) {
      if (this.parent.isRaceMode) {
        if (!sound.skipReadyGo) {
          sound.add('go');
        }
        sound.add('voxgo')
        $('#message').textContent = locale.getString('ui', 'go');
      } else {
        if (!sound.skipReadyGo) {
          sound.add('start');
        }
        sound.add('voxstart');
        $('#message').textContent = locale.getString('ui', 'start');
      }
      $('#ready-meter').classList.add('hidden');
      $('#message').classList.add('dissolve');
      if (this.parent.useAltMusic) {
        sound.playBgm(this.parent.settings.music[1], this.parent.type);
      } else {
        sound.playBgm(this.parent.settings.music[0], this.parent.type);
      }
    }
    this.parent.onPieceSpawn(this.parent);
    this.parent.updateMusic();
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

    this.piece = PIECES[name].shape;
    this.shape = this.piece[this.orientation];
    this.x = 0 + SPAWN_OFFSETS[rotSys][name][0] + PIECE_OFFSETS[rotSys][name][this.orientation][0] + this.xSpawnOffset;
    this.y = 0 + SPAWN_OFFSETS[rotSys][name][1] + PIECE_OFFSETS[rotSys][name][this.orientation][0];
    this.lowestY = this.y;
    this.lowestVisualY = this.visualY;
    this.kicks = KICK_TABLES[rotSys][name];
    this.manipulations = 0;
    this.color = this.parent.colors[this.name];
    for (let i = 0; i < SPAWN_OFFSETS[rotSys].downShift; i++) {
      this.shiftDown();
    }

    this.rotatedX = null;
    this.rotatedY = null;
    if (settings.settings.IRS === 'hold') {
      if (input.getGameDown('rotateRight') && !input.getGamePress('rotateRight')) {
        this.ire = 1;
      } else if (input.getGameDown('rotateLeft') && !input.getGamePress('rotateLeft')) {
        this.ire = 3;
      } else if (input.getGameDown('rotate180') && !input.getGamePress('rotate180')) {
        this.ire = 2;
      }
    }
    if (this.ire !== 0) {
      sound.add('initialrotate');
      let ireDirection = '';
      switch (this.ire) {
        case 1:
          ireDirection = 'right';
          break;
        case 2:
          ireDirection = 'double';
          break;
        case 3:
          ireDirection = 'left';
          break;
      }
      this.rotate(this.ire, ireDirection, false);
    }
    if (this.isStuck && !this.parent.hold.ihs) {
      $('#kill-message').textContent = locale.getString('ui', 'blockOut');
      sound.killVox();
      sound.add('voxblockout');
      this.parent.end();
      return;
      // gameHandler.reset();
    }
    this.ire = 0;
    if (this.gravity <= framesToMs(1 / 20)) {
      sound.add('land');
      this.sonicDrop();
      this.genDropParticles();
    }
    this.isDirty = true;
  }
  die() {
    this.isDead = true;
    this.are = 0;
  }
  get yFloor() {
    return Math.floor(this.y);
  }
  get visualY() {
    return (this.y + this.endY);
  }
  drawMino(x, y, buffer, type, number, color, ctx = this.ctx) {
    const cellSize = this.parent.cellSize;
    const xPos = x * cellSize;
    const yPos = y * cellSize + cellSize * buffer;
    // spriteCtx.drawImage(img, 0, 0, cellSize * 9, cellSize);
    let img;
    switch (type) {
      case 'ghost':
        img = document.getElementById(`ghost-${color}`);
        break;
      case 'piece':
        let suffix = '';
        if (this.useSpecialI && this.name === 'I') {
          suffix = number;
        }
        if (this.useRetroColors) {
          suffix = `-${this.parent.stat.level % 10}`;
        }
        img = document.getElementById(`mino-${color}${suffix}`);
      default:
        break;
    }
    img.height = cellSize;
    // ctx.clearRect(xPos, yPos, cellSize, cellSize);
    ctx.globalCompositeOperation = 'source-over';

    ctx.drawImage(img, xPos, Math.floor(yPos), cellSize, cellSize);

    let darkness = ('0' + (Math.floor(this.lockDelay / this.lockDelayLimit * 255)).toString(16)).slice(-2);
    if (this.isFrozen) {
      darkness = 'FF';
    }
    if (type === 'piece') {
      ctx.globalCompositeOperation = 'saturation';

      ctx.fillStyle = `#000000${darkness}`;
      ctx.fillRect(xPos, Math.floor(yPos), cellSize, cellSize);
    }

    // ctx.fillRect(x * cellSize, y * cellSize + cellSize * buffer, cellSize, cellSize);
  }
  drawPiece(shape, offsetX = 0, offsetY = 0, type = 'piece', color = null) {
    if (color == null) {
      color = this.color;
    }
    for (let y = 0; y < shape.length; y++) {
      for (let x = 0; x < shape[y].length; x++) {
        const isFilled = shape[y][x];
        if (isFilled) {
          this.drawMino(this.x + x + offsetX, this.yFloor + y + offsetY, this.parent.bufferPeek, type, shape[y][x], color);
        }
      }
    }
  }
  genDropParticles() {
    const drop = this.getDrop();
    const cellSize = this.parent.cellSize;
    this.parent.particle.generate({
      amount: 5 * (drop + 1),
      x: (this.x + this.startX) * cellSize,
      y: (this.y + this.endY - this.parent.bufferPeek) * cellSize,
      xRange: (this.endX - this.startX + 1) * cellSize,
      yRange: (drop + 1) * cellSize,
      xVelocity: 0,
      yVelocity: 3,
      xVariance: 1,
      yVariance: 3,
      xDampening: 1.03,
      yDampening: 1.05,
      lifeVariance: 100,
    });
  }
  genPieceParticles() {
    const cellSize = this.parent.cellSize;
    this.parent.particle.generate({
      amount: 2,
      x: (this.x + this.startX) * cellSize,
      y: (this.y + this.endY - this.parent.bufferPeek) * cellSize,
      xRange: (this.endX - this.startX + 1) * cellSize,
      yRange: cellSize,
      xVelocity: 0,
      yVelocity: 3,
      xVariance: 1,
      yVariance: 3,
      xDampening: 1.03,
      yDampening: 1.05,
      lifeVariance: 100,
    });
  }
  draw() {
    const ctx = this.ctx;
    const nextCtx = this.nextCtx;
    clearCtx(ctx);
    clearCtx(nextCtx);
    const cellSize = this.parent.cellSize;
    if (this.parent.stack.waitingGarbage) {
      $('#garbage-counter-container').classList.remove('hidden');
      $('#garbage-counter').textContent = `${this.parent.stack.waitingGarbage}`;
      if (this.parent.stack.waitingGarbage < 0) {
        $('#garbage-counter-container').classList.remove('danger');
        $('#garbage-counter-container').classList.add('negative');
      } else if (this.parent.stack.waitingGarbage > this.parent.settings.height / 2) {
        $('#garbage-counter-container').classList.remove('negative');
        $('#garbage-counter-container').classList.add('danger');
      } else {
        $('#garbage-counter-container').classList.remove('negative');
        $('#garbage-counter-container').classList.remove('danger');
      }
    } else {
      $('#garbage-counter-container').classList.add('hidden');
    }
    if (this.parent.stack.waitingGarbage > 0 && !this.isDead && !this.parent.stack.wouldCauseLineClear()) {
      ctx.beginPath();
      const bottom = this.parent.stack.height + this.parent.bufferPeek;
      ctx.moveTo(0, bottom * cellSize);
      const ghostHeightValues = {};
      for (let i = 0; i < this.parent.stack.grid.length; i++) {
        ghostHeightValues[i] = 0;
      }
      for (const final of this.getFinalBlockLocations()) {
        const highest = this.parent.stack.height - final[1];
        ghostHeightValues[final[0]] = Math.max(ghostHeightValues[final[0]], highest);
      }
      for (let x = 0; x < this.parent.stack.grid.length; x++) {
        const highest = this.parent.stack.getHighestOfColumn(x);
        const y = this.parent.stack.height - Math.max(highest, ghostHeightValues[x]) - this.parent.stack.waitingGarbage + this.parent.bufferPeek;
        ctx.lineTo(x * cellSize, y * cellSize);
        ctx.lineTo((x + 1) * cellSize, y * cellSize);
      }
      ctx.lineTo(this.parent.stack.width * cellSize, bottom * cellSize);
      ctx.lineTo(0, bottom * cellSize);
      ctx.lineWidth = cellSize / 20;
      ctx.strokeStyle = '#f00';
      ctx.fillStyle = '#f003';
      ctx.stroke();
      ctx.fill();
    }
    ctx.fillStyle = '#f00';
    ctx.fillRect((this.parent.settings.width - 0.1) * cellSize,
        (this.parent.settings.height - this.parent.stack.waitingGarbage + this.parent.bufferPeek) * cellSize,
        cellSize / 10, this.parent.stack.waitingGarbage * cellSize);
    // Do this later
    /* const nextBlocks = (this.parent.hold.ihs) ? this.getHoldPieceBlocks() : this.getNextPieceBlocks();
    const check = (x, y) => {return this.parent.stack.isFilled(x, y, this.parent.stack.gridWithLockdown());};
    let fall = 0;
    const max = (this.gravity <= framesToMs(1 / 20)) ? this.parent.stack.height + this.parent.stack.hiddenHeight : SPAWN_OFFSETS[this.parent.rotationSystem].downShift;
    downShiftCheck:
    for (let i = 0; i <= max; i++) {
      fall = i;
      for (let j = 0; j <= nextBlocks.length; j++) {
        const nextBlock = nextBlocks[j];
        if (j === nextBlocks.length) {
          continue downShiftCheck;
        }
        if (check(nextBlock[0], nextBlock[1] + i + this.parent.stack.hiddenHeight)) {
          fall = Math.max(fall - 1, 0);
          break downShiftCheck;
        }
      }
    }
    const nextColor = (this.parent.hold.ihs) ? this.parent.colors[this.parent.hold.getPiece()]: this.parent.colors[this.parent.next.queue[0]];
    for (const nextBlock of nextBlocks) {
      this.drawMino(nextBlock[0], nextBlock[1] + fall, this.parent.bufferPeek, 'ghost', '', nextColor, nextCtx);
    }*/
    if (this.isDead) {
      $('#warning-message-container-hold').classList.add('hidden');
      $('#warning-message-container').classList.add('hidden');
      if ($('#warning-message-container-hold').classList.contains('hidden') &&
        $('#warning-message-container').classList.contains('hidden') &&
        !$('#rotation-warning').classList.contains('hidden')) {
        sound.stopSeLoop('topoutwarning');
      }
      $('#rotation-warning').classList.add('hidden');
      return;
    }
    if (this.ghostIsVisible) {
      this.drawPiece(this.shape, 0, this.getDrop(), 'ghost');
    }
    this.drawPiece(this.shape, 0, 0, 'piece');
    if (this.parent.stack.alarmIsOn) {
      ctx.beginPath();
      const y = cellSize * this.parent.bufferPeek;
      ctx.moveTo(0, y);
      ctx.lineTo(this.parent.settings.width * cellSize, y);
      ctx.lineWidth = cellSize / 20;
      ctx.strokeStyle = '#f00';
      ctx.stroke();
    }

    if (this.manipulations >= this.manipulationLimit) {
      const cellSize = this.parent.cellSize;
      ctx.beginPath();
      const y = cellSize * (Math.floor(this.lowestVisualY) + 1) + cellSize * this.parent.bufferPeek;
      ctx.moveTo(0, y);
      ctx.lineTo(this.parent.settings.width * cellSize, y);
      ctx.lineWidth = cellSize / 20;
      ctx.strokeStyle = '#f00';
      ctx.stroke();
    }

    if (this.hasSpun) {
      if (this.hasSpunMini) {
        this.parent.pieceCanvas.classList.add('spin-pulse-mini');
      } else {
        this.parent.pieceCanvas.classList.add('spin-pulse');
      }
    } else {
      this.parent.pieceCanvas.classList.remove('spin-pulse');
      this.parent.pieceCanvas.classList.remove('spin-pulse-mini');
    }
    this.showBlockOutHold();
    if (!this.showLockOut()) {
      if (!this.showTopOut()) {
        this.showBlockOut();
      }
    }
    if (this.killLockDelayOnRotate) {
      $('#rotation-warning').classList.remove('hidden');
    } else {
      $('#rotation-warning').classList.add('hidden');
    }
    if (!$('#warning-message-container-hold').classList.contains('hidden') ||
      !$('#warning-message-container').classList.contains('hidden') ||
      !$('#rotation-warning').classList.contains('hidden')) {
      if ($('#rotation-warning').classList.contains('hidden')) {
        $('#next-piece').classList.add('immediate-death');
      } else {
        $('#next-piece').classList.remove('immediate-death');
      }
      sound.startSeLoop('topoutwarning');
    } else {
      $('#next-piece').classList.remove('immediate-death');
      sound.stopSeLoop('topoutwarning');
    }
  }
  showTopOut() {
    if (this.parent.stack.wouldCauseLineClear()) {
      return;
    }
    if (this.parent.stack.highest + Math.max(0, this.parent.stack.waitingGarbage) >
      this.parent.stack.height + this.parent.stack.hiddenHeight
    ) {
      $('#warning-message').textContent = locale.getString('ui', 'topOutWarning');
      $('#warning-message-container').classList.remove('hidden');
      return true;
    }
    $('#warning-message-container').classList.add('hidden');
  }
  showLockOut() {
    const finalBlocks = this.getFinalBlockLocations();
    const toCheck = finalBlocks.length;
    let failed = 0;
    for (const finalBlock of finalBlocks) {
      if (finalBlock[1] < 0) {
        failed++;
      }
    }
    if (failed >= toCheck) {
      $('#warning-message').textContent = locale.getString('ui', 'lockOutWarning');
      $('#warning-message-container').classList.remove('hidden');
      return true;
    }
    $('#warning-message-container').classList.add('hidden');
  }
  showBlockOutHold() {
    if (this.parent.hold.isDisabled) {
      $('#warning-message-container-hold').classList.add('hidden');
      return false;
    }
    const holdBlocks = this.getHoldPieceBlocks();
    for (const nextBlock of holdBlocks) {
      const currentX = nextBlock[0];
      const currentY = nextBlock[1];
      if (
        (currentX < 0 || currentX >= this.parent.settings.width || currentY >= this.parent.settings.height) ||
        (this.parent.stack.grid[currentX][currentY + this.parent.settings.hiddenHeight])
      ) {
        $('#warning-message-hold').textContent = locale.getString('ui', 'blockOutHoldWarning');
        $('#warning-message-container-hold').classList.remove('hidden');
        return true;
      }
    }
    $('#warning-message-container-hold').classList.add('hidden');
  }
  showBlockOut() {
    const lineClear = this.parent.stack.wouldCauseLineClear();
    const finalBlocks = this.getFinalBlockLocations();
    const nextBlocks = this.getNextPieceBlocks();
    const arraysEqual = (a1, a2) => {
      /* WARNING: arrays must not contain {objects} or behavior may be undefined */
      return JSON.stringify(a1) == JSON.stringify(a2);
    };
    for (const nextBlock of nextBlocks) {
      const currentX = nextBlock[0];
      let garbageAdd = 0;
      if (!this.parent.stack.wouldCauseLineClear()) {
        garbageAdd = Math.max(0, this.parent.stack.waitingGarbage);
      }
      const currentY = nextBlock[1] - lineClear + garbageAdd;
      if (
        (currentX < 0 || currentX >= this.parent.settings.width || currentY >= this.parent.settings.height) ||
        (this.parent.stack.grid[currentX][currentY + this.parent.settings.hiddenHeight])
      ) {
        $('#warning-message').textContent = locale.getString('ui', 'blockOutWarning');
        $('#warning-message-container').classList.remove('hidden');
        return true;
      }
      for (const finalBlock of finalBlocks) {
        const newNext = [nextBlock[0], nextBlock[1] + garbageAdd];
        if (arraysEqual(finalBlock, newNext)) {
          $('#warning-message').textContent = locale.getString('ui', 'blockOutWarning');
          $('#warning-message-container').classList.remove('hidden');
          return true;
        }
      }
    }
    $('#warning-message-container').classList.add('hidden');
  }
  getFinalBlockLocations() {
    const finalBlocks = [];
    if (this.shape == null) {
      return finalBlocks;
    }
    const currentX = this.x;
    const currentY = this.yFloor + this.getDrop();
    for (let y = 0; y < this.shape.length; y++) {
      for (let x = 0; x < this.shape[y].length; x++) {
        const isFilled = this.shape[y][x];
        if (isFilled) {
          const finalX = currentX + x;
          const finalY = currentY + y;
          finalBlocks.push([finalX, finalY]);
        }
      }
    }
    return finalBlocks;
  }
  getNextPieceBlocks() {
    const nextBlocks = [];
    const nextPiece = this.parent.next.queue[0];
    const nextPieceShape = PIECES[nextPiece].shape[INITIAL_ORIENTATION[this.parent.rotationSystem][nextPiece]];
    const spawnOffsets = SPAWN_OFFSETS[this.parent.rotationSystem][nextPiece];
    for (let y = 0; y < nextPieceShape.length; y++) {
      for (let x = 0; x < nextPieceShape[y].length; x++) {
        const isFilled = nextPieceShape[y][x];
        if (isFilled) {
          nextBlocks.push([x + spawnOffsets[0] + this.xSpawnOffset, y + spawnOffsets[1]]);
        }
      }
    }
    return nextBlocks;
  }
  getHoldPieceBlocks() {
    const holdBlocks = [];
    const holdPiece = this.parent.hold.getPiece();
    const holdPieceShape = PIECES[holdPiece].shape[INITIAL_ORIENTATION[this.parent.rotationSystem][holdPiece]];
    const spawnOffsets = SPAWN_OFFSETS[this.parent.rotationSystem][holdPiece];
    for (let y = 0; y < holdPieceShape.length; y++) {
      for (let x = 0; x < holdPieceShape[y].length; x++) {
        const isFilled = holdPieceShape[y][x];
        if (isFilled) {
          holdBlocks.push([x + spawnOffsets[0] + this.xSpawnOffset, y + spawnOffsets[1]]);
        }
      }
    }
    return holdBlocks;
  }
  moveValid(passedX, passedY, shape, checkIfFrozen = true) {
    if (this.isFrozen && checkIfFrozen) {
      return false;
    }
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
    return !this.moveValid(0, 0, this.shape, false);
  }
  get canShiftLeft() {
    return this.moveValid(-1, 0, this.shape);
  }
  get canShiftRight() {
    return this.moveValid(1, 0, this.shape);
  }
  get canShiftUp() {
    return this.moveValid(0, -1, this.shape);
  }
  get canShiftDown() {
    return this.moveValid(0, 1, this.shape);
  }
  getDrop(distance = (this.parent.settings.height + this.parent.settings.hiddenHeight) * 2) {
    if (this.isStuck) {
      return 0;
    }
    let currentDistance = 0;
    for (currentDistance = 1; currentDistance <= distance; currentDistance++) {
      if (!this.moveValid(0, currentDistance, this.shape, false)) {
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
  get endPoints() {
    if (this.shape == null) {
      return [0, 0];
    }
    let maxX = 0;
    let maxY = 0;
    for (let i = 0; i < this.shape.length; i++) {
      for (let j = 0; j < this.shape[i].length; j++) {
        const mino = this.shape[i][j];
        if (mino !== 0) {
          maxX = Math.max(maxX, j);
          maxY = Math.max(maxY, i);
        }
      }
    }
    return [maxX, maxY];
  }
  get endX() {
    return this.endPoints[0];
  }
  get endY() {
    return this.endPoints[1];
  }
  get startPoints() {
    if (this.shape == null) {
      return [0, 0];
    }
    let minX = this.shape[0].length;
    let minY = this.shape.length;
    for (let i = 0; i < this.shape.length; i++) {
      for (let j = 0; j < this.shape[i].length; j++) {
        const mino = this.shape[i][j];
        if (mino !== 0) {
          minX = Math.min(minX, j);
          minY = Math.min(minY, i);
        }
      }
    }
    return [minX, minY];
  }
  get startX() {
    return this.startPoints[0];
  }
  get startY() {
    return this.startPoints[1];
  }
  sonicDrop() {
    this.y += this.getDrop();
    this.isDirty = true;
  }
  hardDrop() {
    if (!this.isDead) {
      const drop = this.getDrop();
      this.parent.addScore('hardDrop', drop);
      sound.add('harddrop');
      this.genDropParticles();
    }

    this.sonicDrop();
    this.hasHardDropped = true;
    this.mustLock = true;
  }
  addManipulation() {
    if (this.lockdownType !== 'extended') {
      return;
    }
    this.manipulations++;
    if (this.manipulations === this.manipulationLimit) {
      sound.add('lockforce');
      const cellSize = this.parent.cellSize;
      this.parent.particle.generate({
        amount: 100,
        x: 0,
        y: cellSize * (Math.floor(this.lowestVisualY) + 1) + cellSize * this.parent.bufferPeek,
        xRange: this.parent.stack.width * cellSize,
        yRange: 1,
        xVelocity: 0,
        yVelocity: 0,
        xVariance: 3,
        yVariance: 3,
        xFlurry: 1,
        yFlurry: 1,
        xDampening: 1.03,
        yDampening: 1.03,
        lifeVariance: 80,
        red: 255,
        blue: 0,
        green: 0,
      });
    }
  }
  shift(direction, amount, condition) {
    if (condition) {
      this[direction] += amount;
      this.addManipulation();
      this.isDirty = true;
      if (direction === 'x') {
        sound.add('move');
      }
      if (this.isLanded) {
        sound.add('step');
      }
    } else {
      if (direction === 'x') {
        if (amount > 0) {
          this.parent.shiftMatrix('right');
        } else {
          this.parent.shiftMatrix('left');
        }
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
  killLockDelay() {
    if (this.lockDelay >= this.lockDelayLimit) {
      return;
    }
    this.lockDelay = this.lockDelayLimit;
    this.manipulations = this.manipulationLimit;
    this.lowestVisualY = this.parent.stack.height - 1;
    sound.add('lockforce');
  }
  rotate(amount, direction, playSound = true) {
    const newOrientation = (this.orientation + amount) % 4;
    const rotatedShape = this.piece[newOrientation];
    const kickTable = this.kicks[direction][this.orientation];
    if (this.killLockDelayOnRotate) {
      this.killLockDelay();
    }
    kickTest:
    for (let i = 0; i <= kickTable.length; i++) {
      if (i === kickTable.length) {
        // Rotation Failed
        break;
      }
      const offset = PIECE_OFFSETS[this.parent.rotationSystem][this.name];
      const kickX = kickTable[i][0] + offset[newOrientation][0] - offset[this.orientation][0];
      const kickY = kickTable[i][1] + offset[newOrientation][1] - offset[this.orientation][1];
      const exceptionTable = KICK_TABLES[this.parent.rotationSystem].exception;
      const unlessTable = KICK_TABLES[this.parent.rotationSystem].unlessToWith;
      const killTable = KICK_TABLES[this.parent.rotationSystem].killPieceLockDelay;
      const allowKickOffGroundTable = KICK_TABLES[this.parent.rotationSystem].allowKickOffGround;
      if (allowKickOffGroundTable) {
        const allowArray = allowKickOffGroundTable[this.name];
        if (allowArray) {
          if (!allowArray[this.orientation] && !this.isLanded && i > 0) {
            break;
          }
        }
      }
      if (exceptionTable) {
        const check = (x, y) => {return this.parent.stack.isFilled(x, y);};
        if (exceptionTable[this.name]) {
          exceptionTest:
          for (const exception of exceptionTable[this.name][this.orientation]) {
            if (check(exception[0] + this.x, exception[1] + this.yFloor + this.parent.stack.hiddenHeight)) {
              if (unlessTable) {
                if (unlessTable[this.name]) {
                  const unless = unlessTable[this.name][this.orientation][newOrientation];
                  if (unless[0].length > 0) {
                    for (let i = 0; i <= unless.length; i++) {
                      if (i >= unless.length) {
                        break exceptionTest;
                      }
                      const position = unless[i];
                      if (!check(position[0] + this.x, position[1] + this.yFloor + this.parent.stack.hiddenHeight)) {
                        break;
                      }
                    }
                  }
                }
              }
              break kickTest;
            }
          }
        }
      }
      if (killTable) {
        if (killTable[this.name]) {
          const killOn = killTable[this.name][this.orientation][newOrientation];
          if (killOn >= 0 && i >= killOn) {
            this.killLockDelayOnRotate = true;
          }
        }
      }
      if (this.moveValid(kickX, kickY, rotatedShape)) {
        this.lastSpinDirection = direction;
        this.lastKickIndex = i;
        this.x += kickX;
        this.y += kickY;
        this.orientation = newOrientation;
        this.shape = rotatedShape;
        this.addManipulation();
        this.isDirty = true;
        if (playSound) {
          if (i > 0) {
            sound.add('wallkick');
          }
          sound.add('rotate');
        }
        if (this.isLanded) {
          sound.add('step');
        }
        if (this.resetGravityOnKick && i > 0) {
          this.y = this.yFloor;
        }
        if (this.resetDelayOnKick && i > 0) {
          this.lockDelay = 0;
        }
        if (this.checkSpin().isSpin) {
          const cellSize = this.parent.cellSize;
          if (this.checkSpin().isMini) {
            sound.add('prespinmini');
            this.parent.particle.generate({
              amount: 55,
              x: (this.x) * cellSize,
              y: (this.y) * cellSize,
              xRange: (this.shape[0].length) * cellSize,
              yRange: (this.shape[0].length) * cellSize,
              xVelocity: 0,
              yVelocity: 0,
              xVariance: 10,
              yVariance: 10,
              xFlurry: 1,
              yFlurry: 1,
              gravity: 0,
              maxlife: 60,
              lifeVariance: 40,
            });
          } else {
            this.parent.particle.generate({
              amount: 75,
              x: (this.x) * cellSize,
              y: (this.y) * cellSize,
              xRange: (this.shape[0].length) * cellSize,
              yRange: (this.shape[0].length) * cellSize,
              xVelocity: 0,
              yVelocity: 0,
              xVariance: 5,
              yVariance: 5,
              xFlurry: 1,
              yFlurry: 1,
              gravity: 0,
              maxlife: 150,
              lifeVariance: 100,
            });
            sound.add('prespin');
          }
        }
        this.rotatedX = this.x;
        this.rotatedY = this.yFloor;
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
  checkSpin() {
    if (this.spinDetectionType == null) {
      return {isSpin: false, isMini: false};
    }
    if (this.spinDetectionType === 'immobile') {
      if (!this.canShiftLeft && !this.canShiftRight && !this.canShiftUp && !this.canShiftDown) {
        return {isSpin: true, isMini: false};
      }
      return {isSpin: false, isMini: false};
    }
    const check = (x, y) => {return this.parent.stack.isFilled(x, y);};
    const name = this.name;
    let spinCheckCount = 0;
    let isSpin = false;
    let isMini = false;
    if (name === 'T') {
      const spinHigh = SPIN_POINTS[name].high[this.orientation];
      const spinLow = SPIN_POINTS[name].low[this.orientation];
      for (const point of spinHigh) {
        const x = this.x + point[0];
        const y = this.yFloor + this.parent.stack.hiddenHeight + point[1];
        if (check(x, y)) {
          spinCheckCount++;
        }
      }
      if (spinCheckCount < 2 && this.lastKickIndex < 4) {
        isMini = true;
      }
      for (const point of spinLow) {
        const x = this.x + point[0];
        const y = this.yFloor + this.parent.stack.hiddenHeight + point[1];
        if (check(x, y)) {
          spinCheckCount++;
        }
      }
      if (spinCheckCount >= 3) {
        isSpin = true;
      }
    }
    return {isSpin: isSpin, isMini: isMini};
  }
  get hasSpun() {
    if (
      this.x === this.rotatedX &&
      this.yFloor === this.rotatedY &&
      this.checkSpin().isSpin
    ) {
      return true;
    } else {
      return false;
    }
  }
  get hasSpunMini() {
    if (
      this.x === this.rotatedX &&
      this.yFloor === this.rotatedY &&
      this.checkSpin().isMini
    ) {
      return true;
    } else {
      return false;
    }
  }
  get inAre() {
    if (this.startingAre < this.startingAreLimit) {
      // return true;
    }
    let areMod = 0;
    if (this.hasLineDelay) {
      areMod += this.areLineLimit;
      areMod += this.areLimitLineModifier;
    }
    return (this.are < this.areLimit + areMod) || this.startingAre < this.startingAreLimit;
  }
}
