// settlements: initialized by main.js; dependencies are passed explicitly.
export function createSettlements({
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
} = {}) {
  // ---- settlements
  const gTowns = new T.Group();
  world.add(gTowns);
  const NH = 5600;
  const hb = new T.InstancedMesh(
    new T.BoxGeometry(1, 1, 1),
    new T.MeshLambertMaterial(),
    NH,
  );
  const gr = new T.ConeGeometry(0.78, 0.7, 4);
  gr.rotateY(Math.PI / 4);
  gr.translate(0, 0.35, 0);
  const hr_ = new T.InstancedMesh(gr, new T.MeshLambertMaterial(), NH);
  let nh = 0;
  const WALL = ["#a6a196", "#b3a898", "#9b958a", "#c8b99a"],
    ROOF = {
      1: "#8e9aa6",
      2: "#a98a5a",
      3: "#a8573a",
      4: "#7a6a9a",
      5: "#4a4a52",
      6: "#b8693e",
      7: "#6a7a86",
    };
  function house(x, y, w, h, d, rot, wallc, roofc) {
    const gy = Math.max(hAt(x, y), 0.3);
    dummy.position.set(x - OX, gy + h / 2 - 0.15, y - OY);
    dummy.rotation.set(0, rot, 0);
    dummy.scale.set(w, h, d);
    dummy.updateMatrix();
    hb.setMatrixAt(nh, dummy.matrix);
    hb.setColorAt(nh, cc.set(wallc));
    dummy.position.set(x - OX, gy + h - 0.15, y - OY);
    dummy.scale.set(w * 1.15, h * 0.9, d * 1.15);
    dummy.updateMatrix();
    hr_.setMatrixAt(nh, dummy.matrix);
    hr_.setColorAt(nh, cc.set(roofc));
    nh++;
  }
  const CNT = {
    city: [144, 30],
    town: [64, 21],
    port: [35, 14],
    village: [19, 10],
    fort: [0, 0],
    landmark: [0, 0],
    camp: [0, 0],
  };
  const OVR = {
    hearthmoor: [150, 52],
    verethane: [80, 21],
    applegarth: [90, 24],
  };
  const CAMP = {
    camp_n: "#f1f1f1",
    camp_w: "#4f8f93",
    camp_s: "#5f9a3a",
    camp_e: "#e0a63a",
  };
  const gTent = new T.ConeGeometry(1.2, 1.8, 4);
  gTent.rotateY(Math.PI / 4);
  gTent.translate(0, 0.9, 0);
  const tents = new T.InstancedMesh(gTent, new T.MeshLambertMaterial(), 80);
  let ntent = 0;
  const ROADS = new T.InstancedMesh(
    new T.BoxGeometry(1, 1, 1),
    new T.MeshLambertMaterial({ color: 0xcdbf9a }),
    12000,
  );
  let nrd = 0;
  const AVOID = D.places
    .filter((p) => p.kind === "landmark" || p.kind === "camp")
    .map((p) => [
      p.x,
      p.y,
      p.id.startsWith("h_") ? 11 : p.id === "court" ? 9 : 5,
    ]);
  function road(x, y, th, len = 1.9) {
    const g = Math.max(hAt(x, y), 0.3);
    if (nrd >= 12000) return;
    dummy.position.set(x - OX, g - 0.05, y - OY);
    dummy.rotation.set(0, -th, 0);
    dummy.scale.set(len, 0.4, 1.7);
    dummy.updateMatrix();
    ROADS.setMatrixAt(nrd++, dummy.matrix);
  }
  function slopeAt(x, y) {
    return (
      Math.hypot(hAt(x + 2, y) - hAt(x - 2, y), hAt(x, y + 2) - hAt(x, y - 2)) /
      4
    );
  }
  function layout(p, N, R, isl) {
    const nS =
        p.kind === "village"
          ? 2
          : p.kind === "city"
            ? 6
            : p.kind === "town"
              ? 4
              : 3,
      a0 = rnd() * 6.28,
      S = [];
    for (let k = 0; k < nS; k++)
      S.push({
        a: a0 + (k * 6.283) / nS + (rnd() - 0.5) * 0.5,
        b: (rnd() - 0.5) * 0.6,
      });
    const plaza =
      p.kind === "city"
        ? 6
        : p.kind === "town"
          ? 4.5
          : p.kind === "port"
            ? 3
            : 2.5;
    for (const st of S) {
      for (let r = plaza * 0.6; r < R * 0.95; r += 1.5) {
        const th = st.a + (st.b * r) / R,
          x = p.x + Math.cos(th) * r,
          y = p.y + Math.sin(th) * r;
        if (!(bAt(x, y) & 63)) break;
        road(x, y, th + (st.b / R) * 0.5);
      }
    }
    if (p.kind === "city" || p.kind === "town") {
      const rr = R * 0.5;
      for (let a = 0; a < 6.283; a += 1.5 / rr) {
        const x = p.x + Math.cos(a) * rr,
          y = p.y + Math.sin(a) * rr;
        if (bAt(x, y) & 63) road(x, y, a + Math.PI / 2);
      }
    }
    const pl = [];
    let tries = 0;
    while (pl.length < N && tries++ < N * 40) {
      const r = plaza + Math.sqrt(rnd()) * (R - plaza),
        a = rnd() * 6.283,
        x = p.x + Math.cos(a) * r,
        y = p.y + Math.sin(a) * r;
      if (!(bAt(x, y) & 63) || bAt(x, y) & 192 || slopeAt(x, y) > 0.55)
        continue;
      if (rnd() > 1 - 0.65 * Math.pow(r / R, 2)) continue;
      let best = 9,
        th = 0;
      for (const st of S) {
        const t = st.a + (st.b * r) / R,
          d = Math.atan2(Math.sin(a - t), Math.cos(a - t)),
          perp = r * Math.abs(Math.sin(d));
        if (Math.cos(d) > 0 && perp < best) {
          best = perp;
          th = t;
        }
      }
      if (best < 2.1) continue;
      if (best > 5.5 && rnd() > 0.22) continue;
      let bad = false;
      for (const q of AVOID)
        if (Math.hypot(q[0] - x, q[1] - y) < q[2]) {
          bad = true;
          break;
        }
      if (bad) continue;
      for (const q of pl)
        if (Math.hypot(q[0] - x, q[1] - y) < 3.1) {
          bad = true;
          break;
        }
      if (bad) continue;
      const rot = -(best < 9 ? th : rnd() * 6) + (rnd() - 0.5) * 0.25;
      pl.push([x, y, rot]);
      const big = p.kind === "city" && r < R * 0.4 && rnd() < 0.35;
      house(
        x,
        y,
        1.7 + rnd() * (big ? 1.4 : 0.8),
        1.0 + rnd() * (big ? 1.4 : 0.7),
        1.4 + rnd() * 0.7,
        rot,
        WALL[(rnd() * 4) | 0],
        ROOF[Math.min(isl, 7)],
      );
    }
  }
  for (const p of Object.values(P)) {
    const cnt = OVR[p.id] || CNT[p.kind];
    const isl =
      D.order.indexOf(
        p.isl === "Caelmar"
          ? "caelmar"
          : p.isl === "Far Waste"
            ? "waste"
            : p.isl === "Aurendell"
              ? "aurendell"
              : p.isl === "Elowmere"
                ? "elowmere"
                : p.isl === "Hollow Roads"
                  ? "hollow"
                  : p.isl === "The Iron Country"
                    ? "iron"
                    : "coast-a",
      ) + 1;
    if (cnt && cnt[0]) layout(p, cnt[0], cnt[1], isl);
    if (p.kind === "camp") {
      for (let k = 0; k < 16 && ntent < 80; k++) {
        const x = p.x + (rnd() - 0.5) * 18,
          y = p.y + (rnd() - 0.5) * 14;
        dummy.position.set(x - OX, Math.max(hAt(x, y), 0.3) - 0.1, y - OY);
        dummy.rotation.set(0, rnd() * 3, 0);
        const s = 0.8 + rnd() * 0.5;
        dummy.scale.set(s, s, s);
        dummy.updateMatrix();
        tents.setMatrixAt(ntent, dummy.matrix);
        tents.setColorAt(ntent++, cc.set(CAMP[p.id] || "#ddd"));
      }
      const pole = new T.Mesh(
        new T.CylinderGeometry(0.12, 0.12, 9, 5),
        new T.MeshLambertMaterial({ color: 0x33291f }),
      );
      pole.position.set(p.x - OX, p.gy + 4.5, p.y - OY);
      gTowns.add(pole);
      const fl = new T.Mesh(
        new T.PlaneGeometry(4, 2.2),
        new T.MeshLambertMaterial({ color: CAMP[p.id], side: T.DoubleSide }),
      );
      fl.position.set(p.x - OX + 2, p.gy + 8, p.y - OY);
      gTowns.add(fl);
    }
  }
  // Hearthmoor and Verethane landmark buildings
  {
    const gr_ = (x, y) => Math.max(hAt(x, y), 0.3);
    const box = (x, y, w, h, d, c, rot = 0, dy = 0) => {
      const m = new T.Mesh(
        new T.BoxGeometry(w, h, d),
        new T.MeshLambertMaterial({ color: c }),
      );
      m.position.set(x - OX, gr_(x, y) + h / 2 + dy, y - OY);
      m.rotation.y = rot;
      gTowns.add(m);
      return m;
    };
    const cyl = (x, y, r0, r1, h, c, dy = 0, seg = 10) => {
      const m = new T.Mesh(
        new T.CylinderGeometry(r0, r1, h, seg),
        new T.MeshLambertMaterial({ color: c }),
      );
      m.position.set(x - OX, gr_(x, y) + h / 2 + dy, y - OY);
      gTowns.add(m);
      return m;
    };
    const roof = (x, y, r, h, c, dy, sz = 1) => {
      const m = new T.Mesh(
        new T.ConeGeometry(r, h, 4),
        new T.MeshLambertMaterial({ color: c }),
      );
      m.rotation.y = Math.PI / 4;
      m.scale.z = sz;
      m.position.set(x - OX, gr_(x, y) + dy + h / 2, y - OY);
      gTowns.add(m);
      return m;
    };
    {
      const m = P.h_Market_Square;
      cyl(m.x, m.y, 9, 9.3, 0.35, 0xd9cba3, -0.1, 28);
      const cs = [0xb5473a, 0x4f7f8f, 0xd7a845, 0x6a8a4a, 0x8a5a8a];
      for (let k = 0; k < 10; k++) {
        const a = (k / 10) * 6.283 + 0.2,
          x = m.x + Math.cos(a) * 6,
          y = m.y + Math.sin(a) * 6;
        box(x, y, 2.2, 1.1, 1.5, 0x8a6c4a, -a + Math.PI / 2);
        box(x, y, 2.6, 0.15, 1.9, cs[k % 5], -a + Math.PI / 2, 1.25);
      }
      box(m.x, m.y, 1, 0.9, 1, 0xcfc6b0);
      box(m.x, m.y, 0.5, 3.4, 0.5, 0xcfc6b0, 0, 0.9);
      box(m.x, m.y, 2.2, 0.5, 0.5, 0xcfc6b0, 0, 3);
    }
    {
      const t = P.h_Temple_of_Ilmarion;
      box(t.x, t.y, 9, 4.4, 6, 0xf0ead8);
      roof(t.x, t.y, 7.1, 3, 0xd9a93a, 4.4, 0.72);
      for (let k = 0; k < 6; k++)
        cyl(t.x - 3.6 + k * 1.44, t.y + 3.4, 0.34, 0.34, 4.4, 0xf6f0e0);
      cyl(t.x, t.y, 0.25, 0.25, 4, 0xd9a93a, 7.4, 6);
      sprite(t.x - OX, t.y - OY, gr_(t.x, t.y) + 11.5, 10, 0xffd98a, 1);
    }
    {
      const f = P.h_the_Vaele_forge;
      box(f.x, f.y, 6, 2.8, 4.6, 0x5a4a40);
      roof(f.x, f.y, 4.6, 2, 0x3a3430, 2.8, 0.8);
      cyl(f.x + 1.8, f.y - 1, 0.6, 0.8, 5.4, 0x3a3430);
      box(f.x - 4, f.y + 1, 2.2, 0.8, 1.4, 0x4a4a52);
      sprite(f.x - OX + 1.8, f.y - OY - 1, gr_(f.x, f.y) + 6, 9, 0xff7a2a, 1.3);
      sprite(f.x - OX, f.y - OY + 3, gr_(f.x, f.y) + 1.5, 8, 0xff9a40, 0.9);
    }
    {
      const y = P["h_Dunmore’s_yard"];
      const w = 7,
        d = 5;
      for (let k = 0; k <= 8; k++) {
        const t = k / 8;
        for (const [px, py] of [
          [y.x - w + 2 * w * t, y.y - d],
          [y.x - w + 2 * w * t, y.y + d],
        ])
          box(px, py, 0.3, 1.1, 0.3, 0x6b4a2a);
      }
      for (let k = 1; k < 5; k++) {
        const t = k / 5;
        for (const px of [y.x - w, y.x + w])
          box(px, y.y - d + 2 * d * t, 0.3, 1.1, 0.3, 0x6b4a2a);
      }
      box(y.x - 3, y.y - 1, 3.4, 1.6, 2.6, 0x8a6a4a);
      roof(y.x - 3, y.y - 1, 2.9, 1.4, 0x7a4a2a, 1.6, 0.8);
      box(y.x + 3, y.y + 1, 2.6, 1.4, 2.2, 0x8a6a4a);
      cyl(y.x + 4.5, y.y - 2.5, 1, 1.1, 1.4, 0xcfb25a);
      cyl(y.x + 2, y.y - 3, 1, 1.1, 1.2, 0xcfb25a);
    }
    {
      const w = P.h_the_swearing_iron;
      for (let k = 0; k < 3; k++)
        cyl(
          w.x,
          w.y,
          2.4 - k * 0.5,
          2.6 - k * 0.5,
          0.35,
          0x8d8880,
          k * 0.35,
          12,
        );
      cyl(w.x, w.y, 0.75, 0.95, 8.5, 0x2c2a2e, 1);
      sprite(w.x - OX, w.y - OY, gr_(w.x, w.y) + 9, 10, 0xe8553a, 1.2);
    }
    {
      const s = P.h_Slag_Lane,
        H = P.hearthmoor,
        dx = H.x - s.x,
        dy = H.y - s.y,
        l = Math.hypot(dx, dy),
        ux = dx / l,
        uy = dy / l,
        rot = -Math.atan2(uy, ux);
      for (let k = 0; k < 9; k++) {
        const x = s.x + ux * k * 3.3,
          y = s.y + uy * k * 3.3;
        for (const sd of [-1, 1]) {
          const px = x - uy * sd * 3.4,
            py = y + ux * sd * 3.4;
          if (bAt(px, py) & 63)
            house(px, py, 2.3, 1.2, 1.8, rot, "#5d5750", "#3d3a38");
        }
        road(x, y, -rot, 3.4);
      }
    }

    const well = (x, y, sc = 1) => {
      cyl(x, y, 1.3 * sc, 1.4 * sc, 0.9 * sc, 0x9a968c, 0, 14);
      cyl(x, y, 1.0 * sc, 1.0 * sc, 0.2, 0x6fa3c0, 0.8 * sc, 14);
      for (const sx of [-1, 1])
        box(x + sx * 1.2 * sc, y, 0.2, 2.2 * sc, 0.2, 0x6b4a2a);
      box(x, y, 2.8 * sc, 0.2, 0.2, 0x6b4a2a, 0, 2.2 * sc);
      roof(x, y, 1.9 * sc, 0.9, 0x7a4a2a, 2.2 * sc, 0.7);
    };
    {
      const w = P.h_the_market_well;
      well(w.x, w.y, 1.15);
      const d = P["h_Dorrow’s_well"];
      well(d.x, d.y, 1);
    }
    {
      const b = P.h_the_Great_Bell;
      box(b.x, b.y, 3.2, 7, 3.2, 0xe8e0cc);
      for (const [dx, dz] of [
        [-1.3, -1.3],
        [1.3, -1.3],
        [-1.3, 1.3],
        [1.3, 1.3],
      ])
        cyl(b.x + dx, b.y + dz, 0.22, 0.22, 2.6, 0xcfc6b0, 7);
      box(b.x, b.y, 3.4, 0.3, 3.4, 0xcfc6b0, 0, 9.6);
      roof(b.x, b.y, 3, 2.2, 0xd9a93a, 9.9, 1);
      cyl(b.x, b.y, 0.25, 0.85, 1.5, 0x8a6a2a, 7.1, 10);
    }
    {
      const c = P["h_the_counting-room"];
      box(c.x, c.y, 7, 3.2, 4.4, 0xe9dcb2);
      roof(c.x, c.y, 5.6, 2, 0x8a7450, 3.2, 0.72);
      box(c.x, c.y + 2.3, 1.2, 2, 0.2, 0x4a3a28);
      for (let k = 0; k < 3; k++)
        box(c.x - 2 + k * 2, c.y - 2.25, 0.9, 0.9, 0.1, 0xf6f0e0, 0, 1.5);
    }
    {
      const a = P["h_Mother_Ansel’s"];
      box(a.x, a.y, 3.6, 1.9, 2.8, 0xa6a196);
      roof(a.x, a.y, 3.2, 1.5, 0x6b4a2a, 1.9, 0.8);
      cyl(a.x + 1, a.y, 0.35, 0.35, 2.4, 0x6b655b, 1.6);
      sprite(a.x - OX + 1, a.y - OY, gr_(a.x, a.y) + 4.8, 5, 0xffd9a0, 0.7);
      for (let k = 0; k < 7; k++)
        box(a.x - 3 + k * 1, a.y + 3.2, 0.15, 0.8, 0.15, 0x6b4a2a);
    }
    {
      const d = P["h_Sarrow’s_dye-works"];
      box(d.x, d.y, 7, 2.6, 4.4, 0xb3a898);
      roof(d.x, d.y, 5.6, 1.8, 0x6a4a3a, 2.6, 0.7);
      [
        [0x2f4f9a, -2.5],
        [0xa83a2a, 0],
        [0xd9a82a, 2.5],
      ].forEach(([c, dx]) => {
        cyl(d.x + dx, d.y + 4.4, 1.1, 1.1, 0.9, c, 0, 12);
        box(d.x + dx, d.y + 7.6, 0.12, 2.2, 0.12, 0x6b4a2a);
        box(d.x + dx, d.y + 7.6, 1.8, 1.4, 0.08, c, 0, 1.4);
      });
    }
    {
      const m = P.h_the_mill;
      box(m.x, m.y, 4.4, 3.4, 4.4, 0xc8a26a);
      roof(m.x, m.y, 3.6, 2.2, 0x8a5a3a, 3.4, 1);
      const w = new T.Mesh(
        new T.TorusGeometry(2.1, 0.25, 6, 18),
        new T.MeshLambertMaterial({ color: 0x6b4a2a }),
      );
      w.position.set(m.x - OX + 3.2, gr_(m.x, m.y) + 2.1, m.y - OY);
      w.rotation.y = Math.PI / 2;
      gTowns.add(w);
      for (let k = 0; k < 4; k++) {
        const sp = box(m.x + 3.2, m.y, 0.12, 4.2, 0.2, 0x6b4a2a, 0, 0.1);
        sp.position.set(m.x - OX + 3.2, gr_(m.x, m.y) + 2.1, m.y - OY);
        sp.rotation.x = (k * Math.PI) / 4;
      }
    }
    {
      const t = P.h_the_tannery;
      box(t.x, t.y, 5.4, 2.2, 3.8, 0x9a8460);
      roof(t.x, t.y, 4.4, 1.6, 0x5a4a3a, 2.2, 0.72);
      for (let k = 0; k < 4; k++) {
        box(t.x - 2 + k * 1.4, t.y + 3.6, 0.15, 1.8, 0.15, 0x6b4a2a);
      }
      box(t.x, t.y + 3.6, 4.6, 0.12, 0.12, 0x6b4a2a, 0, 1.8);
      for (let k = 0; k < 4; k++)
        box(t.x - 2 + k * 1.4, t.y + 3.6, 0.9, 1.2, 0.08, 0xb08a58, 0, 0.6);
    }
    {
      const b = P["h_the_baker’s_slate"];
      box(b.x, b.y, 4.6, 2.2, 3.6, 0xc8a26a);
      roof(b.x, b.y, 3.8, 1.6, 0xa8573a, 2.2, 0.8);
      cyl(b.x - 1.4, b.y - 0.5, 0.4, 0.4, 2.4, 0x6b655b, 1.8);
      sprite(
        b.x - OX - 1.4,
        b.y - OY - 0.5,
        gr_(b.x, b.y) + 4.6,
        5,
        0xffb860,
        0.8,
      );
      box(b.x + 3.3, b.y + 1.2, 0.15, 1.5, 1.2, 0x2f2a26, 0.3);
    }
    {
      const s = P["h_Brannock’s_stall"];
      box(s.x, s.y, 2.6, 1.1, 1.6, 0x8a6c4a);
      box(s.x, s.y, 3.2, 0.15, 2.2, 0xd9b24a, 0, 1.7);
      for (const sx of [-1, 1])
        box(s.x + sx * 1.4, s.y + 0.9, 0.12, 1.8, 0.12, 0x6b4a2a);
    }
    {
      const c = P.court,
        V = P.verethane;
      box(c.x, c.y, 7, 3.4, 4.5, 0xfafafa);
      roof(c.x, c.y, 5.6, 2, 0x7f8c99, 3.4, 0.7);
      for (let k = 0; k < 5; k++)
        cyl(c.x - 2.8 + k * 1.4, c.y + 2.7, 0.3, 0.3, 3.4, 0xffffff);
    }
  }
  ROADS.count = nrd;
  ROADS.instanceMatrix.needsUpdate = true;
  gTowns.add(ROADS);
  hb.count = hr_.count = nh;
  tents.count = ntent;
  hb.instanceMatrix.needsUpdate =
    hr_.instanceMatrix.needsUpdate =
    tents.instanceMatrix.needsUpdate =
      true;
  if (hb.instanceColor)
    hb.instanceColor.needsUpdate =
      hr_.instanceColor.needsUpdate =
      tents.instanceColor.needsUpdate =
        true;
  gTowns.add(hb, hr_, tents);
  // walls of Verethane
  {
    const p = P.verethane,
      m = new T.MeshLambertMaterial({ color: 0xe9e7e0 });
    for (let k = 0; k < 76; k++) {
      const a = (k / 76) * 6.283,
        x = p.x + Math.cos(a) * 24,
        y = p.y + Math.sin(a) * 24;
      const b = new T.Mesh(new T.BoxGeometry(2.1, 2.6, 0.8), m);
      b.position.set(x - OX, Math.max(hAt(x, y), 0.3) + 1, y - OY);
      b.rotation.y = -a + Math.PI / 2;
      gTowns.add(b);
    }
    const keep = new T.Mesh(
      new T.BoxGeometry(4, 5, 4),
      new T.MeshLambertMaterial({ color: 0xf3f1ea }),
    );
    keep.position.set(p.x - OX, p.gy + 2.5, p.y - OY);
    gTowns.add(keep);
  }
  // Marrow Gates fort, lighthouse, Sylvaine's Rest
  {
    const f = P.marrow,
      m = new T.MeshLambertMaterial({ color: 0x8f8f8f });
    const k = new T.Mesh(new T.BoxGeometry(5, 3, 4), m);
    k.position.set(f.x - OX, f.gy + 1.5, f.y - OY);
    gTowns.add(k);
    for (const dx of [-2.4, 2.4]) {
      const t = new T.Mesh(new T.CylinderGeometry(0.9, 1, 5, 8), m);
      t.position.set(f.x - OX + dx, f.gy + 2.5, f.y - OY);
      gTowns.add(t);
    }
    const L = P.stormwatch;
    const lh = new T.Mesh(
      new T.CylinderGeometry(0.8, 1.3, 9, 10),
      new T.MeshLambertMaterial({ color: 0xf2ece0 }),
    );
    lh.position.set(L.x - OX, L.gy + 4.5, L.y - OY);
    gTowns.add(lh);
    sprite(L.x - OX, L.y - OY, L.gy + 10, 16, 0xffd98a, 1.6);
    const S = P.sylvrest;
    const tr = new T.Mesh(
      new T.CylinderGeometry(0.5, 0.8, 5, 6),
      new T.MeshLambertMaterial({ color: 0x6b4a2a }),
    );
    tr.position.set(S.x - OX, S.gy + 2.5, S.y - OY);
    gTowns.add(tr);
    const cn = new T.Mesh(
      new T.IcosahedronGeometry(4.2, 1),
      new T.MeshLambertMaterial({ color: 0x8fcf5a }),
    );
    cn.position.set(S.x - OX, S.gy + 7.5, S.y - OY);
    gTowns.add(cn);
    sprite(S.x - OX, S.y - OY, S.gy + 7.5, 14, 0xaef07a, 0.8);
  }
  // Hall of Ilmarion
  const hall = P.hall;
  const HX = hall.x - OX,
    HZ = hall.y - OY,
    HY = hall.gy;
  {
    const m = new T.MeshLambertMaterial({ color: 0xf3ead0 }),
      gm = new T.MeshLambertMaterial({ color: 0xd9a93a });
    const add = (g, mat, x, y, z) => {
      const q = new T.Mesh(g, mat);
      q.position.set(HX + x, HY + y, HZ + z);
      gTowns.add(q);
      return q;
    };
    add(new T.BoxGeometry(16, 2, 10), m, 0, 1, 0);
    add(new T.BoxGeometry(12, 2.6, 7.5), m, 0, 3.3, 0);
    add(new T.BoxGeometry(8, 3, 5.2), m, 0, 6.1, 0);
    for (let k = 0; k < 10; k++) {
      add(
        new T.CylinderGeometry(0.42, 0.42, 5.4, 8),
        m,
        -7.2 + k * 1.6,
        3.1,
        5.6,
      );
    }
    add(new T.CylinderGeometry(2.6, 2.9, 2.6, 16), m, 0, 8.9, 0);
    const dome = add(
      new T.SphereGeometry(2.7, 18, 10, 0, Math.PI * 2, 0, Math.PI / 2),
      gm,
      0,
      10.2,
      0,
    );
    for (const sx of [-1, 1])
      for (const sz of [-1, 1]) {
        add(new T.CylinderGeometry(0.5, 0.7, 9, 8), m, sx * 7.4, 4.5, sz * 4.4);
        add(new T.ConeGeometry(0.9, 2.6, 8), gm, sx * 7.4, 10.3, sz * 4.4);
      }
    add(new T.ConeGeometry(0.35, 3, 6), gm, 0, 13.5, 0);
  }
  const BH = 420;
  const beam = new T.Mesh(
    new T.CylinderGeometry(3, 10, BH, 20, 1, true),
    new T.MeshBasicMaterial({
      color: 0xffe6a0,
      transparent: true,
      opacity: 0.2,
      depthWrite: false,
      side: T.DoubleSide,
      fog: false,
    }),
  );
  beam.position.set(HX, HY + BH / 2, HZ);
  world.add(beam);
  return { HX, HY, HZ, gTowns, beam, hb, hr_, tents };
}
