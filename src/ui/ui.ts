import { createIconSet } from "./icons.js";

export class APMEUI {
  icons!: Map<string, string>;

  private constructor() {
    document.documentElement.style.setProperty(
      "--apme-foreground-0",
      "#8A8A2D",
    );
    document.documentElement.style.setProperty(
      "--apme-foreground-1",
      "#757C2A",
    );
    document.documentElement.style.setProperty(
      "--apme-foreground-1",
      "#626C28",
    );
    document.documentElement.style.setProperty(
      "--apme-background-0",
      "#B8B190",
    );
    document.documentElement.style.setProperty(
      "--apme-background-1",
      "#A69F82",
    );
    document.documentElement.style.setProperty(
      "--apme-background-1",
      "#938D73",
    );
  }

  static async create(): Promise<APMEUI> {
    const ui = new APMEUI();
    ui.icons = await createIconSet("#757C2A");
    return ui;
  }
}
