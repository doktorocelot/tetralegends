import {loadSoundbank} from './loaders.js';
import settings from './settings.js';
import gameHandler from './game/game-handler.js';
import {resetAnimation} from './shortcuts.js';
class Sound {
  constructor() {
    this.sounds = [];
    this.cut = [];
    this.music = {};
    this.toPlay = {};
    this.files = [];
    this.menuSounds = [];
    this.playingSeLoops = {};
    this.amountOfTimesEnded = {};
    this.fadedSounds = {};
    this.mustWait = false;
    this.bgmName = null;
    this.dangerBgmName = null;
    this.dangerBgmIsRaised = false;
    this.paceBgmName = null;
    this.paceBgmIsRaised = false;
    this.lastLoaded = null;
    this.noLoops = false;
    this.playHardNoise = false;
    this.pieceFlashes = {};
    this.flashTimeouts = {};
  }
  updateVolumes() {
    for (const key of Object.keys(this.sounds)) {
      if (this.fadedSounds[key] != null) {
        this.sounds[key].volume(settings.settings.sfxVolume / 100 * 0.5);
        continue;
      }
      this.sounds[key].volume(settings.settings.sfxVolume / 100);
    }
    for (const key of Object.keys(this.menuSounds)) {
      this.menuSounds[key].volume(settings.settings.sfxVolume / 100);
    }
    for (const key of Object.keys(this.music)) {
      if (key.includes('danger') && !this.dangerBgmIsRaised) {
        continue;
      }
      if (key.includes('pace') && !this.paceBgmIsRaised) {
        continue;
      }
      this.music[key].volume(settings.settings.musicVolume / 100);
    }
  }
  loadMenu() {
    const files = ['move', 'select', 'back', 'change', 'optionselect',
      'hardstart1', 'hardstart2', 'hardstart3', 'hardstart4'];
    for (const soundName of files) {
      this.menuSounds[soundName] = new Howl({
        src: [`./se/menu/${soundName}.ogg`],
        volume: settings.settings.sfxVolume / 100,
      });
    }
  }
  playMenuSe(name) {
    this.menuSounds[name].stop();
    this.menuSounds[name].play();
  }
  load(name = 'standard') {
    for (const key of Object.keys(this.playingSeLoops)) {
      this.stopSeLoop(key);
    }
    this.noLoops = false;
    if (name === this.lastLoaded) {
      return;
    }
    this.mustWait = true;
    Howler.unload();
    this.loadMenu();
    loadSoundbank(name)
        .then((soundData) => {
          this.lastLoaded = name;
          this.files = soundData.files;
          this.ren = soundData.ren;
          this.cut = (soundData.cutItself) ? soundData.cutItself : [];
          this.pieceFlashes = (soundData.nextFlashes) ? soundData.nextFlashes : {};
          for (const soundName of this.files) {
            this.amountOfTimesEnded[soundName] = 0;
            this.sounds[soundName] = new Howl({
              src: [`./se/game/${name}/${soundName}.ogg`],
              volume: settings.settings.sfxVolume / 100,
              onend: () => {
                this.amountOfTimesEnded[soundName]++;
                if (this.amountOfTimesEnded[soundName] > 2 && this.playingSeLoops[soundName] != null && this.fadedSounds[soundName] == null) {
                  this.fadedSounds[soundName] = true;
                  this.sounds[soundName].fade(settings.settings.sfxVolume / 100, (settings.settings.sfxVolume / 100) * 0.5, 500);
                }
              },
            });
          }
          for (const ren of this.ren) {
            this.sounds[`ren${ren}`] = new Howl({
              src: [`./se/game/${name}/ren/ren${ren}.ogg`],
              volume: settings.settings.sfxVolume / 100,
            });
          }
          this.mustWait = false;
        });
  }
  loadBgm(name, type) {
    for (const currentName of name) {
      this.music[`${type}-${currentName}-start`] = new Howl({
        src: [`./bgm/${type}/${currentName}-start.ogg`],
        volume: settings.settings.musicVolume / 100,
        onend: () => {
          this.music[`${type}-${currentName}-loop`].play();
        },
      });
      this.music[`${type}-${currentName}-loop`] = new Howl({
        src: [`./bgm/${type}/${currentName}-loop.ogg`],
        volume: settings.settings.musicVolume / 100,
        loop: true,
        onplay: () => {
          // this.syncBgm();
        },
      });
      if (gameHandler.game.settings.hasDangerBgm) {
        this.dangerBgmIsRaised = false;
        this.music[`${type}-${currentName}-danger-start`] = new Howl({
          src: [`./bgm/${type}/${currentName}-danger-start.ogg`],
          volume: 0,
          onend: () => {
            this.music[`${type}-${currentName}-danger-loop`].play();
          },
        });
        this.music[`${type}-${currentName}-danger-loop`] = new Howl({
          src: [`./bgm/${type}/${currentName}-danger-loop.ogg`],
          volume: 0,
          loop: true,
        });
      }
      if (gameHandler.game.settings.hasPaceBgm) {
        this.paceBgmIsRaised = false;
        this.music[`${type}-${currentName}-pace-start`] = new Howl({
          src: [`./bgm/${type}/${currentName}-pace-start.ogg`],
          volume: 0,
          onend: () => {
            this.music[`${type}-${currentName}-pace-loop`].play();
          },
        });
        this.music[`${type}-${currentName}-pace-loop`] = new Howl({
          src: [`./bgm/${type}/${currentName}-pace-loop.ogg`],
          volume: 0,
          loop: true,
        });
      }
    }
  }
  syncBgm() {
    return;
    try {
      if (gameHandler.game.settings.hasDangerBgm) {
        this.music[`${this.dangerBgmName}-start`].seek(this.music[`${this.bgmName}-start`].seek());
        this.music[`${this.dangerBgmName}-loop`].seek(this.music[`${this.bgmName}-loop`].seek());
      }
      if (gameHandler.game.settings.hasPaceBgm) {
        this.music[`${this.paceBgmName}-start`].seek(this.music[`${this.bgmName}-start`].seek());
        this.music[`${this.paceBgmName}-loop`].seek(this.music[`${this.bgmName}-loop`].seek());
      }
    } catch (error) {

    }
  }
  playBgm(name, type) {
    this.killBgm();
    this.bgmName = `${type}-${name}`;
    this.dangerBgmName = `${type}-${name}-danger`;
    this.paceBgmName = `${type}-${name}-pace`;
    this.music[`${type}-${name}-start`].play();
    if (gameHandler.game.settings.hasDangerBgm) {
      if (this.dangerBgmIsRaised) {
        this.music[`${type}-${name}-danger-start`].volume(settings.settings.musicVolume / 100);
        this.music[`${type}-${name}-danger-loop`].volume(settings.settings.musicVolume / 100);
      }
      this.music[`${type}-${name}-danger-start`].play();
    }
    if (gameHandler.game.settings.hasPaceBgm) {
      if (this.paceBgmIsRaised) {
        this.music[`${type}-${name}-pace-start`].volume(settings.settings.musicVolume / 100);
        this.music[`${type}-${name}-pace-loop`].volume(settings.settings.musicVolume / 100);
      }
      this.music[`${type}-${name}-pace-start`].play();
    }
  }
  killBgm() {
    for (const name of Object.keys(this.music)) {
      this.music[name].stop();
    }
  }
  killAllLoops() {
    this.noLoops = true;
    for (const loop of Object.keys(this.playingSeLoops)) {
      this.stopSeLoop(loop);
    }
  }
  raiseDangerBgm() {
    if (!gameHandler.game.settings.hasDangerBgm) {
      return;
    }
    if (!this.dangerBgmIsRaised) {
      this.syncBgm();
      this.music[`${this.dangerBgmName}-start`].fade(0, settings.settings.musicVolume / 100, 500);
      this.music[`${this.dangerBgmName}-loop`].fade(0, settings.settings.musicVolume / 100, 500);
      this.dangerBgmIsRaised = true;
    }
  }
  lowerDangerBgm() {
    if (!gameHandler.game.settings.hasDangerBgm) {
      return;
    }
    if (this.dangerBgmIsRaised) {
      this.syncBgm();
      this.music[`${this.dangerBgmName}-start`].fade(settings.settings.musicVolume / 100, 0, 500);
      this.music[`${this.dangerBgmName}-loop`].fade(settings.settings.musicVolume / 100, 0, 500);
      this.dangerBgmIsRaised = false;
    }
  }
  raisePaceBgm() {
    if (!gameHandler.game.settings.hasPaceBgm) {
      return;
    }
    if (!this.paceBgmIsRaised) {
      this.syncBgm();
      this.music[`${this.paceBgmName}-start`].fade(0, settings.settings.musicVolume / 100, 500);
      this.music[`${this.paceBgmName}-loop`].fade(0, settings.settings.musicVolume / 100, 500);
      this.paceBgmIsRaised = true;
    }
  }
  lowerPaceBgm() {
    if (!gameHandler.game.settings.hasPaceBgm) {
      return;
    }
    if (this.paceBgmIsRaised) {
      this.syncBgm();
      this.music[`${this.paceBgmName}-start`].fade(settings.settings.musicVolume / 100, 0, 500);
      this.music[`${this.paceBgmName}-loop`].fade(settings.settings.musicVolume / 100, 0, 500);
      this.paceBgmIsRaised = false;
    }
  }
  startSeLoop(name) {
    if (this.playingSeLoops[name] != null || this.noLoops) {
      return;
    }
    if (this.files.indexOf(name) !== -1) {
      this.sounds[name].loop(true);
      this.sounds[name].play();
      this.playingSeLoops[name] = true;
    }
  }
  stopSeLoop(name) {
    if (this.playingSeLoops[name] == null) {
      return;
    }
    if (this.files.indexOf(name) !== -1) {
      this.sounds[name].loop(false);
      this.sounds[name].volume(settings.settings.sfxVolume / 100);
      this.sounds[name].stop();
      delete this.fadedSounds[name];
      delete this.playingSeLoops[name];
    }
  }
  playSeQueue() {
    if (this.mustWait) {
      return;
    }
    for (let name of Object.keys(this.toPlay)) {
      if (this.files.indexOf(name) === -1 && name.substr(name.length - 4) === 'mini') {
        name = name.substring(0, name.length - 4);
      }
      if (this.files.indexOf(name) === -1 && name.substr(0, 4) === 'b2b_') {
        name = name.substr(4);
      }
      if (this.files.indexOf(name) === -1 && name.includes('tspin') && !name.includes('not4')) {
        name = name.replace('tspin', 'erase');
      }
      if (this.files.indexOf(name) !== -1) {
        if (this.cut.indexOf(name) !== -1) {
          this.sounds[name].stop();
        }
        if (name.substr(0, 5) === 'piece') {
          for (const flashTime of this.pieceFlashes[name.substr(5, 1)]) {
            setTimeout(() => {
              resetAnimation('#next-main', 'flash');
            }, flashTime);
          }
        }
        this.sounds[name].play();
      } else if (name === 'initialrotate' && this.files.indexOf('rotate') !== -1) {
        this.sounds['rotate'].play();
      } else if (name === 'initialhold' && this.files.indexOf('hold') !== -1) {
        this.sounds['hold'].play();
      } else if (name === 'initialskip' && this.files.indexOf('skip') !== -1) {
        this.sounds['skip'].play();
      } else if (name === 'initialskip' && this.files.indexOf('initialhold') !== -1) {
        this.sounds['initialhold'].play();
      } else if (name === 'prespinmini' && this.files.indexOf('prespin') !== -1) {
        this.sounds['prespin'].play();
      } else if (name === 'go' && this.files.indexOf('start') !== -1) {
        this.sounds['start'].play();
      } else if (name === 'skip' && this.files.indexOf('hold') !== -1 || name === 'initialskip' && this.files.indexOf('hold') !== -1 && this.files.indexOf('initialhold') === -1) {
        this.sounds['hold'].play();
      }

      if (name.substr(0, 3) === 'ren') {
        let number = parseInt(name.substr(3, name.length - 3));
        while (this.ren.indexOf(number) === -1) {
          if (number <= 0) {
            break;
          }
          number--;
        }
        if (number > 0) {
          this.sounds[`ren${number}`].play();
        }
      }
    }
    this.toPlay = {};
  }
  add(name) {
    this.toPlay[name] = true;
  }
}
const sound = new Sound();
export default sound;
