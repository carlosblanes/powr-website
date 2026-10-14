/*
 * Interactive 3D viewer for POWR hardware, straight from the CAD STL files.
 * mountViewer(el, { parts: [{url, color}], bar: 'x'|'z', autoRotate, cameraDist })
 * Model frames: bar clip = Z up, bar along X (see hardware/bar_clip/analysis/revF/revF_build.py);
 * collar = bar along Z. Both centred on the bar axis.
 */
import * as THREE from 'three';
import { STLLoader } from 'three/addons/loaders/STLLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

const loader = new STLLoader();
const cache = {};
const load = (url) => (cache[url] ??= new Promise((res, rej) => loader.load(url, res, undefined, rej)));

export function makeMaterial(hex, finish = 'satin') {
  return new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(hex),
    roughness: finish === 'metal' ? 0.32 : 0.48,
    metalness: finish === 'metal' ? 0.85 : 0.0,
    clearcoat: 0.35, clearcoatRoughness: 0.4,
    sheen: 0.3, sheenColor: new THREE.Color('#ffffff'),
  });
}

export async function mountViewer(el, opts = {}) {
  const { parts = [], bar = 'x', autoRotate = true, cameraDist = 150, barLength = 190, zoom = false, tilt = 0.5, strips = null, barRadius = 24.8 } = opts;
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  el.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = 0.32;

  const camera = new THREE.PerspectiveCamera(30, 1, 1, 5000);
  const key = new THREE.DirectionalLight('#ffffff', 2.2); key.position.set(160, 150, 120); scene.add(key);
  const rim = new THREE.DirectionalLight('#23ebc6', 1.8); rim.position.set(-200, -10, -150); scene.add(rim);
  const fill = new THREE.DirectionalLight('#9fb7b4', 0.5); fill.position.set(-100, -60, 140); scene.add(fill);

  // Everything lives in a group whose frame is: bar axis along world X, up = world Y.
  const group = new THREE.Group(); scene.add(group);
  const model = new THREE.Group(); group.add(model);
  if (bar === 'x') { model.rotation.x = -Math.PI / 2; }                                   // Z-up, bar along X -> Y-up, bar along X
  else { model.rotation.y = Math.PI / 2; }                                           // bar along Z -> bar along X

  const meshes = [];
  const geos = await Promise.all(parts.map((p) => load(p.url)));
  geos.forEach((g, i) => {
    g.computeVertexNormals();
    const m = new THREE.Mesh(g, makeMaterial(parts[i].color || '#1d2021', parts[i].finish));
    model.add(m); meshes.push(m);
  });

  // Silicone grip strips in the bore channels (bar clip only). Each strip is 1.0 mm thick, sits in a
  // 0.4 mm channel and stands 0.6 mm proud, so the bar touches the strips, not the plastic.
  // Values from revF_build.py: bore Ø49.8, channels at the given angles from the top, 6 mm wide.
  if (strips) {
    const rubber = new THREE.MeshPhysicalMaterial({ color: '#0b0c0c', roughness: 0.9, metalness: 0 });
    const r = strips.bore / 2;
    strips.list.forEach(({ angle, half }) => {
      const g = new THREE.Group();
      const m = new THREE.Mesh(new THREE.BoxGeometry(2 * half, strips.width, strips.thickness), rubber);
      m.position.z = r + strips.depth - strips.thickness / 2;   // outer face at the channel floor
      g.add(m); g.rotation.x = -THREE.MathUtils.degToRad(angle);
      model.add(g);
    });
  }

  // Barbell sleeve for scale: knurl-less chrome.
  if (barLength) {
    const sleeve = new THREE.Mesh(
      new THREE.CylinderGeometry(barRadius, barRadius, barLength, 64, 1, false),
      new THREE.MeshPhysicalMaterial({ color: '#9aa4a4', metalness: 1, roughness: 0.3, side: THREE.DoubleSide })
    );
    sleeve.rotation.z = Math.PI / 2;
    group.add(sleeve);
  }

  // Centre the hardware (not the bar) in view.
  const box = new THREE.Box3().setFromObject(model);
  const c = box.getCenter(new THREE.Vector3());
  group.position.set(-c.x * 0.3, -c.y * 0.6, -c.z);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true; controls.dampingFactor = 0.08;
  controls.enablePan = false; controls.enableZoom = zoom;
  controls.autoRotate = autoRotate; controls.autoRotateSpeed = 1.6;
  controls.minPolarAngle = 0.25; controls.maxPolarAngle = Math.PI - 0.25;
  camera.position.set(cameraDist * Math.cos(tilt) * 0.72, cameraDist * Math.sin(tilt), cameraDist * Math.cos(tilt) * 0.72);
  controls.target.set(0, 0, 0);
  controls.addEventListener('start', () => { controls.autoRotate = false; });

  const resize = () => {
    const w = el.clientWidth, h = el.clientHeight || w;
    renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix();
  };
  new ResizeObserver(resize).observe(el); resize();

  let visible = true;
  new IntersectionObserver(([e]) => (visible = e.isIntersecting)).observe(el);
  renderer.setAnimationLoop(() => { if (!visible) return; controls.update(); renderer.render(scene, camera); });

  return {
    setColor(hex) { meshes.forEach((m) => m.material.color.set(hex)); },
    setColors(list) { meshes.forEach((m, i) => list[i] && m.material.color.set(list[i])); },
    renderer, scene, camera, controls, model,
  };
}

/* The POWR Bar Clip rev F as installed: four silicone strips, bar resting on them. */
export const CLIP_STRIPS = {
  bore: 49.8, width: 6.0, thickness: 1.0, depth: 0.4,
  list: [-90.4, -63.3, 63.3, 90.4].map((angle) => ({ angle, half: 27 })),
};
export const CLIP_BAR_RADIUS = 49.8 / 2 + 0.4 - 1.0;   // bar surface touches the strips' inner faces
