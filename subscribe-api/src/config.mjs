import { resolve } from "node:path";

const bool = (value, fallback = false) => {
  if (value === undefined) return fallback;
  return ["1", "true", "yes", "on"].includes(String(value).toLowerCase());
};

const int = (value, fallback) => {
  const parsed = Number.parseInt(String(value ?? ""), 10);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const csv = (value) =>
  String(value ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

export const config = {
  port: int(process.env.PORT, 8787),
  listmonkUrl: String(process.env.LISTMONK_URL ?? "http://localhost:9000").replace(/\/$/, ""),
  listUuids: csv(process.env.LISTMONK_LIST_UUIDS),
  dryRun: bool(process.env.LISTMONK_DRY_RUN, false),
  allowedOrigins: csv(process.env.ALLOWED_ORIGINS),
  rateLimitWindowMs: int(process.env.RATE_LIMIT_WINDOW_MS, 60_000),
  rateLimitMax: int(process.env.RATE_LIMIT_MAX, 12),
  consentLogPath: resolve(process.cwd(), process.env.CONSENT_LOG_PATH ?? "./data/consent-log.jsonl"),
};
