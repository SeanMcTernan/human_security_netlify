import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {/* In order to use custom parameters,
          remove the comments and enter the params.
          <script type="text/javascript">
            (function(){
              window._pxParam1 = "<param1>"
            }());
          </script> */}
        {/* In order to by pass add blockers, the script is requested as if it were available on the same route, the Edge Function Collect this requests in and returns the value from same domain, therefore the script is not blocked. */}
        <script src="/1yz6W67d/init.js" async></script>
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
