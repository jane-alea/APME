import type { maps } from "./map";

export function clean(map: maps.Map): maps.Map {
  for (const layer of map.layers) {
    for (let i = 0; i < 4096; i++) {
      if (layer.array[i]) {
        if (layer.array[i]!.array.every((x) => x === 0)) {
          layer.array[i] = null;
        }
      }
    }
  }
  return map;
}
