import { Vector3 } from "three";
import { Chunk16 } from "./chunk16.js";

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
    mode: "normal" | "addition" | "exclusion" = "normal";
    active = true;
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
}
