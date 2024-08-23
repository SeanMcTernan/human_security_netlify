import { PXEnforcer } from "https://esm.sh/perimeterx-node-core-ts";
import { LoggerSeverity, PXRawConfig } from "https://esm.sh/perimeterx-node-core-ts/dist/interfaces/PXConfig";
import type { Config, Context } from "@netlify/edge-functions";

export default async (request: Request, context: Context) => {
    const config: PXRawConfig = {
        px_app_id: Netlify.env.get("PX_APP_ID"),
        px_cookie_secret: Netlify.env.get("PX_COOKIE_SECRET"),
        px_auth_token: Netlify.env.get("PX_AUTH_TOKEN"),
        px_logger_severity: LoggerSeverity.DEBUG,
        px_extract_user_ip(request) {
            return "<client ip>";
        },
    };

    const px = new PXEnforcer(config);
    const resp = await px.enforce(request);

    if (resp.pxResponse) {
        return new Response(resp.pxResponse.body, {
            headers: resp.pxResponse.headers as HeadersInit,
            status: resp.pxResponse.status,
        });
    }

    console.log("resp", resp);
    return new Response(":wave:");
};

export const config: Config = {
    path: "/*",
    excludedPath: ["/1yz6W67d/init.js", "/1yz6W67d/captcha/*", "/1yz6W67d/xhr/*"]
};