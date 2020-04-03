import {loadMenu} from '../loaders.js';
import $, {negativeMod} from '../shortcuts.js';
import gameHandler from '../game/game-handler.js';
import settings from '../settings.js';
import input from '../input.js';
import locale from '../lang.js';
const isSelectable = (type) => {
  if (
    type == null ||
    type == 'control' ||
    type == 'setting' ||
    type == 'slider' ||
    type == 'toggle' ||
    type == 'select'
  ) {
    return true;
  }
  return false;
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
    this.isLocked = false;
    this.lastSelection = 0;
    this.useLastSelected = false;
  }
  get selected() {
    return parseInt($('#menu > div.selected').id.substring(7));
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
  load(name, type = 'default') {
    this.isLocked = true;
    this.hideMenu();
    loadMenu(name)
        .then((menu) => {
          this.clear();
          this.current.name = name;
          this.current.properties = menu.properties;
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
          }
          if (this.current.properties.game) {
            const game = {
              'string': 'startLabel',
              'stringDesc': 'startDescription',
              'langOverride': 'mode-options',
              'action': 'game',
              'game': this.current.properties.game,
            };
            this.current.data.push(game);
          }
          switch (type) {
            case 'controls':
              this.drawControls();
              break;
            default:
              this.draw();
              break;
          }
          this.showMenu();
          if (this.useLastSelected) {
            this.select(this.lastSelection);
            this.useLastSelected = false;
          }
          this.isLocked = false;
          this.isEnabled = true;
        })
        .catch((error) => {
          throw error;
        });
  }
  close() {
    this.isLocked = true;
    this.isEnabled = false;
    this.hide();
  }
  open() {
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
    $('#vertical-menu').classList.remove('hidden');
  }
  hideMenu() {
    $('#vertical-menu').classList.add('hidden');
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
      let element = document.createElement('div');
      const sub = document.createElement('div');
      switch (currentData.type) {
        case 'overline':
          element = document.createElement('header');
          element.classList.add('overline');
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
        label.textContent = locale.getString(this.current.lang, currentData.string);
        label.classList.add('setting-text');
        const arrowLeft = document.createElement('div');
        const arrowRight = document.createElement('div');
        createArrowElement(arrowLeft, '<', 'arrow-left');
        createArrowElement(arrowRight, '>', 'arrow-right');
        const adjust = (modValue) => {
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
        element.appendChild(label);
        element.appendChild(arrowLeft);
        element.appendChild(value);
        element.appendChild(arrowRight);
      } else {
        if (currentData.langOverride) {
          element.textContent = locale.getString(currentData.langOverride, currentData.string);
        } else {
          if (!currentData.fixedText) {
            element.textContent = locale.getString(this.current.lang, currentData.string);
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
        if (!currentData.fixedText) {
          $('#description').textContent = locale.getString(this.current.lang, currentData.stringDesc);
        } else {
          $('#description').textContent = currentData.description;
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
              label = locale.getString(this.current.lang, valueData.string, valueData.replace);
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
        this.selectedControl.classList.remove('selected');
        element.classList.add('selected');
      };
      element.textContent = `+`;
      currentControlElement.appendChild(element);
    }
  }
  select(number, mouseOver = false) {
    for (const element of $('#menu > div')) {
      element.classList.remove('selected');
    }
    $(`#option-${number}`).classList.add('selected');
    if (!mouseOver) {
      $(`#option-${number}`).scrollIntoView({block: 'center', behavior: 'smooth'});
    }
    if (this.current.data[number].langOverride) {
      $('#description').textContent = locale.getString(this.current.data[number].langOverride, this.current.data[number].stringDesc);
    } else {
      if (!this.current.data[number].fixedText) {
        $('#description').textContent = locale.getString(this.current.lang, this.current.data[number].stringDesc);
      } else {
        $('#description').textContent = this.current.data[number].description;
      }
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
    if (this.selectedData.type === 'control' && input.mouseLimit > 0) {
      return;
    }
    if (this.isLocked) {
      return;
    }
    if (this.selectedData.disabled) {
      return;
    }
    switch (this.selectedData.action) {
      case 'submenu':
        this.lastSelection = this.selected;
        this.load(this.selectedData.submenu);
        break;
      case 'back':
        this.back();
        break;
      case 'quick':
        gameHandler.newGame('marathon');
        break;
      case 'game':
        gameHandler.newGame(this.selectedData.game);
        break;
      case 'control':
        this.selectedControl.onclick();
        break;
      case 'toggle':
        const sel = this.selectedData;
        const value = (sel.settingType === 'game') ?
          !settings.game[sel.gameName][sel.setting] : !settings.settings[sel.setting];
        settings.changeSetting(sel.setting, value,
          (sel.settingType === 'game') ? sel.gameName : undefined);
        this.drawSettings();
        break;
      case 'slider':
        $('.slider-container.selected .value').onclick();
        break;
      case 'controls':
        this.load('controls', 'controls');
        break;
      case 'daspreset':
        settings.changeSetting('DAS', this.selectedData.delay);
        settings.changeSetting('ARR', this.selectedData.rate);
        this.back();
        break;
      case 'functionClearControls':
        for (const key of Object.keys(settings.controls)) {
          settings.controls[key] = [];
        }
        menu.drawControls();
        settings.saveControls();
        break;
      case 'functionResetControls':
        settings.resetControls();
        menu.drawControls();
        settings.saveControls();
        break;
      case 'lang':
        locale.changeLang(this.selectedData.lang);
        this.back();
        break;
      case 'link':
        window.open(this.selectedData.url, '_blank');
        break;
      default:
        // TODO wtf error
        break;
    }
  }
  back() {
    if (!this.isLocked) {
      if (this.current.properties.parent !== null) {
        this.useLastSelected = true;
        this.load(this.current.properties.parent);
      }
    }
  }
}
const menu = new Menu();
export default menu;
