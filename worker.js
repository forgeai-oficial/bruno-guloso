import { DurableObject } from "cloudflare:workers";

export class Leaderboard extends DurableObject {
  cleanName(value) {
    return String(value || "").replace(/[<>]/g, "").replace(/\s+/g, " ").trim().slice(0, 16);
  }

  normalizeScore(value) {
    const n = Math.floor(Number(value) || 0);
    return Math.max(0, Math.min(10000000, n));
  }

  normalizeDistance(value) {
    const n = Math.floor(Number(value) || 0);
    return Math.max(0, Math.min(1000000, n));
  }

  normalizeDonuts(value) {
    const n = Math.floor(Number(value) || 0);
    return Math.max(0, Math.min(100000, n));
  }

  sortBoard(board) {
    return Object.values(board || {})
      .map((r) => ({
        name: this.cleanName(r && r.name),
        score: this.normalizeScore(r && r.score),
        distance: this.normalizeDistance(r && r.distance),
        donuts: this.normalizeDonuts(r && r.donuts),
        when: Number(r && r.when) || 0,
      }))
      .filter((r) => r.name)
      .sort((a, b) => b.score - a.score || b.distance - a.distance || b.donuts - a.donuts || a.when - b.when)
      .slice(0, 200);
  }

  async getRows() {
    const board = (await this.ctx.storage.get("board")) || {};
    return this.sortBoard(board).slice(0, 20);
  }

  async submit(payload) {
    const board = (await this.ctx.storage.get("board")) || {};
    const incoming = Array.isArray(payload && payload.scores)
      ? payload.scores
      : [payload || {}];

    let changed = false;
    for (const raw of incoming.slice(0, 200)) {
      const name = this.cleanName(raw && (raw.player ?? raw.name));
      const score = this.normalizeScore(raw && raw.score);
      const distance = this.normalizeDistance(raw && raw.distance);
      const donuts = this.normalizeDonuts(raw && raw.donuts);
      if (!name) continue;
      const key = name.toLocaleLowerCase();
      const prev = board[key];
      if (!prev || score > Number(prev.score || 0)) {
        board[key] = { name, score, distance, donuts, when: Date.now() };
        changed = true;
      }
    }

    if (changed) {
      const trimmed = {};
      for (const row of this.sortBoard(board).slice(0, 200)) {
        trimmed[row.name.toLocaleLowerCase()] = row;
      }
      await this.ctx.storage.put("board", trimmed);
      return this.sortBoard(trimmed).slice(0, 20);
    }

    return this.sortBoard(board).slice(0, 20);
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

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/api/ranking") {
      if (!env.LEADERBOARD) return json({ error: "ranking_unavailable" }, 503);
      const stub = env.LEADERBOARD.getByName
        ? env.LEADERBOARD.getByName("bruno-guloso-global")
        : env.LEADERBOARD.get(env.LEADERBOARD.idFromName("bruno-guloso-global"));

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
              '<script src="/global-ranking.js?v=2"></script>' +
              '<script src="/mobile-responsive.js?v=4"></script>' +
              '<script src="/mobile-controls.js?v=4"></script>' +
              '<script src="/finish-pro.js?v=1"></script>' +
              '<script src="/orientation-game-only.js?v=2"></script>' +
              '<script src="/mobile-static-fit.js?v=1"></script>' +
              '<script src="/mobile-side-viewport.js?v=4"></script>' +
              '<script src="/mobile-arrow-tune.js?v=1"></script>' +
              '<script src="/mobile-full-touch.js?v=4"></script>' +
              '<script src="/mobile-invisible-arrows.js?v=5"></script>' +
              '<script src="/mushroom-tip-mark.js?v=5"></script>' +
              '<script src="/donut-score-powerup.js?v=3"></script>' +
              '<script src="/donut-touch-fix.js?v=1"></script>' +
              '<script src="/composite-score-ui.js?v=1"></script>' +
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
