import { Color, ColorManagement } from "three";
import { Result } from "../utils.js";
import type { maps } from "./map.js";
import { clean } from "./map-utils.js";

const encoder = new TextEncoder();

const CHUNK_SIZE = 4096;

export function saveToAPMEFormat(unprocessed: maps.Map): Result<Blob, string> {
  const map = clean(unprocessed);
  const buffers = [];

  const headerBuffer = new Uint8Array(7);
  headerBuffer[0] = 0x41; // A
  headerBuffer[1] = 0x50; // P
  headerBuffer[2] = 0x4d; // M
  headerBuffer[3] = 0x45; // E
  headerBuffer[4] = 1; // File version: 1
  let view = new DataView(headerBuffer.buffer);
  const nameBuffer = encoder.encode(map.name);
  if (nameBuffer.length > 65_535) {
    return Result.err("Map name length cannot exceed 65535 bytes.");
  }

  view.setUint16(5, nameBuffer.length, true);
  buffers.push(headerBuffer, nameBuffer);

  const globalInfoBuffer = new Uint8Array(
    3 * 3 /* top, middle & bottom sky */ +
      2 /* sky offset */ +
      1 /* fog enabled */ +
      4 /* fog near */ +
      4 /* fog far */ +
      3 /* fog color */ +
      3 /* light color */,
  );
  view = new DataView(globalInfoBuffer.buffer);
  writeColor(map.sky.topColor, view, 0);
  writeColor(map.sky.middleColor, view, 3);
  writeColor(map.sky.bottomColor, view, 6);
  view.setInt16(9, map.sky.offset, true);
  view.setUint8(11, map.fog.enabled ? 1 : 0);
  view.setFloat32(12, map.fog.near, true);
  view.setFloat32(16, map.fog.far, true);
  writeColor(map.fog.color, view, 20);
  writeColor(map.lightColor, view, 23);

  buffers.push(globalInfoBuffer);

  const idToIndex: { [x: string]: number } = {};
  const ids = [];
  for (const layer of map.layers) {
    for (const chunk of layer.array) {
      if (chunk) {
        for (const block of chunk.array) {
          if (typeof idToIndex[block] !== "number") {
            ids.push(block);
            idToIndex[block] = ids.length - 1;
          }
        }
      }
    }
  }

  const paletteBuffer = new Uint8Array(2 + ids.length * 3);
  view = new DataView(paletteBuffer.buffer);
  view.setUint16(0, ids.length, true);
  let idx = 2;
  for (const entry of ids) {
    const first = entry >> 8;
    view.setUint16(idx, first, true);
    idx += 2;
    const last = entry & 255;
    view.setUint8(idx, last);
    idx++;
  }

  buffers.push(paletteBuffer);

  const pushBlock = paletteBuffer.length > 255 ? pushU16 : pushU8;

  const iter = { buffers, i: 0, view, array: new Uint8Array(CHUNK_SIZE) };
  pushU16(iter, map.layers.length);

  for (const layer of map.layers) {
    const nameArray = encoder.encode(layer.name);
    pushU16(iter, nameArray.length);
    flush(iter);
    buffers.push(nameArray);
    pushU8(
      iter,
      {
        normal: 0,
        addition: 1,
        exclusion: 2,
      }[layer.mode],
    );

    pushU16(iter, layer.stepAreas.length);
    for (const stepArea of layer.stepAreas) {
      pushU8(iter, stepArea.position.x);
      pushU8(iter, stepArea.position.y);
      pushU8(iter, stepArea.position.z);
      pushU8(iter, stepArea.size.x);
      pushU8(iter, stepArea.size.y);
      pushU8(iter, stepArea.size.z);
    }

    pushU16(iter, layer.points.length);
    for (const point of layer.points) {
      pushU8(iter, point.position.x);
      pushU8(iter, point.position.y);
      pushU8(iter, point.position.z);
      pushU8(iter, point.size.x);
      pushU8(iter, point.size.y);
      pushU8(iter, point.size.z);
    }

    pushU16(iter, layer.spawns.length);
    for (const spawn of layer.spawns) {
      pushF32(iter, spawn.position.x);
      pushF32(iter, spawn.position.y);
      pushF32(iter, spawn.position.z);
      pushF32(iter, spawn.orientation);
    }

    pushU16(iter, layer.dummies.length);
    for (const dummy of layer.dummies) {
      pushF32(iter, dummy.x);
      pushF32(iter, dummy.y);
      pushF32(iter, dummy.z);
    }

    let noChunkStreak = 0;
    for (const chunk of layer.array) {
      if (chunk) {
        if (noChunkStreak !== 0) {
          pushU8(iter, noChunkStreak);
        }
        noChunkStreak = 0;
        pushU8(iter, noChunkStreak);

        let id = chunk.array[0]!;
        let run = 1;
        for (let i = 1; i < 4096; i++) {
          if (chunk.array[i] === id && run < 255) {
            run++;
          } else {
            pushBlock(iter, idToIndex[id]!);
            pushU8(iter, run);
            run = 1;
            id = chunk.array[i]!;
          }
        }

        pushBlock(iter, idToIndex[id]!);
        pushU8(iter, run);
      } else {
        noChunkStreak++;
        if (noChunkStreak === 255) {
          pushU8(iter, 255);
          noChunkStreak = 0;
        }
      }
    }
    if (noChunkStreak !== 0) {
      pushU8(iter, noChunkStreak);
    }
  }

  pushU16(iter, 16); // history entries kept
  pushU16(iter, 0); // history entry count
  flush(iter);

  return Result.ok(new Blob(buffers, { type: "application/octet-steam" }));
}

