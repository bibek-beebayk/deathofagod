// forges: chimney smoke, furnace glow and lit mine adits across the Iron Country.
// Smoke is a GPU-animated point cloud; glow is additive sprites. Uses its own
// hash, so the scene's seeded random stream is never consumed.
export function createForges({
  T,
  world,
  D,
  hash,
  hAt,
  OX,
  OY,
  zs,
  quality,
} = {}) {
  const g = new T.Group();
  world.add(g);
  const r1 = (i, o) => hash(i * 13 + o, i * 5 + o * 17 + 313);
  const place = (id) => D.places.find((p) => p.id === id);
  const ground = (x, y) => Math.max(hAt(x, y), 0.3) * 1.0;
  const per = quality.lite ? 8 : 14;
  // emitter: x,y in map coordinates, top = height above ground of the chimney mouth
  const light = [],
    dark = [],
    white = [],
    glows = [];
  const addSmoke = (list, x, y, top, n = per) => list.push({ x, y, top, n });
  // Hearthmoor chimneys
  {
    const h = place("hearthmoor");
    for (let k = 0; k < (quality.lite ? 14 : 26); k++) {
      const a = r1(k, 1) * 6.28,
        r = Math.sqrt(r1(k, 2)) * 24;
      addSmoke(light, h.x + Math.cos(a) * r, h.y + Math.sin(a) * r, 6.5, 6);
    }
    const f = place("h_the_Vaele_forge");
    addSmoke(dark, f.x, f.y, 7, 10);
    glows.push({ x: f.x, y: f.y, h: 3.5, s: 14, k: 1 });
  }
  // Smeltmouth furnaces
  {
    const s = place("smeltmouth");
    const offs = [
      [-9, -2],
      [-3, 5],
      [5, -4],
      [10, 3],
    ];
    offs.forEach(([dx, dy], k) => {
      addSmoke(dark, s.x + dx, s.y + dy, 20 + k * 2, per + 4);
      glows.push({ x: s.x + dx, y: s.y + dy, h: 19 + k * 2, s: 17, k: 1.2 });
      glows.push({ x: s.x + dx, y: s.y + dy, h: 3, s: 20, k: 0.8 });
    });
    glows.push({ x: s.x + 2, y: s.y + 14, h: 1.2, s: 40, k: 0.9 }); // slag run to the sea
  }
  // Cinderwick wharves
  {
    const c = place("cinderwick");
    for (let k = 0; k < 3; k++) {
      addSmoke(dark, c.x - 6 + k * 5, c.y - 4 + k * 2, 9, 8);
      glows.push({
        x: c.x - 6 + k * 5,
        y: c.y - 4 + k * 2,
        h: 8,
        s: 9,
        k: 0.7,
      });
    }
  }
  // Mines: dust and smoke over the pits
  for (const id of ["redseam", "coalgate"]) {
    const m = place(id);
    addSmoke(id === "redseam" ? light : dark, m.x - 6, m.y + 3, 2, 8);
    addSmoke(id === "redseam" ? light : dark, m.x + 8, m.y - 5, 2, 8);
  }
  // Lit mine adits scattered across the Anvil Hills, and charcoal burners in the wood
  {
    const az = zs.find((z) => z.n === "anvil"),
      wz = zs.find((z) => z.n === "wood");
    let got = 0;
    for (let t = 0; t < 400 && got < (quality.lite ? 6 : 11); t++) {
      const a = r1(t, 41) * 6.28,
        r = Math.sqrt(r1(t, 42)) * az.r * 1.1,
        x = az.x + Math.cos(a) * r,
        y = az.y + Math.sin(a) * r;
      if (hAt(x, y) / 1.9 < 10) continue;
      glows.push({ x, y, h: 1.5, s: 11, k: 0.9 });
      if (got % 2 === 0) addSmoke(white, x, y, 2, 6);
      got++;
    }
    for (let k = 0; k < (quality.lite ? 4 : 8); k++) {
      const a = r1(k, 51) * 6.28,
        r = Math.sqrt(r1(k, 52)) * wz.r * 0.8;
      addSmoke(white, wz.x + Math.cos(a) * r, wz.y + Math.sin(a) * r, 3, 10);
    }
  }
  // ---- smoke clouds
  const mk = (list, color, rise, size, alpha, speed) => {
    const N = list.reduce((s, e) => s + e.n, 0),
      base = new Float32Array(N * 3),
      seed = new Float32Array(N * 2);
    let i = 0;
    for (const e of list)
      for (let k = 0; k < e.n; k++, i++) {
        base[i * 3] = e.x - OX;
        base[i * 3 + 1] = ground(e.x, e.y) + e.top;
        base[i * 3 + 2] = e.y - OY;
        seed[i * 2] = k / e.n + r1(i, 61) * 0.05;
        seed[i * 2 + 1] = r1(i, 62);
      }
    const geo = new T.BufferGeometry();
    geo.setAttribute("position", new T.BufferAttribute(base, 3));
    geo.setAttribute("aSeed", new T.BufferAttribute(seed, 2));
    const u = {
      uTime: { value: 0 },
      uColor: { value: new T.Color(color) },
      uTint: { value: 1 },
      uRise: { value: rise },
      uSize: { value: size },
      uAlpha: { value: alpha },
      uSpeed: { value: speed },
      uPx: { value: 800 },
    };
    const m = new T.ShaderMaterial({
      uniforms: u,
      transparent: true,
      depthWrite: false,
      vertexShader: `
        attribute vec2 aSeed;
        uniform float uTime, uRise, uSize, uSpeed, uPx;
        varying float vAge;
        varying float vFade;
        void main(){
          float age = fract(uTime * uSpeed + aSeed.x);
          vAge = age;
          vec3 p = position;
          p.y += age * uRise;
          p.x += (age * 26.0 + sin(age * 6.0 + aSeed.y * 40.0) * 3.0) * (0.6 + aSeed.y * 0.8);
          p.z += age * 9.0 + cos(age * 5.0 + aSeed.y * 30.0) * 3.0;
          vec4 mv = modelViewMatrix * vec4(p, 1.0);
          gl_Position = projectionMatrix * mv;
          float s = uSize * (0.5 + age * 2.4) * (0.8 + aSeed.y * 0.5);
          gl_PointSize = clamp(s * uPx / max(1.0, -mv.z), 0.0, 220.0);
          vFade = 1.0 - smoothstep(2500.0, 7000.0, -mv.z);
        }`,
      fragmentShader: `
        uniform vec3 uColor;
        uniform float uTint, uAlpha;
        varying float vAge;
        varying float vFade;
        void main(){
          vec2 c = gl_PointCoord - 0.5;
          float d = length(c) * 2.0;
          float a = (1.0 - smoothstep(0.35, 1.0, d)) * (1.0 - vAge) * smoothstep(0.0, 0.12, vAge);
          gl_FragColor = vec4(uColor * uTint, a * uAlpha * vFade);
        }`,
    });
    const pts = new T.Points(geo, m);
    pts.frustumCulled = false;
    pts.renderOrder = 4;
    g.add(pts);
    return u;
  };
  const sm = [
    mk(light, 0xc9c6c0, 46, 7, 0.5, 0.11),
    mk(dark, 0x4b4643, 95, 12, 0.62, 0.075),
    mk(white, 0xe6e6e2, 40, 8, 0.4, 0.09),
  ];
  // ---- glows
  const c = document.createElement("canvas");
  c.width = c.height = 64;
  const cx = c.getContext("2d"),
    gr = cx.createRadialGradient(32, 32, 1, 32, 32, 31);
  gr.addColorStop(0, "rgba(255,210,130,1)");
  gr.addColorStop(0.25, "rgba(255,150,50,.65)");
  gr.addColorStop(1, "rgba(255,80,10,0)");
  cx.fillStyle = gr;
  cx.fillRect(0, 0, 64, 64);
  const gtex = new T.CanvasTexture(c);
  const sprites = glows.map((e, i) => {
    const s = new T.Sprite(
      new T.SpriteMaterial({
        map: gtex,
        transparent: true,
        blending: T.AdditiveBlending,
        depthWrite: false,
        fog: false,
      }),
    );
    s.position.set(e.x - OX, ground(e.x, e.y) + e.h, e.y - OY);
    s.scale.setScalar(e.s);
    s.userData = { e, ph: r1(i, 71) * 6.28 };
    s.renderOrder = 5;
    g.add(s);
    return s;
  });
  // Called every frame by the animation loop.
  function update(tt, tod, R) {
    const night = tod === "night" ? 1 : tod === "dusk" ? 0.8 : 0.26,
      px = R.getDrawingBufferSize(new T.Vector2()).y * 0.5 * 2.2;
    const tint = tod === "night" ? 0.35 : tod === "dusk" ? 0.7 : 1;
    for (const u of sm) {
      u.uTime.value = tt;
      u.uPx.value = px;
      u.uTint.value = tint;
    }
    for (const s of sprites) {
      const f =
        0.82 +
        0.18 *
          Math.sin(tt * 3.1 + s.userData.ph) *
          Math.sin(tt * 1.7 + s.userData.ph * 2);
      s.material.opacity = Math.min(1, s.userData.e.k * night * f);
    }
  }
  return { gForges: g, update };
}
