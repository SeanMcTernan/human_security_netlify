import type { Config, Context } from "@netlify/edge-functions";

export default async (request: Request, context: Context) => {
    // The requests that sit on the clients side script are proxied to perimiter X and returned from the same domain that requested it thefore circumventeing adblockers

    if (request.url.includes(`/${Netlify.env.get("PX_APP_ID")}/init.js`)) {
        return await fetch(`https://client.perimeterx.net/PX${Netlify.env.get("PX_APP_ID")}/main.min.js`, request);
    } else if (request.url.includes(`/${Netlify.env.get("PX_APP_ID")}/captcha/`)) {
        const match = request.url.match(/\/1yz6W67d\/captcha\/(.*)/)
        return await fetch(`https://captcha.px-cdn.net/PX${Netlify.env.get("PX_APP_ID")}/captcha.js?${match[1]}`, request);
    } else if (request.url.includes(`/${Netlify.env.get("PX_APP_ID")}/xhr/`)) {
        const match = request.url.match(/\/1yz6W67d\/xhr\/(.*)/)
        return await fetch(new Request(`https://collector-PX${Netlify.env.get("PX_APP_ID")}.perimeterx.net/${match[1]}`, request));
    } else {
        return new Response("Warning: Edge Function executed, but no action was taken!");
    }
};

// The paths defined here are the paths that will be proxied to perimeter X
export const config: Config = {
    cache: "manual",
    path: [`/${Netlify.env.get("PX_APP_ID")}/init.js`, `/${Netlify.env.get("PX_APP_ID")}/captcha/*`, `/${Netlify.env.get("PX_APP_ID")}/xhr/*`],
};