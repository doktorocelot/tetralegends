import {loadSoundbank} from './loaders.js';
import settings from './settings.js';
import gameHandler from './game/game-handler.js';
class Sound {
  constructor() {
    this.sounds = [];
    this.music = {};
    this.toPlay = {};
    this.files = [];
    this.playingSeLoops = {};
    this.amountOfTimesEnded = {};
    this.fadedSounds = {};
    this.mustWait = false;
    this.bgmName = null;
    this.dangerBgmName = null;
    this.dangerBgmIsRaised = false;
    this.paceBgmName = null;
    this.paceBgmIsRaised = false;
  }
  updateVolumes() {
    for (const key of Object.keys(this.sounds)) {
      if (this.fadedSounds[key] != null) {
        this.sounds[key].volume(settings.settings.sfxVolume / 100 * 0.5);
        continue;
      }
      this.sounds[key].volume(settings.settings.sfxVolume / 100);
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
  load(name = 'standard') {
    this.mustWait = true;
    loadSoundbank(name)
        .then((soundData) => {
          this.files = soundData.files;
          this.ren = soundData.ren;
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
    this.music[`${type}-${name}-start`] = new Howl({
      src: [`./bgm/${type}/${name}-start.ogg`],
      volume: settings.settings.musicVolume / 100,
      onend: () => {
        this.music[`${type}-${name}-loop`].play();
      },
    });
    this.music[`${type}-${name}-loop`] = new Howl({
      src: [`./bgm/${type}/${name}-loop.ogg`],
      volume: settings.settings.musicVolume / 100,
      loop: true,
      onplay: () => {
        this.syncBgm();
      },
    });
    if (gameHandler.game.settings.hasDangerBgm) {
      this.dangerBgmIsRaised = false;
      this.music[`${type}-${name}-danger-start`] = new Howl({
        src: [`./bgm/${type}/${name}-danger-start.ogg`],
        volume: 0,
        onend: () => {
          this.music[`${type}-${name}-danger-loop`].play();
        },
      });
      this.music[`${type}-${name}-danger-loop`] = new Howl({
        src: [`./bgm/${type}/${name}-danger-loop.ogg`],
        volume: 0,
        loop: true,
      });
    }
    if (gameHandler.game.settings.hasPaceBgm) {
      this.paceBgmIsRaised = false;
      this.music[`${type}-${name}-pace-start`] = new Howl({
        src: [`./bgm/${type}/${name}-pace-start.ogg`],
        volume: 0,
        onend: () => {
          this.music[`${type}-${name}-pace-loop`].play();
        },
      });
      this.music[`${type}-${name}-pace-loop`] = new Howl({
        src: [`./bgm/${type}/${name}-pace-loop.ogg`],
        volume: 0,
        loop: true,
      });
    }
  }
  syncBgm() {
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
      this.music[`${type}-${name}-danger-start`].play();
    }
    if (gameHandler.game.settings.hasPaceBgm) {
      this.music[`${type}-${name}-pace-start`].play();
    }
  }
  killBgm() {
    for (const name of Object.keys(this.music)) {
      this.music[name].stop();
    }
  }
  raiseDangerBgm() {
    if (!gameHandler.game.settings.hasDangerBgm) {
      return;
    }
    if (!this.dangerBgmIsRaised) {
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
      this.music[`${this.paceBgmName}-start`].fade(settings.settings.musicVolume / 100, 0, 500);
      this.music[`${this.paceBgmName}-loop`].fade(settings.settings.musicVolume / 100, 0, 500);
      this.paceBgmIsRaised = false;
    }
  }
  startSeLoop(name) {
    if (this.playingSeLoops[name] != null) {
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
    for (const name of Object.keys(this.toPlay)) {
      if (this.files.indexOf(name) !== -1) {
        this.sounds[name].play();
      } else if (name === 'initialrotate' && this.files.indexOf('rotate') !== -1) {
        this.sounds['rotate'].play();
      } else if (name === 'initialhold' && this.files.indexOf('hold') !== -1) {
        this.sounds['hold'].play();
      } else if (name === 'prespinmini' && this.files.indexOf('prespin') !== -1) {
        this.sounds['prespin'].play();
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
