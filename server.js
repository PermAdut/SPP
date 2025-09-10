import fs from "node:fs/promises";
import express from "express";
import { Transform } from "node:stream";
import { errorHandler } from "./dist/routes/middlewares/error.middleware.js";
import routes from "./dist/routes/modules/users/routes.js";
import path from "node:path";

const isProduction = process.env.NODE_ENV === "production";
const port = process.env.PORT || 5173;
const base = process.env.BASE || "/";
const ABORT_DELAY = 10000;
const imagePath = path.join(import.meta.dirname, 'dist', 'routes', 'public', 'img');
fs.mkdir(imagePath, { recursive: true }).catch(console.error);
const templateHtml = isProduction
  ? await fs.readFile("./dist/client/index.html", "utf-8")
  : "";

const app = express();
app.use(express.json())
app.use(errorHandler);
app.use(routes);
app.use('/images', express.static(imagePath));
let vite;
if (!isProduction) {
  const { createServer } = await import("vite");
  vite = await createServer({
    server: { middlewareMode: true },
    appType: "custom",
    base,
  });
  app.use(vite.middlewares);
} else {
  const compression = (await import("compression")).default;
  const sirv = (await import("sirv")).default;
  app.use(compression());
  app.use(base, sirv("./dist/client", { extensions: [] }));
}

app.use("*all", async (req, res) => {
  try {
    const url = req.originalUrl.replace(base, "");

    /** @type {string} */
    let template;
    /** @type {import('./src/entry-server.ts').render} */
    let render;
    if (!isProduction) {
      // Always read fresh template in development
      template = await fs.readFile("./index.html", "utf-8");
      template = await vite.transformIndexHtml(url, template);
      render = (await vite.ssrLoadModule("/src/entry-server.tsx")).render;
    } else {
      template = templateHtml;
      render = (await import("./dist/server/entry-server.js")).render;
    }

    let didError = false;

    const { pipe, abort } = render(url, {
      onShellError() {
        res.status(500);
        res.set({ "Content-Type": "text/html" });
        res.send("<h1>Something went wrong</h1>");
      },
      onShellReady() {
        res.status(didError ? 500 : 200);
        res.set({ "Content-Type": "text/html" });

        const [htmlStart, htmlEnd] = template.split(`<!--app-html-->`);
        let htmlEnded = false;

        const transformStream = new Transform({
          transform(chunk, encoding, callback) {
            // See entry-server.tsx for more details of this code
            if (!htmlEnded) {
              chunk = chunk.toString();
              if (chunk.endsWith("<vite-streaming-end></vite-streaming-end>")) {
                res.write(chunk.slice(0, -41) + htmlEnd, "utf-8");
              } else {
                res.write(chunk, "utf-8");
              }
            } else {
              res.write(chunk, encoding);
            }
            callback();
          },
        });

        transformStream.on("finish", () => {
          res.end();
        });

        res.write(htmlStart);

        pipe(transformStream);
      },
      onError(error) {
        didError = true;
        console.error(error);
      },
    });

    setTimeout(() => {
      abort();
    }, ABORT_DELAY);
  } catch (e) {
    vite?.ssrFixStacktrace(e);
    console.log(e.stack);
    res.status(500).end(e.stack);
  }
});
app.listen(port, () => {
  console.log(`Server started at http://localhost:${port}`);
});
