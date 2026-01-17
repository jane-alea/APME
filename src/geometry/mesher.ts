import { BLOCKS } from "../blocks/blocks.js";
import type { Chunk16 } from "../core/chunk16.js";
import { UVStore } from "./uv-generator.js";
import { BufferGeometry, Float32BufferAttribute } from "three";
import { Relationship, shouldDrawFace } from "./visibility.js";

type C = Chunk16<number>;

function xp(
  vert: number[],
  uv: number[],
  x: number,
  y0: number,
  y1: number,
  z0: number,
  z1: number,
  u0: number,
  u1: number,
  v0: number,
  v1: number,
) {
  vert.push(x, y0, z0, x, y1, z0, x, y1, z1, x, y0, z0, x, y1, z1, x, y0, z1);
  uv.push(u1, v1, u1, v0, u0, v0, u1, v1, u0, v0, u0, v1);
}

function xm(
  vert: number[],
  uv: number[],
  x: number,
  y0: number,
  y1: number,
  z0: number,
  z1: number,
  u0: number,
  u1: number,
  v0: number,
  v1: number,
) {
  vert.push(x, y0, z0, x, y1, z1, x, y1, z0, x, y0, z0, x, y0, z1, x, y1, z1);
  uv.push(u0, v1, u1, v0, u0, v0, u0, v1, u1, v1, u1, v0);
}

function ym(
  vert: number[],
  uv: number[],
  x0: number,
  x1: number,
  y: number,
  z0: number,
  z1: number,
  u0: number,
  u1: number,
  v0: number,
  v1: number,
) {
  vert.push(x0, y, z0, x1, y, z0, x1, y, z1, x0, y, z0, x1, y, z1, x0, y, z1);
  uv.push(u0, v1, u0, v0, u1, v0, u0, v1, u1, v0, u1, v1);
}

function yp(
  vert: number[],
  uv: number[],
  x0: number,
  x1: number,
  y: number,
  z0: number,
  z1: number,
  u0: number,
  u1: number,
  v0: number,
  v1: number,
) {
  vert.push(x0, y, z0, x1, y, z1, x1, y, z0, x0, y, z0, x0, y, z1, x1, y, z1);
  uv.push(u0, v1, u1, v0, u0, v0, u0, v1, u1, v1, u1, v0);
}

function zp(
  vert: number[],
  uv: number[],
  x0: number,
  x1: number,
  y0: number,
  y1: number,
  z: number,
  u0: number,
  u1: number,
  v0: number,
  v1: number,
) {
  vert.push(x0, y0, z, x1, y0, z, x1, y1, z, x0, y0, z, x1, y1, z, x0, y1, z);
  uv.push(u0, v1, u1, v1, u1, v0, u0, v1, u1, v0, u0, v0);
}

function zm(
  vert: number[],
  uv: number[],
  x0: number,
  x1: number,
  y0: number,
  y1: number,
  z: number,
  u0: number,
  u1: number,
  v0: number,
  v1: number,
) {
  vert.push(x0, y0, z, x1, y1, z, x1, y0, z, x0, y0, z, x0, y1, z, x1, y1, z);
  uv.push(u1, v1, u0, v0, u0, v1, u1, v1, u1, v0, u0, v0);
}

interface ChunkLike {
  getAt(x: number, y: number, z: number): number;
}

class FakeChunk implements ChunkLike {
  static instance = new FakeChunk();

  getAt(x: number, y: number, z: number): number {
    return 0;
  }
}

class ChunkGroup {
  matrix: ChunkLike[][][];
  constructor(
    chunk: C,
    neighboringChunks: {
      xp?: C;
      xm?: C;
      yp?: C;
      ym?: C;
      zp?: C;
      zm?: C;
    },
  ) {
    this.matrix = [
      [
        [FakeChunk.instance, FakeChunk.instance, FakeChunk.instance],
        [
          FakeChunk.instance,
          neighboringChunks.xm || FakeChunk.instance,
          FakeChunk.instance,
        ],
        [FakeChunk.instance, FakeChunk.instance, FakeChunk.instance],
      ],
      [
        [
          FakeChunk.instance,
          neighboringChunks.ym || FakeChunk.instance,
          FakeChunk.instance,
        ],
        [
          neighboringChunks.zm || FakeChunk.instance,
          chunk,
          neighboringChunks.zp || FakeChunk.instance,
        ],
        [
          FakeChunk.instance,
          neighboringChunks.yp || FakeChunk.instance,
          FakeChunk.instance,
        ],
      ],
      [
        [FakeChunk.instance, FakeChunk.instance, FakeChunk.instance],
        [
          FakeChunk.instance,
          neighboringChunks.xp || FakeChunk.instance,
          FakeChunk.instance,
        ],
        [FakeChunk.instance, FakeChunk.instance, FakeChunk.instance],
      ],
    ];
  }

