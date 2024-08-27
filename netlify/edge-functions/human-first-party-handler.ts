import type { Config, Context } from "@netlify/edge-functions";

export default async (request: Request, context: Context) => {
  // The requests that sit on the clients side script are proxied to perimiter X and returned from the same domain that requested it thefore circumventeing adblockers

  if (request.url.includes(`/1yz6W67d/init.js`)) {
    return await fetch(`https://client.perimeterx.net/PX1yz6W67d/main.min.js`, request);
  } else if (request.url.includes(`/1yz6W67d/captcha/`)) {
    const match = request.url.match(/\/1yz6W67d\/captcha\/(.*)/)
    return await fetch(`https://captcha.px-cdn.net/PX1yz6W67d/captcha.js?${match[1]}`, request);
  } else if (request.url.includes(`/1yz6W67d/xhr/`)) {
    const match = request.url.match(/\/1yz6W67d\/xhr\/(.*)/)
    return await fetch(new Request(`https://collector-PX1yz6W67d.perimeterx.net/${match[1]}`, request));
  } else {
    return new Response("Warning: Edge Function executed, but no action was taken!");
  }
};

// The paths defined here are the paths that will be proxied to perimeter X
export const config: Config = {
  cache: "manual",
  path: [`/1yz6W67d/init.js`, `/1yz6W67d/captcha/*`, `/1yz6W67d/xhr/*`],
};
