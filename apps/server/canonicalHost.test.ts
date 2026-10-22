import assert from "node:assert/strict";
import { once } from "node:events";
import { request } from "node:http";
import type { AddressInfo } from "node:net";
import { after, before, test } from "node:test";
import express from "express";
import { canonicalHostRedirect } from "./canonicalHost";

const app = express();
app.set("trust proxy", 1);
app.use(canonicalHostRedirect());
app.use((_req, res) => res.status(200).send("Destination reached"));
const server = app.listen(0, "127.0.0.1");
let origin: string;

before(async () => {
  if (!server.listening) await once(server, "listening");
  origin = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
});
after(() => new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve())));

function probe(requestPath: string, headers: Record<string, string>, method = "GET") {
  return new Promise<{ status: number | undefined; location: string | undefined }>((resolve, reject) => {
    const req = request(`${origin}${requestPath}`, { headers, method }, (response) => {
      response.resume();
      response.on("end", () => resolve({ status: response.statusCode, location: response.headers.location }));
    });
    req.on("error", reject);
    req.end();
  });
}

test("apex redirect preserves an encoded path and repeated tracking parameters", async () => {
  const requestPath = "/el/blog/report%20requirements?utm_source=chatgpt&utm_term=a%2Bb&tag=one&tag=two";
  const response = await probe(requestPath, { host: "bisolutions.group" });
  assert.equal(response.status, 308);
  assert.equal(response.location, `https://www.bisolutions.group${requestPath}`);
});

test("trusted forwarded apex host redirects HEAD requests", async () => {
  const response = await probe("/services/power-bi-consulting?gclid=test", { host: "internal.railway", "x-forwarded-host": "bisolutions.group" }, "HEAD");
  assert.equal(response.status, 308);
  assert.equal(response.location, "https://www.bisolutions.group/services/power-bi-consulting?gclid=test");
});

test("canonical, local and unrelated hosts do not redirect", async () => {
  for (const host of ["www.bisolutions.group", "localhost", "unrelated.example"]) {
    const response = await probe("/services/ai-automation", { host });
    assert.equal(response.status, 200, host);
    assert.equal(response.location, undefined);
  }
});
