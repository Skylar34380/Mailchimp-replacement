import { createServer } from "node:http";
import { config } from "./config.mjs";
import { writeConsentLog } from "./consent-log.mjs";
import { corsHeaders, clientIp, readRequestBody, sendJson } from "./http.mjs";
import { subscribeToListmonk } from "./listmonk.mjs";
import { createRateLimiter } from "./rate-limit.mjs";
import { normalizeSubscribeInput, validateSubscribeInput } from "./validation.mjs";

const limiter = createRateLimiter({
  windowMs: config.rateLimitWindowMs,
  max: config.rateLimitMax,
});

export function createApp(runtimeConfig = config) {
  return createServer(async (req, res) => {
    const headers = corsHeaders(req, runtimeConfig.allowedOrigins);
    const url = new URL(req.url ?? "/", `http://${req.headers.host ?? "localhost"}`);

    if (req.method === "OPTIONS") {
      sendJson(res, 204, {}, headers);
      return;
    }

    if (req.method === "GET" && url.pathname === "/health") {
      sendJson(
        res,
        200,
        {
          ok: true,
          service: "omm-subscribe-api",
          listmonkUrl: runtimeConfig.listmonkUrl,
          dryRun: runtimeConfig.dryRun,
        },
        headers
      );
      return;
    }

    if (req.method === "POST" && ["/api/subscribe", "/api/wix/subscribe"].includes(url.pathname)) {
      const ip = clientIp(req);
      const limited = limiter(ip);
      if (!limited.allowed) {
        sendJson(res, 429, { ok: false, error: "Too many subscribe attempts. Try again later." }, headers);
        return;
      }

      try {
        const rawInput = await readRequestBody(req);
        const subscriber = normalizeSubscribeInput(rawInput);
        const errors = validateSubscribeInput(subscriber);

        if (errors.length) {
          sendJson(res, 400, { ok: false, errors }, headers);
          return;
        }

        const requestMeta = {
          ip,
          userAgent: req.headers["user-agent"] ?? "",
          referer: req.headers.referer ?? "",
          origin: req.headers.origin ?? "",
          submittedAt: new Date().toISOString(),
        };

        const result = await subscribeToListmonk({
          config: runtimeConfig,
          subscriber,
          requestMeta,
        });

        await writeConsentLog(runtimeConfig.consentLogPath, {
          email: subscriber.email,
          name: subscriber.name,
          source: subscriber.source,
          consentText: subscriber.consentText,
          suburbPreference: subscriber.suburbPreference,
          projectTypePreference: subscriber.projectTypePreference,
          listUuids: runtimeConfig.listUuids,
          listmonkStatus: result.status,
          dryRun: Boolean(result.dryRun),
          ...requestMeta,
        });

        if (!result.ok) {
          sendJson(
            res,
            result.status >= 400 && result.status < 600 ? result.status : 502,
            {
              ok: false,
              error: "Subscription could not be completed.",
              listmonk: result.body ?? result.error,
            },
            headers
          );
          return;
        }

        sendJson(
          res,
          200,
          {
            ok: true,
            message: "Subscription received.",
            dryRun: Boolean(result.dryRun),
          },
          headers
        );
      } catch (error) {
        sendJson(
          res,
          500,
          {
            ok: false,
            error: "Unexpected subscribe API error.",
            detail: error instanceof Error ? error.message : String(error),
          },
          headers
        );
      }
      return;
    }

    sendJson(res, 404, { ok: false, error: "Not found." }, headers);
  });
}

if (import.meta.url === `file://${process.argv[1]}`) {
  createApp().listen(config.port, () => {
    console.log(`OMM subscribe API listening on http://localhost:${config.port}`);
    console.log(`Listmonk target: ${config.listmonkUrl}${config.dryRun ? " (dry run)" : ""}`);
  });
}
