import assert from "node:assert/strict";
import { once } from "node:events";
import { request } from "node:http";
import type { AddressInfo } from "node:net";
import { after, before, test } from "node:test";
import express from "express";
import { redirectLegacyProductPath } from "./static";

const app = express();
for (const suffix of ["", "/", "/index.html"]) {
  redirectLegacyProductPath(app, `/el/meiosi-kostous-delivery${suffix}`, "/el/online-paraggelies");
}
app.use((_req, res) => res.status(200).send("Canonical destination"));
const server = app.listen(0, "127.0.0.1");
let origin: string;
before(async () => {
  if (!server.listening) await once(server, "listening");
  origin = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
});
after(() => new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve())));

function probe(path: string, method = "GET") {
  return new Promise<{ status: number | undefined; location: string | undefined }>((resolve, reject) => {
    const req = request(origin + path, { method }, (res) => {
      res.resume();
      res.on("end", () => resolve({ status: res.statusCode, location: res.headers.location }));
    });
    req.on("error", reject);
    req.end();
  });
}

test("restaurant aliases permanently redirect GET/HEAD with tracking and repeated queries intact", async () => {
  const query = "?utm_source=meta&utm_campaign=delivery%20costs&gclid=A%2BB&tag=one&tag=two";
  for (const suffix of ["", "/", "/index.html"]) {
    for (const method of ["GET", "HEAD"]) {
      const result = await probe(`/el/meiosi-kostous-delivery${suffix}${query}`, method);
      assert.equal(result.status, 308);
      assert.equal(result.location, "/el/online-paraggelies" + query);
    }
  }
});

test("encoded legacy paths normalize without redirecting canonical URLs or POST requests", async () => {
  assert.equal((await probe("/el/meiosi%2Dkostous%2Ddelivery")).location, "/el/online-paraggelies");
  assert.equal((await probe("/el/online-paraggelies")).status, 200);
  assert.equal((await probe("/el/meiosi-kostous-delivery", "POST")).status, 200);
});
