export function loadGameType(name) {
  return fetch(`/gametypes/${name}.json`)
      .then((r) => r.json());
}
