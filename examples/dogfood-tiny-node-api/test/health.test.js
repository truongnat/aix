import assert from "node:assert/strict";
import http from "node:http";
import test from "node:test";
import { server } from "../src/server.js";

function request(path) {
  return new Promise((resolve, reject) => {
    const onListenError = (error) => {
      server.removeListener("error", onListenError);
      reject(error);
    };

    server.once("error", onListenError);
    server.listen(0, "127.0.0.1", () => {
      server.removeListener("error", onListenError);
      const { port } = server.address();
      http
        .get(`http://127.0.0.1:${port}${path}`, (res) => {
          let body = "";
          res.on("data", (chunk) => {
            body += chunk;
          });
          res.on("end", () => {
            server.close(() => resolve({ statusCode: res.statusCode, body }));
          });
        })
        .on("error", (err) => {
          server.close(() => reject(err));
        });
    });
  });
}

test("GET /health returns 200 and ok JSON", async (t) => {
  let response;
  try {
    response = await request("/health");
  } catch (error) {
    if (error && error.code === "EPERM") {
      t.skip("sandbox does not allow binding a local HTTP port");
      return;
    }
    throw error;
  }
  const { statusCode, body } = response;
  assert.equal(statusCode, 200);
  assert.deepEqual(JSON.parse(body), { status: "ok" });
});

test("GET / still returns root response", async (t) => {
  let response;
  try {
    response = await request("/");
  } catch (error) {
    if (error && error.code === "EPERM") {
      t.skip("sandbox does not allow binding a local HTTP port");
      return;
    }
    throw error;
  }
  const { statusCode, body } = response;
  assert.equal(statusCode, 200);
  assert.match(body, /dogfood-tiny-node-api/);
});
