import { BLOCKS } from "../blocks/blocks.js";

type FaceUV = {
  start: { u: number; v: number };
  end: { u: number; v: number };
};

export const UVStore: {
  [id: string]: {
    main: FaceUV;
    otherSide?: FaceUV;
    top?: FaceUV;
    bottom?: FaceUV;
    xplant2?: FaceUV;
  };
} = {};

function idxToUV(idx: number): FaceUV {
  const u = (idx % 32) / 32;
  const v = Math.floor(idx / 32) / 32;
  return {
    start: {
      u: u + 0.0001,
      v: v + 0.0001,
    },
    end: {
      u: u + 1 / 32 - 0.0001,
      v: v + 1 / 32 - 0.0001,
    },
  };
}

let cursor = 0;

for (const [id, data] of Object.entries(BLOCKS)) {
  cursor = data.textureIndex;
  const entry: {
    main: FaceUV;
    otherSide?: FaceUV;
    top?: FaceUV;
    bottom?: FaceUV;
    xplant2?: FaceUV;
  } = {
    main: idxToUV(cursor),
  };
  cursor++;

  if (data.hasTopFace) entry.top = idxToUV(cursor++);
  if (data.hasBottomFace) entry.bottom = idxToUV(cursor++);
  if (data.twoFacedCrossPlant) entry.xplant2 = idxToUV(cursor++);
  if (data.hasOpposingFaces) entry.otherSide = idxToUV(cursor++);

  UVStore[id] = entry;
}
