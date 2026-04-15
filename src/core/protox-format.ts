import { Vector3 } from "three";
import { codeToId, decodeCoords, Result } from "../utils.js";
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
