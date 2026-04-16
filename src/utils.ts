export function decodeCoords(xyz: number): V3 {
  return { x: (xyz >> 8) & 0xf, y: (xyz >> 4) & 0xf, z: xyz & 0xf };
}

export function encodeCoords(xyz: V3): number {
  return (xyz.x << 8) | (xyz.y << 4) | xyz.z;
}

const CHARS = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
export function codeToId(t: string): number {
  return t.split("").reduce((t, e) => t * 62 + CHARS.indexOf(e), 0);
}

export function idToCode(t: number) {
  if (t === 0) {
    return CHARS[0];
  }
  let e = "";
  while (t > 0) {
    e = CHARS[t % 62] + e;
    t = Math.floor(t / 62);
  }
  return e;
}

export function fromRGB(r: number, g: number, b: number): number {
  return (
    ((Math.floor(r / 16) << 8) |
      (Math.floor(g / 16) << 4) |
      Math.floor(b / 16)) +
    700001
  );
}

export function toRGB(id: number) {
  id -= 700001;
  return {
    r: (id & 3840) >> 8,
    g: (id & 240) >> 4,
    b: id & 15,
  };
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

  private constructor(type: 0 | 1) {
    this.type = type;
  }

  transmute<N>(): Result<N, E> {
    if (this.type === 1) {
      return Result.err(this.error!);
    } else {
      throw "failed to transmute success into error";
    }
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

export class APMEEventEmitter<EMap extends { [key: string]: any[] }> {
  map: { [key in keyof EMap]?: ((...args: EMap[key]) => void)[] } = {};

  on<K extends keyof EMap>(
    key: K,
    handler: (...args: EMap[K]) => void,
  ): { off: VoidFunction } {
    if (!this.map[key]) {
      this.map[key] = [];
    }

    this.map[key].push(handler);

    let removed = false;
    return {
      off: () => {
        if (removed) return;
        this.map[key]?.splice(this.map[key].indexOf(handler), 1);
      },
    };
  }

  trigger<K extends keyof EMap>(key: K, args: EMap[K]) {
    const functions = this.map[key];
    if (functions) {
      for (const fx of functions) {
        fx(...args);
      }
    }
  }
}

export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = src;
    img.addEventListener("load", () => {
      resolve(img);
    });

    img.addEventListener("error", (error) => {
      reject(`${error}`);
    });
  });
}

export function createAndAddElement<K extends keyof HTMLElementTagNameMap>(
  key: K,
  parent: HTMLElement,
  process: (element: HTMLElementTagNameMap[K]) => void,
): HTMLElementTagNameMap[K] {
  const element = document.createElement(key);
  process(element);
  parent.appendChild(element);
  return element;
}
