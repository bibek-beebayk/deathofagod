// First-party dictionary lookup: /api/define?w=word
// Proxies the free dictionaryapi.dev service and caches results in Netlify Blobs.
import { getStore } from "@netlify/blobs";

const WORD = /^[A-Za-z][A-Za-z'’-]{1,31}$/;
const J = (o, s = 200, extra = {}) =>
  new Response(JSON.stringify(o), {
    status: s,
    headers: { "content-type": "application/json", "cache-control": s === 200 ? "public, max-age=86400" : "no-store", ...extra },
  });

// Try the word, then plausible base forms (walked -> walk, lanterns -> lantern).
export function candidates(w) {
  const out = [w];
  const add = (x) => { if (x.length > 2 && !out.includes(x)) out.push(x); };
  if (w.endsWith("'s")) add(w.slice(0, -2));
  if (w.endsWith("ies")) add(w.slice(0, -3) + "y");
  if (w.endsWith("es")) add(w.slice(0, -2));
  if (w.endsWith("s")) add(w.slice(0, -1));
  if (w.endsWith("ied")) add(w.slice(0, -3) + "y");
  if (w.endsWith("ed")) { add(w.slice(0, -2)); add(w.slice(0, -1)); if (/(.)\1ed$/.test(w)) add(w.slice(0, -3)); }
  if (w.endsWith("ing")) { add(w.slice(0, -3)); add(w.slice(0, -3) + "e"); if (/(.)\1ing$/.test(w)) add(w.slice(0, -4)); }
  if (w.endsWith("ly")) add(w.slice(0, -2));
  if (w.endsWith("er")) add(w.slice(0, -2));
  return out.slice(0, 5);
}

function shape(data, asked) {
  const e = Array.isArray(data) ? data[0] : null;
  if (!e) return null;
  const meanings = (e.meanings || []).slice(0, 3).map((m) => ({
    pos: String(m.partOfSpeech || "").slice(0, 24),
    defs: (m.definitions || []).slice(0, 2).map((d) => String(d.definition || "").slice(0, 300)),
  })).filter((m) => m.defs.length);
  if (!meanings.length) return null;
  const ph = e.phonetic || ((e.phonetics || []).find((p) => p.text) || {}).text || "";
  return { found: true, word: String(e.word || asked).slice(0, 40), asked, phonetic: String(ph).slice(0, 40), meanings };
}

export async function define(req, store, fetchFn = fetch) {
  const w = (new URL(req.url).searchParams.get("w") || "").trim().toLowerCase().replace(/’/g, "'");
  if (!WORD.test(w)) return J({ found: false, error: "bad_word" }, 400);
  const key = "w/" + w;
  try { const hit = await store.get(key, { type: "json" }); if (hit) return J(hit); } catch {}
  let result = null, upstreamFailed = false;
  for (const c of candidates(w)) {
    try {
      const r = await fetchFn("https://api.dictionaryapi.dev/api/v2/entries/en/" + encodeURIComponent(c), { signal: AbortSignal.timeout(4000) });
      if (r.status === 404) continue;
      if (!r.ok) { upstreamFailed = true; break; }
      result = shape(await r.json(), w);
      if (result) break;
    } catch { upstreamFailed = true; break; }
  }
  if (upstreamFailed && !result) return J({ found: false, error: "unavailable" }, 502);
  const out = result || { found: false, asked: w };
  try { await store.setJSON(key, out); } catch {}
  return J(out);
}

export default async (req) => define(req, getStore("dictionary"));
export const config = { path: "/api/define" };
