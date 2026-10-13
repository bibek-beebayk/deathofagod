// labels: initialized by main.js; dependencies are passed explicitly.
export function createLabels({
  OX,
  OY,
  D,
  hAt,
  show,
  flyTo,
  T,
  state,
  ctl,
  cam,
} = {}) {
  // ---- labels + pins
  const ov = document.getElementById("ov");
  const L = [];
  const TH = {
    realm: [1100, 9e9],
    sea: [1400, 9e9],
    city: [2900, 0],
    port: [1800, 0],
    town: [1800, 0],
    village: [950, 0],
    landmark: [900, 0],
    camp: [1000, 0],
    fort: [1200, 0],
    lane: [2300, 0],
  };
  const RK = {
    realm: 1,
    city: 2,
    port: 4,
    town: 4,
    sea: 5,
    landmark: 6,
    camp: 6,
    fort: 6,
    village: 7,
    lane: 9,
  };
  function mk(cls, html, x, z, y, kind, ref) {
    const e = document.createElement("div");
    e.className = "lb " + cls;
    e.innerHTML = html;
    e.style.opacity = 0;
    ov.appendChild(e);
    const o = {
      e,
      x: x - OX,
      z: z - OY,
      y,
      kind,
      r: RK[kind] || 7,
      ref,
      pin: null,
      on: false,
    };
    L.push(o);
    return o;
  }
  D.realms.forEach((r) =>
    mk("realm", `${r[0]}<small>${r[1]}</small>`, r[2], r[3], 6, "realm"),
  );
  D.sea.forEach((s) => mk("sea", s[0], s[1], s[2], 1, "sea"));
  D.lanes.forEach((l) => {
    mk("lane", l.label, l.mid[0], l.mid[1], 2, "lane");
  });
  D.ironRivers.forEach((r) => {
    const m = r.pts[Math.floor(r.pts.length / 2)];
    mk("riv", r.name, m[0], m[1], hAt(m[0], m[1]) + 1, "lane");
  });
  D.ironRoads.forEach((r) => {
    const m = r.pts[Math.floor(r.pts.length / 2)],
      n = r.pts[Math.floor(r.pts.length / 2) - 1] || m;
    mk(
      "road",
      r.name,
      (m[0] + n[0]) / 2,
      (m[1] + n[1]) / 2,
      hAt((m[0] + n[0]) / 2, (m[1] + n[1]) / 2) + 1,
      "lane",
    );
  });
  for (const p of D.places) {
    const o = mk(
      "place " + p.kind,
      p.name,
      p.x,
      p.y,
      Math.max(hAt(p.x, p.y), 0) + 0.6,
      p.kind,
      p,
    );
    const b = document.createElement("button");
    b.className = "pin " + p.kind;
    b.setAttribute("aria-label", p.name);
    b.innerHTML = "<i></i>";
    b.style.display = "none";
    b.addEventListener("click", (e) => {
      e.stopPropagation();
      show(p);
      flyTo(p);
    });
    ov.appendChild(b);
    o.pin = b;
  }
  const wv = new T.Vector3();
  state.labelsOn = true;
  function labels() {
    const rad = ctl.r,
      W = innerWidth,
      Hh = innerHeight,
      placed = [];
    const cand = [];
    for (const o of L) {
      if (!state.labelsOn) {
        o.e.style.opacity = 0;
        if (o.pin) o.pin.style.display = "none";
        continue;
      }
      wv.set(o.x, o.y * state.EX, o.z).project(cam);
      if (wv.z > 1 || wv.z < -1) {
        o.e.style.opacity = 0;
        if (o.pin) o.pin.style.display = "none";
        continue;
      }
      const sx = (wv.x * 0.5 + 0.5) * W,
        sy = (-wv.y * 0.5 + 0.5) * Hh;
      if (sx < -100 || sx > W + 100 || sy < -60 || sy > Hh + 60) {
        o.e.style.opacity = 0;
        if (o.pin) o.pin.style.display = "none";
        continue;
      }
      const dx = cam.position.x - o.x,
        dy = cam.position.y - o.y * state.EX,
        dz = cam.position.z - o.z,
        d = Math.hypot(dx, dy, dz);
      const t =
        o.ref && o.ref.id && o.ref.id.startsWith("h_")
          ? [230, 0]
          : TH[o.kind] || [500, 0];
      let ok;
      if (o.kind === "realm") ok = rad > t[0] * 1.15 && d > t[0];
      else if (o.kind === "sea") ok = rad > 1500 && rad < 8000;
      else ok = d < t[0];
      if (!ok) {
        o.e.style.opacity = 0;
        if (o.pin) o.pin.style.display = "none";
        continue;
      }
      o.sx = sx;
      o.sy = sy;
      o.d = d;
      cand.push(o);
    }
    cand.sort((a, b) => a.r - b.r || a.d - b.d);
    for (const o of cand) {
      const w = o.w || (o.w = o.e.offsetWidth || 60),
        h = o.h || (o.h = o.e.offsetHeight || 18);
      const centered =
        o.kind === "realm" || o.kind === "sea" || o.kind === "lane";
      const x0 = centered ? o.sx - w / 2 : o.sx - 6,
        y0 = o.sy - h / 2,
        r = [x0 - 3, y0 - 2, x0 + w + 3, y0 + h + 2];
      let free = true;
      for (const q of placed)
        if (r[0] < q[2] && r[2] > q[0] && r[1] < q[3] && r[3] > q[1]) {
          free = false;
          break;
        }
      if (o.pin) {
        o.pin.style.display = "block";
        o.pin.style.transform = `translate(${o.sx.toFixed(1)}px,${o.sy.toFixed(1)}px)`;
      }
      if (free) {
        placed.push(r);
        o.e.style.opacity = 1;
        o.e.style.transform = `translate(${(centered ? x0 : o.sx - 6).toFixed(1)}px,${y0.toFixed(1)}px)`;
      } else o.e.style.opacity = 0;
    }
  }
  return { labels };
}
