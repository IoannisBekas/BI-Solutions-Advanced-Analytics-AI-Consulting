import assert from "node:assert/strict";
import { once } from "node:events";
import { request } from "node:http";
import type { AddressInfo } from "node:net";
import { after, before, test } from "node:test";
import { brotliDecompressSync, gunzipSync } from "node:zlib";
import express from "express";
import { publicAssetCompression } from "./publicCompression";

const content = "Public campaign content. ".repeat(500);
const app = express();
app.use(publicAssetCompression());
app.get("/assets/app.css", (_req, res) => res.type("css").set("Cache-Control", "public, max-age=31536000, immutable").send(content));
app.get("/assets/raw.js", (_req, res) => res.type("js").set("Cache-Control", "no-transform").send(content));
app.get("/el/meiosi-kostous-delivery", (_req, res) => res.type("html").send(content));
app.get("/el/online-paraggelies/", (_req, res) => res.type("html").send(content));
app.get("/api/example", (_req, res) => res.json({ content }));
app.get("/api/stream", (_req, res) => res.type("text/event-stream").send(content));
const server = app.listen(0, "127.0.0.1");
let origin: string;

before(async () => {
  if (!server.listening) await once(server, "listening");
  origin = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
});
after(() => new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve())));

function probe(path: string, encoding: string) {
  return new Promise<{ headers: Record<string, unknown>; body: Buffer }>((resolve, reject) => {
    const req = request(origin + path, { headers: { "Accept-Encoding": encoding } }, (res) => {
      const chunks: Buffer[] = [];
      res.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
      res.on("end", () => resolve({ headers: res.headers, body: Buffer.concat(chunks) }));
    });
    req.on("error", reject);
    req.end();
  });
}

test("public build assets negotiate gzip, preserve cache headers and retain their content", async () => {
  const result = await probe("/assets/app.css?v=campaign", "gzip");
  assert.equal(result.headers["content-encoding"], "gzip");
  assert.match(String(result.headers.vary), /Accept-Encoding/i);
  assert.match(String(result.headers["cache-control"]), /immutable/);
  assert.equal(gunzipSync(result.body).toString(), content);
  assert.ok(result.body.length < Buffer.byteLength(content) / 2);
});

test("both campaign documents support Brotli and uncompressed clients", async () => {
  for (const path of ["/el/meiosi-kostous-delivery", "/el/online-paraggelies/"]) {
    const compressed = await probe(path, "br");
    assert.equal(compressed.headers["content-encoding"], "br");
    assert.equal(brotliDecompressSync(compressed.body).toString(), content);
    const identity = await probe(path, "identity");
    assert.equal(identity.headers["content-encoding"], undefined);
    assert.equal(identity.body.toString(), content);
  }
});

test("API, streaming and no-transform responses remain uncompressed", async () => {
  for (const path of ["/api/example", "/api/stream", "/assets/raw.js"]) {
    const result = await probe(path, "br, gzip");
    assert.equal(result.headers["content-encoding"], undefined, path);
    assert.ok(result.body.toString().includes(content), path);
  }
});
