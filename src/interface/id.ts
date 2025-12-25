export namespace ProtoxID {
  const CHARS =
    "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

  export function encode(t: number) {
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

  export function decode(t: string) {
    return t.split("").reduce((t, e) => t * 62 + CHARS.indexOf(e), 0);
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
}
