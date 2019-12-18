import $ from '../../shortcuts.js';
// SHARED
function tryLockdown(piece, arg) {
  if (
    (piece.lockDelay >= piece.lockDelayLimit && piece.isLanded) ||
    piece.mustLock
  ) {
    arg.stack.add(piece.x, piece.yFloor, piece.shape, piece.color);
    arg.stack.isDirty = true;
    piece.isDead = true;
    piece.die();
  }
}
function stepReset(piece, arg) {
  if (piece.isLanded) {
    if (
      piece.lastX !== piece.x ||
      piece.lastY !== piece.y ||
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
  if (piece.yFloor > Math.floor(piece.lowestY)) {
    if (usesManipulations) {
      piece.manipulations = 0;
    }
    piece.lockDelay = 0;
  }
}
// LOCKDOWN FUNCTIONS
export function extendedLockdown(arg) {
  const piece = arg.piece;
  piece.lockdownType = 'extended';
  if (piece.isDead) {
    $('#lockdown').value = 0;
    return;
  }
  fallReset(piece, true);
  tryLockdown(piece, arg);
  stepReset(piece, arg);

  if (piece.manipulations >= piece.manipulationLimit) {
    piece.lockDelay = piece.lockDelayLimit;
  }
  updateLockdownBar(piece);
  piece.lowestY = Math.max(piece.y, piece.lowestY);
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
  piece.lowestY = Math.max(piece.y, piece.lowestY);
}
export function retroLockdown(arg) {
  const piece = arg.piece;
  piece.lockdownType = 'retro';
  if (piece.isDead) {
    $('#lockdown').value = 0;
    return;
  }
  if (piece.mustLock) {
    arg.stack.add(piece.x, piece.yFloor, piece.shape, piece.color);
    arg.stack.isDirty = true;
    piece.softDropIsLocked = true;
    piece.die();
  }

  if (piece.manipulations >= piece.manipulationLimit) {
    piece.lockDelay = piece.lockDelayLimit;
  }
  $('#lockdown').max = 1;
  $('#lockdown').value = 1;
  piece.lowestY = Math.max(piece.y, piece.lowestY);
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
  piece.lowestY = Math.max(piece.y, piece.lowestY);
}
