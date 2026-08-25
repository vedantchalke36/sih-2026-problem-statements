export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    let response = await env.ASSETS.fetch(request);

    if (response.status === 404) {
      const cleanPath = url.pathname.replace(/\/+$/, "") || "/";
      const candidate =
        cleanPath === "/" ? "/index.html" : `${cleanPath}.html`;
      const fallback = await env.ASSETS.fetch(
        new Request(url.origin + candidate, request),
      );
      response =
        fallback.status === 404
          ? await env.ASSETS.fetch(new Request(url.origin + "/404.html", request))
          : fallback;
    }

    return response;
  },
};