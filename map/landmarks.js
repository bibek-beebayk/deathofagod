// landmarks: initialized by main.js; dependencies are passed explicitly.
export function createLandmarks({
  hAt,
  T,
  world,
  OX,
  OY,
  sprite,
  P,
  D,
  bAt,
  gRound,
  S0,
  ORCH,
  gTrees,
} = {}) {
  // ---- Hollow Roads landmark models
  {
    const gy = (x, y) => Math.max(hAt(x, y), 0.3),
      M = (c) => new T.MeshLambertMaterial({ color: c }),
      G = new T.Group();
    world.add(G);
    G.userData.hr = 1;
    const add = (m) => {
        G.add(m);
        return m;
      },
      bx = (x, y, w, h, d, c, rot = 0, dy = 0) => {
        const m = add(new T.Mesh(new T.BoxGeometry(w, h, d), M(c)));
        m.position.set(x - OX, gy(x, y) + h / 2 + dy, y - OY);
        m.rotation.y = rot;
        return m;
      },
      cy = (x, y, r0, r1, h, c, dy = 0, seg = 12) => {
        const m = add(new T.Mesh(new T.CylinderGeometry(r0, r1, h, seg), M(c)));
        m.position.set(x - OX, gy(x, y) + h / 2 + dy, y - OY);
        return m;
      },
      cn = (x, y, r, h, c, dy, seg = 4, rot = Math.PI / 4) => {
        const m = add(new T.Mesh(new T.ConeGeometry(r, h, seg), M(c)));
        m.rotation.y = rot;
        m.position.set(x - OX, gy(x, y) + dy + h / 2, y - OY);
        return m;
      },
      lit = (x, y, h, c = 0xffd98a, s = 14) => {
        const m = add(
          new T.Mesh(
            new T.SphereGeometry(0.55, 8, 6),
            new T.MeshBasicMaterial({ color: c }),
          ),
        );
        m.position.set(x - OX, gy(x, y) + h, y - OY);
        sprite(x - OX, y - OY, gy(x, y) + h, s, c, 1.2);
      };
    const L = P.lamp;
    bx(L.x, L.y, 3.6, 1.1, 3.6, 0xb9b1a0);
    cy(L.x, L.y, 0.3, 0.45, 10, 0x2c2a2e, 1);
    bx(L.x, L.y, 1.9, 2.4, 1.9, 0xffe3a0, 0, 11);
    cn(L.x, L.y, 1.7, 2.2, 0xc9402a, 13.4);
    for (const [dx, dy] of [
      [-1, -1],
      [1, -1],
      [-1, 1],
      [1, 1],
    ])
      (cy(L.x + dx * 7.6, L.y + dy * 7.6, 0.14, 0.14, 3.2, 0x4a3a28),
        lit(L.x + dx * 7.6, L.y + dy * 7.6, 3.6, 0xffd98a, 7));
    {
      const W = P.wells;
      for (const [dx, dy] of [
        [-3.4, -3.4],
        [3.4, -3.4],
        [-3.4, 3.4],
        [3.4, 3.4],
      ]) {
        cy(W.x + dx, W.y + dy, 1.15, 1.3, 1, 0xa9a39a);
        cy(W.x + dx, W.y + dy, 0.85, 0.85, 0.1, 0x3f6f93, 1);
        cy(W.x + dx - 0.9, W.y + dy, 0.08, 0.08, 2.6, 0x4a3a28);
        cy(W.x + dx + 0.9, W.y + dy, 0.08, 0.08, 2.6, 0x4a3a28);
        bx(W.x + dx, W.y + dy, 2.2, 0.12, 0.5, 0x4a3a28, 0, 2.6);
      }
    }
    {
      const H = P.lwhall;
      cy(H.x, H.y, 4.4, 4.8, 3.4, 0x4a4256, 0, 14);
      cn(H.x, H.y, 5.2, 3.2, 0x6b5f73, 3.4, 14, 0);
      bx(H.x + 4.5, H.y, 1.2, 2.2, 1.6, 0x2c2a2e);
      cy(H.x, H.y, 0.35, 0.35, 2, 0x4a3a28, 6.4);
      lit(H.x, H.y, 8.6, 0xffe3a0, 12);
    }
    {
      const S = P.stone;
      const r = add(new T.Mesh(new T.IcosahedronGeometry(2.1, 0), M(0x8f8a98)));
      r.scale.set(1.5, 0.7, 1);
      r.position.set(S.x - OX, gy(S.x, S.y) + 0.9, S.y - OY);
      [
        [-3.2, 1.4, 0xc9402a],
        [3.1, 0.8, 0x4f7aa8],
        [-1.8, 3.2, 0xd8b87a],
        [2.4, 2.8, 0x7a9a52],
        [-3.8, -1, 0x8a5a3a],
        [1.2, -3, 0xe8e0cc],
      ].forEach(([dx, dy, c], i) =>
        bx(
          S.x + dx,
          S.y + dy,
          0.7 + (i % 3) * 0.3,
          0.5 + (i % 2) * 0.4,
          0.7,
          c,
          i,
        ),
      );
    }
    {
      const F = P.fogbell;
      for (const dx of [-1.6, 1.6]) bx(F.x + dx, F.y, 0.4, 5.4, 0.4, 0x5a3c24);
      bx(F.x, F.y, 3.8, 0.4, 0.5, 0x5a3c24, 0, 5);
      const b = add(new T.Mesh(new T.ConeGeometry(1.1, 1.8, 10), M(0xc29a3c)));
      b.position.set(F.x - OX, gy(F.x, F.y) + 3.9, F.y - OY);
      cn(F.x, F.y, 2.6, 1.4, 0x6b4a2a, 5.4);
    }
    {
      const T_ = P.toll;
      bx(T_.x, T_.y, 5.4, 3.2, 4, 0xcdb98a);
      cn(T_.x, T_.y, 4.4, 2.4, 0x8a5a3a, 3.2, 4, Math.PI / 4).scale.z = 0.8;
      bx(T_.x - 4, T_.y + 2, 0.3, 2.6, 0.3, 0x4a3a28);
      bx(T_.x - 4, T_.y + 2, 2.2, 1.2, 0.2, 0xe8dcc0, 0, 1.6);
      lit(T_.x + 3, T_.y + 2.2, 3, 0xffd98a, 6);
    }
    {
      const O = P.press;
      bx(O.x, O.y, 6, 3.2, 4.4, 0xc8a26a);
      cn(O.x, O.y, 5, 2.6, 0x8a5a3a, 3.2).scale.z = 0.8;
      const w = add(
        new T.Mesh(new T.TorusGeometry(1.7, 0.25, 6, 16), M(0x6b4a2a)),
      );
      w.position.set(O.x - OX - 3.6, gy(O.x, O.y) + 2, O.y - OY);
      w.rotation.y = Math.PI / 2;
      bx(O.x - 6, O.y + 4.4, 14, 0.14, 0.3, 0x6a5a43, 0, 0.5);
      for (let k = 0; k < 5; k++)
        bx(O.x - 12 + k * 3.2, O.y + 4.4, 0.16, 1, 0.16, 0x4a3a28);
    }
    {
      const C = P.cistern;
      for (let k = 0; k < 3; k++) {
        cy(C.x + (k - 1) * 4.2, C.y, 1.9, 2, 3.6, 0x8fa3ad);
        cy(C.x + (k - 1) * 4.2, C.y, 2, 2, 0.25, 0x4a5560, 3.6);
      }
      bx(C.x, C.y + 2.6, 9, 0.3, 0.4, 0x6a5a43, 0, 0.8);
    }
    {
      const K = P.chapel;
      bx(K.x, K.y, 3.4, 3, 4.6, 0xe8e0cc);
      cn(K.x, K.y, 3, 2.8, 0x6b5f73, 3, 4, Math.PI / 4).scale.z = 1.2;
      bx(K.x, K.y - 3, 1.6, 5, 1.6, 0xd8cfb8);
      cn(K.x, K.y - 3, 1.5, 1.8, 0x6b5f73, 5);
      lit(K.x + 0.6, K.y + 2.4, 1.8, 0xffe3a0, 7);
    }
    {
      const T0 = P.threshold,
        x = T0.x,
        y = T0.y + 7;
      for (const dx of [-4.2, 4.2]) bx(x + dx, y, 1.5, 7, 1.5, 0xc9bfa0);
      bx(x, y, 10.2, 1.4, 1.7, 0xc9bfa0, 0, 7);
      cn(x, y, 1.5, 1.4, 0x6b5f73, 8.4, 4);
      lit(x, y, 5.8, 0xffe3a0, 9);
    }
    {
      const Q = P.quay;
      bx(Q.x + 5.5, Q.y, 12, 0.45, 3.2, 0xb79a68, 0, 0.15);
      for (let k = 0; k < 5; k++) {
        const px = Q.x + k * 2.6;
        cy(px, Q.y - 1.9, 0.16, 0.16, 2.4, 0x4a3a28);
        cy(px, Q.y + 1.9, 0.16, 0.16, 2.4, 0x4a3a28);
        if (k % 2 == 0) lit(px, Q.y - 1.9, 2.6, 0xffb347, 6);
      }
    }
    {
      const Lo = P.lowlamp;
      for (let k = 0; k < 4; k++) {
        const sx = Lo.x + (k - 1.5) * 3.6,
          sy = Lo.y - 7;
        bx(sx, sy, 2.6, 1.1, 1.8, 0xd8b87a);
        cn(sx, sy, 2.4, 1.1, [0xc9402a, 0xe8dcc0][k % 2], 1.1, 4).scale.z = 0.8;
      }
      cy(Lo.x + 5.5, Lo.y - 2, 0.8, 0.8, 1.1, 0x6b6a5e);
      cy(Lo.x - 5.5, Lo.y - 2, 0.8, 0.8, 1.1, 0x6b6a5e);
    }
    {
      const F = P.farewell;
      cy(F.x, F.y, 0.28, 0.4, 8, 0x2c2a2e, 0);
      lit(F.x, F.y, 8.6, 0xffd98a, 12);
      for (let k = 0; k < 5; k++)
        bx(
          F.x - 3.2 + k * 1.5,
          F.y + 4.2,
          1.2,
          0.6 + (k % 2) * 0.3,
          1.2,
          0x9a9484,
          k,
        );
    }
    G.traverse((o) => {
      if (o.isMesh) {
        o.castShadow = true;
        o.receiveShadow = true;
      }
    });
  }
  // ---- Elowmere landmark models
  {
    const gy = (x, y) => Math.max(hAt(x, y), 0.3),
      M = (c) => new T.MeshLambertMaterial({ color: c }),
      G = new T.Group();
    world.add(G);
    G.userData.elo = 1;
    const add = (m) => {
        G.add(m);
        return m;
      },
      bx = (x, y, w, h, d, c, rot = 0, dy = 0) => {
        const m = add(new T.Mesh(new T.BoxGeometry(w, h, d), M(c)));
        m.position.set(x - OX, gy(x, y) + h / 2 + dy, y - OY);
        m.rotation.y = rot;
        return m;
      },
      cy = (x, y, r0, r1, h, c, dy = 0, seg = 12) => {
        const m = add(new T.Mesh(new T.CylinderGeometry(r0, r1, h, seg), M(c)));
        m.position.set(x - OX, gy(x, y) + h / 2 + dy, y - OY);
        return m;
      },
      cn = (x, y, r, h, c, dy, seg = 4, rot = Math.PI / 4) => {
        const m = add(new T.Mesh(new T.ConeGeometry(r, h, seg), M(c)));
        m.rotation.y = rot;
        m.position.set(x - OX, gy(x, y) + dy + h / 2, y - OY);
        return m;
      },
      bl = (x, y, r, c, dy = 0, sx = 1, sy = 1, sz = 1) => {
        const m = add(new T.Mesh(new T.IcosahedronGeometry(r, 1), M(c)));
        m.scale.set(sx, sy, sz);
        m.position.set(x - OX, gy(x, y) + dy, y - OY);
        return m;
      },
      lit = (x, y, h, c = 0xffd98a, s = 12) =>
        sprite(x - OX, y - OY, gy(x, y) + h, s, c, 1.1);
    {
      const F = P.guestslip;
      bx(F.x + 7, F.y, 14, 0.5, 2.4, 0x8a6a44, 0, 0.1);
      for (let k = 0; k < 6; k++) {
        bx(F.x + 2 + k * 2.4, F.y - 1.4, 0.3, 1.6, 0.3, 0x5a3c24, 0, -0.5);
        bx(F.x + 2 + k * 2.4, F.y + 1.4, 0.3, 1.6, 0.3, 0x5a3c24, 0, -0.5);
      }
      cy(F.x + 14, F.y, 0.2, 0.2, 4, 0x33291f, 0, 6);
      lit(F.x + 14, F.y, 4.4, 0xffd98a, 12);
      bx(F.x - 3, F.y - 2.2, 0.5, 4, 0.5, 0x6b4a2a);
      bx(F.x - 3, F.y + 2.2, 0.5, 4, 0.5, 0x6b4a2a);
      bx(F.x - 3, F.y, 0.6, 0.5, 5.4, 0x6b4a2a, 0, 4);
      lit(F.x - 3, F.y, 3.4, 0xffe2a0, 8);
    }
    {
      const R = P.guestroll;
      bx(R.x, R.y, 10, 2.6, 4, 0xc8a26a);
      cn(R.x, R.y, 7, 2.4, 0x8a5a3a, 2.6).scale.z = 0.45;
      for (let k = 0; k < 5; k++)
        bx(R.x - 4 + k * 2, R.y + 2.4, 0.3, 2.2, 0.3, 0x6b4a2a);
      bx(R.x + 3.2, R.y - 1.2, 0.8, 3.4, 0.8, 0x6b655b, 0, 2);
      lit(R.x, R.y + 3.1, 2.6, 0xffcf80, 9);
      lit(R.x - 3.5, R.y + 3.1, 2.6, 0xffcf80, 7);
    }
    {
      const T0 = P.motherpear;
      cy(T0.x, T0.y, 0.9, 1.5, 4.2, 0x5a4030, 0, 8);
      bl(T0.x, T0.y, 5.2, 0x86ba5e, 8.4, 1.35, 0.95, 1.35);
      bl(T0.x + 2.6, T0.y + 0.8, 3, 0x9bc96e, 7.2);
      bl(T0.x - 2.8, T0.y - 0.6, 3, 0x78ad55, 7);
      for (let k = 0; k < 9; k++) {
        const a = (k / 9) * 6.283 + 0.3;
        bl(
          T0.x + Math.cos(a) * 4.4,
          T0.y + Math.sin(a) * 3.8,
          0.9,
          0xf6d8e2,
          8 + (k % 3) * 1.2,
        );
      }
      for (let k = 0; k < 10; k++) {
        const a = (k / 10) * 6.283;
        bx(
          T0.x + Math.cos(a) * 3,
          T0.y + Math.sin(a) * 3,
          0.25,
          2.6,
          0.25,
          0x6b4a2a,
        );
      }
      sprite(T0.x - OX, T0.y - OY, gy(T0.x, T0.y) + 9, 22, 0xffd9e6, 0.8);
    }
    {
      const L = P.longpress;
      bx(L.x, L.y, 7, 3, 5, 0xb08a58);
      cn(L.x, L.y, 5.8, 2.4, 0x7a4a30, 3).scale.z = 0.72;
      bx(L.x + 6.4, L.y + 1, 5, 0.5, 0.6, 0x5a3c24, 0, 1.3);
      cy(L.x + 8.2, L.y + 1, 0.35, 0.35, 3, 0x4a3a28, 0.5, 6);
      bx(L.x + 6.4, L.y + 1, 0.5, 2.4, 0.5, 0x5a3c24);
      for (let k = 0; k < 4; k++)
        cy(L.x - 5 + k * 1.4, L.y + 4, 0.7, 0.65, 1.2, 0x8a5a3a, 0, 8);
      for (let k = 0; k < 7; k++)
        bl(
          L.x + 5 + (k % 3) * 0.9,
          L.y + 4 + Math.floor(k / 3) * 0.8,
          0.45,
          k % 2 ? 0xc2433a : 0xa8c24a,
          0.4,
        );
      lit(L.x, L.y + 3, 2.4, 0xffcf80, 8);
    }
    {
      const W = D.ironRoads.find((r) => r.name === "Pilgrims’ Walk");
      if (W) {
        const pts = W.pts;
        let tot = 0;
        const seg = [];
        for (let i = 0; i < pts.length - 1; i++) {
          const d = Math.hypot(
            pts[i + 1][0] - pts[i][0],
            pts[i + 1][1] - pts[i][1],
          );
          seg.push(d);
          tot += d;
        }
        for (let k = 1; k <= 7; k++) {
          let s = (tot * k) / 8,
            i = 0;
          while (i < seg.length - 1 && s > seg[i]) {
            s -= seg[i];
            i++;
          }
          const t = s / seg[i],
            dx = pts[i + 1][0] - pts[i][0],
            dy = pts[i + 1][1] - pts[i][1],
            l = Math.hypot(dx, dy),
            x = pts[i][0] + dx * t - (dy / l) * 2.8,
            y = pts[i][1] + dy * t + (dx / l) * 2.8;
          bx(x, y, 1.1, 1.5, 1.1, 0x9a7a54, Math.atan2(dy, dx));
          cn(x, y, 1, 1, 0x6b8a4a, 1.5);
          lit(x, y, 1.2, 0xffe2a0, 5);
        }
      }
    }
    {
      const B = P.backflow;
      for (let k = 0; k < 7; k++) {
        const a = (k / 7) * 6.283,
          x = B.x + 15 + Math.cos(a) * 5,
          y = B.y + Math.sin(a) * 5;
        cy(x, y, 0.25, 0.35, 1.8 + (k % 3) * 0.6, 0xcfc8b4, -0.3, 6);
      }
      for (const [r, o] of [
        [6.5, 0.55],
        [3.6, 0.4],
      ]) {
        const m = add(
          new T.Mesh(
            new T.TorusGeometry(r, 0.22, 6, 48),
            new T.MeshBasicMaterial({
              color: 0xe8f6f4,
              transparent: true,
              opacity: Math.min(0.85, o + 0.2),
              depthWrite: false,
            }),
          ),
        );
        m.rotation.x = Math.PI / 2;
        m.position.set(B.x + 15 - OX, 0.7, B.y - OY);
      }
      sprite(B.x + 15 - OX, B.y - OY, 2.5, 18, 0xcfeee8, 0.7);
    }
    {
      const Mi = P.reedmill;
      bx(Mi.x, Mi.y, 4.6, 3.6, 4.2, 0xc8a26a);
      cn(Mi.x, Mi.y, 3.9, 2.4, 0x6b4a2a, 3.6);
      const w = add(
        new T.Mesh(new T.TorusGeometry(2.1, 0.25, 6, 18), M(0x6b4a2a)),
      );
      w.position.set(Mi.x - OX + 3.2, gy(Mi.x, Mi.y) + 2.1, Mi.y - OY);
      w.rotation.y = Math.PI / 2;
      bx(Mi.x - 0.5, Mi.y + 4.6, 9, 0.6, 1.1, 0x9a9484, 0, 0.2);
      lit(Mi.x - 2.4, Mi.y + 2.3, 2.2, 0xffcf80, 6);
    }
    {
      const S = P.seedhouse;
      cy(S.x, S.y, 4, 4.2, 2, 0xcfc6b0);
      const g = add(
        new T.Mesh(
          new T.SphereGeometry(4, 18, 8, 0, Math.PI * 2, 0, Math.PI / 2),
          new T.MeshPhongMaterial({
            color: 0xcfeee0,
            transparent: true,
            opacity: 0.5,
            shininess: 80,
          }),
        ),
      );
      g.position.set(S.x - OX, gy(S.x, S.y) + 2, S.y - OY);
      for (let k = 0; k < 12; k++) {
        const a = (k / 12) * 6.283;
        cy(
          S.x + Math.cos(a) * 2.4,
          S.y + Math.sin(a) * 2.4,
          0.35,
          0.35,
          0.9 + (k % 3) * 0.3,
          [0xc8a26a, 0xa8c24a, 0xc2433a][k % 3],
          0.2,
          6,
        );
      }
      cy(S.x, S.y, 0.2, 0.2, 6.4, 0x4a3a28, 0, 6);
      sprite(S.x - OX, S.y - OY, gy(S.x, S.y) + 3.2, 22, 0xbfe8a0, 0.9);
    }
    {
      const Hv = P.oldhives;
      for (let r = 0; r < 3; r++)
        for (let c = 0; c < 6; c++) {
          const x = Hv.x + c * 2.2 - 5.5,
            y = Hv.y + r * 2.5 - 2.5;
          bx(x, y, 1.4, 0.5, 1.4, 0x6b4a2a);
          bl(x, y, 0.85, 0xdcb45a, 0.95, 1, 0.85, 1);
        }
      sprite(Hv.x - OX, Hv.y - OY, gy(Hv.x, Hv.y) + 2, 12, 0xffd070, 0.6);
    }
    {
      const E = P.greathedge;
      for (let k = -118; k <= 118; k++) {
        if (Math.abs(k) <= 3) continue;
        const x = E.x + k * 3.2,
          y = E.y + Math.sin(k * 0.12) * 3.5;
        if (!(bAt(x, y) & 63) || bAt(x, y) & 128) continue;
        const h = 3.6 + ((k * 7) % 3) * 0.4;
        bl(
          x,
          y,
          1.9,
          [0x4f7a3a, 0x58843f, 0x476f36][(k + 130) % 3],
          h / 2,
          1.9,
          h / 3.4,
          1.4,
        );
      }
      for (const s of [-1, 1]) {
        bx(E.x + s * 3.4, E.y, 0.6, 5, 0.6, 0x5a3c24);
      }
      bx(E.x, E.y, 7.4, 0.5, 0.6, 0x5a3c24, 0, 4.6);
      lit(E.x, E.y, 3.8, 0xffd98a, 9);
    }
    {
      const A = P.applegarth,
        Ms = new T.InstancedMesh(gRound, new T.MeshLambertMaterial(), 900);
      let n = 0;
      const dm = new T.Object3D(),
        cl = new T.Color();
      const RDS = D.ironRoads
          .filter((r) => r.pts[0][0] < 1300 * S0 && r.pts[0][1] > 1000 * S0)
          .map((r) => r.pts),
        PLS = D.places.filter(
          (p) =>
            Math.abs(p.x - A.x) < 300 * S0 && Math.abs(p.y - A.y) < 200 * S0,
        );
      const dR = (x, y) => {
        let m = 999;
        for (const pl of RDS)
          for (let i = 0; i < pl.length - 1; i++) {
            const a = pl[i],
              b = pl[i + 1],
              dx = b[0] - a[0],
              dy = b[1] - a[1],
              L = dx * dx + dy * dy || 1,
              t = Math.max(
                0,
                Math.min(1, ((x - a[0]) * dx + (y - a[1]) * dy) / L),
              );
            m = Math.min(m, Math.hypot(x - a[0] - t * dx, y - a[1] - t * dy));
          }
        return m;
      };
      const OB = ORCH;
      for (const [ox, oy, w, h, rot] of OB) {
        const cx = A.x + (ox + w / 2) * S0,
          cy = A.y + (oy + h / 2) * S0,
          c = Math.cos((rot * Math.PI) / 180),
          s = Math.sin((rot * Math.PI) / 180);
        for (let i = 0; i <= w / 5; i++)
          for (let j = 0; j <= h / 5; j++) {
            const lx = (i * 5 - w / 2) * S0,
              ly = (j * 5 - h / 2) * S0,
              x = cx + lx * c - ly * s,
              y = cy + lx * s + ly * c;
            if (n >= 900) break;
            if (
              !(bAt(x, y) & 63) ||
              bAt(x, y) & 128 ||
              Math.hypot(x - A.x, y - A.y) < 42 ||
              dR(x, y) < 6 ||
              PLS.some((p) => Math.hypot(p.x - x, p.y - y) < 12)
            )
              continue;
            const g = hAt(x, y);
            if (g < 0.5) continue;
            dm.position.set(x - OX, g - 0.1, y - OY);
            dm.rotation.set(0, (i * 7 + j * 3) % 6, 0);
            const sc = 0.85 + ((i * 5 + j * 11) % 7) * 0.04;
            dm.scale.set(sc, sc * (0.9 + ((i + j) % 3) * 0.08), sc);
            dm.updateMatrix();
            Ms.setMatrixAt(n, dm.matrix);
            Ms.setColorAt(
              n++,
              cl.set(["#86ad4e", "#7ca546", "#93b856"][(i + j) % 3]),
            );
          }
      }
      Ms.count = n;
      Ms.castShadow = Ms.receiveShadow = true;
      Ms.instanceMatrix.needsUpdate = true;
      if (Ms.instanceColor) Ms.instanceColor.needsUpdate = true;
      gTrees.add(Ms);
    }
    G.traverse((o) => {
      if (o.isMesh) {
        o.castShadow = true;
        o.receiveShadow = true;
      }
    });
  }
  // ---- Caelmar landmark models
  {
    const gy = (x, y) => Math.max(hAt(x, y), 0.3),
      M = (c) => new T.MeshLambertMaterial({ color: c }),
      G = new T.Group();
    world.add(G);
    G.userData.cael = 1;
    const MB = 0xf2f0ea,
      MG = 0xb9bcc0,
      SL = 0x7f8c99,
      BR = 0x9a7a3a;
    const add = (m) => {
        G.add(m);
        return m;
      },
      bx = (x, y, w, h, d, c, rot = 0, dy = 0) => {
        const m = add(new T.Mesh(new T.BoxGeometry(w, h, d), M(c)));
        m.position.set(x - OX, gy(x, y) + h / 2 + dy, y - OY);
        m.rotation.y = rot;
        return m;
      },
      cy = (x, y, r0, r1, h, c, dy = 0, seg = 12) => {
        const m = add(new T.Mesh(new T.CylinderGeometry(r0, r1, h, seg), M(c)));
        m.position.set(x - OX, gy(x, y) + h / 2 + dy, y - OY);
        return m;
      },
      cn = (x, y, r, h, c, dy, seg = 4, rot = Math.PI / 4) => {
        const m = add(new T.Mesh(new T.ConeGeometry(r, h, seg), M(c)));
        m.rotation.y = rot;
        m.position.set(x - OX, gy(x, y) + dy + h / 2, y - OY);
        return m;
      },
      lit = (x, y, h, c = 0xffd98a, s = 12) =>
        sprite(x - OX, y - OY, gy(x, y) + h, s, c, 1.1);
    const dense = (name) => {
      const R = D.ironRoads.find((r) => r.name === name);
      if (!R) return [];
      const o = [];
      for (let i = 0; i < R.pts.length - 1; i++) {
        const a = R.pts[i],
          b = R.pts[i + 1],
          L = Math.hypot(b[0] - a[0], b[1] - a[1]),
          n = Math.max(1, Math.round(L / 2));
        for (let k = 0; k < n; k++)
          o.push([
            a[0] + ((b[0] - a[0]) * k) / n,
            a[1] + ((b[1] - a[1]) * k) / n,
            Math.atan2(b[1] - a[1], b[0] - a[0]),
          ]);
      }
      return o;
    };
    // Marble Canal: straight, kerbed, stepped like a lock-flight
    {
      const CN = D.ironRivers.find((r) => r.name === "the Marble Canal");
      if (CN) {
        const wm = new T.MeshPhongMaterial({
          color: 0x7fb6cc,
          transparent: true,
          opacity: 0.85,
          shininess: 90,
        });
        for (let i = 0; i < CN.pts.length - 1; i++) {
          const a = CN.pts[i],
            b = CN.pts[i + 1],
            L = Math.hypot(b[0] - a[0], b[1] - a[1]),
            n = Math.max(1, Math.round(L / 3)),
            ux = (b[0] - a[0]) / L,
            uy = (b[1] - a[1]) / L,
            rot = -Math.atan2(uy, ux);
          for (let k = 0; k < n; k++) {
            const x = a[0] + ((b[0] - a[0]) * (k + 0.5)) / n,
              y = a[1] + ((b[1] - a[1]) * (k + 0.5)) / n,
              g = gy(x, y),
              sl = L / n + 0.2;
            const w = add(new T.Mesh(new T.BoxGeometry(sl, 0.3, 3), wm));
            w.position.set(x - OX, g + 0.15, y - OY);
            w.rotation.y = rot;
            for (const s of [-1, 1]) {
              const kb = add(
                new T.Mesh(new T.BoxGeometry(sl, 0.8, 0.7), M(MB)),
              );
              kb.position.set(
                x - OX - uy * s * 2,
                g + 0.35,
                y - OY + ux * s * 2,
              );
              kb.rotation.y = rot;
            }
          }
        }
        const end = CN.pts[CN.pts.length - 1];
        sprite(
          end[0] - OX,
          end[1] - OY,
          gy(end[0], end[1]) + 1.5,
          14,
          0xbfe6f4,
          0.4,
        );
      }
    }
    // Signing Steps
    {
      const F = P.signsteps;
      for (let k = 0; k < 8; k++)
        bx(
          F.x,
          F.y - k * 1.3,
          13 - k * 0.5,
          0.5,
          1.4,
          k % 2 ? MB : 0xe4e2dc,
          0,
          k * 0.45,
        );
      for (let k = 0; k < 4; k++)
        cy(F.x - 4.5 + k * 3, F.y - 10.8, 0.35, 0.35, 3.4, MB, 3.6, 8);
      bx(F.x, F.y - 10.8, 14, 0.35, 2.2, MB, 0, 7);
      bx(F.x, F.y - 10.8, 12, 0.3, 1.8, SL, 0, 7.35);
      bx(F.x, F.y - 10.8, 2, 1.1, 0.9, 0x6b4a2a, 0, 3.6);
      lit(F.x - 4.5, F.y - 10.8, 7.2, 0xffe2a0, 8);
      lit(F.x + 4.5, F.y - 10.8, 7.2, 0xffe2a0, 8);
      for (const s of [-1, 1]) {
        bx(F.x + s * 7, F.y - 3, 0.4, 2.6, 0.4, BR);
        lit(F.x + s * 7, F.y - 3, 2.9, 0xffd98a, 7);
      }
    }
    // Reading Gate (barbican over the Harbor Road)
    {
      const g = P.readgate;
      for (const s of [-1, 1]) {
        cy(g.x + s * 4.2, g.y, 1.7, 1.9, 6.4, MB, 0, 10);
        cy(g.x + s * 4.2, g.y, 2.1, 1.7, 0.7, MG, 6.4, 10);
        cn(g.x + s * 4.2, g.y, 2.2, 2.2, SL, 7.1, 10, 0);
      }
      bx(g.x, g.y, 6.6, 1.4, 2.6, MB, 0, 4.6);
      bx(g.x, g.y, 8, 0.5, 3, MG, 0, 6);
      for (let k = 0; k < 7; k++)
        bx(g.x - 3.6 + k * 1.2, g.y + 1.4, 0.6, 0.7, 0.5, MB, 0, 6.5);
      bx(g.x, g.y + 5.4, 2.6, 1.1, 1.6, 0x8a6a44);
      bx(g.x, g.y + 5.4, 0.2, 2.1, 0.2, 0x6b4a2a, 0, 1.1);
      bx(g.x, g.y + 5.9, 1.6, 1, 0.1, 0xf6efd6, 0, 2.4);
      for (const s of [-1, 1]) lit(g.x + s * 4.2, g.y + 2.2, 6, 0xffe2a0, 8);
      lit(g.x, g.y + 5.4, 2.8, 0xffd98a, 8);
    }
    // Rolls Vault
    {
      const V = P.rollsvault;
      cy(V.x, V.y, 5.2, 5.4, 5.2, MB, 0, 28);
      cy(V.x, V.y, 5.5, 5.5, 0.5, MG, 5.1, 28);
      const d = add(
        new T.Mesh(
          new T.SphereGeometry(5.2, 28, 10, 0, Math.PI * 2, 0, Math.PI / 2),
          M(0xe8e6df),
        ),
      );
      d.position.set(V.x - OX, gy(V.x, V.y) + 5.6, V.y - OY);
      d.scale.y = 0.45;
      bx(V.x, V.y + 5.3, 2.2, 3.2, 0.5, 0x3a342e);
      for (let k = 0; k < 10; k++) {
        const a = (k / 10) * 6.283;
        cy(
          V.x + Math.cos(a) * 6.4,
          V.y + Math.sin(a) * 6.4,
          0.28,
          0.28,
          2.2,
          MB,
          0,
          6,
        );
      }
      sprite(V.x - OX, V.y - OY, gy(V.x, V.y) + 8.2, 16, 0xdfeaff, 0.5);
    }
    // Lawgivers' Colonnade (runs from the Court road out to the blank plinth)
    {
      const C = P.colonnade,
        V = P.verethane,
        dx = V.x - C.x,
        dy = V.y - C.y,
        L = Math.hypot(dx, dy),
        ux = dx / L,
        uy = dy / L,
        nx = -uy,
        ny = ux,
        rot = -Math.atan2(uy, ux);
      for (let k = 0; k < 11; k++)
        for (const s of [-1, 1]) {
          const x = C.x + ux * k * 3.2 + nx * s * 2.6,
            y = C.y + uy * k * 3.2 + ny * s * 2.6;
          cy(x, y, 0.42, 0.46, 4.4, MB, 0.4, 10);
          bx(x, y, 1.1, 0.4, 1.1, MG, 0, 0);
          bx(x, y, 1.1, 0.3, 1.1, MG, 0, 4.7);
          if (k % 2 === 0) {
            const m = add(
              new T.Mesh(new T.IcosahedronGeometry(0.4, 0), M(0xd8dce0)),
            );
            m.scale.y = 1.7;
            m.position.set(
              x - OX + nx * s * 1.4,
              gy(x, y) + 1.5,
              y - OY + ny * s * 1.4,
            );
          }
        }
      for (let k = 0; k < 10; k++)
        for (const s of [-1, 1]) {
          const x = C.x + ux * (k + 0.5) * 3.2 + nx * s * 2.6,
            y = C.y + uy * (k + 0.5) * 3.2 + ny * s * 2.6;
          bx(x, y, 3.2, 0.5, 1, MB, rot, 4.4);
        }
      bx(C.x, C.y, 1.8, 1.1, 1.8, MB);
      bx(C.x - ux * 1.2, C.y - uy * 1.2, 0.4, 0.04, 1.2, MG, 0, 1.1);
      lit(C.x, C.y, 2.4, 0xe8f0ff, 7);
    }
    // Courtesy House
    {
      const H = P.courtesy;
      bx(H.x, H.y, 10, 3, 5, 0xf6efe0);
      cn(H.x, H.y, 8, 2.4, SL, 3, 4).scale.z = 0.5;
      bx(H.x, H.y + 2.6, 3, 2.4, 0.2, 0x2f2a26, 0, 0);
      bx(H.x - 1.55, H.y + 2.7, 0.6, 2.5, 0.3, 0xe8dcc0, 0.9, 0);
      bx(H.x + 1.55, H.y + 2.7, 0.6, 2.5, 0.3, 0xe8dcc0, -0.9, 0);
      for (let k = 0; k < 4; k++)
        cy(H.x - 3.6 + k * 2.4, H.y + 3.3, 0.28, 0.28, 3, MB, 0, 8);
      bx(H.x, H.y + 3.3, 9.4, 0.3, 1.4, MB, 0, 3);
      for (const s of [-1, 1])
        for (let k = 0; k < 2; k++)
          lit(H.x + s * (2.6 + k * 1.4), H.y + 2.6, 1.8, 0xffcf80, 5);
      for (let k = 0; k < 4; k++) {
        cy(
          H.x - 3 + k * 2,
          H.y + 5.4,
          0.25,
          0.3,
          1.3,
          [0x3a4a6a, 0x3a4a6a, 0x4a3a5a, 0x3a4a6a][k],
          0,
          6,
        );
      }
      bx(H.x - 5, H.y + 4, 2.4, 0.5, 0.8, 0x8a6a44);
      bx(H.x + 5, H.y + 4, 2.4, 0.5, 0.8, 0x8a6a44);
    }
    // Watch-Lantern
    {
      const W = P.watchlantern;
      cy(W.x, W.y, 2.3, 1.7, 12, MB, 0, 14);
      cy(W.x, W.y, 2.7, 2.7, 0.5, MG, 11.8, 14);
      cy(W.x, W.y, 1.5, 1.5, 2, 0xfff1b0, 12.2, 12);
      cn(W.x, W.y, 2.2, 2.2, SL, 14.2, 12, 0);
      for (let k = 0; k < 4; k++) bx(W.x, W.y, 0.2, 0.2, 0.2, MB, 0, 0);
      bx(W.x + 3.2, W.y, 3, 1.2, 2.4, 0xe4e2dc);
      cn(W.x + 3.2, W.y, 2.4, 1.2, SL, 1.2, 4);
      sprite(W.x - OX, W.y - OY, gy(W.x, W.y) + 13.2, 34, 0xfff1b0, 1.1);
      sprite(W.x - OX, W.y - OY, gy(W.x, W.y) + 13.2, 60, 0xffe9a0, 0.35);
    }
    // Great Cut
    {
      const Q = P.greatcut;
      for (let r = 0; r < 2; r++)
        for (let k = 0; k < 14; k++) {
          const a = (k / 14) * 6.283 + r * 0.2,
            rad = 16 + r * 3.5,
            x = Q.x + Math.cos(a) * rad * 1.3,
            y = Q.y + Math.sin(a) * rad;
          if (!(bAt(x, y) & 63)) continue;
          bx(x, y, 1.8, 0.9, 1.1, MB, a, 0);
          bx(x, y, 1.5, 0.8, 1, 0xe4e2dc, a + 0.2, 0.9);
        }
      for (let k = 0; k < 9; k++) {
        const x = Q.x + (k % 3) * 2 - 22,
          y = Q.y + Math.floor(k / 3) * 1.4 + 10;
        bx(
          x,
          y,
          1.7,
          0.8,
          1,
          k % 2 ? MB : 0xe4e2dc,
          0,
          Math.floor(k / 3) * 0.8,
        );
      }
      {
        const x = Q.x + 18,
          y = Q.y - 10;
        bx(x, y, 0.35, 9, 0.35, 0x6b4a2a);
        bx(x + 2.4, y, 5.2, 0.3, 0.3, 0x6b4a2a, 0, 8.7);
        bx(x + 4.8, y, 0.08, 3.4, 0.08, 0x2f2a26, 0, 5.4);
        bx(x + 4.8, y, 1.5, 1, 0.9, MB, 0, 4.4);
        lit(x, y, 9.4, 0xffd98a, 6);
      }
      sprite(Q.x - OX, Q.y - OY, gy(Q.x, Q.y) + 4, 40, 0xf4f6ff, 0.35);
    }
    // Advice Posts along the Statute Road
    {
      const P0 = P.advice,
        pts = dense("Statute Road").filter(
          (p) => Math.hypot(p[0] - P0.x, p[1] - P0.y) < 34,
        );
      let n = 0;
      pts.forEach((p, i) => {
        if (i % 3) return;
        const s = n++ % 2 ? 1 : -1,
          x = p[0] - Math.sin(p[2]) * 3 * s,
          y = p[1] + Math.cos(p[2]) * 3 * s;
        bx(x, y, 0.45, 2.3, 0.45, MB);
        bx(x, y, 0.7, 0.25, 0.7, MG, 0, 2.3);
        bx(x, y, 0.12, 0.55, 0.8, BR, p[2] + Math.PI / 2, 1.2);
        if (n % 3 === 0) lit(x, y, 2.8, 0xe8f0ff, 4);
      });
    }
    // Sealing Mills
    {
      const S = P.sealingmills;
      for (let m = 0; m < 2; m++) {
        const x = S.x + m * 9 - 4.5,
          y = S.y + (m ? 2 : 0);
        bx(x, y, 5, 3.6, 4.2, 0xe4e2dc);
        cn(x, y, 4.2, 2.4, SL, 3.6, 4).scale.z = 0.8;
        const w = add(
          new T.Mesh(new T.TorusGeometry(2.1, 0.25, 6, 18), M(0x6b4a2a)),
        );
        w.position.set(x - OX - 3.2, gy(x, y) + 2.1, y - OY);
        w.rotation.y = Math.PI / 2;
        lit(x, y + 2.3, 2.2, 0xffcf80, 6);
      }
      bx(S.x, S.y + 8, 8, 2.4, 3, 0xf2f0ea);
      cn(S.x, S.y + 8, 6.4, 1.6, SL, 2.4, 4).scale.z = 0.6;
      bx(S.x, S.y + 10.2, 0.15, 3.6, 0.15, BR);
      bx(S.x, S.y + 10.2, 4, 0.15, 0.15, BR, 0, 3.6);
      for (const s of [-1, 1])
        cy(S.x + s * 2, S.y + 10.2, 0.7, 0.5, 0.25, BR, 2.8, 10);
      for (let k = 0; k < 8; k++)
        bx(
          S.x + 6 + (k % 4) * 1.1,
          S.y + 7 + Math.floor(k / 4) * 1,
          1,
          0.7,
          0.8,
          0xe8dcc0,
          k * 0.3,
          Math.floor(k / 4) * 0.7,
        );
    }
    // Waste-Watch
    {
      const W = P.wastewatch;
      cy(W.x, W.y, 3.4, 3.1, 5, MG, 0, 12);
      cy(W.x, W.y, 3.8, 3.8, 0.6, 0xa3a7ab, 4.8, 12);
      for (let k = 0; k < 10; k++) {
        const a = (k / 10) * 6.283;
        bx(
          W.x + Math.cos(a) * 3.6,
          W.y + Math.sin(a) * 3.6,
          0.8,
          0.7,
          0.6,
          MG,
          -a,
          5.4,
        );
      }
      cy(W.x, W.y, 0.7, 0.7, 0.5, 0x3a342e, 5.4, 8);
      sprite(W.x - OX, W.y - OY, gy(W.x, W.y) + 6.6, 18, 0xff9a50, 1);
      bx(W.x + 5, W.y + 3, 0.2, 6, 0.2, 0x6b4a2a);
      bx(W.x + 5.9, W.y + 3, 1.6, 0.9, 0.05, 0xf2f0ea, 0, 5);
      bx(W.x + 3.6, W.y + 4.4, 2.2, 1, 0.2, 0xf6efd6, 0.5, 0);
    }
    // cypress avenues along the Harbor Road and the Statute Road
    {
      const CG = new T.ConeGeometry(0.75, 5, 6);
      CG.translate(0, 2.7, 0);
      const Is = new T.InstancedMesh(CG, new T.MeshLambertMaterial(), 420),
        dm = new T.Object3D(),
        cl = new T.Color(),
        V = P.verethane,
        PLc = D.places.filter(
          (p) =>
            p.isl === "Caelmar" &&
            p.id !== "verethane" &&
            p.id !== "court" &&
            p.id !== "readgate",
        );
      let n = 0;
      for (const nm of ["Harbor Road", "Statute Road", "Mill Road"])
        dense(nm).forEach((p, i) => {
          if (i % 4 || n >= 418) return;
          if (Math.hypot(p[0] - V.x, p[1] - V.y) < 34) return;
          if (PLc.some((q) => Math.hypot(q.x - p[0], q.y - p[1]) < 14)) return;
          for (const s of [-1, 1]) {
            const x = p[0] - Math.sin(p[2]) * 3.4 * s,
              y = p[1] + Math.cos(p[2]) * 3.4 * s;
            if (!(bAt(x, y) & 63) || bAt(x, y) & 128) continue;
            const g = hAt(x, y);
            if (g < 0.5) continue;
            dm.position.set(x - OX, g - 0.1, y - OY);
            dm.rotation.set(0, i, 0);
            const sc = 0.9 + ((i * 7) % 5) * 0.07;
            dm.scale.set(sc, sc * (1 + ((i * 3) % 4) * 0.08), sc);
            dm.updateMatrix();
            Is.setMatrixAt(n, dm.matrix);
            Is.setColorAt(
              n++,
              cl.set(["#4f6f54", "#58795c", "#486a50"][i % 3]),
            );
          }
        });
      Is.count = n;
      Is.castShadow = true;
      Is.instanceMatrix.needsUpdate = true;
      if (Is.instanceColor) Is.instanceColor.needsUpdate = true;
      gTrees.add(Is);
    }
    G.traverse((o) => {
      if (o.isMesh) {
        o.castShadow = true;
        o.receiveShadow = true;
      }
    });
  }
}
