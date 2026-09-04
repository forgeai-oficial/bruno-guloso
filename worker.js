export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const response = await env.ASSETS.fetch(request);

    if ((url.pathname === "/" || url.pathname === "/index.html") &&
        (response.headers.get("content-type") || "").includes("text/html")) {
      return new HTMLRewriter()
        .on("body", {
          element(el) {
            el.append('<script src="/audio-cleanup.js?v=1"></script><script src="/audio.js?v=5"></script><script src="/audio-anyclick.js?v=1"></script><script src="/no-timeout.js?v=1"></script><script src="/ranking-pro.js?v=2"></script><script src="/landing-pro.js?v=4"></script>', { html: true });
          }
        })
        .transform(response);
    }

    return response;
  }
};