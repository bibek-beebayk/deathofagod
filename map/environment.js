// environment: initialized by main.js; dependencies are passed explicitly.
export function createEnvironment({ T, scene, hash } = {}) {
  // deep floor
  const floor = new T.Mesh(
    new T.PlaneGeometry(40000, 30000),
    new T.MeshBasicMaterial({ color: 0x2a5870 }),
  );
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -11;
  scene.add(floor);
  // water with scrolling normal map
  function waterTex() {
    const S = 256,
      c = document.createElement("canvas");
    c.width = c.height = S;
    const g = c.getContext("2d"),
      im = g.createImageData(S, S),
      hh = new Float32Array(S * S);
    for (let y = 0; y < S; y++)
      for (let x = 0; x < S; x++) {
        let v = 0;
        for (let o = 0; o < 4; o++) {
          const f = 1 << (o + 2),
            a = (x / S) * f,
            b = (y / S) * f,
            i0 = Math.floor(a),
            j0 = Math.floor(b),
            u = a - i0,
            w = b - j0,
            s = (i, j) => hash((((i % f) + f) % f) + o * 97, ((j % f) + f) % f);
          v +=
            ((s(i0, j0) * (1 - u) + s(i0 + 1, j0) * u) * (1 - w) +
              (s(i0, j0 + 1) * (1 - u) + s(i0 + 1, j0 + 1) * u) * w) /
            (1 << o);
        }
        hh[y * S + x] = v;
      }
    for (let y = 0; y < S; y++)
      for (let x = 0; x < S; x++) {
        const dx = hh[y * S + ((x + 1) % S)] - hh[y * S + ((x + S - 1) % S)],
          dy = hh[((y + 1) % S) * S + x] - hh[((y + S - 1) % S) * S + x];
        const k = (y * S + x) * 4;
        im.data[k] = 128 + dx * 220;
        im.data[k + 1] = 128 + dy * 220;
        im.data[k + 2] = 255;
        im.data[k + 3] = 255;
      }
    g.putImageData(im, 0, 0);
    const t = new T.CanvasTexture(c);
    t.wrapS = t.wrapT = T.RepeatWrapping;
    t.repeat.set(200, 145);
    return t;
  }
  const wnt = waterTex();
  const wmat = new T.MeshPhongMaterial({
    color: 0x2d7d98,
    transparent: true,
    opacity: 0.74,
    shininess: 140,
    specular: 0xfff0d0,
    normalMap: wnt,
    normalScale: new T.Vector2(0.55, 0.55),
    depthWrite: false,
  });
  const water = new T.Mesh(new T.PlaneGeometry(40000, 30000), wmat);
  water.rotation.x = -Math.PI / 2;
  scene.add(water);
  // clouds
  function cloudTex() {
    const S = 256,
      c = document.createElement("canvas");
    c.width = c.height = S;
    const g = c.getContext("2d"),
      im = g.createImageData(S, S);
    for (let y = 0; y < S; y++)
      for (let x = 0; x < S; x++) {
        let v = 0;
        for (let o = 0; o < 5; o++) {
          const f = 1 << (o + 1),
            a = (x / S) * f,
            b = (y / S) * f,
            i0 = Math.floor(a),
            j0 = Math.floor(b),
            u = a - i0,
            w = b - j0,
            s = (i, j) =>
              hash((((i % f) + f) % f) + o * 53 + 500, ((j % f) + f) % f);
          const uu = u * u * (3 - 2 * u),
            ww = w * w * (3 - 2 * w);
          v +=
            ((s(i0, j0) * (1 - uu) + s(i0 + 1, j0) * uu) * (1 - ww) +
              (s(i0, j0 + 1) * (1 - uu) + s(i0 + 1, j0 + 1) * uu) * ww) /
            (1 << o);
        }
        const a = Math.max(0, Math.min(1, (v - 0.95) * 2.2));
        const k = (y * S + x) * 4;
        im.data[k] = im.data[k + 1] = im.data[k + 2] = 255;
        im.data[k + 3] = a * 255;
      }
    g.putImageData(im, 0, 0);
    const t = new T.CanvasTexture(c);
    t.wrapS = t.wrapT = T.RepeatWrapping;
    t.repeat.set(3, 2);
    return t;
  }
  const cloudT = cloudTex(),
    cloudM = new T.MeshBasicMaterial({
      map: cloudT,
      transparent: true,
      opacity: 0.5,
      depthWrite: false,
      fog: false,
    });
  const clouds = new T.Mesh(new T.PlaneGeometry(26000, 17000), cloudM);
  clouds.rotation.x = -Math.PI / 2;
  clouds.position.y = 760;
  clouds.renderOrder = 3;
  scene.add(clouds);
  return { wmat, floor, cloudT, cloudM, wnt };
}
