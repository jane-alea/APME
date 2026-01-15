import type { Chunk16 } from "../core/chunk16.js";
import { UVStore } from "./uv-generator.js";
import { BufferGeometry, Float32BufferAttribute } from "three";

type C = Chunk16<number>;

function quadXP(
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
  v1: number
) {
  vert.push(x, y0, z0, x, y1, z0, x, y1, z1, x, y0, z0, x, y1, z1, x, y0, z1);

  uv.push(u0, v1, u0, v0, u1, v0, u0, v1, u1, v0, u1, v1);
}

interface ChunkLike {
  getBlock(x: number, y: number, z: number): number;
}

class FakeChunk implements ChunkLike {
  static instance = new FakeChunk();

  getBlock(x: number, y: number, z: number): number {
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
    }
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

  getBlock(x: number, y: number, z: number): number {
    const a = x + 16,
      b = y + 16,
      c = z + 16;
    const cx = a >> 4,
      cy = b >> 4,
      cz = c >> 4;
    return this.matrix[cx]![cy]![cz]!.getBlock(a % 16, b % 16, c % 16);
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
  }
) {
  const vertices: number[] = [];
  const uvs: number[] = [];
  const cg = new ChunkGroup(chunk, neighboringChunks);

  for (let x = 0; x < 16; x++) {
    for (let y = 0; y < 16; y++) {
      for (let z = 0; z < 16; z++) {
        const id = chunk.getBlock(x, y, z);

        const uv = UVStore[id]!;

        if (id && !cg.getBlock(x + 1, y, z)) {
          quadXP(
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
            uv.xp.end.v
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
