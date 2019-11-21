export function loadGameType(name) {
  return fetch(`./gametypes/${name}.json`)
      .then((r) => r.json());
}
export function loadMenu(name) {
  return fetch(`./menus/${name}.json`)
      .then((r) => r.json());
}
export function loadSoundbank(name) {
  return fetch(`./se/game/${name}/info.json`)
      .then((r) => r.json());
}
