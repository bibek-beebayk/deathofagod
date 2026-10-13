// scenery: sea stacks along the coasts and drifting mist banks on the high ground.
// Uses its own hash, so the scene's seeded random stream is never consumed.
export function createScenery({
  T,
  world,
  hash,
  H,
  BM,
  GW,
  GH,
  CELL,
  OX,
  OY,
  VS,
  quality,
} = {}) {
  const gScenery = new T.Group();
  world.add(gScenery);
  const r1 = (i, o) => hash(i * 7 + o, i * 3 + o * 11 + 91);
  const landAt = (i, j) => {
    i = Math.max(0, Math.min(GW - 1, i));
    j = Math.max(0, Math.min(GH - 1, j));
    return BM[j * GW + i] & 63 ? 1 : 0;
  };
  // ---- sea stacks: jagged rocks standing in the shallows near the shore
  {
    const want = quality.lite ? 260 : 700,
      spots = [];
    for (let t = 0; t < 60000 && spots.length < want; t++) {
      const i = (r1(t, 1) * GW) | 0,
        j = (r1(t, 2) * GH) | 0,
        n = j * GW + i,
        h = H[n];
      if (landAt(i, j) || h > -0.3 || h < -3.2) continue;
      let near = 0;
      for (let d = 2; d <= 12 && !near; d += 2)
        near =
          landAt(i + d, j) |
          landAt(i - d, j) |
          landAt(i, j + d) |
          landAt(i, j - d);
      if (near) spots.push([(i + 0.5) * CELL - OX, (j + 0.5) * CELL - OY, t]);
    }
    const geo = new T.DodecahedronGeometry(1, 0);
    const mat = new T.MeshPhongMaterial({
      color: 0x5a5650,
      flatShading: true,
      specular: 0x000000,
      shininess: 0,
    });
    const rocks = new T.InstancedMesh(geo, mat, spots.length);
    const m = new T.Matrix4(),
      q = new T.Quaternion(),
      e = new T.Euler(),
      p = new T.Vector3(),
      s = new T.Vector3();
    spots.forEach(([x, z, t], k) => {
      const big = r1(t, 3) ** 2.2,
        w = 1.4 + big * 7,
        ht = w * (1.1 + r1(t, 4) * 2.2);
      e.set(0, r1(t, 5) * 6.28, 0);
      q.setFromEuler(e);
      p.set(x, -0.6 + ht * 0.28, z);
      s.set(w, ht, w * (0.7 + r1(t, 6) * 0.6));
      m.compose(p, q, s);
      rocks.setMatrixAt(k, m);
    });
    rocks.castShadow = quality.shadows;
    rocks.receiveShadow = true;
    gScenery.add(rocks);
  }
  // ---- mist banks: soft cloud puffs clinging to the highlands
  {
    const c = document.createElement("canvas");
    c.width = c.height = 128;
    const g = c.getContext("2d"),
      gr = g.createRadialGradient(64, 64, 4, 64, 64, 62);
    gr.addColorStop(0, "rgba(255,255,255,.95)");
    gr.addColorStop(0.5, "rgba(255,255,255,.4)");
    gr.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = gr;
    g.fillRect(0, 0, 128, 128);
    const tex = new T.CanvasTexture(c);
    const want = quality.lite ? 8 : 22;
    let got = 0;
    for (let t = 0; t < 40000 && got < want; t++) {
      const i = (r1(t, 21) * GW) | 0,
        j = (r1(t, 22) * GH) | 0,
        h = H[j * GW + i] / VS;
      if (!(BM[j * GW + i] & 63) || h < 16) continue;
      for (let k = 0; k < 3; k++) {
        const sp = new T.Sprite(
          new T.SpriteMaterial({
            map: tex,
            transparent: true,
            opacity: 0.1 + r1(t, 23 + k) * 0.14,
            depthWrite: false,
            fog: false,
          }),
        );
        const sz = 110 + r1(t, 30 + k) * 240;
        sp.position.set(
          (i + 0.5) * CELL - OX + (r1(t, 40 + k) - 0.5) * 120,
          H[j * GW + i] * 0.75 + 5 + r1(t, 50 + k) * 20,
          (j + 0.5) * CELL - OY + (r1(t, 60 + k) - 0.5) * 120,
        );
        sp.scale.set(sz, sz * 0.7, 1);
        sp.renderOrder = 2;
        gScenery.add(sp);
      }
      got++;
    }
  }
  return { gScenery };
}
