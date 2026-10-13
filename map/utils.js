// utils: initialized by main.js; dependencies are passed explicitly.
export function createRandom({} = {}) {
  let seed = 12345;
  function rnd() {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  }
  function hash(i, j) {
    let h = (i * 374761393 + j * 668265263) >>> 0;
    h = ((h ^ (h >>> 13)) * 1274126177) >>> 0;
    return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
  }
  function vn(x, y) {
    const i = Math.floor(x),
      j = Math.floor(y),
      fx = x - i,
      fy = y - j,
      u = fx * fx * (3 - 2 * fx),
      v = fy * fy * (3 - 2 * fy);
    return (
      (hash(i, j) * (1 - u) + hash(i + 1, j) * u) * (1 - v) +
      (hash(i, j + 1) * (1 - u) + hash(i + 1, j + 1) * u) * v
    );
  }
  return { vn, hash, rnd };
}
