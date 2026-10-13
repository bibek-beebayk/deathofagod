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
} = {}) {
  // ---- time of day
  const TOD = {
    day: {
      s1: "#5d9ad0",
      s2: "#d5e6ea",
      fog: 0xd0e3e8,
      hs: 0xdbe9f2,
      hg: 0x7a6a50,
      hi: 0.5,
      dc: 0xffe6bd,
      di: 0.85,
      dp: [-760, 520, 520],
      w: 0x2d7d98,
      fl: 0x2a5870,
      gl: 0.55,
      sun: "rgba(255, 200, 130, .3)",
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
    state.glowK = t.gl;
    hallLight.intensity = n === "night" ? 1.4 : n === "dusk" ? 0.8 : 0.0;
    beam.material.opacity = n === "night" ? 0.4 : n === "dusk" ? 0.3 : 0.18;
  }
  return { setTod };
}
