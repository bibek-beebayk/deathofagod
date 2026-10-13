// scene: initialized by main.js; dependencies are passed explicitly.
export function createScene({ state } = {}) {
  const T = THREE;
  const cv = document.getElementById("cv");
  const R = new T.WebGLRenderer({ canvas: cv, antialias: true, alpha: true });
  R.setPixelRatio(Math.min(devicePixelRatio || 1, innerWidth < 700 ? 1.5 : 2));
  R.setClearColor(0, 0);
  R.shadowMap.enabled = true;
  R.shadowMap.type = T.PCFSoftShadowMap;
  const scene = new T.Scene();
  scene.fog = new T.Fog(0xd0e3e8, 3000, 14000);
  const cam = new T.PerspectiveCamera(42, 1, 2, 32000);
  const hemi = new T.HemisphereLight(0xdbe9f2, 0x7a6a50, 0.5),
    sun = new T.DirectionalLight(0xfff2d8, 0.78);
  sun.position.set(-600, 700, 500);
  const sunDir = new T.Vector3(-600, 700, 500).normalize();
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.bias = -0.0006;
  sun.shadow.normalBias = 0.6;
  scene.add(hemi, sun, sun.target);
  const world = new T.Group();
  scene.add(world);
  state.EX = 1.4;
  world.scale.y = state.EX;
  return { T, world, scene, hemi, sun, sunDir, cam, cv, R };
}
