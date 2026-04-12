import { createAndAddElement, loadImage } from "../utils.js";

let iconsCtx: CanvasRenderingContext2D = undefined!;
let iconsList: { name: string; x: number; y: number }[] = [];
let iconsImage: HTMLImageElement = undefined!;

export async function createIconSet(
  color: string,
): Promise<Map<string, string>> {
  if (!iconsCtx) {
    const canvas = createAndAddElement("canvas", document.body, (canvas) => {
      canvas.width = 16;
      canvas.height = 16;
      iconsCtx = canvas.getContext("2d")!;
    });

    canvas.classList.add("icons-canvas");
  }

  if (iconsList.length === 0) {
    iconsImage = await loadImage("assets/icons.png");
    const response = await fetch("assets/icons.csv");
    const text = await response.text();
    const lines = text.split("\n").slice(1);

    for (const line of lines) {
      const parts = line.split(",");
      if (parts.length < 5) continue;

      const entry = {
        name: parts[0]!,
        x: parseInt(parts[3]!),
        y: parseInt(parts[4]!),
      };
      iconsList.push(entry);
    }
  }

  const map: Map<string, string> = new Map();
  iconsCtx.fillStyle = color;
  for (const { name, x, y } of iconsList) {
    iconsCtx.clearRect(0, 0, 16, 16);
    iconsCtx.drawImage(iconsImage, x, y, 16, 16, 0, 0, 16, 16);

    const { data } = iconsCtx.getImageData(0, 0, 16, 16);
    iconsCtx.clearRect(0, 0, 16, 16);
    for (let x = 0; x < 16; x++) {
      for (let y = 0; y < 16; y++) {
        const index = (y * 16 + x) * 4;
        if (data[index]! > 128) {
          iconsCtx.fillRect(x, y, 1, 1);
        }
      }
    }
    map.set(name, iconsCtx.canvas.toDataURL("image/png"));
  }

  return map;
}
