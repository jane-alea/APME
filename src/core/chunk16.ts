export type Chunk = Chunk16<number>;
export type MetaChunk = Chunk16<Chunk | undefined>;

export class Chunk16<T> {
  array: T[];
  constructor(defaultGenerator: () => T) {
    this.array = Array(4096).fill(0).map(defaultGenerator);
  }

  index(x: number, y: number, z: number): number {
    return (x << 8) | (y << 4) | z;
  }

  getBlock(x: number, y: number, z: number): T {
    return this.array[this.index(x, y, z)]!;
  }
}
