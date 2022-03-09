import {loadMenu} from '../loaders.js';
import $, {negativeMod} from '../shortcuts.js';
import gameHandler from '../game/game-handler.js';
import settings from '../settings.js';
import input from '../input.js';
import locale from '../lang.js';
import sound from '../sound.js';
const isSelectable = (type) => {
  return type == null ||
    type == 'control' ||
    type == 'setting' ||
    type == 'slider' ||
    type == 'toggle' ||
    type == 'select';

};
const getKey = (event) => {
  if (event.code === 'Backspace') {
    return;
  }
  settings.addControl(menu.waitingKey, event.code);
  menu.isLocked = false;
  $('#key-popup').classList.add('hidden');
  document.removeEventListener('keydown', getKey);
};
class Menu {
  constructor() {
    this.current = {
      name: null,
      lang: null,
      data: null,
      properties: null,
    };
    this.isEnabled = false;
    this.isLocked = true;
    this.lastSelection = [];
    this.useLastSelected = false;
    this.stored = {};
  }
  get selected() {
    try {
      return parseInt($('#menu > div.selected').id.substring(7));
    } catch (e) {
      return 0;
    }
  }
  get selectedData() {
    return this.current.data[this.selected];
  }
  get length() {
    return $('#menu > div').length;
  }
  get selectedControl() {
    return ($('#menu > .control.selected > .control-bay > .set-control.selected'));
  }
  load(name, type = 'default', menuData = null) {
    this.isLocked = true;
    this.hideMenu();
    const render = (menu) => {
      this.current.name = name;
      this.current.properties = menu.properties;
      if (menu.properties.parentSecret) {
        this.skipSecretA = true;
      }
      if (
        (gameHandler.game.isDead || gameHandler.game.isOver || gameHandler.game.isDead == null)
        && !this.skipMusicChange
      ) {
        if (this.current.properties.pgmusic) {
          if (sound.bgmName !== `menu-${this.current.properties.pgmusic}`) {
            sound.killBgm();
            sound.loadBgm([this.current.properties.pgmusic], 'menu');
            sound.playBgm([this.current.properties.pgmusic], 'menu');
          }
        } else {
          if (sound.bgmName !== 'menu-menu') {
            sound.loadBgm(['menu'], 'menu');
            sound.playBgm(['menu'], 'menu');
          }
        }
      }
      this.current.lang = (this.current.properties.langOverride) ?
        this.current.properties.langOverride : `menu_${this.current.name}`;
      this.current.data = menu.data;
      if (this.current.properties.parent) {
        const back = {
          'string': 'backLabel',
          'stringDesc': 'backDescription',
          'langOverride': 'menu_general',
          'action': 'back',
        };
        this.current.data.unshift(back);
      } else {
        if (sound.lastVoice !== settings.settings.voicebank) {
          sound.loadMenuVoice();
        }
      }
      if (this.current.properties.game) {
        const game = {
          'string': 'startLabel',
          'default': true,
          'stringDesc': 'startDescription',
          'langOverride': 'mode-options',
          'action': 'game',
          'game': this.current.properties.game,
        };
        this.current.data.push(game);
      }
      setTimeout(() => {
        this.clear();
        switch (type) {
        case 'controls':
          this.drawControls();
          break;
        default:
          this.draw();
          break;
        }
        this.showMenu();
        if (this.current.properties.vox && !this.useLastSelected) {
          sound.playMenuVox(this.current.properties.vox);
        }
        if (!gameHandler.game.isVisible) {
          this.isEnabled = true;
          this.isLocked = false;
        }
        if (this.useLastSelected) {
          this.select(this.lastSelection[this.lastSelection.length - 1], false, false, true);
          this.lastSelection.pop()
          this.useLastSelected = false;
        }
      }, 500);
    };
    if (menuData != null) {
      render(JSON.parse(JSON.stringify(menuData)));
      return;
    }
    if (this.stored[name]) {
      render(JSON.parse(JSON.stringify(this.stored[name])));
      return;
    }
    loadMenu(name)
        .then((menu) => {
          this.stored[name] = JSON.parse(JSON.stringify(menu));
          render(menu);
        })
        .catch(function(err) {setTimeout(() => {throw err;});});
  }
  close() {
    this.isLocked = true;
    this.isEnabled = false;
    this.hide();
  }
  open() {
    $('#lights-warning').classList.add('hidden')
    if (gameHandler.game.isOver) {
      gameHandler.game.settings = {
        ...gameHandler.game.settings,
        hasDangerBgm: false,
        hasPaceBgm: false,
      };
      if (this.current.properties.pgmusic) {
        sound.killBgm();
        sound.loadBgm([this.current.properties.pgmusic], 'menu');
        sound.playBgm([this.current.properties.pgmusic], 'menu');
      } else {
        if (sound.bgmName !== 'menu-menu') {
          sound.loadBgm(['menu'], 'menu');
          sound.playBgm(['menu'], 'menu');
        }
      }
    }
    this.isLocked = false;
    this.isEnabled = true;
    this.show();
  }
  show() {
    $('#menu-container').classList.remove('hidden');
  }
  hide() {
    $('#menu-container').classList.add('hidden');
  }
  showMenu() {
    $('#menu').classList.remove('hidden');
  }
  hideMenu() {
    $('#menu').classList.add('hidden');
  }
  clear() {
    while ($('#menu').firstChild) {
      $('#menu').removeChild($('#menu').firstChild);
    }
  }
  draw() {
    let nonOptions = 0;
    for (let i = 0; i < this.current.data.length; i++) {
      const currentData = this.current.data[i];
      if ((currentData.secretA && !input.holdingCtrl) && !this.skipSecretA) { // For those who are looking through my code, this is how you can access a secret game.
        continue;
      } else if (currentData.secretA) {
        this.skipSecretA = false;
      }
      let element = document.createElement('div');
      const sub = document.createElement('div');
      switch (currentData.type) {
        case 'overline':
          element = document.createElement('header');
          element.classList.add('overline');
          break;
        case 'header':
          element = document.createElement('header');
          element.classList.add('header');
          break;
        case 'description':
          element = document.createElement('header');
          element.classList.add('description');
          break;
        case 'social':
          element = document.createElement('a');
          element.classList.add('third-width');
          element.classList.add('social');
          break;
        case 'slider':
          element = document.createElement('div');
          element.classList.add('slider-container');
          sub.innerHTML =
            `<div id=${currentData.settingType}-${currentData.setting}-value></div>`;
          break;
        case 'toggle':
          element = document.createElement('div');
          element.classList.add('toggle-container');
          break;
        case 'select':
          element = document.createElement('div');
          element.classList.add('select-container');
          break;
        case 'control':
          element = document.createElement('div');
          element.classList.add('control');
          sub.classList.add('control-bay');
          sub.id = `control-${currentData.control}`;
          sub.innerHTML =
`<div class='set-control'>ArrowUp ✕ </div><div class='set-control'>ArrowUp ✕ </div><div class='set-control'>+</div>`;
          break;
        default:
          element = document.createElement('div');
          element.classList.add('btn');
          if (currentData.isShort) {
            element.classList.add('short');
          }
          switch (currentData.width) {
            case 'half':
              element.classList.add('half-width');
              break;
            case 'third':
              element.classList.add('third-width');
              break;
            default:
              element.classList.add('full-width');
              break;
          }
          break;
      }
      if (isSelectable(currentData.type)) {
        const index = i - nonOptions;
        element.id = `option-${index}`;
        element.onmousemove = () => {
          if (this.isLocked || input.mouseLimit < 1) {
            return;
          }
          this.select(index, true);
        };
        element.onclick = () => {
          this.ok();
        };
      } else {
        nonOptions++;
      }

      if (currentData.type === 'control') {
        const label = document.createElement('div');
        label.textContent = locale.getString(this.current.lang, currentData.string);
        label.classList.add('label');
        element.appendChild(label);
        element.appendChild(sub);
      } else if (currentData.type === 'slider') {
        element.onclick = () => {};
        const label = document.createElement('div');
        label.textContent = locale.getString(this.current.lang, currentData.string);
        label.classList.add('setting-text');
        const value = document.createElement('div');
        value.id = `${currentData.settingType}-${currentData.setting}-value`;
        value.classList.add('value');
        value.onclick = () => {
          const newValue = prompt('Enter the desired value:'); // TODO turn into translation string
          if (isNaN(newValue) || newValue == null) {
            return;
          }
          const sel = currentData;
          settings.changeSetting(currentData.setting, Math.min(Math.max(currentData.min, newValue), currentData.max),
            (sel.settingType === 'game') ? sel.gameName : undefined);
          this.drawSettings();
        };
        const slider = document.createElement('input');
        slider.setAttribute('settingtype', 'slider');
        slider.type = 'range';
        slider.min = currentData.min;
        slider.value = currentData.min;
        slider.max = currentData.max;
        slider.classList.add('slider');
        slider.id = `${currentData.settingType}-${currentData.setting}`;
        slider.setAttribute('gamename', currentData.gameName);
        slider.oninput = () => {
          const sel = currentData;
          settings.changeSetting(sel.setting, slider.value,
            (sel.settingType === 'game') ? sel.gameName : undefined);
          this.drawSettings();
        };
        slider.onchange = () => {
          sound.playMenuSe('change');
        };
        element.appendChild(label);
        element.appendChild(slider);
        element.appendChild(value);
      } else if (currentData.type === 'toggle') {
        const label = document.createElement('div');
        label.textContent = locale.getString(this.current.lang, currentData.string);
        label.classList.add('setting-text');
        const bubble = document.createElement('div');
        bubble.classList.add('bubble');
        bubble.id = `${currentData.settingType}-${currentData.setting}`;
        bubble.setAttribute('gamename', currentData.gameName);
        bubble.setAttribute('settingtype', 'toggle');
        const value = document.createElement('div');
        value.classList.add('value-name');
        value.id = `${currentData.settingType}-${currentData.setting}-value`;
        element.appendChild(label);
        element.appendChild(bubble);
        element.appendChild(value);
      } else if (currentData.type === 'select') {
        const label = document.createElement('div');
        const createArrowElement = (passedElement, text, className) => {
          passedElement.classList.add('arrow');
          passedElement.classList.add(className);
          passedElement.textContent = text;
        };
        if (!currentData.fixedText) {
          label.textContent = locale.getString(this.current.lang, currentData.string);
        } else {
          label.textContent = currentData.label;
        }
        label.classList.add('setting-text');

        const arrowLeft = document.createElement('div');
        const arrowRight = document.createElement('div');
        createArrowElement(arrowLeft, '<', 'arrow-left');
        createArrowElement(arrowRight, '>', 'arrow-right');
        const adjust = (modValue) => {
          sound.playMenuSe('change');
          const sel = currentData;
          const value = (sel.settingType === 'game') ?
            settings.game[sel.gameName][sel.setting] : settings.settings[sel.setting];
          let index = 0;
          for (index = 0; index < sel.selectOptions.length; index++) {
            const selectData = sel.selectOptions[index];
            if (selectData.value === value) {
              break;
            }
          }
          const newValue = sel.selectOptions[negativeMod(index + modValue, sel.selectOptions.length)].value;
          settings.changeSetting(sel.setting, newValue,
            (sel.settingType === 'game') ? sel.gameName : undefined);
          this.drawSettings();
        };
        arrowLeft.onclick = () => {
          adjust(-1);
        };
        arrowRight.onclick = () => {
          adjust(1);
        };
        const value = document.createElement('div');
        value.classList.add('value-name');
        value.id = `${currentData.settingType}-${currentData.setting}`;
        value.setAttribute('gamename', currentData.gameName);
        value.setAttribute('settingtype', 'select');
        value.classList.add('value');
        value.onclick = () => {
          sound.playMenuSe('select');
          $(`#option-${this.selected}`).classList.add('chosen');
          this.skipMusicChange = true
          this.lastSelection.push(this.selected)
          const newData = {};
          newData.properties = {
            parent: this.current.name,
          };
          if (this.current.lang) {
            newData.properties.langOverride = this.current.lang;
          }
          newData.data = [];
          const currentSelectionType = (this.selectedData.settingType === 'game') ? 'game' : 'settings';
          const selectedSetting = (currentSelectionType === 'game') ?
            settings[currentSelectionType][this.selectedData.gameName][this.selectedData.setting] :
            settings[currentSelectionType][this.selectedData.setting];
          for (const selectData of this.selectedData.selectOptions) {
            const menuButton = JSON.parse(JSON.stringify(selectData));
            if (selectData.value === selectedSetting) {
              menuButton.default = true;
            }
            menuButton.isShort = true;
            menuButton.omitDescription = true;
            menuButton.action = 'settingChange';
            menuButton.setting = this.selectedData.setting;
            menuButton.settingType = this.selectedData.settingType;
            menuButton.gameName = this.selectedData.gameName;
            newData.data.push(menuButton);
          }
          menu.load('selectTemp', 'default', newData);
        };
        element.onclick = () => {};
        element.appendChild(label);
        element.appendChild(arrowLeft);
        element.appendChild(value);
        element.appendChild(arrowRight);
      } else {
        if (currentData.langOverride) {
          element.textContent = locale.getString(currentData.langOverride, currentData.string, currentData.replace);
        } else {
          if (!currentData.fixedText) {
            element.textContent = locale.getString(this.current.lang, currentData.string, currentData.replace);
          } else {
            element.textContent = currentData.label;
          }
        }
      }
      if (currentData.useIcon) {
        element.classList.add('icon');
      }
      if (currentData.disabled) {
        element.classList.add('disabled');
      }
      $('#menu').appendChild(element);
      if (currentData.default) {
        element.classList.add('selected');
        element.scrollIntoView({block: 'center'});
        if (!currentData.omitDescription) {
          if (!currentData.fixedText) {
            $('#description').textContent = locale.getString(this.current.lang, currentData.stringDesc);
          } else {
            $('#description').textContent = currentData.description;
          }
        } else {
          $('#description').textContent = '';
        }
      }
    }
    const newData = [];
    for (const data of this.current.data) {
      if (isSelectable(data.type)) {
        newData.push(data);
      }
    }
    this.current.data = [...newData];
    if (this.current.name === 'controls') {
      this.drawControls();
    }
    this.drawSettings();
  }
  listenForNewKey() {
    this.isLocked = true;
    document.addEventListener('keydown', getKey);
  }
  drawSettings() {
    const drawElement = (element, key, gameName) => {
      if (element != null) {
        const settingValue = (gameName) ? settings.game[gameName][key] : settings.settings[key];
        const valueSelector = `#${(gameName) ? 'game' : 'setting'}-${key}-value`;
        switch (element.getAttribute('settingtype')) {
          case 'slider':
            element.value = settingValue;
            $(valueSelector).innerHTML = element.value;
            break;
          case 'toggle':
            if (settingValue === true) {
              element.classList.add('enabled');
              $(valueSelector).textContent = locale.getString('menu_general', 'enabled');
            } else {
              element.classList.remove('enabled');
              $(valueSelector).textContent = locale.getString('menu_general', 'disabled');
            }
            break;
          case 'select':
            let selectData = null;
            for (const data of this.current.data) {
              if (data.selectOptions && data.setting === key) {
                selectData = data.selectOptions;
                break;
              }
            }
            let valueData = null;
            for (const currentSelectData of selectData) {
              if (currentSelectData.value === settingValue) {
                valueData = currentSelectData;
                break;
              }
            }
            let label = null;
            if (valueData.fixedText) {
              label = valueData.label;
            } else {
              const lang = (valueData.langOverride) ? valueData.langOverride : this.current.lang;
              label = locale.getString(lang, valueData.string, valueData.replace);
            }
            element.textContent = label;
            break;
        }
      }
    };
    for (const key of Object.keys(settings.settings)) {
      const element = $(`#setting-${key}`);
      drawElement(element, key);
    }
    for (const gameName of Object.keys(settings.game)) {
      for (const key of Object.keys(settings.game[gameName])) {
        const element = $(`#game-${key}[gamename="${gameName}"]`);
        drawElement(element, key, gameName);
      }
    }
  }
  drawControls() {
    const duplicates = settings.getConflictingControlNames();
    for (const key of Object.keys(settings.controls)) {
      const array = settings.controls[key];
      const currentControlElement = $(`#control-${key}`);
      currentControlElement.innerHTML = '';
      let i = 0;
      for (const item of array) {
        const element = document.createElement('div');
        element.classList.add('set-control');
        if (i === 0) {
          element.classList.add('selected');
        }
        if (duplicates.indexOf(item) !== -1) {
          element.classList.add('conflict');
        }
        element.textContent = `${item} ×`;
        element.setAttribute('parent', key);
        element.setAttribute('control', item);
        element.onclick = () => {
          settings.removeControl(element.getAttribute('parent'), element.getAttribute('control'));
          this.drawControls();
        };
        element.onmouseenter = () => {
          if (input.mouseLimit < 1) {
            return;
          }
          if (!element.parentElement.parentElement.classList.contains('selected')) {
            return
          }
          if (!element.classList.contains('selected')) {
            sound.playMenuSe('move');
          }
          this.selectedControl.classList.remove('selected');
          element.classList.add('selected');
        };
        currentControlElement.appendChild(element);
        i++;
      }
      const element = document.createElement('div');
      element.classList.add('set-control');
      if (i === 0) {
        element.classList.add('selected');
      }
      element.setAttribute('parent', key);
      element.setAttribute('control', 'addNew');
      element.onclick = () => {
        this.waitingKey = element.getAttribute('parent');
        $('#key-popup').classList.remove('hidden');
        $('#key-popup .header').textContent = locale.getString('menu_controls', 'configPopupHeader');
        $('#key-popup .body').textContent = locale.getString('menu_controls', 'configPopupDescription');
        this.listenForNewKey();
      };
      element.onmouseenter = () => {
        if (input.mouseLimit < 1) {
          return;
        }
        if (!element.classList.contains('selected')) {
          sound.playMenuSe('move');
        }
        if (!element.parentElement.parentElement.classList.contains('selected')) {
          return
        }
        this.selectedControl.classList.remove('selected');
        element.classList.add('selected');
      };
      element.textContent = `+`;
      currentControlElement.appendChild(element);
    }
  }
  select(number, mouseOver = false, playSound = true, noScrollAnimation = false) {
    if (number !== this.selected && playSound) {
      sound.playMenuSe('move');
    }
    for (const element of $('#menu > div')) {
      element.classList.remove('selected');
    }
    $(`#option-${number}`).classList.add('selected');
    if (!mouseOver) {
      $(`#option-${number}`).scrollIntoView({block: 'center', behavior: (noScrollAnimation) ? 'auto' : 'smooth'});
    }
    if (!this.current.data[number].omitDescription) {
      if (this.current.data[number].langOverride) {
        $('#description').textContent = locale.getString(this.current.data[number].langOverride, this.current.data[number].stringDesc);
      } else {
        if (!this.current.data[number].fixedText) {
          $('#description').textContent = locale.getString(this.current.lang, this.current.data[number].stringDesc);
        } else {
          $('#description').textContent = this.current.data[number].description;
        }
      }
    } else {
      $('#description').textContent = '';
    }
  }
  up() {
    if (this.isLocked) {
      return;
    }
    let modifier = 0;
    if (
      this.selectedData.width === 'half' &&
        this.current.data[negativeMod((this.selected - 1), this.length)].width === 'half'
    ) {
      modifier = 1;
    }
    this.select(negativeMod((this.selected - 1 - modifier), this.length));
  }
  down() {
    if (this.isLocked) {
      return;
    }
    let modifier = 0;
    if (
      this.selectedData.width === 'half' &&
        this.current.data[negativeMod((this.selected + 1), this.length)].width === 'half'
    ) {
      modifier = 1;
    }
    this.select(negativeMod((this.selected + 1 + modifier), this.length));
  }
  right() {
    if (this.isLocked) {
      return;
    }
    if (this.selectedData.type === 'control') {
      sound.playMenuSe('move');
      const next = this.selectedControl.nextSibling;
      this.selectedControl.classList.remove('selected');
      if (next == null) {
        $('#menu > .control.selected > .control-bay').firstChild.classList.add('selected');
        return;
      }
      next.classList.add('selected');
      return;
    }
    if (this.selectedData.type === 'slider') {
      const slider = $('#menu > .slider-container.selected .slider');
      slider.value = parseInt(slider.value) + this.selectedData.discrete;
      slider.oninput();
      sound.playMenuSe('change');
      return;
    }
    if (this.selectedData.type === 'toggle') {
      settings.changeSetting(this.selectedData.setting, true);
      this.drawSettings();
      return;
    }
    if (this.selectedData.type === 'select') {
      $('#menu > .select-container.selected .arrow-right').onclick();
      return;
    }
    this.select(negativeMod((this.selected + 1), this.length));
  }
  left() {
    if (this.isLocked) {
      return;
    }
    if (this.selectedData.type === 'control') {
      const prev = this.selectedControl.previousElementSibling;
      this.selectedControl.classList.remove('selected');
      sound.playMenuSe('move');
      if (prev == null) {
        $('#menu > .control.selected > .control-bay').lastChild.classList.add('selected');
        return;
      }
      prev.classList.add('selected');
      return;
    }
    if (this.selectedData.type === 'slider') {
      const slider = $('#menu > .slider-container.selected .slider');
      slider.value = parseInt(slider.value) - this.selectedData.discrete;
      slider.oninput();
      sound.playMenuSe('change');
      return;
    }
    if (this.selectedData.type === 'toggle') {
      settings.changeSetting(this.selectedData.setting, false);
      this.drawSettings();
      return;
    }
    if (this.selectedData.type === 'select') {
      $('#menu > .select-container.selected .arrow-left').onclick();
      return;
    }
    this.select(negativeMod((this.selected - 1), this.length));
  }

