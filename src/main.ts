import * as THREE from "three";
import { CameraControls } from "./ui/camera-controls.js";
import { Chunk16 } from "./core/chunk16.js";
import { makeChunkMesh } from "./geometry/mesher.js";
import { maps } from "./core/map.js";

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

const cubeMesh = new THREE.BoxGeometry(16, 16, 16);
const cubeMat = new THREE.MeshBasicMaterial({
  wireframe: true,
  color: 0xff0000,
});
const cube = new THREE.Mesh(cubeMesh, cubeMat);
cube.position.set(8, 8, 8);
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

const testChunk = new Chunk16(() => Math.round(Math.random() * 104));
const geo = makeChunkMesh(testChunk, {});
const mat = new THREE.MeshBasicMaterial({ side: THREE.FrontSide });
const loader = new THREE.TextureLoader();
loader.loadAsync("assets/texture.png").then((tex) => {
  tex.minFilter = THREE.NearestFilter;
  tex.magFilter = THREE.NearestFilter;
  tex.colorSpace = THREE.SRGBColorSpace;
  const newMat = new THREE.MeshBasicMaterial({ map: tex, alphaTest: 0.5 });
  obj.material = newMat;
  fetch("assets/map.txt").then((resp) =>
    resp.json().then((data) => {
      const map = maps.load(data).value!;
      for (let x = 0; x < 16; x++) {
        for (let y = 0; y < 16; y++) {
          for (let z = 0; z < 16; z++) {
            const ch = map.getAt(x, y, z);
            if (ch) {
              const geom = makeChunkMesh(ch, {});
              const mesh = new THREE.Mesh(geom, newMat);
              mesh.position.set(x * 16, y * 16, z * 16);
              scene.add(mesh);
            }
          }
        }
      }
    })
  );
});
const obj = new THREE.Mesh(geo, mat);
// scene.add(obj);

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
