import { worldData } from "./data.js";
import { terrainData } from "./terrain-data.js";
import { createRandom } from "./utils.js";
import { createHeightfield } from "./heightfield.js";
import { createScenery } from "./scenery.js";
import { createForges } from "./forges.js";
import { createScene } from "./scene.js";
import { createTerrain } from "./terrain.js";
import { createEnvironment } from "./environment.js";
import { createWorld } from "./world.js";
import { createTrees } from "./trees.js";
import { createSettlements } from "./settlements.js";
import { createLandmarks } from "./landmarks.js";
import { createEffects } from "./effects.js";
import { createRoutes } from "./routes.js";
import { createLighting } from "./lighting.js";
import { createControls } from "./controls.js";
import { createLabels } from "./labels.js";
import { startAnimation } from "./animation.js";
import { getQuality } from "./quality.js";

// Builders mutate coordinates and attach runtime metadata to a private copy.
const D = JSON.parse(JSON.stringify({ ...terrainData, ...worldData }));
const state = { EX: 1.4, todN: "day", glowK: 0.55, labelsOn: true };
const quality = getQuality();

const { vn, hash, rnd } = createRandom({});
const { GW, GH, BM, CELL, H, OX, OY, VS, S0, RM, hAt, WW, WH, bAt } =
  createHeightfield({ D, vn, up: quality.up, relief: 2 });
const { T, world, scene, hemi, sun, sunDir, cam, cv, R } = createScene({
  state,
  quality,
});
const { HALL0, zs } = createTerrain({
  quality,
  T,
  D,
  GW,
  GH,
  BM,
  CELL,
  H,
  OX,
  OY,
  VS,
  S0,
  vn,
  RM,
  world,
});
const { wmat, floor, cloudT, cloudM, wnt } = createEnvironment({
  T,
  scene,
  hash,
});
const { P, inOrch, sprite, ORCH, GLOW, glows } = createWorld({
  T,
  rnd,
  world,
  D,
  S0,
  hAt,
  OX,
  OY,
});
const { dummy, cc, gRound, gTrees } = createTrees({
  quality,
  T,
  P,
  rnd,
  WW,
  WH,
  bAt,
  inOrch,
  hAt,
  VS,
  HALL0,
  vn,
  S0,
  zs,
  OX,
  OY,
  world,
  D,
});
createScenery({ T, world, hash, H, BM, GW, GH, CELL, OX, OY, VS, quality });
const forges = createForges({ T, world, D, hash, hAt, OX, OY, zs, quality });
const { HX, HY, HZ, gTowns, beam, hb, hr_, tents } = createSettlements({
  T,
  world,
  hAt,
  dummy,
  OX,
  OY,
  cc,
  D,
  rnd,
  bAt,
  P,
  sprite,
});
createLandmarks({
  hAt,
  T,
  world,
  OX,
  OY,
  sprite,
  P,
  D,
  bAt,
  gRound,
  S0,
  ORCH,
  gTrees,
});
const { hallLight, ringMats, shards, motes } = createEffects({
  T,
  HX,
  HY,
  HZ,
  world,
  sprite,
  RM,
  HALL0,
  hAt,
  OX,
  OY,
  rnd,
  GLOW,
  D,
  P,
  gTowns,
});
const { gLanes, gRoads, gRoute, cuOut, cuBack, pil, pil2, ships } =
  createRoutes({ T, world, D, OX, OY, hAt, sprite });
const { setTod } = createLighting({
  state,
  scene,
  hemi,
  sun,
  sunDir,
  wmat,
  floor,
  hallLight,
  beam,
});
const { show, flyTo, ctl, updCam, $ } = createControls({
  T,
  WW,
  WH,
  hAt,
  OX,
  OY,
  state,
  cam,
  scene,
  cv,
  D,
  gLanes,
  gRoads,
  gRoute,
  gTrees,
  gTowns,
  hb,
  hr_,
  tents,
  setTod,
  world,
  P,
});
const { labels } = createLabels({
  OX,
  OY,
  D,
  hAt,
  show,
  flyTo,
  T,
  state,
  ctl,
  cam,
});
startAnimation({
  forges,
  quality,
  R,
  cam,
  gTowns,
  setTod,
  updCam,
  ctl,
  sun,
  sunDir,
  cloudT,
  cloudM,
  state,
  wnt,
  glows,
  beam,
  hallLight,
  ringMats,
  shards,
  HX,
  HZ,
  HY,
  motes,
  cuOut,
  cuBack,
  pil,
  pil2,
  ships,
  S0,
  scene,
  labels,
  $,
});
