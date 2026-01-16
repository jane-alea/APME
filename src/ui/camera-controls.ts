import { Vector2, Vector3, type Camera } from "three";
import { Settings } from "./settings.js";

const KEY_MAP: [string, string][] = [
  ["KeyW", "forward"],
  ["KeyS", "back"],
  ["KeyA", "left"],
  ["KeyD", "right"],
  ["KeyQ", "down"],
  ["KeyE", "up"],
  ["ShiftLeft", "accelerate"],
];

const slowSpeed = 3;
const fastSpeed = 40;

export class CameraControls {
  position: Vector3;
  rotation: Vector2;

  inputs: {
    [key: string]: boolean;
  } = {};

  constructor(public camera: Camera, public canvas: HTMLCanvasElement) {
    camera.rotation.order = "YXZ";

    this.position = new Vector3();
    this.rotation = new Vector2();

    this.addListeners();
  }

  update(dt: number) {
    if (dt === 0 || document.pointerLockElement !== this.canvas) return;

    let positionChanged = false;

    if (!this.inputs.forward !== !this.inputs.back) {
      const xCos = Math.cos(this.rotation.x);
      const forwardX = Math.sin(this.rotation.y) * xCos;
      const forwardY = -Math.sin(this.rotation.x);
      const forwardZ = Math.cos(this.rotation.y) * xCos;

      const mult =
        (this.inputs.forward ? -1 : 1) *
        (this.inputs.accelerate ? fastSpeed : slowSpeed);

      this.position.x += mult * forwardX * dt;
      this.position.y += mult * forwardY * dt;
      this.position.z += mult * forwardZ * dt;

      positionChanged = true;
    }

    if (!this.inputs.up !== !this.inputs.down) {
      const mult =
        (this.inputs.down ? -1 : 1) *
        (this.inputs.accelerate ? fastSpeed : slowSpeed);
      this.position.y += mult * dt;
      positionChanged = true;
    }

    if (!this.inputs.left !== !this.inputs.right) {
      const forwardX = Math.sin(this.rotation.y - Math.PI / 2);
      const forwardZ = Math.cos(this.rotation.y - Math.PI / 2);

      const mult =
        (this.inputs.left ? 1 : -1) *
        (this.inputs.accelerate ? fastSpeed : slowSpeed);

      this.position.x += mult * forwardX * dt;
      this.position.z += mult * forwardZ * dt;

      positionChanged = true;
    }

    if (positionChanged)
      this.camera.position.set(
        this.position.x,
        this.position.y,
        this.position.z
      );
  }

  addListeners() {
    this.canvas.addEventListener("click", () => {
      this.canvas.requestPointerLock();
    });

    addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        document.exitPointerLock();
      }

      for (const [code, key] of KEY_MAP) {
        if (event.code === code) {
          this.inputs[key] = true;
          break;
        }
      }
    });

    addEventListener("keyup", (event) => {
      for (const [code, key] of KEY_MAP) {
        if (event.code === code) {
          this.inputs[key] = false;
          break;
        }
      }
    });

    addEventListener("mousemove", (event) => {
      if (document.pointerLockElement !== this.canvas) return;

      const dY =
        ((event.movementX * -0.22 * Settings.sensitivity) / 180) * Math.PI;
      const dX =
        ((event.movementY * -0.22 * Settings.sensitivity) / 180) * Math.PI;

      this.rotation.x = Math.max(
        Math.min(this.rotation.x + dX, Math.PI / 2),
        -Math.PI / 2
      );
      this.rotation.y = this.rotation.y + dY;

      this.camera.rotation.set(this.rotation.x, this.rotation.y, 0);
    });
  }
}
