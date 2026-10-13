// quality: chooses a rendering tier once at start-up.
// Phones and low-memory devices get the "lite" tier; everything else gets "high".
// Force a tier for testing with /map.html?q=lite or /map.html?q=high.
export function getQuality() {
  const forced = new URLSearchParams(location.search).get("q");
  const touch = matchMedia("(pointer: coarse)").matches;
  const small = Math.min(screen.width, screen.height) < 700;
  const memory = navigator.deviceMemory || 4;
  const lite =
    forced === "lite" || (forced !== "high" && (touch || small || memory <= 2));
  const dpr = devicePixelRatio || 1;
  return {
    lite,
    // Terrain grid upsampling: 2 = 484k vertices, 1 = 121k vertices.
    up: lite ? 1 : 2,
    shadows: !lite,
    antialias: !lite || dpr < 1.5,
    maxPixelRatio: lite ? 1.25 : 2,
    // Fraction of trees kept; the seeded random stream is still consumed in full.
    treeKeep: lite ? 0.45 : 1,
    detailBump: !lite,
    // Frame-time budget (ms) before the renderer lowers its resolution.
    frameBudget: lite ? 24 : 34,
  };
}
