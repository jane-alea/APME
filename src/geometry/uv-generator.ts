import { BLOCKS } from "../blocks/blocks.js";

export type FaceUV = {
  start: { u: number; v: number };
  end: { u: number; v: number };
};

export const UVStore: {
  [id: string]: {
    xp: FaceUV;
    yp: FaceUV;
    zp: FaceUV;
    xm: FaceUV;
    ym: FaceUV;
    zm: FaceUV;
    xpmain: FaceUV;
    xp2: FaceUV;
  };
} = {};

function idxToUV(idx: number): FaceUV {
  idx -= 1;
  const u = (idx % 32) / 32;
  const v = Math.floor(idx / 32) / 32;
  return {
    start: {
      u: u + 0.0001,
      v: 1 - (v + 0.0001),
    },
    end: {
      u: u + 1 / 32 - 0.0001,
      v: 1 - (v + 1 / 32 - 0.0001),
    },
  };
}

let cursor = 0;

const _1_32 = 1 / 32;
const _1_16_32 = _1_32 / 16;
const _1_1024 = 1 / 1024;

for (const [id, info] of Object.entries(BLOCKS)) {
  if (info.isSolidColor) {
    const r = info.textureIndex >> 8;
    const g = (info.textureIndex >> 4) & 0xf;
    const b = info.textureIndex & 0xf;
    const u = _1_32 * r + _1_16_32 * g + _1_1024;
    const v = 1 - (_1_32 * 31 + _1_16_32 * b + _1_1024);
    const uv: FaceUV = {
      start: { u, v },
      end: { u, v },
    };
    UVStore[id] = {
      xp: uv,
      yp: uv,
      zp: uv,
      xm: uv,
      ym: uv,
      zm: uv,
      xpmain: uv,
      xp2: uv,
    };
  } else {
    cursor = info.textureIndex;
    const base = idxToUV(cursor);
    const entry: {
      xp: FaceUV;
      yp: FaceUV;
      zp: FaceUV;
      xm: FaceUV;
      ym: FaceUV;
      zm: FaceUV;
      xpmain: FaceUV;
      xp2: FaceUV;
    } = {
      xp: base,
      yp: base,
      zp: base,
      xm: base,
      ym: base,
      zm: base,
      xpmain: base,
      xp2: base,
    };
    cursor++;

    if (info.hasTopFace) entry.yp = idxToUV(cursor++);
    if (info.hasBottomFace) entry.ym = idxToUV(cursor++);
    if (info.twoFacedCrossPlant) entry.xp2 = idxToUV(cursor++);
    if (info.hasOpposingFaces) {
      entry.xm = entry.xp = idxToUV(cursor++);
    }
    if (info.separateLowerSlabTexture && info.isLower) {
      entry.xm = entry.zm = entry.xp = entry.zp = idxToUV(cursor++);
    }

    UVStore[id] = entry;
  }
}
