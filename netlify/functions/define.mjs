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

const UA = "deathofagod.com dictionary (https://deathofagod.com; contact via site)";
const strip = (h) => String(h || "").replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#0?39;/g, "'").replace(/\s+/g, " ").trim();

// Wiktionary REST: { en: [{ partOfSpeech, definitions: [{ definition: "<html>" }] }] }
function shapeWikt(data, asked, word) {
  const entries = (data && data.en) || [];
  const meanings = entries.slice(0, 3).map((m) => ({
    pos: String(m.partOfSpeech || "").slice(0, 24),
    defs: (m.definitions || []).map((d) => strip(d.definition).slice(0, 300)).filter(Boolean).slice(0, 2),
  })).filter((m) => m.defs.length);
  return meanings.length ? { found: true, word, asked, phonetic: "", meanings } : null;
}

function shapeDict(data, asked) {
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

// Returns {result}, {missing:true} (404) or {failed:reason}
async function fromWikt(c, asked, fetchFn) {
  try {
    const r = await fetchFn("https://en.wiktionary.org/api/rest_v1/page/definition/" + encodeURIComponent(c), { headers: { "user-agent": UA, accept: "application/json" }, signal: AbortSignal.timeout(2500) });
    if (r.status === 404) return { missing: true };
    if (!r.ok) return { failed: "wikt_" + r.status };
    const res = shapeWikt(await r.json(), asked, c);
    return res ? { result: res } : { missing: true };
  } catch (e) { return { failed: "wikt_" + (e && e.name || "error") }; }
}
async function fromDictApi(c, asked, fetchFn) {
  try {
    const r = await fetchFn("https://api.dictionaryapi.dev/api/v2/entries/en/" + encodeURIComponent(c), { signal: AbortSignal.timeout(2500) });
    if (r.status === 404) return { missing: true };
    if (!r.ok) return { failed: "dict_" + r.status };
    const res = shapeDict(await r.json(), asked);
    return res ? { result: res } : { missing: true };
  } catch (e) { return { failed: "dict_" + (e && e.name || "error") }; }
}

export async function define(req, store, fetchFn = fetch) {
  const w = (new URL(req.url).searchParams.get("w") || "").trim().toLowerCase().replace(/\u2019/g, "'");
  if (!WORD.test(w)) return J({ found: false, error: "bad_word" }, 400);
  const key = "w/" + w;
  try {
    const hit = await Promise.race([store.get(key, { type: "json" }), new Promise((_, rej) => setTimeout(() => rej(new Error("t")), 1500))]);
    if (hit) return J(hit);
  } catch {}
  const deadline = Date.now() + 7000;
  let result = null, failures = [], anySuccess = false;
  for (const c of candidates(w)) {
    if (Date.now() > deadline) break;
    let r = await fromWikt(c, w, fetchFn);
    if (r.failed) { failures.push(r.failed); if (Date.now() < deadline) r = await fromDictApi(c, w, fetchFn); if (r.failed) failures.push(r.failed); }
    if (r.result) { result = r.result; break; }
    if (r.missing) anySuccess = true;
    if (r.failed && !anySuccess) break; // both sources down: stop early
  }
  if (!result && !anySuccess) return J({ found: false, error: "unavailable", why: failures.join(",") }, 502);
  const out = result || { found: false, asked: w };
  try { await Promise.race([store.setJSON(key, out), new Promise((_, rej) => setTimeout(() => rej(new Error("t")), 1500))]); } catch {}
  return J(out);
}

export default async (req) => define(req, getStore("dictionary"));
export const config = { path: "/api/define" };
