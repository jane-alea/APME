import { Vector3 } from "three";
import {
  codeToId,
  decodeCoords,
  encodeCoords,
  idToCode,
  Result,
} from "../utils.js";
import { Chunk16 } from "./chunk16.js";
import { maps } from "./map.js";

export function loadProtoxMap(sourceText: string): Result<maps.Map, string> {
  try {
    const source = JSON.parse(sourceText);

    if (source.v < 2) {
      return Result.err(
        "Map versions lower than 2 are unsupported. Please use the official map editor at https://mapmaker.protox.io/ to upgrade your map.",
      );
    } else if (source.v > 2) {
      return Result.err(
        "Map versions higher than 2 are not yet available. Please notify APME devs at https://discord.gg/shwBAp3mMG!",
      );
    }
    const map = new maps.Map();
    map.name = source.n || "Unnamed";
    map.fog.enabled = !!source.f0g;
    map.fog.near = source.f0gNr;
    map.fog.far = source.f0gFr;
    map.fog.color = source.f0gClr;
    map.sky.topColor = source.skClrTop;
    map.sky.middleColor = source.skClrMiddle;
    map.sky.bottomColor = source.skClrBottom;
    map.lightColor = source.liClr;

    map.sky.offset = source.skOffset;
    if (
      map.sky.offset !== Math.floor(map.sky.offset) ||
      map.sky.offset < -200 ||
      map.sky.offset > 200
    ) {
      return Result.err(
        "The official Protox map editor does not naturally produce maps which have a non-integer sky offset. Please use an integer offset, and one that is situated between -200 and 200, inclusively.",
      );
    }

    if (source.chnks) {
      const layer = new maps.Layer(() => null);
      layer.name = "Imported";
      for (const [blockData, xyz] of source.chnks) {
        const { x, y, z } = decodeCoords(xyz);
        const chunk = new Chunk16(() => 0);
        for (const [code, startPos, length] of blockData) {
          const id = codeToId(code);
          for (let i = startPos; i < startPos + length; i++) {
            chunk.array[i] = id;
          }
        }
        layer.setAt(x, y, z, chunk);
      }
      map.layers.push(layer);
    }

    if (!map.layers[0]) map.layers.push(new maps.Layer(() => null));

    map.layers[0]!.spawns = source.spwns.map(
      ([x, y, z, r]: [number, number, number, number]) => {
        return new maps.Spawn(new Vector3(x, y, z), r);
      },
    );

    map.layers[0]!.points = source.pnts.map(
      ([x, y, z, w, h, d]: [
        number,
        number,
        number,
        number,
        number,
        number,
      ]) => {
        return new maps.Zone(new Vector3(x, y, z), new Vector3(w, h, d));
      },
    );

    map.layers[0]!.stepAreas = source.stpArs.map(
      ([x, y, z, w, h, d]: [
        number,
        number,
        number,
        number,
        number,
        number,
      ]) => {
        return new maps.Zone(new Vector3(x, y, z), new Vector3(w, h, d));
      },
    );

    return Result.ok(map);
  } catch (e) {
    console.error(e);
    return Result.err("Map loading error: " + (e as Error).toString());
  }
}

export function saveToProtoxFormat(map: maps.Map): string {
  const pMap: any = {};
  pMap.v = 2;
  pMap.n = map.name;
  pMap.f0g = map.fog.enabled;
  pMap.f0gNr = map.fog.near;
  pMap.f0gFr = map.fog.far;
  pMap.f0gClr = map.fog.color;
  pMap.skClrTop = map.sky.topColor;
  pMap.skClrMiddle = map.sky.middleColor;
  pMap.skClrBottom = map.sky.bottomColor;
  pMap.skOffset = map.sky.offset;
  pMap.liClr = map.lightColor;
  pMap.chnkSize = 16;

  const activeLayers = map.layers.filter((layer) => layer.active);

  pMap.spwns = (<maps.Spawn[]>[])
    .concat(...activeLayers.map((layer) => layer.spawns))
    .map((spawn) => [
      spawn.position.x,
      spawn.position.y,
      spawn.position.z,
      spawn.orientation,
    ]);
  pMap.pnts = (<maps.Zone[]>[])
    .concat(...activeLayers.map((layer) => layer.points))
    .map((point) => [
      point.position.x,
      point.position.y,
      point.position.z,
      point.size.x,
      point.size.y,
      point.size.z,
    ]);
  pMap.stpArs = (<maps.Zone[]>[])
    .concat(...activeLayers.map((layer) => layer.stepAreas))
    .map((stepArea) => [
      stepArea.position.x,
      stepArea.position.y,
      stepArea.position.z,
      stepArea.size.x,
      stepArea.size.y,
      stepArea.size.z,
    ]);

  let maxX = 0;
  let maxY = 0;
  let maxZ = 0;
  let minX = 256;
  let minY = 256;
  let minZ = 256;

  pMap.chnks = [];
  for (let cx = 0; cx < 16; cx++) {
    for (let cy = 0; cy < 16; cy++) {
      for (let cz = 0; cz < 16; cz++) {
        let blockData: [string, number, number][] = [];

        const relevantChunks: [
          "normal" | "addition" | "exclusion",
          Chunk16<number>,
        ][] = activeLayers
          .map((layer) => [layer.mode, layer.getAt(cx, cy, cz)])
          .filter((x) => !!x[1]) as unknown as any;

        let prevBlock: number = 0;
        let run = 0;
        let start = 0;
        for (let q = 0; q < 4096; q++) {
          let block = 0;
          for (const [mode, chunk] of relevantChunks) {
            let blockHere = chunk.array[q]!;
            if (blockHere !== 0) {
              if (mode === "normal") {
                block = blockHere;
              } else if (mode === "addition") {
                block = block === 0 ? blockHere : block;
              } else if (mode === "exclusion") {
                block = blockHere === 0 ? block : 0;
              }
            }
          }

          if (block !== 0) {
            const wx = cx * 16 + (q >> 8);
            const wy = cy * 16 + ((q >> 4) & 0xf);
            const wz = cz * 16 + (q & 0xf);
            maxX = Math.max(maxX, wx + 1);
            maxY = Math.max(maxY, wy + 1);
            maxZ = Math.max(maxZ, wz + 1);
            minX = Math.min(minX, wx - 1);
            minY = Math.min(minY, wy - 1);
            minZ = Math.min(minZ, wz - 1);
          }

          if (block !== prevBlock) {
            if (prevBlock !== 0) {
              blockData.push([idToCode(prevBlock)!, start, run]);
            }

            run = 1;
            prevBlock = block;
            start = q;
          } else {
            run++;
          }
        }

        if (prevBlock !== 0) {
          blockData.push([idToCode(prevBlock)!, start, run]);
        }

        let xyz = encodeCoords({ x: cx, y: cy, z: cz });
        if (blockData.length > 0) {
          pMap.chnks.push([blockData, xyz]);
        }
      }
    }
  }

  if (maxX < minX) {
    console.log(maxX, minX);
    // fully empty map
    pMap.mnVoxel = [0, 0, 0];
    pMap.mxVoxel = [0, 0, 0];
  } else {
    pMap.mnVoxel = [minX, minY, minZ];
    pMap.mxVoxel = [maxX, maxY, maxZ];
  }

  return JSON.stringify(pMap);
}
