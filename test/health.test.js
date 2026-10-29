import test from "node:test";
import assert from "node:assert";
import { EventEmitter } from "node:events";
import app from "../backend/index.js";

test("Health check endpoint returns status 200 and ok", (t, done) => {
  const req = new EventEmitter();
  req.method = "GET";
  req.url = "/api/health";
  req.headers = { host: "localhost" };

  const res = new EventEmitter();
  res.statusCode = 200;
  let body = "";
  res.setHeader = () => {};
  res.getHeader = () => {};
  res.writeHead = (code) => {
    res.statusCode = code;
  };
  res.write = (chunk) => {
    body += chunk;
  };
  res.end = (chunk) => {
    if (chunk) body += chunk;
    try {
      assert.strictEqual(res.statusCode, 200, "Health check should return HTTP 200");
      const json = JSON.parse(body);
      assert.deepStrictEqual(json, { status: "ok" }, "Response body should match { status: 'ok' }");
      done();
    } catch (err) {
      done(err);
    }
  };

  app(req, res);
});
