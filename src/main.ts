import * as THREE from "three";

const canvas = document.getElementsByTagName("canvas")[0]!;

const renderer = new THREE.WebGLRenderer({ canvas });
const camera = new THREE.PerspectiveCamera(
  90,
  innerWidth / innerHeight,
  0.1,
  256
);

function resize() {
  canvas.width = innerWidth;
  canvas.height = innerHeight;
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
}

addEventListener("resize", resize);

resize();
