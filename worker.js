import { DurableObject } from "cloudflare:workers";

const ANALYTICS_KEY_HASH = "82d4888576b619cad81a1dd92ebde4726e57b7d463b0bb03705be51c42e27db1";

async function sha256Hex(value) {
  const data = new TextEncoder().encode(String(value || ""));
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest), b => b.toString(16).padStart(2, "0")).join("");
}

async function analyticsAuthorized(url) {
  const key = String(url.searchParams.get("key") || "");
  if (!key || key.length > 200) return false;
  return (await sha256Hex(key)) === ANALYTICS_KEY_HASH;
}

export class Leaderboard extends DurableObject {
  cleanName(value) {
    return String(value || "").replace(/[<>]/g, "").replace(/\s+/g, " ").trim().slice(0, 16);
  }

  playerKey(value) {
    return this.cleanName(value)
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLocaleLowerCase();
  }

  normalizeScore(value) {
    const n = Math.floor(Number(value) || 0);
    return Math.max(0, Math.min(1000000, n));
  }

  normalizeDistance(value) {
    const n = Math.floor(Number(value) || 0);
    return Math.max(0, Math.min(1000000, n));
  }

  normalizeDonuts(value) {
    const n = Math.floor(Number(value) || 0);
    return Math.max(0, Math.min(100000, n));
  }

  normalizeBlues(value) {
    const n = Math.floor(Number(value) || 0);
    return Math.max(0, Math.min(10000, n));
  }

