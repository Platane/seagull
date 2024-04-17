import * as path from "node:path";
import chokidar from "chokidar";
import { build, bundle } from "./build";

let assets: Awaited<ReturnType<typeof bundle>> = {};
let onChange: () => void;
const reset = () => {
  onChangePromise = new Promise((r) => {
    onChange = () => {
      reset();
      r();
    };
  });
};
let onChangePromise: Promise<void>;
reset();

const rebuild = async () => {
  const a = Date.now();

  try {
    assets = await build(false);
  } catch (error: any) {
    console.error(error);

    assets = {
      "index.html": injectWatcher(
        `<html><head></head><pre>${error.message}</pre></html>`,
      ),
    };
  }

  console.log("rebuilt", Date.now() - a, "ms");

  onChange();
};
rebuild();

chokidar
  .watch(__dirname + "/../game/", { ignoreInitial: true })
  .on("all", (event, path) => {
    console.log(event, path);
    rebuild();
  });

const injectWatcher = (html: string) => {
  function code() {
    let delay = 0;

    const loop = () => {
      fetch("/__watcher")
        .then(async (res) => {
          delay = 0;
          if ((await res.text()) === "refresh")
            setTimeout(() => window.location.reload(), 100);

          loop();
        })
        .catch(() => {
          setTimeout(loop, delay);
          delay = Math.min(5000, delay * 2 + 100);
        });
    };

    loop();
  }

  return html.replace(
    "</head>",
    `<script>;(${code.toString()})()</script></head>`,
  );
};

//@ts-ignore
Bun.serve({
  async fetch(req: Request) {
    let { pathname } = new URL(req.url);

    if (pathname === "/__watcher") {
      await onChangePromise;

      return new Response("refresh");
    }

    if (pathname === "/") pathname = "index.html";
    else pathname = pathname.slice(1);

    const content = assets[pathname];

    if (!content)
      return new Response(injectWatcher("<html><head></head>404</html>"), {
        status: 404,
        headers: {
          "content-type": "text/html",
          "Cache-Control": "no-store, max-age=0",
        },
      });

    if (path.extname(pathname) === ".html")
      return new Response(injectWatcher(content.toString()), {
        headers: {
          "content-type": "text/html",
          "Cache-Control": "no-store, max-age=0",
        },
      });

    return new Response(content);
  },
});
