// docks: the Cinderwick ore-wharves - timber piers, cranes, ore and ingot stacks,
// and moored tall ships. Built from simple shapes; no seeded randomness is consumed.
export function createDocks({ T, world, D, hAt, OX, OY } = {}) {
  const c = D.places.find((p) => p.id === "cinderwick");
  const g = new T.Group();
  world.add(g);
  // find the shoreline east of the town
  let sx = c.x;
  for (let k = 0; k < 120 && hAt(sx, c.y) > 0.25; k++) sx += 1;
  const base = new T.Vector3(sx - OX, 0, c.y - OY);
  const mat = (color, extra = {}) =>
    new T.MeshPhongMaterial({
      color,
      flatShading: true,
      specular: 0x111111,
      shininess: 6,
      ...extra,
    });
  const wood = mat(0x6b4f35),
    darkWood = mat(0x4a3626),
    iron = mat(0x3a3b3f),
    ore = mat(0x5b3a2b),
    ingot = mat(0x7a7d82),
    hull = mat(0x4b3424),
    sail = mat(0xe9dcc0, { side: T.DoubleSide, flatShading: false });
  const box = (m, w, h, d, x, y, z, parent = g) => {
    const o = new T.Mesh(new T.BoxGeometry(w, h, d), m);
    o.position.set(x, y, z);
    o.castShadow = o.receiveShadow = true;
    parent.add(o);
    return o;
  };
  const piers = [-16, 0, 16],
    cranes = [],
    ships = [];
  piers.forEach((dz, pi) => {
    const len = 42 - pi * 3,
      x0 = base.x - 6;
    box(wood, len, 0.7, 5.2, x0 + len / 2, 1.3, base.z + dz);
    for (let k = 0; k <= len; k += 6) {
      for (const s of [-2.4, 2.4]) {
        const p = new T.Mesh(
          new T.CylinderGeometry(0.35, 0.35, 5, 5),
          darkWood,
        );
        p.position.set(x0 + k, -0.8, base.z + dz + s);
        g.add(p);
      }
    }
    // crane at the pier head
    const cr = new T.Group();
    cr.position.set(x0 + len - 5, 1.65, base.z + dz);
    box(iron, 1.1, 13, 1.1, 0, 6.5, 0, cr);
    const jib = new T.Group();
    jib.position.y = 12.5;
    box(iron, 11, 0.7, 0.7, 3.5, 0, 0, jib);
    box(iron, 0.15, 6, 0.15, 8.4, -3, 0, jib);
    box(ingot, 1.4, 1, 1.4, 8.4, -6.3, 0, jib);
    cr.add(jib);
    g.add(cr);
    cranes.push({ jib, ph: pi * 2.1 });
    // stacked ingots and ore on the quay
    for (let k = 0; k < 4; k++)
      for (let j = 0; j < 3 - (k % 2); j++)
        box(
          ingot,
          2.4,
          0.9,
          1.1,
          x0 + 8 + k * 2.7,
          1.9 + j * 0.9,
          base.z + dz + 1.2,
        );
    // moored ship on the north side of each pier but the middle
    if (pi !== 1) {
      const sh = new T.Group();
      sh.position.set(x0 + len - 12, 0.2, base.z + dz + (pi === 0 ? -9 : 9));
      const hl = new T.Mesh(new T.CylinderGeometry(2.6, 1.8, 20, 6, 1), hull);
      hl.rotation.z = Math.PI / 2;
      hl.scale.set(1, 1, 0.8);
      hl.position.y = 1.4;
      hl.castShadow = true;
      sh.add(hl);
      box(darkWood, 6, 1.4, 4.2, -7.5, 3.4, 0, sh);
      for (const [mx, mh] of [
        [-4, 15],
        [1.5, 18],
        [6.5, 13],
      ]) {
        box(darkWood, 0.35, mh, 0.35, mx, 3 + mh / 2, 0, sh);
        const s = new T.Mesh(new T.PlaneGeometry(6.5, mh * 0.62), sail);
        s.rotation.y = Math.PI / 2 + 0.12;
        s.position.set(mx + 0.3, 3 + mh * 0.62, 0);
        s.castShadow = true;
        sh.add(s);
      }
      g.add(sh);
      ships.push({ sh, y: 0.2, ph: pi * 1.7 });
    }
  });
  // ore heaps and warehouses behind the wharf
  for (let k = 0; k < 5; k++) {
    const h = new T.Mesh(
      new T.ConeGeometry(4 + (k % 3), 4 + (k % 2) * 2, 7),
      ore,
    );
    h.position.set(base.x - 14 - (k % 2) * 6, 2, base.z - 28 + k * 14);
    h.castShadow = true;
    g.add(h);
  }
  for (let k = 0; k < 3; k++) {
    const w = box(darkWood, 9, 5, 6, base.x - 22, 3.2, base.z - 20 + k * 20);
    const r = new T.Mesh(new T.ConeGeometry(6.8, 3, 4), iron);
    r.rotation.y = Math.PI / 4;
    r.scale.set(1, 1, 0.75);
    r.position.set(0, 4, 0);
    w.add(r);
  }
  function update(tt) {
    for (const k of cranes) k.jib.rotation.y = Math.sin(tt * 0.12 + k.ph) * 0.7;
    for (const s of ships) {
      s.sh.position.y = s.y + Math.sin(tt * 1.2 + s.ph) * 0.18;
      s.sh.rotation.z = Math.sin(tt * 0.9 + s.ph) * 0.02;
    }
  }
  return { update };
}
