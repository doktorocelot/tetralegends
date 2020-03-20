export function loadGameType(name) {
  return fetch(`./gametypes/${name}.json`, {cache: 'no-store'})
      .then((r) => r.json());
}
export function loadMenu(name) {
  return fetch(`./ui/${name}.json`, {cache: 'no-store'})
      .then((r) => r.json());
}
export function loadSoundbank(name) {
  return fetch(`./se/game/${name}/info.json`, {cache: 'no-store'})
      .then((r) => r.json());
}
export function loadLanguage(name, file) {
  return fetch(`./lang/${name}/${file}.json`, {cache: 'no-store'})
      .then((r) => r.json());
}
