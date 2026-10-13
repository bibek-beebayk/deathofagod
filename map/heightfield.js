// heightfield: initialized by main.js; dependencies are passed explicitly.
export function createHeightfield({ D, vn, up = 2, relief = 1 } = {}) {
  const S0 = 2.5,
    UP = up,
    VS = 1.9;
  const WW = 2200 * S0,
    WH = 1375 * S0,
    OX = WW / 2,
    OY = WH / 2,
    GW0 = D.gw,
    GH0 = D.gh,
    GW = GW0 * UP,
    GH = GH0 * UP,
    CELL = (D.cell * S0) / UP;
  function dec(s) {
    const b = atob(s),
      u = new Uint8Array(b.length);
    for (let i = 0; i < b.length; i++) u[i] = b.charCodeAt(i);
    return u;
  }
  {
    const sp = (a) => [a[0] * S0, a[1] * S0];
    D.places.forEach((p) => {
      p.x *= S0;
      p.y *= S0;
    });
    D.lanes.forEach((l) => {
      l.pts = l.pts.map(sp);
      l.mid = sp(l.mid);
    });
    D.ironRoads.forEach((r) => {
      r.pts = r.pts.map(sp);
    });
    D.ironRivers.forEach((r) => {
      r.pts = r.pts.map(sp);
    });
    D.routeOut = D.routeOut.map(sp);
    D.routeBack = D.routeBack.map(sp);
    D.zones.forEach((z) => {
      z.x *= S0;
      z.y *= S0;
      z.r *= S0;
    });
    D.realms.forEach((r) => {
      r[2] *= S0;
      r[3] *= S0;
    });
    D.sea.forEach((s) => {
      s[1] *= S0;
      s[2] *= S0;
    });
  }
  const RM = 135 * 1.5;
  const hr = new Uint16Array(dec(D.h).buffer),
    BM0 = dec(D.b);
  const HG0 = new Float32Array(GW0 * GH0);
  for (let i = 0; i < HG0.length; i++) HG0[i] = hr[i] / D.hs + D.hmin;
  const H = new Float32Array(GW * GH),
    BM = new Uint8Array(GW * GH),
    FL = new Float32Array(GW * GH);
  {
    const SRr = {
        city: 30,
        town: 21,
        port: 14,
        village: 10,
        fort: 10,
        landmark: 10,
        camp: 12,
      },
      OVRr = { hearthmoor: 52, verethane: 21, applegarth: 24 };
    for (const p of D.places) {
      const r =
          p.id === "hall"
            ? RM * 1.1
            : Math.max(SRr[p.kind] || 8, OVRr[p.id] || 0),
        fo = r * 1.2 + 14,
        ci = p.x / CELL,
        cj = p.y / CELL,
        m = Math.ceil((r + fo) / CELL) + 1;
      for (
        let j = Math.max(0, (cj | 0) - m);
        j < Math.min(GH, (cj | 0) + m);
        j++
      )
        for (
          let i = Math.max(0, (ci | 0) - m);
          i < Math.min(GW, (ci | 0) + m);
          i++
        ) {
          const d = Math.hypot((i + 0.5) * CELL - p.x, (j + 0.5) * CELL - p.y);
          let w = d <= r ? 1 : d >= r + fo ? 0 : 1 - (d - r) / fo;
          w = w * w * (3 - 2 * w);
          const n = j * GW + i;
          if (w > FL[n]) FL[n] = w;
        }
    }
    for (let J = 0; J < GH; J++)
      for (let I = 0; I < GW; I++) {
        const n = J * GW + I,
          fx = Math.max(0, Math.min(GW0 - 1.001, (I + 0.5) / UP - 0.5)),
          fy = Math.max(0, Math.min(GH0 - 1.001, (J + 0.5) / UP - 0.5)),
          i0 = fx | 0,
          j0 = fy | 0,
          tx = fx - i0,
          ty = fy - j0;
        const a = HG0[j0 * GW0 + i0],
          b = HG0[j0 * GW0 + i0 + 1],
          c = HG0[(j0 + 1) * GW0 + i0],
          d = HG0[(j0 + 1) * GW0 + i0 + 1];
        let hb =
          (a * (1 - tx) + b * tx) * (1 - ty) + (c * (1 - tx) + d * tx) * ty;
        let bm =
          BM0[
            Math.min(GH0 - 1, ((J + 0.5) / UP) | 0) * GW0 +
              Math.min(GW0 - 1, ((I + 0.5) / UP) | 0)
          ];
        if (!(bm & 63) && hb > 0.25) {
          let bd = 9;
          for (let dj = 0; dj < 2; dj++)
            for (let di = 0; di < 2; di++) {
              const v = BM0[(j0 + dj) * GW0 + i0 + di];
              if (v & 63) {
                const dd = Math.abs(di - tx) + Math.abs(dj - ty);
                if (dd < bd) {
                  bd = dd;
                  bm = v;
                }
              }
            }
        }
        if (bm & 63 && hb < 0) bm = 0;
        if (bm & 63 && hb > 1.3) {
          const x = (I + 0.5) * CELL,
            y = (J + 0.5) * CELL,
            id = bm & 63,
            e =
              Math.min(1, (hb - 1.3) / 3) *
              (1 + Math.min(2.2, hb / 9)) *
              (1 - FL[n]);
          if (e > 0) {
            let dn =
              (vn(x / 85, y / 85) - 0.5) * 1.5 +
              (vn(x / 36, y / 36) - 0.5) * 0.75 +
              (vn(x / 15, y / 15) - 0.5) * 0.32;
            if (id === 1 || id === 5)
              dn +=
                (Math.abs(vn(x / 60 + 7, y / 60 + 3) - 0.5) * 2 - 0.4) *
                1.8 *
                Math.min(1, hb / 10);
            hb += dn * e;
          }
        }
        {
          const q = (i, j) => (BM0[j * GW0 + i] >> 7) & 1,
            rvf =
              q(i0, j0) * (1 - tx) * (1 - ty) +
              q(i0 + 1, j0) * tx * (1 - ty) +
              q(i0, j0 + 1) * (1 - tx) * ty +
              q(i0 + 1, j0 + 1) * tx * ty;
          if (bm & 63) bm = rvf > 0.5 ? bm | 128 : bm & 127;
        }
        if (relief !== 1 && hb > 1.3 && bm & 63) {
          // Open-cast mines at Redseam and Coalgate: stepped pits with spoil rims.
          for (const id of ["redseam", "coalgate"]) {
            const mp = D.places.find((q) => q.id === id),
              R = 34,
              d = Math.hypot((I + 0.5) * CELL - mp.x, (J + 0.5) * CELL - mp.y);
            if (d < R) {
              const t = 1 - d / R,
                q5 = t * 5,
                f = q5 - Math.floor(q5);
              hb -= 6.5 * ((Math.floor(q5) + f * f * (3 - 2 * f)) / 5);
            } else if (d < R + 7) hb += 1.2 * (1 - (d - R) / 7);
          }
        }
        if (relief !== 1 && hb > 1.3 && bm & 63) {
          // Aurendell rises toward the Hall in broad terraces.
          const hp = D.places.find((q) => q.id === "hall"),
            t =
              1 -
              Math.hypot((I + 0.5) * CELL - hp.x, (J + 0.5) * CELL - hp.y) /
                330;
          if (t > 0) {
            const q7 = t * 6,
              f = q7 - Math.floor(q7),
              st = (Math.floor(q7) + f * f * (3 - 2 * f)) / 6;
            hb += (relief - 1) * 11 * Math.pow(0.45 * t + 0.55 * st, 1.15);
          }
        }
        if (relief !== 1 && hb > 1.3 && bm & 63) {
          // Optional dramatic relief: taller mountains, raised interiors that
          // meet the sea as cliffs, and sharper ridges. Settlement pads stay flat.
          const x = (I + 0.5) * CELL,
            y = (J + 0.5) * CELL,
            id = bm & 63,
            // The Iron Country keeps its mountains in the Anvil Hills; the rest stays low.
            az = id === 5 ? D.zones.find((q) => q.n === "anvil") : null,
            ak = az
              ? 0.12 +
                0.9 *
                  Math.max(0, 1 - Math.hypot(x - az.x, y - az.y) / (az.r * 1.6))
              : 1,
            k = (relief - 1) * ak,
            sm = (a, b, v) => {
              const t = Math.max(0, Math.min(1, (v - a) / (b - a)));
              return t * t * (3 - 2 * t);
            },
            ridge =
              1 -
              Math.abs(vn(x / 120 + 11, y / 120 + 5) * 2 - 1) *
                (0.6 + 0.4 * vn(x / 40, y / 40));
          hb +=
            (k * 3.2 * sm(1.3, 4.5, hb) +
              hb * k * 0.9 * sm(5, 24, hb) +
              k * 5 * sm(8, 26, hb) * ridge * ridge) *
            (1 - FL[n]);
        }
        H[n] = hb > 0 ? hb * VS : hb;
        BM[n] = bm;
      }
  }
  function hAt(x, y) {
    let fx = x / CELL - 0.5,
      fy = y / CELL - 0.5;
    fx = Math.max(0, Math.min(GW - 1.001, fx));
    fy = Math.max(0, Math.min(GH - 1.001, fy));
    const i = fx | 0,
      j = fy | 0,
      tx = fx - i,
      ty = fy - j,
      a = H[j * GW + i],
      b = H[j * GW + i + 1],
      c = H[(j + 1) * GW + i],
      d = H[(j + 1) * GW + i + 1];
    return (a * (1 - tx) + b * tx) * (1 - ty) + (c * (1 - tx) + d * tx) * ty;
  }
  function bAt(x, y) {
    const i = Math.max(0, Math.min(GW - 1, (x / CELL) | 0)),
      j = Math.max(0, Math.min(GH - 1, (y / CELL) | 0));
    return BM[j * GW + i];
  }
  return { GW, GH, BM, CELL, H, OX, OY, VS, S0, RM, hAt, WW, WH, bAt };
}
