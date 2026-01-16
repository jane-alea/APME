export function decodeCoords(xyz: number): V3 {
  return { x: (xyz >> 8) & 0xf, y: (xyz >> 4) & 0xf, z: xyz & 0xf };
}

const chars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
export function codeToId(t: string): number {
  return t.split("").reduce((t, e) => t * 62 + chars.indexOf(e), 0);
}

export interface V3 {
  x: number;
  y: number;
  z: number;
}

export class Result<T, E> {
  value?: T;
  error?: E;
  type: 0 | 1;

  constructor(type: 0 | 1) {
    this.type = type;
  }

  static ok<T, E>(value: T) {
    const res = new Result<T, E>(0);
    res.value = value;
    return res;
  }

  static err<T, E>(error: E) {
    const res = new Result<T, E>(1);
    res.error = error;
    return res;
  }
}
