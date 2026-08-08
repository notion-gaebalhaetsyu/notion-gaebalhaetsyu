export default {
  async fetch(request, env) {
    // Sites serves the Vite build from the static asset binding.
    const url = new URL(request.url);
    if (url.pathname === "/" || url.pathname === "") {
      url.pathname = "/index.html";
      return env.ASSETS.fetch(new Request(url, request));
    }
    return env.ASSETS.fetch(request);
  },
};
