export interface Env {
  ASSETS: Fetcher;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    // Vite/React uses client-side routes. Resolve those routes to the app shell
    // before asking the static asset binding to serve the request.
    if (url.pathname !== "/" && !url.pathname.split("/").pop()?.includes(".")) {
      url.pathname = "/index.html";
    }
    return env.ASSETS.fetch(url);
  },
};
