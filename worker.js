export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const response = await env.ASSETS.fetch(request);

    if ((url.pathname === "/" || url.pathname === "/index.html") &&
        (response.headers.get("content-type") || "").includes("text/html")) {
      return new HTMLRewriter()
        .on("body", {
          element(el) {
            el.append('<script src="/audio.js?v=1"></script>', { html: true });
          }
        })
        .transform(response);
    }

    return response;
  }
};
