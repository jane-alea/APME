import { Vector3 } from "three";
import { Chunk16 } from "./chunk16.js";
import { codeToId, decodeCoords, Result } from "../utils.js";

export namespace maps {
  export class Map extends Chunk16<Chunk16<number> | null> {
    name: string = "";
    spawns: Spawn[] = [];
    points: Zone[] = [];
    stepAreas: Zone[] = [];
    light: string = "#ffffff";
    sky: {
      top: string;
      middle: string;
      bottom: string;
      offset: number;
    } = {
      top: "#c0e6fA",
      middle: "#8ccde1",
      bottom: "#497d9a",
      offset: 0,
    };
    fog: {
      on: boolean;
      near: number;
      far: number;
      color: string;
    } = {
      on: false,
      near: 10,
      far: 250,
      color: "#bebebe",
    };
  }

  export class Spawn {
    constructor(public position: Vector3, public orientation: number) {}
  }

  export class Zone {
    constructor(public position: Vector3, public size: Vector3) {}
  }

  export function load(source: any): Result<Map, string> {
    try {
      if (source.v < 2) {
        return Result.err(
          "Map versions lower than 2 are unsupported. Please use the official map editor at https://mapmaker.protox.io/ to upgrade your map."
        );
      } else if (source.v > 2) {
        return Result.err(
          "Map versions higher than 2 are not yet available. Please notify APME's developer and request for them to be added."
        );
      }
      const map = new Map(() => null);
      map.name = source.n || "Unnamed";
      map.spawns = source.spwns.map(
        ([x, y, z, r]: [number, number, number, number]) => {
          return new Spawn(new Vector3(x, y, z), r);
        }
      );
      map.points = source.pnts.map(
        ([x, y, z, w, h, d]: [
          number,
          number,
          number,
          number,
          number,
          number
        ]) => {
          return new Zone(new Vector3(x, y, z), new Vector3(w, h, d));
        }
      );
      map.stepAreas = source.stpArs.map(
        ([x, y, z, w, h, d]: [
          number,
          number,
          number,
          number,
          number,
          number
        ]) => {
          return new Zone(new Vector3(x, y, z), new Vector3(w, h, d));
        }
      );
      for (const [blockData, xyz] of source.chnks) {
        const { x, y, z } = decodeCoords(xyz);
        const chunk = new Chunk16(() => 0);
        for (const [code, startPos, length] of blockData) {
          const id = codeToId(code);
          for (let i = startPos; i < startPos + length; i++) {
            chunk.array[i] = id;
          }
        }
        map.setAt(x, y, z, chunk);
      }
      return Result.ok(map);
    } catch (e) {
      console.error(e);
      return Result.err("Map loading error: " + (e as Error).toString());
    }
  }
}
