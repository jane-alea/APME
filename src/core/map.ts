import { Vector3 } from "three";
import { Chunk16 } from "./chunk16.js";
import { codeToId, decodeCoords, Result } from "../utils.js";

export namespace maps {
  export class Map {
    name: string = "";
    lightColor: string = "#ffffff";
    sky: {
      topColor: string;
      middleColor: string;
      bottomColor: string;
      offset: number;
    } = {
      topColor: "#c0e6fA",
      middleColor: "#8ccde1",
      bottomColor: "#497d9a",
      offset: 0,
    };
    fog: {
      enabled: boolean;
      near: number;
      far: number;
      color: string;
    } = {
      enabled: false,
      near: 10,
      far: 250,
      color: "#bebebe",
    };

    layers: Layer[] = [];
  }

  export class Layer extends Chunk16<Chunk16<number> | null> {
    name = "";
    spawns: Spawn[] = [];
    stepAreas: Zone[] = [];
    points: Zone[] = [];
    dummies: Vector3[] = [];
  }

  export class Spawn {
    constructor(
      public position: Vector3,
      public orientation: number,
    ) {}
  }

  export class Zone {
    constructor(
      public position: Vector3,
      public size: Vector3,
    ) {}
  }

  export function loadProtoxMap(sourceText: string): Result<Map, string> {
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
      const map = new Map();
      map.name = source.n || "Unnamed";
      map.fog.enabled = !!source.f0g;
      map.fog.near = source.f0gNr;
      map.fog.far = source.f0gFr;
      map.fog.color = source.f0gClr;
      map.lightColor = source.liClr;

      if (source.chnks) {
        const layer = new Layer(() => null);
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

      if (!map.layers[0]) map.layers.push(new Layer(() => null));

      map.layers[0]!.spawns = source.spwns.map(
        ([x, y, z, r]: [number, number, number, number]) => {
          return new Spawn(new Vector3(x, y, z), r);
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
          return new Zone(new Vector3(x, y, z), new Vector3(w, h, d));
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
          return new Zone(new Vector3(x, y, z), new Vector3(w, h, d));
        },
      );

      return Result.ok(map);
    } catch (e) {
      console.error(e);
      return Result.err("Map loading error: " + (e as Error).toString());
    }
  }
}
