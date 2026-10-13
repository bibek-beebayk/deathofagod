// controls: initialized by main.js; dependencies are passed explicitly.
export function createControls({
  T,
  WW,
  WH,
  hAt,
  OX,
  OY,
  state,
  cam,
  scene,
  cv,
  D,
  gLanes,
  gRoads,
  gRoute,
  gTrees,
  gTowns,
  hb,
  hr_,
  tents,
  setTod,
  world,
  P,
} = {}) {
  // ---- camera control
  const ctl = {
    tx: 0,
    tz: 0,
    r: 6000,
    th: 0.5,
    ph: 0.85,
    gtx: 0,
    gtz: 0,
    gr: 6000,
    gth: 0.5,
    gph: 0.85,
    auto: false,
    ty: 0,
  };
  const up = new T.Vector3(0, 1, 0);
  function clampC() {
    ctl.gr = Math.max(30, Math.min(9500, ctl.gr));
    ctl.gph = Math.max(0.08, Math.min(1.5, ctl.gph));
    ctl.gtx = Math.max(-WW * 0.52, Math.min(WW * 0.52, ctl.gtx));
    ctl.gtz = Math.max(-WH * 0.52, Math.min(WH * 0.52, ctl.gtz));
  }
  let flying = null;
  function updCam(dt) {
    clampC();
    if (ctl.auto && !flying) ctl.gth += dt * 0.06;
    const k = 1 - Math.pow(0.0009, dt);
    if (flying) {
      const f = flying;
      f.t = Math.min(1, f.t + dt / f.d);
      const e = f.t < 0.5 ? 4 * f.t ** 3 : 1 - Math.pow(-2 * f.t + 2, 3) / 2;
      ctl.gtx = f.a.tx + (f.b.tx - f.a.tx) * e;
      ctl.gtz = f.a.tz + (f.b.tz - f.a.tz) * e;
      const lr = Math.log(f.a.r) + (Math.log(f.b.r) - Math.log(f.a.r)) * e;
      const arc = Math.sin(e * Math.PI) * f.lift;
      ctl.gr = Math.exp(lr) * (1 + arc);
      ctl.gph = f.a.ph + (f.b.ph - f.a.ph) * e;
      ctl.gth = f.a.th + (f.b.th - f.a.th) * e;
      ctl.tx = ctl.gtx;
      ctl.tz = ctl.gtz;
      ctl.r = ctl.gr;
      ctl.th = ctl.gth;
      ctl.ph = ctl.gph;
      if (f.t >= 1) flying = null;
    } else {
      ctl.tx += (ctl.gtx - ctl.tx) * k;
      ctl.tz += (ctl.gtz - ctl.tz) * k;
      ctl.r += (ctl.gr - ctl.r) * k;
      ctl.th += (ctl.gth - ctl.th) * k;
      ctl.ph += (ctl.gph - ctl.ph) * k;
    }
    const gyT = Math.max(hAt(ctl.tx + OX, ctl.tz + OY), 0) * state.EX;
    ctl.ty += (gyT - ctl.ty) * Math.min(1, k * 1.5);
    let ph = ctl.ph;
    for (let i = 0; i < 14; i++) {
      const sx = Math.sin(ph) * Math.sin(ctl.th) * ctl.r,
        sz = Math.sin(ph) * Math.cos(ctl.th) * ctl.r,
        sy = Math.cos(ph) * ctl.r;
      const cx = ctl.tx + sx,
        cz = ctl.tz + sz;
      const g = Math.max(hAt(cx + OX, cz + OY), 0) * state.EX + 7;
      if (ctl.ty + sy >= g || ph < 0.1) break;
      ph *= 0.94;
    }
    cam.position.set(
      ctl.tx + Math.sin(ph) * Math.sin(ctl.th) * ctl.r,
      ctl.ty + Math.cos(ph) * ctl.r,
      ctl.tz + Math.sin(ph) * Math.cos(ctl.th) * ctl.r,
    );
    cam.lookAt(ctl.tx, ctl.ty, ctl.tz);
    scene.fog.near = ctl.r * 0.7;
    scene.fog.far = ctl.r * 3 + 1100;
    cam.near = Math.max(1, ctl.r * 0.01);
    cam.updateProjectionMatrix();
  }
  function flyTo(p, r = 190) {
    const pr = { tx: ctl.tx, tz: ctl.tz, r: ctl.r, th: ctl.th, ph: ctl.ph };
    const mx = Math.hypot(p.x - OX - ctl.tx, p.y - OY - ctl.tz);
    flying = {
      t: 0,
      d: Math.min(4.4, 1.1 + mx / 1500),
      a: pr,
      b: {
        tx: p.x - OX,
        tz: p.y - OY,
        r: p.kind === "landmark" || p.kind === "camp" ? Math.min(r, 110) : r,
        th: ctl.th,
        ph: 0.95,
      },
      lift: Math.min(5, mx / 700),
    };
  }
  // pointer
  const pts = new Map();
  let mv = 0,
    pd = null;
  cv.addEventListener("pointerdown", (e) => {
    cv.setPointerCapture(e.pointerId);
    pts.set(e.pointerId, {
      x: e.clientX,
      y: e.clientY,
      b: e.button,
      s: e.shiftKey,
    });
    mv = 0;
    flying = null;
    hideHint();
    if (pts.size === 2) {
      const [a, b] = [...pts.values()];
      pd = Math.hypot(a.x - b.x, a.y - b.y);
    }
    cv.classList.add("drag");
  });
  function pan(dx, dy) {
    const s = ctl.gr * 0.0017,
      sn = Math.sin(ctl.th),
      cs = Math.cos(ctl.th);
    ctl.gtx += (-cs * dx - sn * dy) * s * -1 * -1;
    ctl.gtz += (sn * dx - cs * dy) * s;
  }
  cv.addEventListener("pointermove", (e) => {
    const p = pts.get(e.pointerId);
    if (!p) return;
    const dx = e.clientX - p.x,
      dy = e.clientY - p.y;
    p.x = e.clientX;
    p.y = e.clientY;
    mv += Math.abs(dx) + Math.abs(dy);
    if (pts.size === 1) {
      if (p.b === 2 || p.s || p.b === 1) pan(dx, dy);
      else {
        ctl.gth -= dx * 0.0055;
        ctl.gph -= dy * 0.0045;
      }
    } else if (pts.size === 2) {
      const [a, b] = [...pts.values()],
        d = Math.hypot(a.x - b.x, a.y - b.y);
      if (pd) {
        ctl.gr *= pd / d;
      }
      pd = d;
      pan(dx / 2, dy / 2);
    }
  });
  const upf = (e) => {
    pts.delete(e.pointerId);
    pd = null;
    if (!pts.size) cv.classList.remove("drag");
  };
  cv.addEventListener("pointerup", upf);
  cv.addEventListener("pointercancel", upf);
  cv.addEventListener("contextmenu", (e) => e.preventDefault());
  cv.addEventListener(
    "wheel",
    (e) => {
      e.preventDefault();
      flying = null;
      hideHint();
      const d = e.deltaMode === 1 ? e.deltaY * 16 : e.deltaY;
      ctl.gr *= Math.exp(Math.max(-150, Math.min(150, d)) * 0.0018);
    },
    { passive: false },
  );
  addEventListener("keydown", (e) => {
    if (e.target.tagName === "INPUT" && e.target.type === "search") return;
    const k = e.key;
    if (k === "+" || k === "=") ctl.gr /= 1.25;
    else if (k === "-" || k === "_") ctl.gr *= 1.25;
    else if (k === "q" || k === "Q") ctl.gth += 0.12;
    else if (k === "e" || k === "E") ctl.gth -= 0.12;
    else if (k === "ArrowLeft" || k === "a") pan(-40, 0);
    else if (k === "ArrowRight" || k === "d") pan(40, 0);
    else if (k === "ArrowUp" || k === "w") pan(0, -40);
    else if (k === "ArrowDown" || k === "s") pan(0, 40);
  });
  const $ = (id) => document.getElementById(id);
  $("zi").onclick = () => {
    ctl.gr /= 1.5;
  };
  $("zo").onclick = () => {
    ctl.gr *= 1.5;
  };
  $("tl").onclick = () => {
    ctl.gph = ctl.gph > 0.6 ? 0.25 : 1.2;
  };
  $("zf").onclick = () => {
    flying = {
      t: 0,
      d: 1.6,
      a: { tx: ctl.tx, tz: ctl.tz, r: ctl.r, th: ctl.th, ph: ctl.ph },
      b: { tx: 0, tz: 0, r: 6000, th: 0.5, ph: 0.85 },
      lift: 0.2,
    };
  };
  let hid = false;
  function hideHint() {
    if (!hid) {
      hid = true;
      $("hint").style.opacity = 0;
    }
  }
  setTimeout(hideHint, 10000);
  // UI
  const info = $("info");
  let cur = null;
  function show(p) {
    cur = p;
    info.querySelector(".k").textContent = p.kind + " · " + p.isl;
    info.querySelector("h2").textContent = p.name;
    info.querySelector("p").textContent = p.desc || "";
    info.classList.add("open");
  }
  info.querySelector(".x").onclick = () => info.classList.remove("open");
  info.querySelector(".go").onclick = () => {
    if (cur) flyTo(cur);
  };
  const q = $("q"),
    res = $("res");
  function find(s) {
    s = s.trim().toLowerCase();
    if (!s) return [];
    const o = D.places.filter(
      (g) =>
        g.name.toLowerCase().includes(s) || g.isl.toLowerCase().includes(s),
    );
    o.sort(
      (a, b) =>
        (a.name.toLowerCase().startsWith(s) ? 0 : 1) -
        (b.name.toLowerCase().startsWith(s) ? 0 : 1),
    );
    return o.slice(0, 8);
  }
  function go(g) {
    q.value = "";
    res.innerHTML = "";
    q.blur();
    show(g);
    flyTo(g);
  }
  q.addEventListener("input", () => {
    res.innerHTML = "";
    for (const g of find(q.value)) {
      const b = document.createElement("button");
      b.innerHTML = "<span></span><small></small>";
      b.firstChild.textContent = g.name;
      b.lastChild.textContent = g.isl;
      b.onclick = () => go(g);
      res.appendChild(b);
    }
  });
  q.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      const f = find(q.value)[0];
      if (f) go(f);
    } else if (e.key === "Escape") {
      q.value = "";
      res.innerHTML = "";
    }
  });
  const lb = $("lbtn"),
    lp = $("layers");
  lb.onclick = () => {
    const o = lp.classList.toggle("open");
    lb.setAttribute("aria-expanded", o);
  };
  lp.querySelectorAll("input[data-t]").forEach((i) =>
    i.addEventListener("change", () => {
      const t = i.dataset.t,
        v = i.checked;
      if (t === "labels") {
        state.labelsOn = v;
      } else if (t === "lanes") gLanes.visible = v;
      else if (t === "roads") gRoads.visible = v;
      else if (t === "route") gRoute.visible = v;
      else if (t === "trees") gTrees.visible = v;
      else if (t === "towns")
        gTowns.visible = hb.visible = hr_.visible = tents.visible = v;
      else if (t === "orbit") ctl.auto = v;
    }),
  );
  lp.querySelectorAll("input[name=tod]").forEach((i) =>
    i.addEventListener("change", () => setTod(i.value)),
  );
  $("ex").addEventListener("input", (e) => {
    state.EX = +e.target.value;
    world.scale.y = state.EX;
  });
  lp.querySelectorAll(".vy").forEach(
    (b) =>
      (b.onclick = () => {
        const p = P[b.dataset.go];
        if (p) {
          show(p);
          flyTo(p, 300);
        }
      }),
  );
  window.__o = {
    ctl,
    flyTo,
    P,
    setTod,
    jump: (x, y, r, th, ph) => {
      flying = null;
      ctl.gtx = ctl.tx = x - OX;
      ctl.gtz = ctl.tz = y - OY;
      ctl.gr = ctl.r = r;
      ctl.gth = ctl.th = th;
      ctl.gph = ctl.ph = ph;
    },
  };
  return { show, flyTo, ctl, updCam, $ };
}
