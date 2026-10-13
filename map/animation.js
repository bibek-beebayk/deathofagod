// animation: initialized by main.js; dependencies are passed explicitly.
export function startAnimation({
  docks,
  forges,
  quality,
  R,
  cam,
  gTowns,
  setTod,
  updCam,
  ctl,
  sun,
  sunDir,
  cloudT,
  cloudM,
  state,
  wnt,
  glows,
  beam,
  hallLight,
  ringMats,
  shards,
  HX,
  HZ,
  HY,
  motes,
  cuOut,
  cuBack,
  pil,
  pil2,
  ships,
  S0,
  scene,
  labels,
  $,
} = {}) {
  function size() {
    const w = innerWidth,
      h = innerHeight;
    R.setSize(w, h, false);
    cam.aspect = w / h;
    cam.updateProjectionMatrix();
  }
  gTowns.traverse((o) => {
    if (o.isMesh) {
      o.castShadow = true;
      o.receiveShadow = true;
    }
  });
  addEventListener("resize", size);
  size();
  setTod("day");
  let last = performance.now(),
    tt = 0;
  // Adaptive quality: if frames stay over budget, first drop shadows, then
  // step the render resolution down. It never steps back up, so it cannot flicker.
  let slowMs = 0,
    slowN = 0,
    pixelRatio = R.getPixelRatio();
  function adapt(rawMs) {
    if (tt < 4 || document.hidden) return;
    slowMs += rawMs;
    if (++slowN < 45) return;
    const avg = slowMs / slowN;
    slowMs = slowN = 0;
    if (avg <= quality.frameBudget) return;
    if (R.shadowMap.enabled) {
      R.shadowMap.enabled = false;
      sun.castShadow = false;
      scene.traverse((o) => {
        if (o.material) {
          for (const m of [].concat(o.material)) m.needsUpdate = true;
        }
      });
    } else if (pixelRatio > 0.75) {
      pixelRatio = Math.max(0.75, pixelRatio * 0.85);
      R.setPixelRatio(pixelRatio);
      size();
    }
  }
  function frame(now) {
    const raw = now - last;
    const dt = Math.max(0, Math.min(0.05, raw / 1000));
    last = now;
    adapt(raw);
    tt += dt;
    updCam(dt);
    {
      const S = Math.max(120, Math.min(1500, ctl.r * 1.15));
      const sc = sun.shadow.camera;
      sc.left = -S;
      sc.right = S;
      sc.top = S;
      sc.bottom = -S;
      sc.near = 10;
      sc.far = 4200;
      sc.updateProjectionMatrix();
      sun.target.position.set(ctl.tx, ctl.ty, ctl.tz);
      sun.position.set(ctl.tx, ctl.ty, ctl.tz).addScaledVector(sunDir, 1800);
      sun.target.updateMatrixWorld();
      cloudT.offset.x += dt * 0.0012;
      cloudM.opacity =
        (state.todN === "night" ? 0.22 : 0.5) *
        Math.max(0, Math.min(1, (4200 - cam.position.y) / 1800)) *
        Math.max(0, Math.min(1, (cam.position.y - 300) / 200));
      cloudM.color.setHex(
        state.todN === "dusk"
          ? 0xffc9a0
          : state.todN === "night"
            ? 0x6070a0
            : 0xffffff,
      );
    }
    wnt.userData.uT.value = tt;
    forges.update(tt, state.todN, R);
    docks.update(tt);
    wnt.offset.x = tt * 0.004;
    wnt.offset.y = tt * 0.0028;
    for (const s of glows) {
      const p = s.userData;
      const f = 0.85 + 0.15 * Math.sin(tt * 2.2 + p.ph);
      const g = p.k * (state.glowK + 0.25);
      s.material.opacity = Math.min(1, g * 0.6 * f);
      s.scale.setScalar(p.size * (0.9 + 0.1 * f));
    }
    {
      const fl =
        0.72 +
        0.28 * Math.sin(tt * 1.3) * Math.sin(tt * 3.1 + 1) +
        0.12 * Math.sin(tt * 7.7);
      beam.material.opacity =
        (state.todN === "night" ? 0.42 : state.todN === "dusk" ? 0.32 : 0.2) *
        Math.max(0.25, fl);
      hallLight.intensity =
        (state.todN === "night" ? 1.4 : state.todN === "dusk" ? 0.8 : 0) *
        Math.max(0.3, fl);
    }
    {
      const nk =
        state.todN === "night" ? 1 : state.todN === "dusk" ? 0.75 : 0.45;
      ringMats.forEach(
        (m, k) =>
          (m.opacity = nk * (0.45 + 0.3 * Math.sin(tt * 1.4 - k * 0.7))),
      );
      for (const q of shards) {
        const a = tt * q.w + q.ph,
          x = HX + Math.cos(a) * q.r,
          z = HZ + Math.sin(a) * q.r,
          y = HY + q.y + Math.sin(tt * 0.9 + q.ph) * 3;
        q.m.position.set(x, y, z);
        q.m.rotation.y = tt * 0.8;
        q.sp.position.set(x, y, z);
      }
      const pa = motes.geometry.attributes.position;
      motes.userData.mv.forEach((v, i) => {
        v.h += dt * v.sp;
        if (v.h > 70) v.h = 0;
        pa.setY(i, v.y0 + v.h);
      });
      pa.needsUpdate = true;
      motes.material.opacity = 0.55 + 0.4 * nk;
    }
    const pt = (tt * 0.018) % 1,
      p1 = cuOut.getPoint(pt),
      p2 = cuBack.getPoint((tt * 0.03) % 1);
    pil.position.copy(p1);
    pil.position.y += 2.2;
    pil2.position.copy(p2);
    pil2.position.y += 2;
    for (const s of ships) {
      const u = s.userData;
      u.t += (dt * u.sp * u.dir * 18 * S0) / u.L.len;
      if (u.t > 1) {
        u.t = 1;
        u.dir = -1;
      }
      if (u.t < 0) {
        u.t = 0;
        u.dir = 1;
      }
      const a = u.L.at(u.t * u.L.len),
        b = u.L.at(Math.min(u.L.len, Math.max(0, u.t * u.L.len + u.dir * 4)));
      s.position.set(a[0], Math.sin(tt * 1.6 + u.t * 40) * 0.15, a[1]);
      s.rotation.y = -Math.atan2(b[1] - a[1], b[0] - a[0]);
      s.rotation.z = Math.sin(tt * 1.3 + u.t * 30) * 0.03;
    }
    R.render(scene, cam);
    labels();
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
  setTimeout(() => {
    const l = $("load");
    l.style.opacity = 0;
    setTimeout(() => l.remove(), 700);
  }, 600);
}
