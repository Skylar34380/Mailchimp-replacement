import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createApp } from "../src/server.mjs";

const tempDir = await mkdtemp(join(tmpdir(), "omm-subscribe-api-"));
const consentLogPath = join(tempDir, "consent-log.jsonl");

const app = createApp({
  port: 0,
  listmonkUrl: "http://localhost:9000",
  listUuids: ["dry-run-list-uuid"],
  dryRun: true,
  allowedOrigins: ["http://localhost:5173"],
  rateLimitWindowMs: 60_000,
  rateLimitMax: 12,
  consentLogPath,
});

const server = await new Promise((resolve) => {
  const instance = app.listen(0, "127.0.0.1", () => resolve(instance));
});

try {
  const { port } = server.address();
  const response = await fetch(`http://127.0.0.1:${port}/api/wix/subscribe`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      origin: "http://localhost:5173",
    },
    body: JSON.stringify({
      email: "buyer@example.com",
      firstName: "Buyer",
      lastName: "One",
      source: "wix-home",
      consentText: "I agree to receive OMM property updates.",
      suburb: "Yarraville",
      projectType: "Townhouse",
    }),
  });

  const body = await response.json();
  const log = await readFile(consentLogPath, "utf8");

  console.log("HTTP status:", response.status);
  console.log("API response:", JSON.stringify(body));
  console.log("Consent log:", log.trim());

  if (!response.ok || body.ok !== true || !log.includes("buyer@example.com")) {
    process.exitCode = 1;
  }
} finally {
  await new Promise((resolve) => server.close(resolve));
  await rm(tempDir, { recursive: true, force: true });
}
