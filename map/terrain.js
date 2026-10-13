// terrain: initialized by main.js; dependencies are passed explicitly.
export function createTerrain({
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
} = {}) {
  // ---- terrain
  const PAL = {
    1: "#b4c19f",
    2: "#dcc380",
    3: "#c6c685",
    4: "#a8a2bb",
    5: "#a88462",
    6: "#8fb25a",
    7: "#8aa085",
  };
  const col = (k) => new T.Color(k);
  const C = {};
  for (const k in PAL) C[k] = col(PAL[k]);
  const FOR = col("#4b6a3c"),
    SAND = col("#e6d9a8"),
    ROCK = col("#8d8880"),
    SNOW = col("#f1f3f4"),
    DARK = col("#5e4a3d"),
    RIVER = col("#6fa3c0"),
    SALT = col("#f1ede0"),
    SHAL = col("#74cdc4"),
    FOAM = col("#f4f8f6");
  const HALL0 = D.places.find((p) => p.id === "hall");
  const MARB = col("#f0e7cc"),
    TRD = col("#b5c78a"),
    GOLD = col("#e9dba0"),
    PALE = col("#f6efd6");
  const zs = D.zones.map((z) => ({ ...z, c: col(z.c) }));
  const pos = new Float32Array(GW * GH * 3),
    clr = new Float32Array(GW * GH * 3),
    idx = new Uint32Array((GW - 1) * (GH - 1) * 6);
  let ni_ = 0;
  const tmp = new T.Color();
  const nsea = (i, j) => {
    for (const [di, dj] of [
      [3, 0],
      [-3, 0],
      [0, 3],
      [0, -3],
      [2, 2],
      [-2, -2],
      [2, -2],
      [-2, 2],
    ]) {
      const a = Math.max(0, Math.min(GW - 1, i + di)),
        b = Math.max(0, Math.min(GH - 1, j + dj));
      if (!(BM[b * GW + a] & 63)) return 1;
    }
    return 0;
  };
  for (let j = 0; j < GH; j++)
    for (let i = 0; i < GW; i++) {
      const n = j * GW + i,
        x = (i + 0.5) * CELL,
        y = (j + 0.5) * CELL,
        h = H[n];
      pos[n * 3] = x - OX;
      pos[n * 3 + 1] = h;
      pos[n * 3 + 2] = y - OY;
      const bm = BM[n],
        id = bm & 63,
        h0 = h > 0 ? h / VS : h,
        xs = x / S0,
        ys = y / S0;
      let c;
      if (!id) {
        const d = Math.min(1, -h / 9);
        tmp.setRGB(0.5 - 0.25 * d, 0.72 - 0.3 * d, 0.76 - 0.22 * d);
        const sh = Math.max(0, 1 - -h / 2.6);
        tmp.lerp(SHAL, sh * 0.75);
        if (h > -0.5) {
          const fn = vn(xs * 0.22, ys * 0.22);
          tmp.lerp(FOAM, Math.max(0, 1 + h / 0.5) * 0.34 * (0.4 + fn));
        }
        c = tmp;
      } else {
        const nz =
          vn(xs * 0.04, ys * 0.04) * 0.55 +
          vn(xs * 0.17, ys * 0.17) * 0.3 +
          vn(x * 0.7, y * 0.7) * 0.15;
        const base = C[Math.min(id, 7)];
        tmp.copy(base);
        tmp.offsetHSL(
          (vn(xs * 0.013, ys * 0.013) - 0.5) * 0.035,
          (vn(xs * 0.02 + 9, ys * 0.02) - 0.5) * 0.12,
          (vn(xs * 0.03, ys * 0.03 + 4) - 0.5) * 0.05,
        );
        const gx =
            H[j * GW + Math.min(GW - 1, i + 1)] -
            H[j * GW + Math.max(0, i - 1)],
          gy =
            H[Math.min(GH - 1, j + 1) * GW + i] -
            H[Math.max(0, j - 1) * GW + i],
          sl = Math.hypot(gx, gy) / (2 * CELL);
        for (const z of zs) {
          const d = Math.hypot(x - z.x, y - z.y);
          if (d < z.r) {
            tmp.lerp(z.c, Math.min(1, (1 - d / z.r) * 2.2) * 0.85);
          }
        }
        {
          const DT = { 1: 0.07, 3: 0.1, 4: 0.16, 5: 0.2, 6: 0.5, 7: 0.22 },
            pf = Math.max(
              0.12,
              Math.min(1.9, (vn(xs * 0.02, ys * 0.02) - 0.22) * 3.2),
            );
          tmp.lerp(FOR, Math.min(0.45, (DT[id] || 0) * pf * 0.8));
        }
        const rockT =
          id === 1
            ? Math.max(0, (h0 - 14) / 12)
            : id === 5
              ? Math.max(0, (h0 - 9) / 14)
              : Math.max(0, (h0 - 12) / 20);
        tmp.lerp(id === 5 ? DARK : ROCK, Math.min(1, rockT));
        tmp.lerp(ROCK, Math.min(0.8, Math.max(0, sl - 0.28) * 2));
        if (id === 1 && h0 > 29) tmp.lerp(SNOW, Math.min(1, (h0 - 29) / 5));
        if (h0 < 1.15)
          tmp.lerp(
            SAND,
            Math.min(1, (1.15 - h0) / 0.9) * (nsea(i, j) ? 1 : 0.2),
          );
        if (h0 < 0.55 && !(bm & 128) && nsea(i, j))
          tmp.lerp(
            FOAM,
            Math.min(0.6, (0.55 - h0) * 1.1) * (0.5 + vn(x * 0.6, y * 0.6)),
          );
        if (bm & 64) tmp.copy(SALT);
        if (bm & 128) tmp.lerp(RIVER, 0.9);
        if (id === 3) {
          const r = Math.hypot(x - HALL0.x, y - HALL0.y),
            t = Math.max(0, 1 - r / RM);
          if (t > 0 && !(bm & 128)) {
            const q = t * 9,
              fr = q - Math.floor(q);
            if (fr > 0.6) tmp.copy(MARB);
            else {
              tmp.copy(TRD).lerp(GOLD, Math.min(1, t * 1.2));
              if (t > 0.8) tmp.lerp(PALE, (t - 0.8) * 4);
            }
          }
        }
        const hn =
            (H[j * GW + Math.min(GW - 1, i + 2)] +
              H[j * GW + Math.max(0, i - 2)] +
              H[Math.min(GH - 1, j + 2) * GW + i] +
              H[Math.max(0, j - 2) * GW + i]) /
            4,
          ao = Math.max(-0.16, Math.min(0.16, (h - hn) * 0.035));
        const v =
          ((id === 3 ? 0.94 : 0.88) + (id === 3 ? 0.12 : 0.24) * nz) * (1 + ao);
        tmp.multiplyScalar(v);
        c = tmp;
      }
      clr[n * 3] = c.r;
      clr[n * 3 + 1] = c.g;
      clr[n * 3 + 2] = c.b;
    }
  for (let j = 0; j < GH - 1; j++)
    for (let i = 0; i < GW - 1; i++) {
      const a = j * GW + i,
        b = a + 1,
        c = a + GW,
        d = c + 1;
      idx[ni_++] = a;
      idx[ni_++] = c;
      idx[ni_++] = b;
      idx[ni_++] = b;
      idx[ni_++] = c;
      idx[ni_++] = d;
    }
  const tg = new T.BufferGeometry();
  tg.setAttribute("position", new T.BufferAttribute(pos, 3));
  tg.setAttribute("color", new T.BufferAttribute(clr, 3));
  tg.setIndex(new T.BufferAttribute(idx, 1));
  tg.computeVertexNormals();
  const terrain = new T.Mesh(
    tg,
    new T.MeshLambertMaterial({ vertexColors: true }),
  );
  terrain.receiveShadow = true;
  world.add(terrain);
  return { HALL0, zs };
}
