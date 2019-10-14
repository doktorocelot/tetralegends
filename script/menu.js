import {loadMenu} from './loaders.js';
import $ from './shortcuts.js';

export default class Menu {
  constructor() {
    this.current = {
      name: null,
      data: null,
      properties: null,
    };
    this.enabled = false;
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
  load(name, selection = 'default') {
    this.hideMenu();
    loadMenu(name)
        .then((menu) => {
          this.clear();
          this.current.name = name;
          this.current.data = menu.data;
          this.current.properties = menu.properties;
          this.draw();
          this.showMenu();
        });
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
  select(number) {
    for (const element of $('#vertical-menu li')) {
      element.classList.remove('selected');
    }
    $(`#option-${number}`).classList.add('selected');
    $('#description-text').textContent = this.current.data[number].description;
  }
  up() {
    if (this.selected === 0) {
      this.select(this.length - 1);
    } else {
      this.select(this.selected - 1);
    }
  }
  down() {
    if (this.selected === this.length - 1) {
      this.select(0);
    } else {
      this.select(this.selected + 1);
    }
  }
  ok() {
    if (this.selectedData.action === 'submenu') {
      this.load(this.selectedData.submenu);
    }
  }
  back() {
    if (this.current.properties.parent !== null) {
      this.load(this.current.properties.parent);
    }
  }
}

