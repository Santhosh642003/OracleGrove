import handler from "vinext/server/fetch-handler";

// Standalone hosting uses Cloudflare runtime secrets directly.
export default {
  fetch(request: Request, env: Cloudflare.Env, ctx: ExecutionContext) {
    return handler.fetch(request, env, ctx);
  },
};
