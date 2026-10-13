// effects: initialized by main.js; dependencies are passed explicitly.
export function createEffects({
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
} = {}) {
  const hallLight = new T.PointLight(0xffd27a, 0.0, 160);
  hallLight.position.set(HX, HY + 12, HZ);
  world.add(hallLight);
  sprite(HX, HZ, HY + 10, 44, 0xffd27a, 1.6);
  // ---- mystic Sunstair
  const gMys = new T.Group();
  world.add(gMys);
  const ringMats = [];
  for (let k = 0; k < 8; k++) {
    const r = RM * (1 - (k + 0.82) / 9),
      seg = 96,
      pp = [],
      ii = [];
    for (let a = 0; a <= seg; a++) {
      const th = (a / seg) * Math.PI * 2,
        wob = 1 + 0.05 * Math.sin(th * 3 + k) + 0.03 * Math.sin(th * 5 + k * 2),
        x = HALL0.x + Math.cos(th) * r * wob,
        y = HALL0.y + Math.sin(th) * r * wob,
        g = hAt(x, y) + 0.35;
      pp.push(x - OX, g, y - OY, x - OX, g + 1.1, y - OY);
    }
    for (let a = 0; a < seg; a++) {
      const q = a * 2;
      ii.push(q, q + 1, q + 2, q + 1, q + 3, q + 2);
    }
    const gg = new T.BufferGeometry();
    gg.setAttribute("position", new T.Float32BufferAttribute(pp, 3));
    gg.setIndex(ii);
    const mt = new T.MeshBasicMaterial({
      color: 0xffd98a,
      transparent: true,
      opacity: 0.5,
      blending: T.AdditiveBlending,
      depthWrite: false,
      side: T.DoubleSide,
      fog: false,
    });
    ringMats.push(mt);
    gMys.add(new T.Mesh(gg, mt));
  }
  // orbiting shards
  const shards = [];
  const shG = new T.OctahedronGeometry(1.5, 0);
  shG.scale(0.55, 1.5, 0.55);
  for (let i = 0; i < 10; i++) {
    const m = new T.Mesh(
      shG,
      new T.MeshBasicMaterial({
        color: i % 2 ? 0xfff0b8 : 0xbfeee0,
        fog: false,
      }),
    );
    gMys.add(m);
    const sp = sprite(0, 0, 0, 9, i % 2 ? 0xffe08a : 0x9fe8d6, 1);
    shards.push({
      m,
      sp,
      r: 20 + rnd() * 24,
      y: 20 + rnd() * 34,
      w: (0.12 + rnd() * 0.12) * (i % 2 ? 1 : -1),
      ph: rnd() * 6,
    });
  }
  // motes
  {
    const N = 520,
      pa = new Float32Array(N * 3),
      mv = [];
    for (let i = 0; i < N; i++) {
      const r = rnd() * RM * 0.95,
        th = rnd() * 6.283,
        x = HALL0.x + Math.cos(th) * r,
        y = HALL0.y + Math.sin(th) * r;
      mv.push({
        x: x - OX,
        z: y - OY,
        y0: hAt(x, y),
        h: rnd() * 60,
        sp: 2 + rnd() * 4,
      });
      pa[i * 3] = x - OX;
      pa[i * 3 + 1] = hAt(x, y);
      pa[i * 3 + 2] = y - OY;
    }
    const g = new T.BufferGeometry();
    g.setAttribute("position", new T.BufferAttribute(pa, 3));
    var motes = new T.Points(
      g,
      new T.PointsMaterial({
        map: GLOW,
        color: 0xffe9a8,
        size: 3.2,
        transparent: true,
        opacity: 0.9,
        blending: T.AdditiveBlending,
        depthWrite: false,
        fog: false,
      }),
    );
    motes.userData.mv = mv;
    gMys.add(motes);
  }
  // pilgrim stones
  {
    const sm = new T.MeshLambertMaterial({ color: 0xcfc8b4 }),
      PS = D.places.find((p) => p.id === "pilgrim");
    for (let i = 0; i < 32; i++) {
      const th = (i / 32) * Math.PI * 2,
        x = HALL0.x + Math.cos(th) * RM * 0.78,
        y = HALL0.y + Math.sin(th) * RM * 0.78,
        g = hAt(x, y);
      if (g < 1) continue;
      const m = new T.Mesh(new T.BoxGeometry(1.3, 6.5, 1.3), sm);
      m.position.set(x - OX, g + 3, y - OY);
      m.rotation.y = th;
      m.rotation.z = (rnd() - 0.5) * 0.1;
      gMys.add(m);
      sprite(x - OX, y - OY, g + 6.8, 5, 0x8ff0d8, 0.8);
    }
  }
  // mist
  for (let i = 0; i < 16; i++) {
    const th = rnd() * 6.283,
      r = 45 + rnd() * 140,
      x = HALL0.x + Math.cos(th) * r,
      y = HALL0.y + Math.sin(th) * r;
    const sp = sprite(
      x - OX,
      y - OY,
      hAt(x, y) + 3 + rnd() * 4,
      60 + rnd() * 40,
      0xdff3f0,
      0.28,
    );
    sp.material.opacity = 0.18;
  }

  // Ledgerstone
  {
    const l = P.ledgerstone,
      m = new T.MeshLambertMaterial({ color: 0x6b655e });
    for (let k = 0; k < 13; k++) {
      const a = (k / 13) * 6.283,
        x = l.x + Math.cos(a) * 6,
        y = l.y + Math.sin(a) * 6;
      const s = new T.Mesh(new T.BoxGeometry(1, 3 + rnd(), 0.8), m);
      s.position.set(x - OX, Math.max(hAt(x, y), 0.3) + 1.5, y - OY);
      s.rotation.y = -a;
      s.rotation.z = (rnd() - 0.5) * 0.1;
      gTowns.add(s);
    }
    const c = new T.Mesh(
      new T.BoxGeometry(2.2, 7, 1.6),
      new T.MeshLambertMaterial({ color: 0x3d3a36 }),
    );
    c.position.set(l.x - OX, l.gy + 3.5, l.y - OY);
    gTowns.add(c);
    sprite(l.x - OX, l.y - OY, l.gy + 7.5, 12, 0xc9402a, 0.9);
  }
  // Hollow Roads lamps
  for (const id of ["lamp", "threshold", "quay", "farewell", "lowlamp"]) {
    const p = P[id];
    const post = new T.Mesh(
      new T.CylinderGeometry(0.18, 0.18, id === "lamp" ? 7 : 4.5, 6),
      new T.MeshLambertMaterial({ color: 0x33291f }),
    );
    post.position.set(p.x - OX, p.gy + (id === "lamp" ? 3.5 : 2.2), p.y - OY);
    gTowns.add(post);
    sprite(
      p.x - OX,
      p.y - OY,
      p.gy + (id === "lamp" ? 7.4 : 4.8),
      id === "lamp" ? 18 : 11,
      0xffc65a,
      1.3,
    );
  }

  return { hallLight, ringMats, shards, motes };
}
