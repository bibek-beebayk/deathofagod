// scene: initialized by main.js; dependencies are passed explicitly.
export function createScene({ state, quality } = {}) {
  const T = THREE;
  const cv = document.getElementById("cv");
  const R = new T.WebGLRenderer({
    canvas: cv,
    antialias: quality.antialias,
    alpha: true,
    powerPreference: "high-performance",
  });
  R.setPixelRatio(Math.min(devicePixelRatio || 1, quality.maxPixelRatio));
  R.setClearColor(0, 0);
  R.outputEncoding = T.sRGBEncoding;
  R.toneMapping = T.ACESFilmicToneMapping;
  R.toneMappingExposure = 0.84;
  R.shadowMap.enabled = quality.shadows;
  R.shadowMap.type = T.PCFSoftShadowMap;
  const scene = new T.Scene();
  scene.fog = new T.Fog(0xd0e3e8, 3000, 14000);
  const cam = new T.PerspectiveCamera(42, 1, 2, 32000);
  const hemi = new T.HemisphereLight(0xadc6cd, 0x473d34, 0.3),
    sun = new T.DirectionalLight(0xffcf88, 1.55);
  sun.position.set(-760, 430, 520);
  const sunDir = new T.Vector3(-760, 430, 520).normalize();
  sun.castShadow = quality.shadows;
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
