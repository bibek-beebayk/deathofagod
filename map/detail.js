// detail: small tileable noise textures that add fine ground texture and relief.
// Uses its own hash so the scene's seeded random stream is never consumed.
export function createDetailTextures({ T } = {}) {
  const S = 256;
  const h2 = (x, y, o) => {
    let n = (x * 374761393 + y * 668265263 + o * 2147483647) | 0;
    n = (n ^ (n >>> 13)) * 1274126177;
    return ((n ^ (n >>> 16)) >>> 0) / 4294967295;
  };
  const field = new Float32Array(S * S);
  for (let y = 0; y < S; y++)
    for (let x = 0; x < S; x++) {
      let v = 0,
        amp = 0.5,
        norm = 0;
      for (let o = 0; o < 5; o++) {
        const f = 4 << o,
          a = (x / S) * f,
          b = (y / S) * f,
          i0 = Math.floor(a),
          j0 = Math.floor(b),
          u = a - i0,
          w = b - j0,
          uu = u * u * (3 - 2 * u),
          ww = w * w * (3 - 2 * w),
          s = (i, j) => h2(((i % f) + f) % f, ((j % f) + f) % f, o);
        v +=
          amp *
          ((s(i0, j0) * (1 - uu) + s(i0 + 1, j0) * uu) * (1 - ww) +
            (s(i0, j0 + 1) * (1 - uu) + s(i0 + 1, j0 + 1) * uu) * ww);
        norm += amp;
        amp *= 0.55;
      }
      field[y * S + x] = v / norm;
    }
  const make = (fn) => {
    const c = document.createElement("canvas");
    c.width = c.height = S;
    const g = c.getContext("2d"),
      im = g.createImageData(S, S);
    for (let i = 0; i < S * S; i++) {
      const v = Math.max(0, Math.min(255, fn(field[i]) | 0));
      im.data[i * 4] = im.data[i * 4 + 1] = im.data[i * 4 + 2] = v;
      im.data[i * 4 + 3] = 255;
    }
    g.putImageData(im, 0, 0);
    const t = new T.CanvasTexture(c);
    t.wrapS = t.wrapT = T.RepeatWrapping;
    t.anisotropy = 4;
    return t;
  };
  // Albedo multiplier, centred near 0.9 so the ground colours stay as painted.
  const albedo = make((v) => 255 * (0.74 + 0.4 * v));
  // Height for the bump map.
  const bump = make((v) => 255 * v);
  return { albedo, bump };
}