  cleanText(value, max = 120) {
    return String(value || "")
      .replace(/[\u0000-\u001f\u007f]/g, " ")
      .replace(/[<>]/g, "")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, max);
  }

  cleanAnalyticsId(value, prefix) {
    const s = String(value || "").replace(/[^A-Za-z0-9_-]/g, "").slice(0, 80);
    return s.length >= 8 ? s : `${prefix}_${crypto.randomUUID().replace(/-/g, "")}`;
  }

  sortBoard(board) {
    return Object.values(board || {})
      .map((r) => ({
        name: this.cleanName(r && r.name),
        score: this.normalizeScore(r && r.score),
        distance: this.normalizeDistance(r && r.distance),
        donuts: this.normalizeDonuts(r && r.donuts),
        blues: this.normalizeBlues(r && r.blues),
        when: Number(r && r.when) || 0,
      }))
      .filter((r) => r.name && r.score > 0)
      .sort((a, b) => b.score - a.score || b.distance - a.distance || b.donuts - a.donuts || b.blues - a.blues || a.when - b.when)
      .slice(0, 200);
  }

  async cleanupLegacyTestScore(board) {
    const markerKey = "ranking_cleanup_zanettibonitao_22k_v1";
    if (await this.ctx.storage.get(markerKey)) return board;

    let changed = false;
    for (const [key, row] of Object.entries(board || {})) {
      if (this.playerKey(row && row.name) !== "zanettibonitao") continue;
      const score = this.normalizeScore(row && row.score);
      if (score < 20000 || score > 25000) continue;
      board[key] = {
        ...(row || {}),
        name: this.cleanName(row && row.name),
        score: 0,
        distance: 0,
        donuts: 0,
        blues: 0,
        when: Date.now(),
      };
      changed = true;
    }

    if (changed) await this.ctx.storage.put("board_v2", board);
    await this.ctx.storage.put(markerKey, { done: true, at: Date.now(), changed });
    return board;
  }

  async getRows() {
    let board = (await this.ctx.storage.get("board_v2")) || {};
    board = await this.cleanupLegacyTestScore(board);
    return this.sortBoard(board).slice(0, 20);
  }

  async submit(payload) {
    let board = (await this.ctx.storage.get("board_v2")) || {};
    board = await this.cleanupLegacyTestScore(board);
    const fromLocalMigration = Array.isArray(payload && payload.scores);
    const incoming = fromLocalMigration
      ? payload.scores
      : [payload || {}];

    let changed = false;
    for (const raw of incoming.slice(0, 200)) {
      const name = this.cleanName(raw && (raw.player ?? raw.name));
      const score = this.normalizeScore(raw && raw.score);
      const distance = this.normalizeDistance(raw && raw.distance);
      const donuts = this.normalizeDonuts(raw && raw.donuts);
      const blues = this.normalizeBlues(raw && raw.blues);
      if (!name) continue;

      // Ignore only the stale test result being re-migrated from this browser.
      // The player name remains fully usable for new, real runs.
      if (fromLocalMigration && this.playerKey(name) === "zanettibonitao" && score >= 20000 && score <= 25000) {
        continue;
      }

      const key = name.toLocaleLowerCase();
      const prev = board[key];
      if (!prev || score > Number(prev.score || 0)) {
        board[key] = { name, score, distance, donuts, blues, when: Date.now() };
        changed = true;
      }
    }

    if (changed) {
      const trimmed = {};
      for (const row of this.sortBoard(board).slice(0, 200)) {
        trimmed[row.name.toLocaleLowerCase()] = row;
      }
      await this.ctx.storage.put("board_v2", trimmed);
      return this.sortBoard(trimmed).slice(0, 20);
    }

    return this.sortBoard(board).slice(0, 20);
  }

  async recordAccess(raw) {
    raw = raw || {};
    const now = Date.now();
    const visitorId = this.cleanAnalyticsId(raw.visitorId, "v");
    const sessionId = this.cleanAnalyticsId(raw.sessionId, "s");
    const event = raw.event === "game_start" ? "game_start" : "visit";

    const info = {
      deviceType: this.cleanText(raw.deviceType, 30) || "Desconhecido",
      model: this.cleanText(raw.model, 80),
      os: this.cleanText(raw.os, 50),
      platform: this.cleanText(raw.platform, 80),
      browser: this.cleanText(raw.browser, 40),
      screen: this.cleanText(raw.screen, 30),
      viewport: this.cleanText(raw.viewport, 30),
      dpr: Math.max(0, Math.min(10, Number(raw.dpr) || 1)),
      language: this.cleanText(raw.language, 20),
      timezone: this.cleanText(raw.timezone, 60),
      referrer: this.cleanText(raw.referrer, 120) || "direto",
      path: this.cleanText(raw.path, 120) || "/",
      city: this.cleanText(raw.city, 80),
      region: this.cleanText(raw.region, 80),
      country: this.cleanText(raw.country, 8),
      userAgent: this.cleanText(raw.userAgent, 220),
    };

    let visitors = (await this.ctx.storage.get("analytics_visitors_v1")) || {};
    let v = visitors[visitorId];
    if (!v) {
      v = {
        visitorId,
        firstSeen: now,
        lastSeen: now,
        visits: 0,
        starts: 0,
      };
    }
    if (event === "visit") v.visits = Math.max(0, Number(v.visits) || 0) + 1;
    if (event === "game_start") v.starts = Math.max(0, Number(v.starts) || 0) + 1;
    v.lastSeen = now;
    Object.assign(v, info);
    visitors[visitorId] = v;

    const visitorEntries = Object.values(visitors);
    if (visitorEntries.length > 3000) {
      visitorEntries.sort((a, b) => (Number(b.lastSeen) || 0) - (Number(a.lastSeen) || 0));
      visitors = {};
      for (const item of visitorEntries.slice(0, 3000)) visitors[item.visitorId] = item;
    }

    let events = (await this.ctx.storage.get("analytics_events_v1")) || [];
    events.push({ visitorId, sessionId, event, at: now, ...info });
    if (events.length > 5000) events = events.slice(events.length - 5000);

    await this.ctx.storage.put({
      analytics_visitors_v1: visitors,
      analytics_events_v1: events,
    });
    return { ok: true };
  }

  async getAccessReport(limit = 100, days = 30) {
    limit = Math.max(1, Math.min(500, Math.floor(Number(limit) || 100)));
    days = Math.max(1, Math.min(3650, Math.floor(Number(days) || 30)));
    const now = Date.now();
    const since = now - days * 86400000;
    const events = ((await this.ctx.storage.get("analytics_events_v1")) || [])
      .filter(e => Number(e && e.at) >= since);
    const visitors = Object.values((await this.ctx.storage.get("analytics_visitors_v1")) || {})
      .filter(v => Number(v && v.lastSeen) >= since)
      .sort((a, b) => (Number(b.lastSeen) || 0) - (Number(a.lastSeen) || 0));

    const pageViews = events.filter(e => e.event === "visit");
    const gameStarts = events.filter(e => e.event === "game_start");
    const unique = new Set(pageViews.map(e => e.visitorId));

    const tag = id => `V-${String(id || "").slice(-8).toUpperCase()}`;
    const countBy = (rows, fn) => {
      const map = {};
      for (const row of rows) {
        const key = this.cleanText(fn(row), 140) || "Desconhecido";
        map[key] = (map[key] || 0) + 1;
      }
      return Object.entries(map)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
        .slice(0, 30);
    };

    return {
      generatedAt: now,
      sinceDays: days,
      storageNote: "Até 5000 eventos recentes e 3000 visitantes únicos. IP bruto não é armazenado.",
      summary: {
        pageViews: pageViews.length,
        uniqueVisitors: unique.size,
        gameStarts: gameStarts.length,
      },
      byDevice: countBy(pageViews, r => r.deviceType),
      byOS: countBy(pageViews, r => r.os || r.platform),
      byBrowser: countBy(pageViews, r => r.browser),
      byLocation: countBy(pageViews, r => [r.city, r.region, r.country].filter(Boolean).join(", ")),
      byReferrer: countBy(pageViews, r => r.referrer || "direto"),
      visitors: visitors.slice(0, Math.min(limit, 200)).map(v => ({
        visitor: tag(v.visitorId),
        firstSeen: Number(v.firstSeen) || 0,
        lastSeen: Number(v.lastSeen) || 0,
        visits: Number(v.visits) || 0,
        gameStarts: Number(v.starts) || 0,
        deviceType: v.deviceType || "",
        model: v.model || "",
        os: v.os || "",
        platform: v.platform || "",
        browser: v.browser || "",
        screen: v.screen || "",
        city: v.city || "",
        region: v.region || "",
        country: v.country || "",
        referrer: v.referrer || "",
      })),
      recent: events.slice(-limit).reverse().map(e => ({
        visitor: tag(e.visitorId),
        event: e.event,
        at: Number(e.at) || 0,
        deviceType: e.deviceType || "",
        model: e.model || "",
        os: e.os || "",
        platform: e.platform || "",
        browser: e.browser || "",
        screen: e.screen || "",
        city: e.city || "",
        region: e.region || "",
        country: e.country || "",
        referrer: e.referrer || "",
      })),
    };
  }
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store, no-cache, must-revalidate",
    },
  });
}

