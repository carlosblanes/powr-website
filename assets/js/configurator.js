/*
 * The POWR Bar Clip rev J, as sold: clip + MagSafe plate (two PETG parts), the metal
 * magnet ring on the plate, four black silicone strips in the bore. Colours per part,
 * and an "apart" view that slides the plate off its dovetail rail and lifts the ring.
 *
 * Geometry is the production CAD (hardware/bar_clip/revJ, J.3): Z up, bar along X,
 * bore centred on the origin. Plate face at Z 33.85; its dovetail slot opens at +X,
 * so the plate comes off by sliding along the bar. Ring 55 x 45 mm on the plate face.
 * Strips: 6 x 42 x 1.0 mm at ±40° and ±105° from the top, in 0.3 mm pockets of the
 * Ø48.7 bore (0.7 mm proud).
 */
import * as THREE from 'three';
import { STLLoader } from 'three/addons/loaders/STLLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

const REV_J = {
  clip: 'assets/models/POWR_Clip_RevJ.stl',
  plate: 'assets/models/POWR_Plate_RevJ.stl',
  plateFaceZ: 33.85,
  ring: { od: 55, id: 45, t: 1.2 },
  strips: { bore: 48.7, pocket: 0.3, width: 6, length: 42, thickness: 1.0, angles: [-105, -40, 40, 105] },
  barRadius: 49.2 / 2,
};

const plastic = (hex) => new THREE.MeshPhysicalMaterial({
  color: new THREE.Color(hex), roughness: 0.42, metalness: 0,
  clearcoat: 0.45, clearcoatRoughness: 0.35,   // PETG has a light gloss
});
const metal = (hex) => new THREE.MeshPhysicalMaterial({
  color: new THREE.Color(hex), roughness: 0.24, metalness: 1, clearcoat: 0.2,
});

const loadSTL = (url) => new Promise((res, rej) => new STLLoader().load(url, res, undefined, rej));

export async function mountConfigurator(el, colors, view = {}) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  el.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = 0.55;   // the ring needs something to reflect
  const key = new THREE.DirectionalLight('#ffffff', 2.0); key.position.set(160, 150, 120); scene.add(key);
  // Neutral: a teal rim light tinted white parts teal, which is wrong in a colour picker.
  const rim = new THREE.DirectionalLight('#e6eeee', 1.1); rim.position.set(-200, -10, -150); scene.add(rim);
  const fill = new THREE.DirectionalLight('#9fb7b4', 0.5); fill.position.set(-100, -60, 140); scene.add(fill);

  const camera = new THREE.PerspectiveCamera(30, 1, 1, 5000);

  // World frame: bar along X, up = Y. The CAD is Z-up, so the model is turned -90° about X.
  const model = new THREE.Group(); model.rotation.x = -Math.PI / 2; scene.add(model);

  const [clipGeo, plateGeo] = await Promise.all([loadSTL(REV_J.clip), loadSTL(REV_J.plate)]);
  clipGeo.computeVertexNormals(); plateGeo.computeVertexNormals();
  const clip = new THREE.Mesh(clipGeo, plastic(colors.clip));
  const plate = new THREE.Mesh(plateGeo, plastic(colors.plate));
  model.add(clip, plate);

  // Magnet ring on the plate face.
  const { od, id, t } = REV_J.ring;
  const shape = new THREE.Shape(); shape.absarc(0, 0, od / 2, 0, Math.PI * 2, false);
  const hole = new THREE.Path(); hole.absarc(0, 0, id / 2, 0, Math.PI * 2, true); shape.holes.push(hole);
  const ringGeo = new THREE.ExtrudeGeometry(shape, { depth: t, bevelEnabled: true, bevelThickness: 0.25, bevelSize: 0.25, bevelSegments: 3, curveSegments: 96 });
  const ring = new THREE.Mesh(ringGeo, metal(colors.ring));
  ring.position.z = REV_J.plateFaceZ;
  model.add(ring);

  // Silicone strips (always black: that is the silicone).
  const rubber = new THREE.MeshPhysicalMaterial({ color: '#0b0c0c', roughness: 0.9 });
  const s = REV_J.strips;
  s.angles.forEach((angle) => {
    const g = new THREE.Group();
    const m = new THREE.Mesh(new THREE.BoxGeometry(s.length, s.width, s.thickness), rubber);
    m.position.z = s.bore / 2 + s.pocket - s.thickness / 2;
    g.add(m); g.rotation.x = -THREE.MathUtils.degToRad(angle);
    clip.add(g);
  });

  // Barbell sleeve for scale.
  const sleeve = new THREE.Mesh(
    new THREE.CylinderGeometry(REV_J.barRadius, REV_J.barRadius, 120, 64, 1, true),
    new THREE.MeshPhysicalMaterial({ color: '#9aa4a4', metalness: 1, roughness: 0.3, side: THREE.DoubleSide }),
  );
  sleeve.rotation.z = Math.PI / 2; scene.add(sleeve);

  model.position.y = -10;   // centre the hardware, not the bar
  sleeve.position.y = -10;

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true; controls.dampingFactor = 0.08;
  controls.enablePan = false; controls.enableZoom = true; controls.minDistance = 120; controls.maxDistance = 420;
  controls.autoRotate = view.autoRotate ?? true; controls.autoRotateSpeed = 1.4;
  controls.minPolarAngle = 0.2; controls.maxPolarAngle = Math.PI - 0.2;
  camera.position.set(...(view.camera ?? [215, 150, 215]));
  controls.target.set(18, 0, 0);   // a little toward +X, where the plate goes when apart
  controls.addEventListener('start', () => { controls.autoRotate = false; });

  // "Apart": plate slides +X along the rail and off it; the ring lifts off the plate.
  let apart = view.apart ? 1 : 0, target = apart;
  const pose = () => {
    const e = apart * apart * (3 - 2 * apart);          // smoothstep
    plate.position.x = e * 62;
    ring.position.x = e * 62;
    ring.position.z = REV_J.plateFaceZ + e * 16;
  };

  const resize = () => {
    const w = el.clientWidth, h = el.clientHeight || w;
    renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix();
  };
  pose();
  new ResizeObserver(resize).observe(el); resize();
  let visible = true;
  new IntersectionObserver(([e]) => (visible = e.isIntersecting)).observe(el);
  renderer.setAnimationLoop(() => {
    if (!visible) return;
    if (apart !== target) { apart += Math.sign(target - apart) * Math.min(0.03, Math.abs(target - apart)); pose(); }
    controls.update(); renderer.render(scene, camera);
  });

  return {
    setColors({ clip: c, plate: p, ring: r }) {
      if (c) clip.material.color.set(c);
      if (p) plate.material.color.set(p);
      if (r) ring.material.color.set(r);
    },
    setApart(on) { target = on ? 1 : 0; },
    isApart: () => target === 1,
  };
}
