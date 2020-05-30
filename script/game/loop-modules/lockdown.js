import $, {framesToMs} from '../../shortcuts.js';
import gameHandler from '../game-handler.js';
// SHARED
function tryLockdown(piece, arg) {
  if (
    (piece.lockDelay >= piece.lockDelayLimit && piece.isLanded) ||
    piece.mustLock
  ) {
    arg.stack.add(piece.x, piece.yFloor, piece.shape, piece.color);
    arg.stack.isDirty = true;
    piece.isDead = true;
    piece.softDropIsLocked = true;
    piece.die();
  }
}
function stepReset(piece, arg) {
  if (piece.isLanded) {
    if (
      piece.lastX !== piece.x ||
      piece.lastVisualY !== piece.visualY ||
      piece.lastOrientation !== piece.orientation
    ) {
      piece.lockDelay = 0;
    }
    piece.lockDelay += arg.ms;
    piece.isDirty = true;
  } else {
    piece.lockDelay = 0;
  }
}
function updateLockdownBar(piece) {
  $('#lockdown').max = piece.lockDelayLimit;
  $('#lockdown').value = piece.lockDelayLimit - piece.lockDelay;
}
function fallReset(piece, usesManipulations) {
  if (Math.floor(piece.visualY) > Math.floor(piece.lowestVisualY)) {
    if (usesManipulations) {
      piece.manipulations = 0;
    }
    piece.lockDelay = 0;
  }
}
function setLowestY(piece) {
  piece.lowestY = Math.max(piece.y, piece.lowestY);
  piece.lowestVisualY = Math.max(piece.visualY, piece.lowestVisualY);
}
// LOCKDOWN FUNCTIONS
export function extendedLockdown(arg) {
  const piece = arg.piece;
  piece.lockdownType = 'extended';
  if (piece.isDead || piece.isFrozen) {
    $('#lockdown').value = 0;
    if (piece.isDead) {
      return;
    }
  }
  fallReset(piece, true);
  tryLockdown(piece, arg);
  stepReset(piece, arg);

  if (piece.manipulations >= piece.manipulationLimit) {
    piece.lockDelay = piece.lockDelayLimit;
  }
  updateLockdownBar(piece);
  setLowestY(piece);
  for (let i = 1; i <= piece.manipulationLimit; i++) {
    $(`#pip-${i}`).classList.remove('disabled');
  }
  for (let i = 1; i <= Math.min(piece.manipulations, piece.manipulationLimit); i++) {
    $(`#pip-${i}`).classList.add('disabled');
  }
}
export function nonLockdown(arg) {
  const piece = arg.piece;
  piece.lockDelay = 0;
  piece.lockdownType = 'extended';

  if (piece.isDead || piece.isFrozen) {
    $('#lockdown').value = 0;
    if (piece.isDead) {
      return;
    }
  }
  fallReset(piece, true);
  tryLockdown(piece, arg);
  stepReset(piece, arg);

  if (piece.manipulations >= piece.manipulationLimit) {
    piece.lockDelay = piece.lockDelayLimit;
  }
  $('#lockdown').max = 100;
  $('#lockdown').value = $('#lockdown').max - ((gameHandler.game.nonTime / 333.333333333) * $('#lockdown').max);
  setLowestY(piece);
  for (let i = 1; i <= piece.manipulationLimit; i++) {
    $(`#pip-${i}`).classList.remove('disabled');
  }
  for (let i = 1; i <= Math.min(piece.manipulations, piece.manipulationLimit); i++) {
    $(`#pip-${i}`).classList.add('disabled');
  }
}
export function classicLockdown(arg) {
  const piece = arg.piece;
  piece.lockdownType = 'classic';
  if (piece.isDead) {
    $('#lockdown').value = 0;
    return;
  }
  piece.manipulations = 0;
  fallReset(piece, false);
  tryLockdown(piece, arg);
  if (piece.isLanded) {
    piece.lockDelay += arg.ms;
    piece.isDirty = true;
  }
  updateLockdownBar(piece);
  setLowestY(piece);
}
export function retroLockdown(arg, useNesTable) {
  const piece = arg.piece;
  piece.lockdownType = 'retro';
  if (piece.isDead) {
    $('#lockdown').value = 0;
    return;
  }
  if (piece.mustLock) {
    arg.stack.add(piece.x, piece.yFloor, piece.shape, piece.color);
    arg.stack.isDirty = true;
    if (useNesTable) {
      const areFrames = Math.floor(Math.abs(piece.yFloor + piece.endY - 21) / 4);
      piece.areLimit = framesToMs(10 + areFrames * 2);
      piece.areLineLimit = framesToMs(10 + areFrames * 2);
      piece.areLimitLineModifier = framesToMs(19) - piece.areLimit;
    }
    piece.softDropIsLocked = true;
    piece.die();
  }

  if (piece.manipulations >= piece.manipulationLimit) {
    piece.lockDelay = piece.lockDelayLimit;
  }
  $('#lockdown').max = 1;
  $('#lockdown').value = 1;
  setLowestY(piece);
}
export function infiniteLockdown(arg) {
  const piece = arg.piece;
  piece.lockdownType = 'infinite';
  if (piece.isDead) {
    $('#lockdown').value = 0;
    return;
  }
  piece.manipulations = 0;
  fallReset(piece, false);
  tryLockdown(piece, arg);
  stepReset(piece, arg);
  updateLockdownBar(piece);
  setLowestY(piece);
}
