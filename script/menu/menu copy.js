import {loadMenu} from '../loaders.js';
import $ from '../shortcuts.js';
import gameHandler from '../game/game-handler.js';

class Menu {
  constructor() {
    this.current = {
      name: null,
      data: null,
      properties: null,
    };
    this.isEnabled = false;
    this.isLocked = false;
  }
  get selected() {
    return parseInt($('li.selected').id.substring(7));
  }
  get selectedData() {
    return this.current.data[this.selected];
  }
  get length() {
    return $('#vertical-menu li').length;
  }
  load(name, type = 'default') {
    this.isLocked = true;
    this.hideMenu();
    loadMenu(name)
        .then((menu) => {
          this.clear();
          this.current.name = name;
          this.current.data = menu.data;
          this.current.properties = menu.properties;
          switch (type) {
            case 'controls':
              this.drawControls();
              break;
            default:
              this.draw();
              break;
          }
          this.showMenu();
          this.isLocked = false;
          this.isEnabled = true;
        })
        .catch((error) => {
        // TODO error handling
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
    while ($('#vertical-menu').firstChild) {
      $('#vertical-menu').removeChild($('#vertical-menu').firstChild);
    }
  }
  draw() {
    // return;
    for (let i = 0; i < this.current.data.length; i++) {
      const currentData = this.current.data[i];
      const element = document.createElement('li');
      element.id = `option-${i}`;
      element.textContent = currentData.label;
      element.onmouseenter = () => {
        this.select(i);
      };
      element.onclick = () => {
        this.ok();
      };
      if (currentData.default) {
        element.classList.add('selected');
        $('#description-text').textContent = currentData.description;
      }
      $('#vertical-menu').appendChild(element);
    }
    const spaceRemianing = window.innerHeight - $('#vertical-menu').getBoundingClientRect().y;
    $('#vertical-menu').style.height = `${spaceRemianing - 80}px`;
  }
  drawControls() {
    for (let i = 0; i < this.current.data.length; i++) {
      const currentData = this.current.data[i];
      const element = document.createElement('li');
      // element.id = `option-${i}`;
      element.classList.add('control-name');
      element.textContent = currentData.label;
      // element.onmouseenter = () => {
      //   this.select(i);
      // };
      // element.onclick = () => {
      //   this.ok();
      // };
      $('#vertical-menu').appendChild(element);
    }
    const spaceRemianing = window.innerHeight - $('#vertical-menu').getBoundingClientRect().y;
    $('#vertical-menu').style.height = `${spaceRemianing - 80}px`;
    // this.select(0);
  }
  select(number) {
    for (const element of $('#vertical-menu li')) {
      element.classList.remove('selected');
    }
    $(`#option-${number}`).classList.add('selected');
    $('#description-text').textContent = this.current.data[number].description;
  }
  up() {
    if (!this.isLocked) {
      if (this.selected === 0) {
        this.select(this.length - 1);
      } else {
        this.select(this.selected - 1);
      }
    }
  }
  down() {
    if (!this.isLocked) {
      if (this.selected === this.length - 1) {
        this.select(0);
      } else {
        this.select(this.selected + 1);
      }
    }
  }
  ok() {
    if (!this.isLocked) {
      switch (this.selectedData.action) {
        case 'submenu':
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
        case 'controls':
          this.load('controls', 'controls');
          break;
        default:
          // TODO wtf error
          break;
      }
    }
  }
  back() {
    if (!this.isLocked) {
      if (this.current.properties.parent !== null) {
        this.load(this.current.properties.parent);
      }
    }
  }
}
const menu = new Menu();
export default menu;