  getAt(x: number, y: number, z: number): number {
    const a = x + 16,
      b = y + 16,
      c = z + 16;
    const cx = a >> 4,
      cy = b >> 4,
      cz = c >> 4;
    return this.matrix[cx]![cy]![cz]!.getAt(a % 16, b % 16, c % 16);
  }
}

export function makeChunkMesh(
  chunk: C,
  neighboringChunks: {
    xp?: C;
    xm?: C;
    yp?: C;
    ym?: C;
    zp?: C;
    zm?: C;
  },
) {
  const vertices: number[] = [];
  const uvs: number[] = [];
  const cg = new ChunkGroup(chunk, neighboringChunks);

  for (let x = 0; x < 16; x++) {
    for (let y = 0; y < 16; y++) {
      for (let z = 0; z < 16; z++) {
        const id = chunk.getAt(x, y, z);
        if (!id) continue;

        const info = BLOCKS[id]!;

        const uv = UVStore[id]!;
        if (!uv) {
          console.error("missing UV for " + id);
          continue;
        }

        if (
          id &&
          shouldDrawFace(info, BLOCKS[cg.getAt(x + 1, y, z)], Relationship.Side)
        ) {
          xp(
            vertices,
            uvs,
            x + 1,
            y,
            y + 1,
            z,
            z + 1,
            uv.xp.start.u,
            uv.xp.end.u,
            uv.xp.start.v,
            uv.xp.end.v,
          );
        }
        if (
          id &&
          shouldDrawFace(info, BLOCKS[cg.getAt(x - 1, y, z)], Relationship.Side)
        ) {
          xm(
            vertices,
            uvs,
            x,
            y,
            y + 1,
            z,
            z + 1,
            uv.xm.start.u,
            uv.xm.end.u,
            uv.xm.start.v,
            uv.xm.end.v,
          );
        }
        if (
          id &&
          shouldDrawFace(info, BLOCKS[cg.getAt(x, y, z + 1)], Relationship.Side)
        ) {
          zp(
            vertices,
            uvs,
            x,
            x + 1,
            y,
            y + 1,
            z + 1,
            uv.zp.start.u,
            uv.zp.end.u,
            uv.zp.start.v,
            uv.zp.end.v,
          );
        }
        if (
          id &&
          shouldDrawFace(info, BLOCKS[cg.getAt(x, y, z - 1)], Relationship.Side)
        ) {
          zm(
            vertices,
            uvs,
            x,
            x + 1,
            y,
            y + 1,
            z,
            uv.zm.start.u,
            uv.zm.end.u,
            uv.zm.start.v,
            uv.zm.end.v,
          );
        }
        if (
          id &&
          shouldDrawFace(info, BLOCKS[cg.getAt(x, y + 1, z)], Relationship.Up)
        ) {
          yp(
            vertices,
            uvs,
            x,
            x + 1,
            y + 1,
            z,
            z + 1,
            uv.yp.start.u,
            uv.yp.end.u,
            uv.yp.start.v,
            uv.yp.end.v,
          );
        }
        if (
          id &&
          shouldDrawFace(info, BLOCKS[cg.getAt(x, y - 1, z)], Relationship.Down)
        ) {
          ym(
            vertices,
            uvs,
            x,
            x + 1,
            y,
            z,
            z + 1,
            uv.ym.start.u,
            uv.ym.end.u,
            uv.ym.start.v,
            uv.ym.end.v,
          );
        }
      }
    }
  }

  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new Float32BufferAttribute(vertices, 3));
  geometry.setAttribute("uv", new Float32BufferAttribute(uvs, 2));
  geometry.computeVertexNormals();
  return geometry;
}
