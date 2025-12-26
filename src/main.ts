import * as THREE from "three";
import { CameraControls } from "./ui/camera-controls.js";

const canvas = document.getElementsByTagName("canvas")[0]!;

const scene = new THREE.Scene();
const renderer = new THREE.WebGLRenderer({ canvas });
renderer.setClearColor(0x000000);
const camera = new THREE.PerspectiveCamera(
  90,
  innerWidth / innerHeight,
  0.1,
  256
);

const cubeMesh = new THREE.BoxGeometry(1, 1, 1);
const cubeMat = new THREE.MeshBasicMaterial({
  wireframe: true,
  color: 0xff0000,
});
const cube = new THREE.Mesh(cubeMesh, cubeMat);
scene.add(cube);

function resize() {
  canvas.width = innerWidth;
  canvas.height = innerHeight;
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
}

addEventListener("resize", resize);

resize();

const controls = new CameraControls(camera, canvas);

let lastTime: number | undefined = undefined;
function animate() {
  let dt;
  if (lastTime) {
    const now = performance.now();
    const dtMs = now - lastTime;
    lastTime = now;
    dt = dtMs / 1000;
  } else {
    lastTime = performance.now();
    dt = 1 / 60;
  }

  controls.update(dt);
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

animate();