  ok() {
    if (this.isLocked) {
      return;
    }
    if (this.selectedData.type === 'control' && input.mouseLimit > 0) {
      return;
    }
    if (this.selectedData.disabled) {
      return;
    }
    switch (this.selectedData.action) {
      case 'submenu':
        $(`#option-${this.selected}`).classList.add('chosen');
        this.lastSelection.push(this.selected)
        this.load(this.selectedData.submenu);
        sound.playMenuSe('select');
        break;
      case 'back':
        this.back();
        break;
      case 'quick':
        $(`#option-${this.selected}`).classList.add('chosen');
        sound.killBgm()
        this.isLocked = true;
        this.hideMenu();
        sound.playMenuSe('select');
        $('#menu').classList.add('slow')
        setTimeout(() => {
          gameHandler.newGame('marathon');
          $(`#option-${this.selected}`).classList.remove('chosen');
          this.showMenu();
          $('#menu').classList.remove('slow')
        }, 1000)
        break;
      case 'game':
        sound.killBgm()
        $(`#option-${this.selected}`).classList.add('chosen');
        this.isLocked = true;
        this.hideMenu();
        $('#menu').classList.add('slow')
        sound.playMenuSe('select');
        setTimeout(() => {
          gameHandler.newGame(this.selectedData.game);
          $(`#option-${this.selected}`).classList.remove('chosen');
          $('#menu').classList.remove('slow')
          this.showMenu();
        }, 1000)
        break;
      case 'control':
        this.selectedControl.onclick();
        sound.playMenuSe('select');
        break;
      case 'toggle':
        const sel = this.selectedData;
        sound.playMenuSe('change');
        const value = (sel.settingType === 'game') ?
          !settings.game[sel.gameName][sel.setting] : !settings.settings[sel.setting];
        settings.changeSetting(sel.setting, value,
          (sel.settingType === 'game') ? sel.gameName : undefined);
        this.drawSettings();
        break;
      case 'select':

        $('.select-container.selected .value-name').onclick();
        break;
      case 'settingChange':
        $(`#option-${this.selected}`).classList.add('chosen');
        const game = (this.selectedData.settingType === 'game') ? this.selectedData.gameName : false;
        settings.changeSetting(this.selectedData.setting, this.selectedData.value, game);
        sound.playMenuSe('optionselect');
        this.back(false);
        break;
      case 'slider':
        sound.playMenuSe('change');
        $('.slider-container.selected .value').onclick();
        break;
      case 'controls':
        sound.playMenuSe('select');
        this.load('controls', 'controls');
        break;
      case 'daspreset':
        $(`#option-${this.selected}`).classList.add('chosen');
        sound.playMenuSe('optionselect');
        settings.changeSetting('DAS', this.selectedData.delay);
        settings.changeSetting('ARR', this.selectedData.rate);
        this.back(false);
        break;
      case 'functionClearControls':
        sound.playMenuSe('optionselect');
        for (const key of Object.keys(settings.controls)) {
          settings.controls[key] = [];
        }
        menu.drawControls();
        settings.saveControls();
        break;
      case 'functionResetControls':
        sound.playMenuSe('optionselect');
        settings.resetControls();
        menu.drawControls();
        settings.saveControls();
        break;
      case 'functionResetColors':
        sound.playMenuSe('optionselect');
        for (const pieceName of ['I', 'J', 'L', 'O', 'S', 'T', 'Z']) {
          settings.changeSetting(`color${pieceName}`, 'auto');
        }
        menu.drawSettings();
        break;
      case 'lang':
        $(`#option-${this.selected}`).classList.add('chosen');
        sound.playMenuSe('optionselect');
        this.hideMenu();
        this.isLocked = true;
        const lang = this.selectedData.lang.toString();
        locale.loadLang(lang)
            .then(() => {
              this.isLocked = false;
              locale.changeLang(lang);
              this.back(false);
            });
        break;
      case 'link':
        window.open(this.selectedData.url, '_blank');
        break;
      default:
        // TODO wtf error
        break;
    }
  }
  back(playSound = true) {
    if (!this.isLocked) {
      if (this.current.properties.parent !== null) {
        if (playSound) {
          this.select(0, false, false, true)
          $(`#option-${this.selected}`).classList.add('chosen');
        }
        if (playSound) {
          sound.playMenuSe('back');
        }
        this.useLastSelected = true;
        this.skipMusicChange = false;
        this.load(this.current.properties.parent);
      }
    }
  }
}
const menu = new Menu();
export default menu;
