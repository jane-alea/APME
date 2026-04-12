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
