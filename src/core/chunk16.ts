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
}
