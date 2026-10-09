import { getStore } from "@netlify/blobs";
import { aggregate, bump, dayKey, safeEqual } from "../lib/analytics.mjs";

const json = (o, status = 200) => new Response(JSON.stringify(o), { status, headers: { "content-type": "application/json", "cache-control": "no-store", "x-robots-tag": "noindex" } });

async function dayAgg(store, day, today) {
  if (day !== today) { const cached = await store.get(`a/${day}`, { type: "json" }); if (cached) return cached; }
  const { blobs } = await store.list({ prefix: `e/${day}/` });
  const events = [];
  for (let i = 0; i < blobs.length; i += 25)
    events.push(...(await Promise.all(blobs.slice(i, i + 25).map((b) => store.get(b.key, { type: "json" })))));
  const a = aggregate(events);
  if (day !== today) await store.setJSON(`a/${day}`, a);
  return a;
}

export async function stats(req, store, token = process.env.ADMIN_TOKEN, now = Date.now()) {
  if (!token) return json({ error: "not_configured" }, 503);
  const m = /^Bearer (.+)$/.exec(req.headers.get("authorization") || "");
  if (!m || !safeEqual(m[1], token)) { await new Promise((r) => setTimeout(r, 400)); return json({ error: "unauthorized" }, 401); }
  const days = Math.min(90, Math.max(1, parseInt(new URL(req.url).searchParams.get("days")) || 30));
  const today = dayKey(now);
  const list = Array.from({ length: days }, (_, i) => dayKey(now - (days - 1 - i) * 86400000));
  const aggs = [];
  for (let i = 0; i < list.length; i += 6) aggs.push(...(await Promise.all(list.slice(i, i + 6).map((d) => dayAgg(store, d, today)))));
  const out = { generatedAt: now, today, days, series: [], pages: {}, refs: {}, countries: {}, devices: {}, hours: Array(24).fill(0), shares: {}, chars: {}, depth: {}, about: 0, views: 0, visitors: 0 };
  aggs.forEach((a, i) => {
    out.series.push({ day: list[i], views: a.views, visitors: a.visitors });
    out.views += a.views; out.visitors += a.visitors; out.about += a.about || 0;
    for (const k of ["pages", "refs", "countries", "devices", "shares", "chars"]) for (const [x, n] of Object.entries(a[k] || {})) bump(out[k], x, n);
    (a.hours || []).forEach((n, h) => { out.hours[h] += n; });
    for (const [p, d] of Object.entries(a.depth || {})) { out.depth[p] = out.depth[p] || {}; for (const [x, n] of Object.entries(d)) bump(out.depth[p], x, n); }
  });
  return json(out);
}

export default async (req) => stats(req, getStore("analytics"));
export const config = { path: "/api/stats" };
