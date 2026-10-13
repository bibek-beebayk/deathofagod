// world: initialized by main.js; dependencies are passed explicitly.
export function createWorld({ T, rnd, world, D, S0, hAt, OX, OY } = {}) {
  // ---- helpers
  function gl() {
    const c = document.createElement("canvas");
    c.width = c.height = 64;
    const g = c.getContext("2d"),
      r = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    r.addColorStop(0, "rgba(255,255,255,1)");
    r.addColorStop(0.25, "rgba(255,255,255,.55)");
    r.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = r;
    g.fillRect(0, 0, 64, 64);
    return new T.CanvasTexture(c);
  }
  const GLOW = gl(),
    glows = [];
  function sprite(x, z, y, size, color, k = 1) {
    const s = new T.Sprite(
      new T.SpriteMaterial({
        map: GLOW,
        color,
        blending: T.AdditiveBlending,
        depthWrite: false,
        transparent: true,
        fog: false,
      }),
    );
    s.position.set(x, y, z);
    s.scale.set(size, size, 1);
    s.userData = { size, k, ph: rnd() * 6 };
    world.add(s);
    glows.push(s);
    return s;
  }
  {
    const H0 = D.places.find((p) => p.id === "hearthmoor"),
      V0 = D.places.find((p) => p.id === "verethane");
    for (const p of D.places) {
      if (p.id.startsWith("h_")) {
        p.x = H0.x + (p.x - H0.x) * (2.6 / S0);
        p.y = H0.y + (p.y - H0.y) * (2.6 / S0);
      }
      if (p.id === "court") {
        p.x = V0.x + (p.x - V0.x) * (2.4 / S0);
        p.y = V0.y + (p.y - V0.y) * (2.4 / S0);
      }
    }
  }
  const P = {};
  D.places.forEach((p) => {
    P[p.id] = p;
    p.gy = Math.max(hAt(p.x, p.y), 0.2);
  });
  const W3 = (x, y) => [x - OX, y - OY];
  const ORCH = [
    [-70, -58, 50, 25, -6],
    [-17, -50, 50, 30, 4],
    [40, -40, 45, 25, -3],
    [-95, 0, 33, 40, 7],
    [-23, 32, 37, 25, 0],
    [37, 13, 50, 30, -4],
    [87, -10, 37, 23, 5],
  ];
  const inOrch = (x, y) => {
    const A = P.applegarth;
    for (const [ox, oy, w, h, rot] of ORCH) {
      const cx = A.x + (ox + w / 2) * S0,
        cy = A.y + (oy + h / 2) * S0,
        c = Math.cos((rot * Math.PI) / 180),
        s = Math.sin((rot * Math.PI) / 180),
        dx = x - cx,
        dy = y - cy,
        lx = dx * c + dy * s,
        ly = -dx * s + dy * c;
      if (Math.abs(lx) < (w / 2 + 5) * S0 && Math.abs(ly) < (h / 2 + 5) * S0)
        return true;
    }
    return false;
  };
  return { P, inOrch, sprite, ORCH, GLOW, glows };
}
