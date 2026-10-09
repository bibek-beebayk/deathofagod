// Shared helpers for the cookie-free, first-party analytics.
import { createHash, timingSafeEqual } from "node:crypto";

// Days are bucketed in Nepal time (UTC+5:45) so "today" matches the owner's day.
export const OFFSET_MIN = 345;
export const dayKey = (ms = Date.now()) => new Date(ms + OFFSET_MIN * 60000).toISOString().slice(0, 10);
export const hourOf = (ms) => new Date(ms + OFFSET_MIN * 60000).getUTCHours();
export const sha = (s) => createHash("sha256").update(s).digest("hex");

export function safeEqual(a, b) {
  const x = Buffer.from(sha(String(a)), "hex");
  const y = Buffer.from(sha(String(b)), "hex");
  return timingSafeEqual(x, y);
}

export const bump = (o, k, n = 1) => { if (k != null && k !== "") o[k] = (o[k] || 0) + n; };

// Build the daily aggregate from raw events.
export function aggregate(events) {
  const a = { views: 0, visitors: 0, pages: {}, refs: {}, countries: {}, devices: {}, hours: Array(24).fill(0),
              shares: {}, chars: {}, depth: {}, about: 0 };
  const seen = new Set();
  for (const e of events) {
    if (!e || typeof e !== "object") continue;
    if (e.t === "pv") {
      a.views++; seen.add(e.h);
      bump(a.pages, e.p); bump(a.refs, e.r || "(direct)"); bump(a.countries, e.c || "??"); bump(a.devices, e.d || "desktop");
      a.hours[hourOf(e.ts)]++;
    } else if (e.t === "share") bump(a.shares, e.v || "other");
    else if (e.t === "char") bump(a.chars, e.v);
    else if (e.t === "scroll") { a.depth[e.p] = a.depth[e.p] || {}; bump(a.depth[e.p], e.v); }
    else if (e.t === "about") a.about++;
  }
  a.visitors = seen.size;
  return a;
}
