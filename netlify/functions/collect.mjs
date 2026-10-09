import { getStore } from "@netlify/blobs";
import { dayKey, sha } from "../lib/analytics.mjs";

const BOT = /bot|crawl|spider|slurp|facebookexternalhit|preview|headless|lighthouse|pingdom|uptime|monitor|curl|wget|python|axios|node-fetch|go-http|java\/|httpclient/i;
const TYPES = new Set(["pv", "share", "char", "scroll", "about"]);
const PATH = /^\/[A-Za-z0-9\-_./]{0,79}$/;
const TOKEN = /^[a-z0-9_:.\-]{1,40}$/;
const HOST = /^[a-z0-9.\-]{1,60}$/;

export async function collect(req, ctx, store, now = Date.now()) {
  if (req.method !== "POST") return new Response(null, { status: 405 });
  const ua = req.headers.get("user-agent") || "";
  if (!ua || BOT.test(ua)) return new Response(null, { status: 204 });
  // Same-origin only: the beacon always sends Origin; reject other sites.
  const origin = req.headers.get("origin");
  const host = new URL(req.url).host;
  if (origin) { try { if (new URL(origin).host !== host) return new Response(null, { status: 204 }); } catch { return new Response(null, { status: 204 }); } }
  let body;
  try { const txt = await req.text(); if (txt.length > 600) return new Response(null, { status: 413 }); body = JSON.parse(txt); } catch { return new Response(null, { status: 400 }); }
  if (!body || !TYPES.has(body.t)) return new Response(null, { status: 400 });
  let p = String(body.p || "/").replace(/\/index\.html$/, "/");
  if (!PATH.test(p)) return new Response(null, { status: 400 });
  const rec = { ts: now, t: body.t, p };
  if (body.v != null) { const v = String(body.v).toLowerCase(); if (!TOKEN.test(v)) return new Response(null, { status: 400 }); rec.v = v; }
  if (body.t === "pv") {
    const r = String(body.r || "").toLowerCase();
    if (r && HOST.test(r.replace(/^utm:/, "")) && r !== host) rec.r = r;
    const ip = ctx?.ip || req.headers.get("x-nf-client-connection-ip") || "";
    const day = dayKey(now);
    // Daily-rotating hash: counts unique visitors per day, cannot track anyone across days, no IP stored.
    rec.h = sha(`${process.env.ANALYTICS_SALT || "oathlands"}|${day}|${ip}|${ua}`).slice(0, 12);
    rec.c = (ctx?.geo?.country?.code || "").toUpperCase().slice(0, 2) || undefined;
    rec.d = /mobi|android|iphone|ipad/i.test(ua) ? "mobile" : "desktop";
  }
  const key = `e/${dayKey(now)}/${now}-${Math.random().toString(36).slice(2, 6)}`;
  await store.setJSON(key, rec);
  return new Response(null, { status: 204 });
}

export default async (req, ctx) => collect(req, ctx, getStore("analytics"));
export const config = { path: "/api/collect" };
