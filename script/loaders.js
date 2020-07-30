export async function loadGameType(name) {
  const r = await fetch(`./gametypes/${name}.json`, {cache: 'no-store'});
  return await r.json();
}
export async function loadMenu(name) {
  const r = await fetch(`./ui/${name}.json`, {cache: 'no-store'});
  return await r.json();
}
export async function loadSoundbank(name) {
  const r = await fetch(`./se/game/${name}/info.json`, {cache: 'no-store'});
  return await r.json();
}
export async function loadPiecebank(name) {
  const r = await fetch(`./se/piece/${name}/info.json`, {cache: 'no-store'});
  return await r.json();
}
export async function loadLanguage(name, file) {
  const r = await fetch(`./lang/${name}/${file}.json`, {cache: 'no-store'});
  return await r.json();
}