function analyticsStub(env) {
  if (!env.LEADERBOARD) return null;
  return env.LEADERBOARD.getByName
    ? env.LEADERBOARD.getByName("bruno-guloso-global")
    : env.LEADERBOARD.get(env.LEADERBOARD.idFromName("bruno-guloso-global"));
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/api/ranking") {
      const stub = analyticsStub(env);
      if (!stub) return json({ error: "ranking_unavailable" }, 503);

      if (request.method === "GET") {
        return json({ rows: await stub.getRows() });
      }

      if (request.method === "POST") {
        let body;
        try { body = await request.json(); }
        catch { return json({ error: "invalid_json" }, 400); }
        return json({ rows: await stub.submit(body) });
      }

      return json({ error: "method_not_allowed" }, 405);
    }

    if (url.pathname === "/api/analytics/visit") {
      if (request.method !== "POST") return json({ error: "method_not_allowed" }, 405);
      const stub = analyticsStub(env);
      if (!stub) return json({ error: "analytics_unavailable" }, 503);
      let body;
      try { body = await request.json(); }
      catch { return json({ error: "invalid_json" }, 400); }
      const cf = request.cf || {};
      body = {
        ...(body || {}),
        city: cf.city || "",
        region: cf.region || cf.regionCode || "",
        country: cf.country || "",
        userAgent: request.headers.get("user-agent") || body.userAgent || "",
      };
      await stub.recordAccess(body);
      return json({ ok: true });
    }

    if (url.pathname === "/api/analytics") {
      if (request.method !== "GET") return json({ error: "method_not_allowed" }, 405);
      if (!(await analyticsAuthorized(url))) return json({ error: "unauthorized" }, 401);
      const stub = analyticsStub(env);
      if (!stub) return json({ error: "analytics_unavailable" }, 503);
      const limit = Math.max(1, Math.min(500, Number(url.searchParams.get("limit")) || 100));
      const days = Math.max(1, Math.min(3650, Number(url.searchParams.get("days")) || 30));
      return json(await stub.getAccessReport(limit, days));
    }

    const response = await env.ASSETS.fetch(request);

    if ((url.pathname === "/" || url.pathname === "/index.html") &&
        (response.headers.get("content-type") || "").includes("text/html")) {
      return new HTMLRewriter()
        .on("body", {
          element(el) {
            el.append(
              '<script src="/audio-cleanup.js?v=1"></script>' +
              '<script src="/audio.js?v=5"></script>' +
              '<script src="/audio-anyclick.js?v=1"></script>' +
              '<script src="/no-timeout.js?v=1"></script>' +
              '<script src="/ranking-pro.js?v=3"></script>' +
              '<script src="/landing-pro.js?v=4"></script>' +
              '<script src="/global-ranking.js?v=4"></script>' +
              '<script src="/mobile-responsive.js?v=4"></script>' +
              '<script src="/mobile-controls.js?v=4"></script>' +
              '<script src="/finish-pro.js?v=1"></script>' +
              '<script src="/orientation-game-only.js?v=2"></script>' +
              '<script src="/mobile-static-fit.js?v=1"></script>' +
              '<script src="/mobile-side-viewport.js?v=5"></script>' +
              '<script src="/mobile-arrow-tune.js?v=1"></script>' +
              '<script src="/mobile-full-touch.js?v=4"></script>' +
              '<script src="/mobile-invisible-arrows.js?v=5"></script>' +
              '<script src="/mushroom-tip-mark.js?v=8"></script>' +
              '<script src="/donut-score-powerup.js?v=3"></script>' +
              '<script src="/donut-touch-fix.js?v=2"></script>' +
              '<script src="/blue-brick-score-v4.js?v=2"></script>' +
              '<script src="/composite-score-ui.js?v=2"></script>' +
              '<script src="/speed-v1-lock.js?v=4"></script>' +
              '<script src="/access-analytics.js?v=1"></script>' +
              '<script src="/test-flight.js?v=3"></script>',
              { html: true },
            );
          },
        })
        .transform(response);
    }

    return response;
  },
};