// terrain: initialized by main.js; dependencies are passed explicitly.
import { createDetailTextures } from "./detail.js";

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
  quality,
} = {}) {
  // ---- terrain
  const PAL = {
    1: "#7f8b66",
    2: "#b99d68",
    3: "#9aa066",
    4: "#8b8794",
    5: "#7d634b",
    6: "#5f8238",
    7: "#6f8365",
  };
  const col = (k) => new T.Color(k);
  const C = {};
  for (const k in PAL) C[k] = col(PAL[k]);
  const FOR = col("#263f22"),
    SAND = col("#d8c999"),
    ROCK = col("#7a766e"),
    SNOW = col("#f1f3f4"),
    DARK = col("#5e4a3d"),
    RIVER = col("#6fa3c0"),
    SALT = col("#f1ede0"),
    SHAL = col("#74cdc4"),
    FOAM = col("#f4f8f6");
  const FIELD = [
      col("#d2b24e"),
      col("#e0cd7a"),
      col("#86a047"),
      col("#8a6a3c"),
    ],
    HEDGE = col("#35502c"),
    GRASS = col("#6d8a44"),
    CLIFFA = col("#8a7660"),
    CLIFFB = col("#5f5850"),
    HEATH = col("#7f5c88"),
    HEATH2 = col("#5f4a62"),
    RUST = col("#7b4a30"),
    CHAR = col("#3f3733"),
    SCREE = col("#2f2c2a"),
    PAN1 = col("#eef0ea"),
    PAN2 = col("#c9dde2"),
    PANEDGE = col("#9d9580"),
    SPOIL = col("#5a4a3d"),
    PITR = [col("#9a3326"), col("#b84a30"), col("#6a2822")],
    PITC = [col("#1d1d1f"), col("#2e2d30"), col("#121214")];
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
        for (const id of ["redseam", "coalgate"]) {
          const mp = D.places.find((q) => q.id === id),
            d = Math.hypot(x - mp.x, y - mp.y);
          if (d < 41) {
            const t = 1 - d / 34;
            if (t < 0) tmp.lerp(SPOIL, 0.8 * (1 - (d - 34) / 7));
            else {
              const b = Math.floor(t * 5) % 3,
                pal = id === "redseam" ? PITR : PITC;
              tmp.copy(pal[b]);
            }
          }
        }
        {
          const DT = { 1: 0.07, 3: 0.1, 4: 0.16, 5: 0.2, 6: 0.5, 7: 0.22 },
            pf = Math.max(
              0.12,
              Math.min(1.9, (vn(xs * 0.02, ys * 0.02) - 0.22) * 3.2),
            );
          tmp.lerp(FOR, Math.min(0.7, (DT[id] || 0) * pf * 1.3));
        }
        const rockT =
          id === 1
            ? Math.max(0, (h0 - 14) / 12)
            : id === 5
              ? Math.max(0, (h0 - 24) / 16)
              : Math.max(0, (h0 - 12) / 20);
        tmp.lerp(id === 5 ? DARK : ROCK, Math.min(1, rockT));
        tmp.lerp(ROCK, Math.min(0.8, Math.max(0, sl - 0.28) * 2));
        if (sl > 0.24 && h0 < 30) {
          // Sea-cliff faces: layered strata in warm and grey rock.
          const band =
            0.5 + 0.5 * Math.sin(h * 1.7 + vn(xs * 0.3, ys * 0.3) * 6);
          tmp.lerp(
            band > 0.5 ? CLIFFA : CLIFFB,
            Math.min(0.9, (sl - 0.24) * 4.5),
          );
        }
        if (id === 5 && sl < 0.3) {
          // Iron Country lowlands: grassy plains below the brown foothills.
          const lo = 1 - Math.max(0, Math.min(1, (h0 - 3) / 12));
          tmp.lerp(GRASS, lo * (0.35 + 0.45 * vn(xs * 0.05 + 2, ys * 0.05)));
        }
        for (const z of zs) {
          const d = Math.hypot(x - z.x, y - z.y);
          if (d >= z.r) continue;
          const w = Math.min(1, (1 - d / z.r) * 3),
            hh = h0;
          if (z.k === "farm" && !(bm & 128) && hh > 1) {
            // Patchwork of hedged fields, each with its own crop colour.
            const u = (x * 0.94 + y * 0.34) / 15,
              v = (-x * 0.34 + y * 0.94) / 15,
              ci = Math.floor(u),
              cj = Math.floor(v),
              k = vn(ci * 13, cj * 17),
              e = Math.min(u - ci, 1 + ci - u, v - cj, 1 + cj - v);
            tmp.lerp(
              k < 0.25
                ? FIELD[0]
                : k < 0.5
                  ? FIELD[1]
                  : k < 0.72
                    ? FIELD[2]
                    : FIELD[3],
              0.85 * w,
            );
            if (e < 0.06) tmp.lerp(HEDGE, 0.75 * w);
            else tmp.multiplyScalar(1 + 0.08 * Math.sin(v * 70 + k * 9) * w);
          } else if (z.k === "moor") {
            tmp.lerp(vn(xs * 0.3, ys * 0.3) > 0.5 ? HEATH : HEATH2, 0.8 * w);
          } else if (z.k === "hills") {
            const r2 = vn(xs * 0.15 + 5, ys * 0.15);
            tmp.lerp(r2 > 0.5 ? RUST : CHAR, 0.8 * w);
            if (sl > 0.14) tmp.lerp(SCREE, Math.min(0.7, (sl - 0.14) * 3) * w);
          } else if (z.k === "salt" && hh < 2.2 && !(bm & 128)) {
            const u = x / 7,
              v = y / 5,
              ci = Math.floor(u),
              cj = Math.floor(v);
            const e = Math.min(u - ci, 1 + ci - u, v - cj, 1 + cj - v);
            tmp.lerp(vn(ci * 5, cj * 3) > 0.5 ? PAN1 : PAN2, 0.9 * w);
            if (e < 0.09) tmp.lerp(PANEDGE, 0.8 * w);
          }
        }
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
        const cs = vn(x * 1.9 + 3, y * 1.9) - 0.5,
          v =
            ((id === 3 ? 0.94 : 0.88) +
              (id === 3 ? 0.12 : 0.24) * nz +
              (id === 3 ? 0.05 : 0.22) * cs) *
            (1 + ao);
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
  // Ground texture coordinates in world units, for the tiling detail maps.
  const uv = new Float32Array(GW * GH * 2);
  for (let n = 0; n < GW * GH; n++) {
    uv[n * 2] = pos[n * 3];
    uv[n * 2 + 1] = pos[n * 3 + 2];
  }
  tg.setAttribute("uv", new T.BufferAttribute(uv, 2));
  const detail = createDetailTextures({ T });
  detail.albedo.repeat.set(1 / 70, 1 / 70);
  detail.bump.repeat.set(1 / 24, 1 / 24);
  // Per-pixel lighting (Phong without specular) shows relief far better than
  // the per-vertex Lambert shading it replaces.
  const terrainMat = new T.MeshPhongMaterial({
    vertexColors: true,
    map: detail.albedo,
    specular: 0x000000,
    shininess: 0,
  });
  if (quality.detailBump) {
    terrainMat.bumpMap = detail.bump;
    terrainMat.bumpScale = 1.6;
  }

  function paintOverlay() {
    const TW = quality.lite ? 2048 : 4096,
      TH = TW / 2,
      WWd = OX * 2,
      WHd = OY * 2,
      cv = document.createElement("canvas");
    cv.width = TW;
    cv.height = TH;
    const g = cv.getContext("2d"),
      px = (c) => [(c.r * 255) | 0, (c.g * 255) | 0, (c.b * 255) | 0];
    const box = (cx, cy, r, fn) => {
      const x0 = Math.max(0, Math.floor(((cx - r) / WWd) * TW)),
        x1 = Math.min(TW, Math.ceil(((cx + r) / WWd) * TW)),
        y0 = Math.max(0, Math.floor(((cy - r) / WHd) * TH)),
        y1 = Math.min(TH, Math.ceil(((cy + r) / WHd) * TH));
      const im = g.createImageData(x1 - x0, y1 - y0);
      for (let ty = y0; ty < y1; ty++)
        for (let tx = x0; tx < x1; tx++) {
          const x = ((tx + 0.5) / TW) * WWd,
            y = ((ty + 0.5) / TH) * WHd,
            gi = Math.max(0, Math.min(GW - 1, (x / CELL) | 0)),
            gj = Math.max(0, Math.min(GH - 1, (y / CELL) | 0)),
            bm = BM[gj * GW + gi],
            o = ((ty - y0) * (x1 - x0) + (tx - x0)) * 4,
            r = fn(x, y, bm, H[gj * GW + gi] / VS);
          if (r) {
            im.data[o] = r[0];
            im.data[o + 1] = r[1];
            im.data[o + 2] = r[2];
            im.data[o + 3] = r[3];
          }
        }
      g.putImageData(im, x0, y0);
    };
    for (const z of zs) {
      if (z.k === "farm")
        box(z.x, z.y, z.r, (x, y, bm, h0) => {
          const d = Math.hypot(x - z.x, y - z.y);
          if (d >= z.r || !(bm & 63) || bm & 128 || h0 < 1) return null;
          const u = (x * 0.94 + y * 0.34) / 15,
            v = (-x * 0.34 + y * 0.94) / 15,
            ci = Math.floor(u),
            cj = Math.floor(v),
            k = vn(ci * 13, cj * 17),
            e = Math.min(u - ci, 1 + ci - u, v - cj, 1 + cj - v),
            a = Math.min(1, (1 - d / z.r) * 2.2) * 0.95;
          if (e < 0.07) return [...px(HEDGE), a * 255];
          const c = px(
              k < 0.25
                ? FIELD[0]
                : k < 0.5
                  ? FIELD[1]
                  : k < 0.72
                    ? FIELD[2]
                    : FIELD[3],
            ),
            f = 1 + 0.07 * Math.sin(v * 90 + k * 9);
          return [c[0] * f, c[1] * f, c[2] * f, a * 255];
        });
      else if (z.k === "salt")
        box(z.x, z.y, z.r, (x, y, bm, h0) => {
          const d = Math.hypot(x - z.x, y - z.y);
          if (d >= z.r || !(bm & 63) || bm & 128 || h0 > 2.2) return null;
          const u = x / 7,
            v = y / 5,
            ci = Math.floor(u),
            cj = Math.floor(v),
            e = Math.min(u - ci, 1 + ci - u, v - cj, 1 + cj - v),
            a = Math.min(1, (1 - d / z.r) * 4) * 0.95;
          return [
            ...px(e < 0.09 ? PANEDGE : vn(ci * 5, cj * 3) > 0.5 ? PAN1 : PAN2),
            a * 255,
          ];
        });
    }
    for (const id of ["redseam", "coalgate"]) {
      const mp = D.places.find((q) => q.id === id),
        pal = id === "redseam" ? PITR : PITC;
      box(mp.x, mp.y, 42, (x, y) => {
        const d = Math.hypot(x - mp.x, y - mp.y);
        if (d > 41) return null;
        const t = 1 - d / 34;
        if (t < 0) return [...px(SPOIL), 255 * 0.8 * (1 - (d - 34) / 7)];
        const q5 = t * 5,
          b = Math.floor(q5) % 3,
          edge = q5 - Math.floor(q5) < 0.08 ? 0.75 : 1,
          c = px(pal[b]);
        return [c[0] * edge, c[1] * edge, c[2] * edge, 255];
      });
    }
    const tex = new T.CanvasTexture(cv);
    tex.flipY = false;
    tex.anisotropy = 4;
    return tex;
  }
  // Fine ground features (hedged fields, salt pans, mine terraces) are painted into
  // an overlay texture so they stay crisp however coarse the terrain mesh is.
  const ov = paintOverlay();
  terrainMat.onBeforeCompile = (sh) => {
    sh.uniforms.uOv = { value: ov };
    sh.uniforms.uWorld = { value: new T.Vector4(OX, OY, OX * 2, OY * 2) };
    sh.vertexShader = sh.vertexShader
      .replace("#include <common>", "#include <common>\nvarying vec2 vOvXY;")
      .replace("#include <uv_vertex>", "#include <uv_vertex>\nvOvXY = uv;");
    sh.fragmentShader = sh.fragmentShader
      .replace(
        "#include <common>",
        "#include <common>\nvarying vec2 vOvXY;\nuniform sampler2D uOv;\nuniform vec4 uWorld;",
      )
      .replace(
        "#include <color_fragment>",
        `#include <color_fragment>
        vec4 ovc = texture2D(uOv, (vOvXY + uWorld.xy) / uWorld.zw);
        diffuseColor.rgb = mix(diffuseColor.rgb, ovc.rgb * (0.8 + 0.35 * texelColor.r), ovc.a);`,
      );
  };
  const terrain = new T.Mesh(tg, terrainMat);
  terrain.receiveShadow = true;
  world.add(terrain);
  return { HALL0, zs };
}
