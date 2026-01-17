import type IBlockInfo from "../blocks/blocks.js";
import { BlockType } from "../blocks/blocks.js";

export enum Relationship {
  Up,
  Down,
  Side,
}

const HasFullUpperFace: { [x: number]: [boolean, boolean] } = {
  [BlockType.Cube]: [true, true],
  [BlockType.Slab]: [false, true],
  [BlockType.WallDecoration]: [false, false],
  [BlockType.XPlant]: [false, false],
  [BlockType.SquarePlant]: [false, true],
  [BlockType.Tile]: [false, true],
  [BlockType.Pillar]: [false, false],
};

const HasFullLowerFace: { [x: number]: [boolean, boolean] } = {
  [BlockType.Cube]: [true, true],
  [BlockType.Slab]: [false, true],
  [BlockType.WallDecoration]: [false, false],
  [BlockType.XPlant]: [false, false],
  [BlockType.SquarePlant]: [false, true],
  [BlockType.Tile]: [false, true],
  [BlockType.Pillar]: [false, false],
};

export function shouldDrawFace(
  main: IBlockInfo,
  other: IBlockInfo | undefined,
  relationship: Relationship,
): boolean {
  if (!other) return true;

  const idxUpperMain =
    main.isUpper || (!main.isTileOrSlab && main.hasTopFace) ? 1 : 0;
  const idxLowerMain =
    main.isLower || (!main.isTileOrSlab && main.hasBottomFace) ? 1 : 0;
  const idxUpperOther =
    other.isUpper || (!other.isTileOrSlab && other.hasTopFace) ? 1 : 0;
  const idxLowerOther =
    other.isLower || (!other.isTileOrSlab && other.hasBottomFace) ? 1 : 0;

  if (relationship === Relationship.Down) {
    if (
      HasFullLowerFace[main.type]![idxLowerMain] &&
      HasFullUpperFace[other.type]![idxUpperOther]
    ) {
      return drawFaceBetweenIdenticalShapes(main, other);
    }
    return true;
  }

  if (relationship === Relationship.Up) {
    if (
      HasFullLowerFace[main.type]![idxUpperMain] &&
      HasFullUpperFace[other.type]![idxLowerOther]
    ) {
      return drawFaceBetweenIdenticalShapes(main, other);
    }
    return true;
  }

  if (main.type === other.type) {
    if (
      main.type === BlockType.Cube ||
      ((main.type === BlockType.Slab || main.type === BlockType.Tile) &&
        main.isLower === other.isLower)
    ) {
      return drawFaceBetweenIdenticalShapes(other, main);
    }
    return true;
  } else {
    // there is no 2 different block types combination that, placed side-by-side, does not draw faces
    // (there could be tile beside slab, but I would like face drawing to be symmetrical)
    return true;
  }
}

function drawFaceBetweenIdenticalShapes(
  main: IBlockInfo,
  other: IBlockInfo,
): boolean {
  return !!(main !== other
    ? main.transparent || other.transparent
    : main.transparent && !main.innerTransparency);
}
