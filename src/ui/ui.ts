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

export abstract class BaseUIComponent {
  // REQUIREMENT: innerContainer must be a descendant of outerContainer, or equal to it
  abstract innerContainer: HTMLElement;
  abstract outerContainer: HTMLElement;
  abstract ui: APMEUI;
  abstract children: BaseUIComponent[];

  textButton(icon: string, text: string, action: VoidFunction) {
    const button = new TextIconButton(this.ui, icon, text, action);
    this.children.push(button);
    this.innerContainer.appendChild(button.outerContainer);
    return button;
  }

  iconButton(icon: string, action: VoidFunction) {
    const button = new TextlessIconButton(this.ui, icon, action);
    this.children.push(button);
    this.innerContainer.appendChild(button.outerContainer);
    return button;
  }

  secH() {
    const secH = new SecH(this.ui);
    this.children.push(secH);
    this.innerContainer.appendChild(secH.outerContainer);
    return secH;
  }

  secV() {
    const secV = new SecV(this.ui);
    this.children.push(secV);
    this.innerContainer.appendChild(secV.outerContainer);
    return secV;
  }

  destroy() {
    for (const child of this.children) {
      child.destroy();
    }

    this.outerContainer.remove();
  }
}

export class TextIconButton extends BaseUIComponent {
  innerContainer: HTMLElement;
  outerContainer: HTMLElement;
  iconElement: HTMLImageElement;
  textElement: HTMLElement;
  children: BaseUIComponent[] = [];
  ui: APMEUI;

  constructor(ui: APMEUI, icon: string, text: string, action: VoidFunction) {
    super();
    this.ui = ui;

    this.innerContainer = document.createElement("div");
    this.innerContainer.classList.add("icon-button");
    this.outerContainer = this.innerContainer;

    this.iconElement = document.createElement("img");
    this.iconElement.classList.add("icon");
    this.iconElement.src = ui.icons.get(icon) || "";
    this.innerContainer.appendChild(this.iconElement);

    this.textElement = document.createElement("div");
    this.textElement.classList.add("label");
    this.textElement.innerText = text;
    this.innerContainer.appendChild(this.textElement);

    this.innerContainer.addEventListener("click", (event) => {
      if (event.button === 0) action();
    });
  }
}

export class TextlessIconButton extends BaseUIComponent {
  innerContainer: HTMLElement;
  outerContainer: HTMLElement;
  iconElement: HTMLImageElement;
  children: BaseUIComponent[] = [];
  ui: APMEUI;

  constructor(ui: APMEUI, icon: string, action: VoidFunction) {
    super();
    this.ui = ui;

    this.innerContainer = document.createElement("div");
    this.innerContainer.classList.add("icon-button", "textless");
    this.outerContainer = this.innerContainer;

    this.iconElement = document.createElement("img");
    this.iconElement.classList.add("icon");
    this.iconElement.src = ui.icons.get(icon) || "";
    this.innerContainer.appendChild(this.iconElement);

    this.innerContainer.addEventListener("click", (event) => {
      if (event.button === 0) action();
    });
  }
}

export class SecH extends BaseUIComponent {
  innerContainer: HTMLElement;
  outerContainer: HTMLElement;
  children: BaseUIComponent[] = [];
  ui: APMEUI;
  constructor(ui: APMEUI) {
    super();
    this.ui = ui;

    this.innerContainer = document.createElement("div");
    this.innerContainer.classList.add("sec-h", "not-bar");
    this.outerContainer = this.innerContainer;
  }
}

export class SecV extends BaseUIComponent {
  innerContainer: HTMLElement;
  outerContainer: HTMLElement;
  children: BaseUIComponent[] = [];
  ui: APMEUI;
  constructor(ui: APMEUI) {
    super();
    this.ui = ui;

    this.innerContainer = document.createElement("div");
    this.innerContainer.classList.add("sec-v", "not-sidebar");
    this.outerContainer = this.innerContainer;
  }
}