function pushU8(
  iter: { buffers: Uint8Array[]; i: number; view: DataView; array: Uint8Array },
  value: number,
) {
  iter.view.setUint8(iter.i, value);

  if (++iter.i === CHUNK_SIZE) {
    iter.i = 0;
    iter.buffers.push(iter.array);
    iter.array = new Uint8Array(CHUNK_SIZE);
    iter.view = new DataView(iter.array.buffer);
  }
}

function pushU16(
  iter: { buffers: Uint8Array[]; i: number; view: DataView; array: Uint8Array },
  value: number,
) {
  if (iter.i + 2 >= CHUNK_SIZE) {
    iter.buffers.push(iter.array.slice(0, iter.i));
    iter.i = 0;
    iter.array = new Uint8Array(CHUNK_SIZE);
    iter.view = new DataView(iter.array.buffer);
  }
  iter.view.setUint16(iter.i, value, true);
  iter.i += 2;
}

function pushF32(
  iter: { buffers: Uint8Array[]; i: number; view: DataView; array: Uint8Array },
  value: number,
) {
  if (iter.i + 4 >= CHUNK_SIZE) {
    iter.buffers.push(iter.array.slice(0, iter.i));
    iter.i = 0;
    iter.array = new Uint8Array(CHUNK_SIZE);
    iter.view = new DataView(iter.array.buffer);
  }
  iter.view.setFloat32(iter.i, value, true);
  iter.i += 2;
}

function flush(iter: {
  buffers: Uint8Array[];
  i: number;
  view: DataView;
  array: Uint8Array;
}) {
  if (iter.i === 0) return;

  iter.buffers.push(iter.array.slice(0, iter.i));
  iter.i = 0;
  iter.array = new Uint8Array(CHUNK_SIZE);
  iter.view = new DataView(iter.array.buffer);
}

function writeColor(color: string, buffer: DataView, position: number) {
  if (/^(#?)[0123456789abcdef]{6}$/gim.test(color)) {
    const rgb = parseInt(color.replace("#", ""), 16);
    const r = rgb >> 16;
    const g = (rgb >> 16) & 255;
    const b = rgb & 255;
    buffer.setUint8(position, r);
    buffer.setUint8(position + 1, g);
    buffer.setUint8(position + 2, b);
  }
  {
    ColorManagement.enabled = false;
    const col = new Color(color);
    const r = Math.round(col.r * 255);
    const g = Math.round(col.g * 255);
    const b = Math.round(col.b * 255);
    ColorManagement.enabled = true;
    buffer.setUint8(position, r);
    buffer.setUint8(position + 1, g);
    buffer.setUint8(position + 2, b);
  }
}
