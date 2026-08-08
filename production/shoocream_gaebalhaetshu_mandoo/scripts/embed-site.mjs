import { readFile, writeFile, readdir } from "node:fs/promises";
import { join } from "node:path";

const dist = new URL("../dist/", import.meta.url);
const assetsDir = new URL("../dist/assets/", import.meta.url);
let html = await readFile(new URL("index.html", dist), "utf8");
const assetData = new Map();

async function collect(directory, files) {
  for (const file of files) {
    const data = await readFile(new URL(`${directory}/${file}`, dist));
    const mime = file.endsWith(".png")
      ? "image/png"
      : file.endsWith(".jpg") || file.endsWith(".jpeg")
        ? "image/jpeg"
        : "application/octet-stream";
    const path = `/${directory}/${file}`;
    const value = `data:${mime};base64,${data.toString("base64")}`;
    assetData.set(path, value);
    assetData.set(encodeURI(path), value);
  }
}

await collect("banners", await readdir(new URL("banners/", dist)));
await collect(
  "assets",
  (await readdir(assetsDir)).filter(
    (file) => !file.endsWith(".js") && !file.endsWith(".css"),
  ),
);

for (const file of await readdir(assetsDir)) {
  const path = join("/assets", file);
  const data = await readFile(new URL(`assets/${file}`, dist));
  const mime = file.endsWith(".css")
    ? "text/css"
    : file.endsWith(".js")
      ? "text/javascript"
      : "application/octet-stream";
  let source = data.toString("utf8");
  for (const [assetPath, assetValue] of assetData)
    source = source.split(assetPath).join(assetValue);
  const value = `data:${mime};base64,${Buffer.from(source).toString("base64")}`;
  html = html.split(path).join(value);
}

for (const [assetPath, assetValue] of assetData)
  html = html.split(assetPath).join(assetValue);

const source = `const html = ${JSON.stringify(html)};\nexport default { fetch() { return new Response(html, { headers: { "content-type": "text/html; charset=UTF-8" } }); } };\n`;
await writeFile(new URL("server/index.js", dist), source);
