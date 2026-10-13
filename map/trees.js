// trees: initialized by main.js; dependencies are passed explicitly.
export function createTrees({
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
} = {}) {
  // ---- trees
  function mergeG(list) {
    const P = [],
      N = [];
    for (const g of list) {
      const n = g.index ? g.toNonIndexed() : g;
      P.push(...n.attributes.position.array);
      N.push(...n.attributes.normal.array);
    }
    const o = new T.BufferGeometry();
    o.setAttribute("position", new T.Float32BufferAttribute(P, 3));
    o.setAttribute("normal", new T.Float32BufferAttribute(N, 3));
    return o;
  }
  const tg_ = (g, x, y, z) => {
    g.translate(x, y, z);
    return g;
  };
  const gTree = mergeG([
    tg_(new T.CylinderGeometry(0.16, 0.22, 0.9, 5), 0, 0.45, 0),
    tg_(new T.ConeGeometry(1, 2, 7), 0, 1.5, 0),
    tg_(new T.ConeGeometry(0.78, 1.8, 7), 0, 2.5, 0),
    tg_(new T.ConeGeometry(0.52, 1.5, 7), 0, 3.4, 0),
  ]);
  const gRound = mergeG([
    tg_(new T.CylinderGeometry(0.2, 0.28, 1.4, 5), 0, 0.7, 0),
    tg_(new T.IcosahedronGeometry(1.45, 1), 0, 2.3, 0),
    tg_(new T.IcosahedronGeometry(1, 1), 0.7, 3, 0.3),
    tg_(new T.IcosahedronGeometry(0.9, 1), -0.7, 2.9, -0.3),
  ]);
  const mTree = new T.MeshLambertMaterial({ vertexColors: false });
  const NT = 30000;
  const trees = new T.InstancedMesh(gTree, mTree, NT),
    rounds = new T.InstancedMesh(gRound, mTree, NT);
  let nt = 0,
    nr = 0;
  const DENS = { 1: 0.07, 2: 0, 3: 0.1, 4: 0.16, 5: 0.2, 6: 0.5, 7: 0.22 };
  const TCOL = {
    1: "#4d6b57",
    3: "#6fae9b",
    4: "#7d7a8f",
    5: "#4e6b3a",
    6: "#5f9a3a",
    7: "#6f8a6a",
  };
  const dummy = new T.Object3D(),
    cc = new T.Color();
  const near = Object.values(P).filter((p) => p.kind !== "camp");
  for (let t = 0; t < 900000 && nt + nr < NT * 1.6; t++) {
    const x = rnd() * WW,
      y = rnd() * WH,
      bm = bAt(x, y),
      id = bm & 63;
    if (!id || bm & 192) continue;
    if (inOrch(x, y)) continue;
    const h = hAt(x, y),
      h0 = h / VS;
    if (h0 < 1.3 || h0 > (id === 3 ? 40 : 17)) continue;
    if (id === 3 && Math.hypot(x - HALL0.x, y - HALL0.y) < 26) continue;
    let d =
      DENS[Math.min(id, 7)] *
      Math.max(
        0.12,
        Math.min(1.9, (vn((x / S0) * 0.02, (y / S0) * 0.02) - 0.22) * 3.2),
      );
    for (const z of zs) {
      const dd = Math.hypot(x - z.x, y - z.y);
      if (dd < z.r) {
        d = z.k === "wood" ? Math.max(d, 0.8) : d * z.d;
      }
    }
    if (id === 1 && y < P.verethane.y - 5) d *= 0.2;
    if (rnd() > d) continue;
    let bad = false;
    for (const p of near) {
      if (Math.abs(p.x - x) < 9 && Math.abs(p.y - y) < 9) {
        bad = true;
        break;
      }
    }
    if (bad) continue;
    const s = (0.7 + rnd() * 0.9) * 0.85,
      c = cc
        .set(TCOL[Math.min(id, 7)] || "#5a7a4a")
        .offsetHSL((rnd() - 0.5) * 0.04, 0, (rnd() - 0.5) * 0.1);
    const round = id === 6 && rnd() < 0.5;
    if ((round && nr >= NT) || (!round && nt >= NT)) continue;
    dummy.position.set(x - OX, h - 0.1, y - OY);
    dummy.rotation.set(0, rnd() * 6, 0);
    dummy.scale.set(
      id === 1 ? s * 0.55 : s,
      id === 1 ? s * 1.5 : s,
      id === 1 ? s * 0.55 : s,
    );
    dummy.updateMatrix();
    if (round) {
      rounds.setMatrixAt(nr, dummy.matrix);
      rounds.setColorAt(nr++, c);
    } else {
      trees.setMatrixAt(nt, dummy.matrix);
      trees.setColorAt(nt++, c);
    }
  }
  trees.castShadow = rounds.castShadow = true;
  trees.receiveShadow = rounds.receiveShadow = true;
  trees.count = nt;
  rounds.count = nr;
  trees.instanceMatrix.needsUpdate = rounds.instanceMatrix.needsUpdate = true;
  if (trees.instanceColor) trees.instanceColor.needsUpdate = true;
  if (rounds.instanceColor) rounds.instanceColor.needsUpdate = true;
  const gTrees = new T.Group();
  gTrees.add(trees, rounds);
  world.add(gTrees);
  // Hollow Roads scrub and rocks
  {
    const HX = 1459.5 * S0,
      HY = 1168.9 * S0,
      sg = new T.IcosahedronGeometry(0.85, 0);
    sg.translate(0, 0.4, 0);
    const rg = new T.IcosahedronGeometry(1, 0);
    rg.translate(0, 0.35, 0);
    const NS = 800,
      NR = 170,
      sm = new T.InstancedMesh(sg, new T.MeshLambertMaterial(), NS),
      rm = new T.InstancedMesh(rg, new T.MeshLambertMaterial(), NR);
    let ns = 0,
      nr2 = 0;
    const dm = new T.Object3D(),
      cl = new T.Color();
    const segs = [];
    D.ironRoads.forEach((r) => {
      if (
        Math.abs(r.pts[0][0] - HX) < 90 * S0 &&
        Math.abs(r.pts[0][1] - HY) < 60 * S0
      )
        for (let i = 0; i < r.pts.length - 1; i++)
          segs.push([r.pts[i], r.pts[i + 1]]);
    });
    const dRd = (x, y) => {
      let m = 99;
      for (const [a, b] of segs) {
        const dx = b[0] - a[0],
          dy = b[1] - a[1],
          L = dx * dx + dy * dy || 1,
          t = Math.max(0, Math.min(1, ((x - a[0]) * dx + (y - a[1]) * dy) / L));
        m = Math.min(m, Math.hypot(x - a[0] - t * dx, y - a[1] - t * dy));
      }
      return m;
    };
    const pins = Object.values(P).filter(
      (p) => Math.abs(p.x - HX) < 90 * S0 && Math.abs(p.y - HY) < 60 * S0,
    );
    for (let t = 0; t < 60000 && (ns < NS || nr2 < NR); t++) {
      const x = HX + (rnd() - 0.5) * 160 * S0,
        y = HY + (rnd() - 0.5) * 90 * S0,
        bm = bAt(x, y);
      if (!(bm & 63) || bm & 192) continue;
      const h = hAt(x, y);
      if (h < 0.45) continue;
      if (dRd(x, y) < 5) continue;
      if (pins.some((p) => Math.hypot(p.x - x, p.y - y) < 8)) continue;
      if (rnd() < 0.8 && ns < NS) {
        const s = 0.4 + rnd() * 0.6;
        dm.position.set(x - OX, h - 0.1, y - OY);
        dm.rotation.set(0, rnd() * 6, 0);
        dm.scale.set(s * 1.2, s * (0.55 + rnd() * 0.35), s * 1.2);
        dm.updateMatrix();
        sm.setMatrixAt(ns, dm.matrix);
        sm.setColorAt(
          ns++,
          cl
            .set("#7f8d62")
            .offsetHSL((rnd() - 0.5) * 0.07, 0, (rnd() - 0.5) * 0.14),
        );
      } else if (nr2 < NR) {
        const s = 0.5 + rnd() * 1.1;
        dm.position.set(x - OX, h - 0.15, y - OY);
        dm.rotation.set(rnd() * 3, rnd() * 6, rnd() * 3);
        dm.scale.set(s * 1.3, s * 0.8, s);
        dm.updateMatrix();
        rm.setMatrixAt(nr2, dm.matrix);
        rm.setColorAt(
          nr2++,
          cl.set("#8c8798").offsetHSL(0, 0, (rnd() - 0.5) * 0.14),
        );
      }
    }
    sm.count = ns;
    rm.count = nr2;
    sm.castShadow = rm.castShadow = true;
    sm.receiveShadow = rm.receiveShadow = true;
    sm.instanceMatrix.needsUpdate = rm.instanceMatrix.needsUpdate = true;
    if (sm.instanceColor) sm.instanceColor.needsUpdate = true;
    if (rm.instanceColor) rm.instanceColor.needsUpdate = true;
    gTrees.add(sm, rm);
  }

  return { dummy, cc, gRound, gTrees };
}
