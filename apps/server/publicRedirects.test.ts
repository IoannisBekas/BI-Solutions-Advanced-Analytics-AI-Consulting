import assert from "node:assert/strict";
import { once } from "node:events";
import { request } from "node:http";
import type { AddressInfo } from "node:net";
import { after, before, test } from "node:test";
import express from "express";
import redirects from "../../shared/public-redirects.json";
import { redirectLegacyProductPath } from "./static";

const app = express();
for (const { from, to } of redirects) {
  for (const suffix of ["", "/", "/index.html"]) {
    redirectLegacyProductPath(app, `${from}${suffix}`, to);
  }
}
app.use((_req, res) => res.status(200).send("Unchanged route"));
const server = app.listen(0, "127.0.0.1");
let origin: string;

before(async () => {
  if (!server.listening) await once(server, "listening");
  origin = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
});
after(() => new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve())));

function probe(path: string, method = "GET") {
  return new Promise<{ status: number | undefined; location: string | undefined }>((resolve, reject) => {
    const req = request(`${origin}${path}`, { method }, (res) => {
      res.resume();
      res.on("end", () => resolve({ status: res.statusCode, location: res.headers.location }));
    });
    req.on("error", reject);
    req.end();
  });
}

test("retired project and fallback addresses preserve repeated and encoded query values", async () => {
  const query = "?source=old%2Blink&tag=one&tag=two";
  for (const { from, to } of redirects) {
    for (const suffix of ["", "/", "/index.html"]) {
      for (const method of ["GET", "HEAD"]) {
        const response = await probe(from + suffix + query, method);
        assert.equal(response.status, 308, `${method} ${from}${suffix}`);
        assert.equal(response.location, to + query);
      }
    }
  }
});

test("the five intentionally hidden addresses are outside this migration", async () => {
  for (const path of ["/bnb-companies/", "/btc-companies/", "/sol-companies/", "/us/ai-automation", "/us/power-bi-consulting"]) {
    const response = await probe(path);
    assert.equal(response.status, 200, path);
    assert.equal(response.location, undefined, path);
    assert.ok(!redirects.some(({ from }) => from === path));
  }
});
