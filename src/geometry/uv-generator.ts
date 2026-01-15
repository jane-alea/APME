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

for (const [id, data] of Object.entries(BLOCKS)) {
  cursor = data.textureIndex;
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
    xp: idxToUV(cursor),
    yp: idxToUV(cursor),
    zp: idxToUV(cursor),
    xm: idxToUV(cursor),
    ym: idxToUV(cursor),
    zm: idxToUV(cursor),
    xpmain: idxToUV(cursor),
    xp2: idxToUV(cursor),
  };
  cursor++;

  if (data.hasTopFace) entry.yp = idxToUV(cursor++);
  if (data.hasBottomFace) entry.ym = idxToUV(cursor++);
  if (data.twoFacedCrossPlant) entry.xp2 = idxToUV(cursor++);
  if (data.hasOpposingFaces) {
    entry.xm = entry.xp = idxToUV(cursor++);
  }

  UVStore[id] = entry;
}
