import {loadSoundbank, loadPiecebank} from './loaders.js';
import settings from './settings.js';
import gameHandler from './game/game-handler.js';
import {resetAnimation} from './shortcuts.js';
import {PIECES} from './consts.js';
class Sound {
  constructor() {
    this.sounds = [];
    this.vox = [];
    this.cut = [];
    this.music = {};
    this.toPlay = {};
    this.files = [];
    this.nextSounds = [];
    this.menuSounds = [];
    this.menuVox = [];
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
    this.lastNext = null;
    this.lastVoice = null;
    this.noLoops = false;
    this.playHardNoise = false;
    this.pieceFlashes = {};
    this.flashTimeouts = {};
    this.skipReadyGo = false;
  }
  updateVolumes() {
    for (const key of Object.keys(this.sounds)) {
      if (this.fadedSounds[key] != null) {
        this.sounds[key].volume(settings.settings.sfxVolume / 100 * 0.5);
        continue;
      }
      if (key.substr(0, 3) === 'vox') {
        this.sounds[key].volume(settings.settings.voiceVolume / 100);
      } else {
        this.sounds[key].volume(settings.settings.sfxVolume / 100);
      }
    }
    for (const key of Object.keys(this.menuSounds)) {
      this.menuSounds[key].volume(settings.settings.sfxVolume / 100);
    }
    for (const key of Object.keys(this.menuVox)) {
      this.menuVox[key].volume(settings.settings.voiceVolume / 100);
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
      'hardstart1', 'hardstart2', 'hardstart3', 'hardstart4', 'error'];
    for (const soundName of files) {
      this.menuSounds[soundName] = new Howl({
        src: [`./se/menu/${soundName}.ogg`],
        volume: settings.settings.sfxVolume / 100,
      });
    }
  }
  loadMenuVoice() {
    const files = ['menuguideline', 'menutetrax', 'menuretro', 'menuarcade', 'menucontrols',
      'menutuning', 'menuvideo', 'menuaudio'];
    for (const soundName of files) {
      this.menuVox[soundName] = new Howl({
        src: [`./vox/${settings.settings.voicebank}/${soundName}.ogg`],
        volume: settings.settings.voiceVolume / 100,
      });
    }
  }
  playMenuSe(name) {
    this.menuSounds[name].stop();
    this.menuSounds[name].play();
  }
  playMenuVox(name) {
    if (settings.settings.voicebank === 'off') {
      return;
    }
    this.menuVox[name].stop();
    this.menuVox[name].play();
  }
  load(name = 'standard') {
    for (const key of Object.keys(this.playingSeLoops)) {
      this.stopSeLoop(key);
    }
    this.noLoops = false;
    if (name === this.lastLoaded && settings.settings.nextSoundbank === this.lastNext && settings.settings.voicebank === this.lastVoice) {
      return;
    }
    this.mustWait = true;
    Howler.unload();
    this.loadMenu();
    this.loadMenuVoice();
    loadSoundbank(name)
        .then((soundData) => {
          this.skipReadyGo = (soundData.usesReadyGoVoices) ? true : false;
          if (this.skipReadyGo) {
            delete this.toPlay.ready;
            delete this.toPlay.go;
            delete this.toPlay.start;
          }
          this.lastLoaded = name;
          this.files = soundData.files;
          this.ren = soundData.ren;
          this.cut = (soundData.cutItself) ? soundData.cutItself : [];
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
          if (settings.settings.voicebank !== 'off') {
            for (const voxName of [
              'ready', 'start', 'go', 'erase2', 'erase3', 'erase4', 'b2b_erase4', 'tspin0', 'tspin1',
              'tspin2', 'tspin3', 'minitspin', 'b2b_tspin', 'perfectclear', 'ren1', 'ren2', 'ren3',
              'blockout', 'lockout', 'topout', 'timeup', 'excellent', 'gameover',
            ]) {
              this.files.push(`vox${voxName}`);
              this.sounds[`vox${voxName}`] = new Howl({
                src: [`./vox/${settings.settings.voicebank}/${voxName}.ogg`],
                volume: settings.settings.voiceVolume / 100,
              });
            }
          }
          this.mustWait = false;
          this.lastNext = settings.settings.nextSoundbank;
          this.lastVoice = settings.settings.voicebank;
          if (
            (soundData.nextSoundbank != null || settings.settings.nextSoundbank !== 'auto') && settings.settings.nextSoundbank !== 'off') {
            const name = (settings.settings.nextSoundbank !== 'auto') ? settings.settings.nextSoundbank : soundData.nextSoundbank;
            this.mustWait = true;
            for (const piece of Object.keys(PIECES)) {
              const soundName = `piece${piece}`;
              this.files.push(soundName);
              this.sounds[soundName] = new Howl({
                src: [`./se/piece/${name}/${soundName}.ogg`],
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
            loadPiecebank(name)
                .then((nextData) => {
                  this.pieceFlashes = (nextData.nextFlashes) ? nextData.nextFlashes : {};
                  this.mustWait = false;
                });
          }
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
    /*
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

    } */
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
    if (!gameHandler.game.settings.hasDangerBgm ||
      !this.music[`${this.dangerBgmName}-start`] ||
      !this.music[`${this.dangerBgmName}-loop`]) {
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
    if (!gameHandler.game.settings.hasDangerBgm ||
        !this.music[`${this.dangerBgmName}-start`] ||
        !this.music[`${this.dangerBgmName}-loop`]) {
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
    if (!gameHandler.game.settings.hasPaceBgm ||
      !this.music[`${this.paceBgmName}-start`] ||
      !this.music[`${this.paceBgmName}-loop`]) {
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
    if (!gameHandler.game.settings.hasPaceBgm ||
      !this.music[`${this.paceBgmName}-start`] ||
      !this.music[`${this.paceBgmName}-loop`]) {
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
  killVox() {
    for (const file of this.files) {
      if (file.substr(0, 3) === 'vox') {
        this.sounds[file].stop();
      }
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
