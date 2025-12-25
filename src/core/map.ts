import type { Vector3 } from "three";
import { Chunk16, type MetaChunk } from "./chunk16";

export namespace Map {
  export class Map {
    name: string = "";
    spawns: Spawn[] = [];
    points: Zone[] = [];
    stepAreas: Zone[] = [];
    world!: MetaChunk;
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

    static defaultMap() {
      const m = new Map();
      m.world = new Chunk16(() => undefined);
    }
  }

  export class Spawn {
    constructor(public position: Vector3, public orientation: number) {}
  }

  export class Zone {
    constructor(public position: Vector3, public size: Vector3) {}
  }
}
