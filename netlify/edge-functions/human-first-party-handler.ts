import type { Config, Context } from "@netlify/edge-functions";

export default async (request: Request, context: Context) => {
    // The requests that sit on the clients side script are proxied to perimiter X and returned from the same domain that requested it thefore circumventeing adblockers

    if (request.url.includes(`/${Netlify.env.get("PX_APP_ID")}/xhr/`)) {
        const match = request.url.match(/\/1yz6W67d\/xhr\/(.*)/)
        return await fetch(new Request(`https://collector-PX${Netlify.env.get("PX_APP_ID")}.perimeterx.net/${match[1]}`, request));
    } else {
        return new Response("Warning: Edge Function executed, but no action was taken!");
    }
};

// The paths defined here are the paths that will be proxied to perimeter X
export const config: Config = {
    cache: "manual",
    path: [`/${Netlify.env.get("PX_APP_ID")}/xhr/*`],
};