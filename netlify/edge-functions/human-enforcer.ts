import { PxClient, PxEnforcer } from "https://esm.sh/perimeterx-node-core@3.11.0";
import Mustache from "https://esm.sh/mustache@4.2.0";
import type { Config, Context } from "@netlify/edge-functions";

export interface EnforcerRequest {
    headers: { [key: string]: string };
    cookies: { [key: string]: string };
    query?: string;
    protocol?: string;
    ip?: string;
    hostname?: string;
    method?: string;
    originalUrl?: string;
    get?: (key: string) => string;
    path?: string;
    httpVersion?: string;
    originalRequest: Request;
    body?: string;
}

export interface PXResponse {
    status: string;
    body: string;
    headers: any;
}

// Params to be passed to the PerimeterX Enforcer using the Netlify environment variables
const pxParams = {
    px_app_id: Netlify.env.get("PX_APP_ID"),
    px_auth_token: Netlify.env.get("PX_AUTH_TOKEN"),
    px_cookie_secret: Netlify.env.get("PX_COOKIE_SECRET"),
    px_module_version: "Netlify Edge Function 0.0.1",
    px_logger_severity: "debug",
    px_module_mode: "active_blocking",
};

// HTML templates for the block has been extracted from the PerimeterX NodeJS SDK
const BLOCK_TEMPLATE = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="description" content="px-captcha">
    <title>Access to this page has been denied</title>
    {{#cssRef}}
        <link rel="stylesheet" type="text/css" href="{{{cssRef}}}">
    {{/cssRef}}
</head>
<body>
<script>
    /* PerimeterX assignments */
    window._pxVid = '{{vid}}';
    window._pxUuid = '{{uuid}}';
    window._pxAppId = '{{appId}}';
    window._pxMobile = {{isMobile}};
    window._pxHostUrl = '{{{hostUrl}}}';
    window._pxCustomLogo = '{{{customLogo}}}';
    window._pxJsClientSrc = '{{{jsClientSrc}}}';
    window._pxFirstPartyEnabled = {{firstPartyEnabled}};
    var pxCaptchaSrc = '{{{blockScript}}}';

    var script = document.createElement('script');
    script.src = pxCaptchaSrc;
    script.onerror = function () {
        script = document.createElement('script');
        script.src = '{{altBlockScript}}';
        script.onerror = window._pxOnError;
        document.head.appendChild(script);
    };
    window._pxOnError = function () {
        var style = document.createElement('style');
        style.innerText = '@import url(https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,100;0,300;0,400;0,500;0,700;0,900;1,100;1,300;1,400;1,500;1,700;1,900&display=swap);body{background-color:#fafbfc}.px-captcha-error-container{position:fixed;height:340px;background-color:#fff;font-family:Roboto,sans-serif}.px-captcha-error-header{color:#f0f1f2;font-size:29px;margin:67px 0 33px;font-weight:500;line-height:.83;text-align:center}.px-captcha-error-message{color:#f0f1f2;font-size:18px;margin:0 0 29px;line-height:1.33;text-align:center}.px-captcha-error-button{text-align:center;line-height:48px;width:253px;margin:auto;border-radius:50px;border:solid 1px #f0f1f2;font-size:20px;color:#f0f1f2}.px-captcha-error-wrapper{margin:18px 0 0}div.px-captcha-error{margin:auto;text-align:center;width:400px;height:30px;font-size:12px;background-color:#fcf0f2;color:#ce0e2d}img.px-captcha-error{margin:6px 8px -2px 0}.px-captcha-error-refid{border-top:solid 1px #f0eeee;height:27px;margin:13px 0 0;border-radius:0 0 3px 3px;background-color:#fafbfc;font-size:10px;line-height:2.5;text-align:center;color:#b1b5b8}@media (min-width:620px){.px-captcha-error-container{width:530px;top:50%;left:50%;margin-top:-170px;margin-left:-265px;border-radius:3px;box-shadow:0 2px 9px -1px rgba(0,0,0,.13)}}@media (min-width:481px) and (max-width:620px){.px-captcha-error-container{width:85%;top:50%;left:50%;margin-top:-170px;margin-left:-42.5%;border-radius:3px;box-shadow:0 2px 9px -1px rgba(0,0,0,.13)}}@media (max-width:480px){body{background-color:#fff}.px-captcha-error-header{color:#f0f1f2;font-size:29px;margin:55px 0 33px}.px-captcha-error-container{width:530px;top:50%;left:50%;margin-top:-170px;margin-left:-265px}.px-captcha-error-refid{position:fixed;width:100%;left:0;bottom:0;border-radius:0;font-size:14px;line-height:2}}@media (max-width:390px){div.px-captcha-error{font-size:10px}.px-captcha-error-refid{font-size:11px;line-height:2.5}}';
        document.head.appendChild(style);
        var div = document.createElement('div');
        div.className = 'px-captcha-error-container';
        div.innerHTML = '<div class="px-captcha-error-header">Before we continue...</div><div class="px-captcha-error-message">Press & Hold to confirm you are<br>a human (and not a bot).</div><div class="px-captcha-error-button">Press & Hold</div><div class="px-captcha-error-wrapper"><div class="px-captcha-error"><img class="px-captcha-error" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABMAAAAQCAMAAADDGrRQAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAABFUExURUdwTNYELOEGONQILd0AONwALtwEL+AAL9MFLfkJSNQGLdMJLdQJLdQGLdQKLtYFLNcELdUGLdcBL9gFL88OLdUFLNEOLglBhT4AAAAXdFJOUwC8CqgNIRgRoAS1dWWuR4RTjzgryZpYblfkcAAAAI9JREFUGNNdj+sWhCAIhAdvqGVa1r7/oy6RZ7eaH3D4ZACBIed9wlOOMtUnSrEmZ6cHa9YAIfsbCkWrdpi/c50Bk2CO9mNLdMAu03wJA3HpEnfpxbyOg6ruyx8JJi6KNstnslp1dbPd9GnqmuYq7mmcv1zjnbQw8cV0xzkqo+fX1zkjUOO7wnrInUTxJiruC3vtBNRoQQn2AAAAAElFTkSuQmCC">Please check your internet connection' + (window._pxMobile ? '' : ' or disable your ad-blocker') + '.</div></div><div class="px-captcha-error-refid">Reference ID ' + window._pxUuid + '</div>';
        document.body.appendChild(div);
        if (window._pxMobile) {
            setTimeout(function() {
                location.href = '/px/captcha_close?status=-1';
            }, 5000);
        }
    };
    document.head.appendChild(script);
</script>
{{#jsRef}}
    <script src="{{{jsRef}}}"></script>
{{/jsRef}}
</body>
</html>`;

const RATE_LIMIT_TEMPLATE = `<html>
<head>
    <title>Too Many Requests</title>
</head>
<body>
    <h1>Too Many Requests</h1>
    <p>Reached maximum requests limitation, try again soon.</p>
</body>
</html>`;

const client = new PxClient();
// This class extends the PerimeterX PxEnforcer class and overrides the compileMustache method to use the HTML templates above
class NetlifyPxEnforcer extends PxEnforcer {
    constructor(params: Object, client: PxClient) {
        super(params, client);
    }

    compileMustache(template, props, cb) {
        const templateMap = {
            "block_template": BLOCK_TEMPLATE,
            "ratelimit": RATE_LIMIT_TEMPLATE
        }

        let htmlOutput = Mustache.render(templateMap[template], props);
        cb(htmlOutput);
    }
}
// Create a new instance of the NetlifyPxEnforcer class
const enforcer = new NetlifyPxEnforcer(pxParams, client);

// Build the request object to be passed to the PerimeterX Enforcer
const buildRequestObject = (request: Request, context: Context) => {
    const req: EnforcerRequest = { originalRequest: request, headers: {}, cookies: {} };

    request.headers.forEach((value, key) => {
        req.headers[key] = value;
    });
    // Parse cookies from the request
    const cookieHeader = request.headers.get("cookie");
    if (cookieHeader) {
        const cookies = cookieHeader.split(/;\s?/);
        for (const cookie of cookies) {
            const eqIndex = cookie.indexOf("=");
            const key = decodeURIComponent(cookie.substring(0, eqIndex)).trim();
            const value = cookie.substring(eqIndex + 1);
            if (key && value) {
                req.cookies[key] = value;
            }
        }
    }
    // Parse request from the request
    const reqUrl = new URL(request.url);

    req.query = reqUrl.searchParams.toString();
    req.originalUrl = `${reqUrl.pathname}${reqUrl.search}`;
    req.protocol = reqUrl.protocol.slice(0, -1);
    req.ip = context.ip;

    req.hostname = request.headers.get("host");
    req.method = request.method;

    req.path = reqUrl.pathname;

    req.get = (key) => {
        return req.headers[key.toLowerCase()] || "";
    };
    return req;
};

/**
 * This async function enforces a bot score on the incoming request. If a response is returned, the request should be blocked. If undefined is returned, the request should be allowed to proceed.
 *
 * @param {EnforcerRequest} request - The incoming request to be enforced by HUMAN.
 * @returns {Promise} - Returns a Promise that resolves when the enforcement is complete.
 */

// This function enforces the request using the PerimeterX Enforcer
const enforce = async (request: EnforcerRequest) => {
    return new Promise<PXResponse | undefined>((resolve, reject) => {
        enforcer.enforce(request, null, (err: any, res: any) => {
            if (err) {
                reject(err);
            } else {
                resolve(res);
            }
            client.submitActivities(enforcer.config.conf);
        });
    });
};

// This is the main function that is executed by the Netlify Edge Function

export default async (request: Request, context: Context) => {

    // Build the request object
    const PXRequest = buildRequestObject(request, context);
    // Enforce the request
    const response = await enforce(PXRequest);
    // If a response is returned, the request should be blocked
    if (response) {
        //block
        console.log("Blocking request");
        return new Response(typeof response.body !== 'string' ? JSON.stringify(response.body) : response.body, {
            headers: response.headers,
            status: parseInt(response.status)
        });

    } else {
        //allow
        return await context.next();
    }


};

// This is the config for the Netlify Edge Function defining the path to be enforced
export const config: Config = {
    path: "/*",
    excludedPath: ["/1yz6W67d/init.js", "/1yz6W67d/captcha/*", "/1yz6W67d/xhr/*"]
};
