"use strict";
const V = "ams-app-v1";
const CORE = ["./app.html"];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(V)
      .then((c) => Promise.allSettled(CORE.map((u) => c.add(new Request(u, { cache: "reload" })))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== V).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("message", (e) => {
  if (e.data === "skip") self.skipWaiting();
  if (e.data === "ping" && e.source) e.source.postMessage({ type: "pong", v: V });
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  const isDoc = req.mode === "navigate" || (req.headers.get("accept") || "").includes("text/html");

  if (isDoc) {
    e.respondWith(
      fetch(req).then((res) => {
        if (res && res.ok) {
          const copy = res.clone();
          caches.open(V).then((c) => c.put(req, copy)).catch(() => {});
        }
        return res;
      }).catch(() =>
        caches.match(req).then((hit) => hit || caches.match("./app.html").then((f) => f || new Response(
          "<!DOCTYPE html><meta charset='utf-8'><title>Офлайн</title><body style=\"background:#08070d;color:#f3effa;font-family:system-ui;padding:32px\"><h1>Нет сети</h1><p>Откройте приложение один раз онлайн.</p><p><a style='color:#8b5cf6' href='./app.html'>Приложение</a></p></body>",
          { headers: { "Content-Type": "text/html; charset=utf-8" } }
        )))
      )
    );
    return;
  }

  e.respondWith(
    caches.match(req).then((hit) => {
      if (hit) {
        fetch(req).then((res) => {
          if (res && res.ok) caches.open(V).then((c) => c.put(req, res.clone())).catch(() => {});
        }).catch(() => {});
        return hit;
      }
      return fetch(req).then((res) => {
        if (res && res.ok) {
          const copy = res.clone();
          caches.open(V).then((c) => c.put(req, copy)).catch(() => {});
        }
        return res;
      }).catch(() => new Response("", { status: 504, statusText: "offline" }));
    })
  );
});
