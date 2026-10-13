// routes: initialized by main.js; dependencies are passed explicitly.
export function createRoutes({ T, world, D, OX, OY, hAt, sprite } = {}) {
  // ---- Iron Country roads
  const gRoads = new T.Group();
  world.add(gRoads);
  {
    const cu = (pts) =>
      new T.CatmullRomCurve3(
        pts.map((p) => new T.Vector3(p[0], 0, p[1])),
        false,
        "catmullrom",
        0.4,
      );
    // Two ribbons per road: a dark worn verge underneath and a pale packed surface on top.
    const ribbon = (wk, lift, color, order) => {
      const pos = [],
        idx = [];
      let n = 0;
      for (const R of D.ironRoads) {
        const c = cu(R.pts.map((p) => [p[0] - OX, p[1] - OY])),
          len = c.getLength(),
          N = Math.max(8, Math.round(len / 4)),
          w = (R.main ? 2.2 : 1.5) * wk;
        for (let i = 0; i <= N; i++) {
          const u = c.getPointAt(i / N),
            t = c.getTangentAt(i / N),
            nx = -t.z * w,
            nz = t.x * w;
          const y = (x) =>
            Math.max(hAt(u.x + OX + x[0], u.z + OY + x[1]), 0.25) + lift;
          pos.push(
            u.x + nx,
            y([nx, nz]),
            u.z + nz,
            u.x - nx,
            y([-nx, -nz]),
            u.z - nz,
          );
          if (i > 0) {
            const a = n - 2;
            idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
          }
          n += 2;
        }
      }
      const g = new T.BufferGeometry();
      g.setAttribute("position", new T.Float32BufferAttribute(pos, 3));
      g.setIndex(idx);
      g.computeVertexNormals();
      gRoads.add(
        new T.Mesh(
          g,
          new T.MeshLambertMaterial({
            color,
            side: T.DoubleSide,
            polygonOffset: true,
            polygonOffsetFactor: order,
            polygonOffsetUnits: order,
          }),
        ),
      );
    };
    ribbon(1.7, 0.4, 0x7d6c4c, -1);
    ribbon(1, 0.55, 0xdcc994, -3);
  }
  // ---- route & lanes
  const gRoute = new T.Group(),
    gLanes = new T.Group();
  world.add(gRoute, gLanes);
  function gh(x, y) {
    return Math.max(hAt(x, y), 0);
  }
  function tube(pts, color, r) {
    const v = pts.map(
      (p) => new T.Vector3(p[0] - OX, gh(p[0], p[1]) + 2.8, p[1] - OY),
    );
    const cu = new T.CatmullRomCurve3(v, false, "catmullrom", 0.3);
    const m = new T.Mesh(
      new T.TubeGeometry(cu, 1200, r, 6, false),
      new T.MeshBasicMaterial({ color }),
    );
    gRoute.add(m);
    return cu;
  }
  const cuOut = tube(D.routeOut, 0xd2452a, 1.2),
    cuBack = tube(D.routeBack, 0x4a63d6, 1.1);
  gRoute.visible = false;
  const pil = sprite(0, 0, 0, 32, 0xff8a5a, 1.5);
  const pil2 = sprite(0, 0, 0, 26, 0x8aa0ff, 1.3);
  world.remove(pil, pil2);
  gRoute.add(pil, pil2);
  // lane dashes
  {
    const posA = [],
      ids = [];
    let n = 0;
    const LN = [];
    for (const L of D.lanes) {
      const pts = L.pts.map((p) => [p[0] - OX, p[1] - OY]);
      let len = 0;
      const seg = [];
      for (let i = 0; i < pts.length - 1; i++) {
        const d = Math.hypot(
          pts[i + 1][0] - pts[i][0],
          pts[i + 1][1] - pts[i][1],
        );
        seg.push([len, d]);
        len += d;
      }
      LN.push({ pts, seg, len });
      const at = (s) => {
        let i = 0;
        while (i < seg.length - 1 && seg[i][0] + seg[i][1] < s) i++;
        const t = Math.min(1, Math.max(0, (s - seg[i][0]) / (seg[i][1] || 1)));
        return [
          pts[i][0] + (pts[i + 1][0] - pts[i][0]) * t,
          pts[i][1] + (pts[i + 1][1] - pts[i][1]) * t,
        ];
      };
      L.at = at;
      L.len = len;
      for (let s = 0; s < len - 12; s += 28) {
        const a = at(s),
          b = at(s + 12),
          dx = b[0] - a[0],
          dz = b[1] - a[1],
          l = Math.hypot(dx, dz) || 1,
          nx = (-dz / l) * 1.7,
          nz = (dx / l) * 1.7;
        posA.push(
          a[0] + nx,
          0.5,
          a[1] + nz,
          a[0] - nx,
          0.5,
          a[1] - nz,
          b[0] + nx,
          0.5,
          b[1] + nz,
          b[0] - nx,
          0.5,
          b[1] - nz,
        );
        ids.push(n, n + 1, n + 2, n + 2, n + 1, n + 3);
        n += 4;
      }
    }
    const g = new T.BufferGeometry();
    g.setAttribute("position", new T.Float32BufferAttribute(posA, 3));
    g.setIndex(ids);
    gLanes.add(
      new T.Mesh(
        g,
        new T.MeshBasicMaterial({
          color: 0xfff0c8,
          transparent: true,
          opacity: 0.85,
          side: T.DoubleSide,
          depthWrite: false,
        }),
      ),
    );
  }
  const ships = [];
  const hullM = new T.MeshLambertMaterial({ color: 0x5a3c24 }),
    sailM = new T.MeshLambertMaterial({ color: 0xf4ecd6, side: T.DoubleSide });
  D.lanes.forEach((L, i) => {
    const s = new T.Group();
    const hu = new T.Mesh(new T.BoxGeometry(5, 1.1, 1.8), hullM);
    hu.position.y = 0.5;
    const bow = new T.Mesh(new T.ConeGeometry(0.9, 1.6, 4), hullM);
    bow.rotation.z = -Math.PI / 2;
    bow.position.set(3.2, 0.5, 0);
    bow.scale.z = 1.1;
    const mast = new T.Mesh(new T.CylinderGeometry(0.1, 0.1, 4.4, 5), hullM);
    mast.position.y = 3;
    const sh = new T.Shape();
    sh.moveTo(0, 0);
    sh.lineTo(3.2, 0);
    sh.lineTo(0, 4);
    sh.closePath();
    const sail = new T.Mesh(new T.ShapeGeometry(sh), sailM);
    sail.rotation.y = Math.PI / 2;
    sail.position.set(0.1, 1.2, -0.05);
    sail.scale.set(0.7, 0.9, 1);
    s.add(hu, bow, mast, sail);
    s.userData = {
      L,
      t: (i * 0.137) % 1,
      dir: i % 2 ? -1 : 1,
      sp: 0.6 + ((i * 7) % 5) * 0.08,
    };
    s.scale.setScalar(2.6);
    gLanes.add(s);
    ships.push(s);
  });
  return { gLanes, gRoads, gRoute, cuOut, cuBack, pil, pil2, ships };
}
