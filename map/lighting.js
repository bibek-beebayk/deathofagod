// lighting: initialized by main.js; dependencies are passed explicitly.
export function createLighting({
  state,
  scene,
  hemi,
  sun,
  sunDir,
  wmat,
  floor,
  hallLight,
  beam,
  R,
} = {}) {
  // ---- time of day
  const TOD = {
    day: {
      s1: "#263e50",
      s2: "#789197",
      fog: 0x6f898d,
      hs: 0xadc6cd,
      hg: 0x473d34,
      hi: 0.3,
      dc: 0xffcf88,
      di: 1.55,
      dp: [-760, 430, 520],
      w: 0x174f68,
      fl: 0x0c2d42,
      gl: 0.55,
      exp: 0.84,
      sun: "rgba(255, 190, 102, .4)",
      shade: ".52",
    },
    dusk: {
      s1: "#3a3f7a",
      s2: "#f0a56c",
      fog: 0xe0a47c,
      hs: 0xf1c9a8,
      hg: 0x5a4a55,
      hi: 0.42,
      dc: 0xff9a55,
      di: 0.8,
      dp: [800, 230, -350],
      w: 0x35607a,
      fl: 0x2a4660,
      gl: 1.1,
      exp: 0.92,
      sun: "rgba(255, 137, 78, .42)",
      shade: ".46",
    },
    night: {
      s1: "#050914",
      s2: "#1d2c4e",
      fog: 0x16233f,
      hs: 0x3a4a78,
      hg: 0x161624,
      hi: 0.55,
      dc: 0x8aa0ff,
      di: 0.4,
      dp: [-400, 600, 300],
      w: 0x12304a,
      fl: 0x0b2132,
      gl: 2.4,
      exp: 0.7,
      sun: "rgba(111, 138, 210, .2)",
      shade: ".62",
    },
  };
  state.todN = "day";
  state.glowK = 0.55;
  function setTod(n) {
    state.todN = n;
    const t = TOD[n];
    document.documentElement.style.setProperty("--sky1", t.s1);
    document.documentElement.style.setProperty("--sky2", t.s2);
    document.documentElement.style.setProperty("--sun-glow", t.sun);
    document.documentElement.style.setProperty("--edge-shade", t.shade);
    scene.fog.color.setHex(t.fog);
    hemi.color.setHex(t.hs);
    hemi.groundColor.setHex(t.hg);
    hemi.intensity = t.hi;
    sun.color.setHex(t.dc);
    sun.intensity = t.di;
    sunDir.set(...t.dp).normalize();
    wmat.color.setHex(t.w);
    wmat.userData.u.uSky.value.set(t.s2);
    floor.material.color.setHex(t.fl);
    R.toneMappingExposure = t.exp;
    state.glowK = t.gl;
    hallLight.intensity = n === "night" ? 1.4 : n === "dusk" ? 0.8 : 0.0;
    beam.material.opacity = n === "night" ? 0.4 : n === "dusk" ? 0.3 : 0.18;
  }
  return { setTod };
}
