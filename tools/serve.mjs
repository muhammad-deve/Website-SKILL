import http from "node:http";
import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { safePath } from "./core.mjs";

export async function serve(directory, port = 0) {
  const root = await fs.realpath(directory);
  const types = {
    ".html": "text/html; charset=utf-8",
    ".css": "text/css",
    ".js": "text/javascript",
    ".svg": "image/svg+xml",
    ".json": "application/json",
    ".png": "image/png",
  };
  const server = http.createServer(async (req, res) => {
    try {
      if (!["GET", "HEAD"].includes(req.method)) {
        res.writeHead(405).end();
        return;
      }
      const raw = decodeURIComponent(req.url.split("?")[0]);
      if (raw.split(/[\\/]/).some((s) => s.startsWith(".")))
        throw new Error("Hidden path");
      let file = safePath(root, raw.replace(/^\/+/, ""));
      if ((await fs.stat(file)).isDirectory())
        file = path.join(file, "index.html");
      file = await fs.realpath(file);
      safePath(root, path.relative(root, file));
      const data = await fs.readFile(file);
      res.writeHead(200, {
        "Content-Type": types[path.extname(file)] || "application/octet-stream",
        "Cache-Control": "no-store",
      });
      res.end(req.method === "HEAD" ? undefined : data);
    } catch {
      res.writeHead(404).end("Not found");
    }
  });
  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(port, "127.0.0.1", resolve);
  });
  return {
    server,
    url: `http://127.0.0.1:${server.address().port}`,
    close: () =>
      new Promise((resolve, reject) =>
        server.close((e) => (e ? reject(e) : resolve())),
      ),
  };
}
if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href
) {
  const port = Number(process.argv[3] || 4173);
  if (!Number.isInteger(port) || port < 0 || port > 65535)
    throw new Error("Invalid port");
  const running = await serve(process.argv[2] || "examples", port);
  console.log(`Preview: ${running.url}`);
}
