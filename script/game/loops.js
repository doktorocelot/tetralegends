import gravity from './loop-modules/gravity.js';
import extendedLockdown from './loop-modules/extended-lockdown.js';
import updateKeys from './loop-modules/update-keys.js';
import shifting from './loop-modules/shifting.js';
import hardDrop from './loop-modules/hard-drop.js';
import softDrop from './loop-modules/soft-drop.js';
import rotate from './loop-modules/rotate.js';
import hyperSoftDrop from './loop-modules/hyper-soft-drop.js';
import rotate180 from './loop-modules/rotate-180.js';
import updateLasts from './loop-modules/update-lasts.js';

export const loops = {
  marathon: {
    update: (arg) => {
      extendedLockdown(arg);
      gravity(arg);
      shifting(arg);
      softDrop(arg);
      rotate(arg);
      rotate180(arg);
      hardDrop(arg);
      updateKeys();
      updateLasts(arg);
    },
  },
};
