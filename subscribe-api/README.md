# OMM Subscribe API

This service receives Wix form submissions and forwards valid subscribers to Listmonk.

```text
Wix form -> OMM Subscribe API -> Listmonk public subscription API
```

It is intentionally small: no Express, no database dependency, and no build step.

## Endpoints

```text
GET  /health
POST /api/subscribe
POST /api/wix/subscribe
```

`POST /api/subscribe` accepts JSON or form-encoded input.

Example JSON:

```json
{
  "email": "buyer@example.com",
  "name": "Buyer Name",
  "source": "https://www.ommelb.com.au/",
  "consentText": "I agree to receive property updates from Off Market Melbourne.",
  "suburbPreference": "Yarraville",
  "projectTypePreference": "Townhouse"
}
```

Wix can also send fields like `firstName`, `lastName`, `pageUrl`, `suburb`, and `projectType`.

## Local Run

```bash
cd subscribe-api
cp .env.example .env
npm start
```

Default local URL:

```text
http://localhost:8787
```

## Test Without Listmonk

Set:

```text
LISTMONK_DRY_RUN=true
```

Then:

```bash
curl -X POST http://localhost:8787/api/subscribe \
  -H 'Content-Type: application/json' \
  --data '{"email":"buyer@example.com","name":"Buyer Name","source":"wix-home"}'
```

Expected response:

```json
{
  "ok": true,
  "message": "Subscription received.",
  "dryRun": true
}
```

Or run the built-in dry-run integration test:

```bash
npm run test:dry-run
```

This starts the API on a random local port, submits a fake Wix subscriber, verifies the response, and checks that a consent log entry was written.

## Connect To Listmonk

1. Run Listmonk.
2. Create a public list such as `OMM Property Updates`.
3. Copy the list UUID.
4. Set:

```text
LISTMONK_DRY_RUN=false
LISTMONK_URL=https://newsletter.your-domain.com
LISTMONK_LIST_UUIDS=your-public-list-uuid
```

The API forwards to:

```text
POST /api/public/subscription
```

with:

```json
{
  "email": "buyer@example.com",
  "name": "Buyer Name",
  "list_uuids": ["your-public-list-uuid"]
}
```

## Consent Log

Every successful validation attempt writes an append-only JSONL entry to:

```text
data/consent-log.jsonl
```

This records email, name, source, consent text, timestamp, user agent, origin and Listmonk response status.

## Wix Setup

In Wix, configure the signup form to send a webhook or custom form submit to:

```text
https://subscribe.your-domain.com/api/wix/subscribe
```

Recommended fields:

- `email`
- `firstName`
- `lastName`
- `pageUrl`
- `suburb`
- `projectType`
- `consentText`

Add a hidden honeypot field named `website`, `company`, or `honeypot`. Real users leave it empty; spam bots often fill it.

## Production Notes

- Put the API behind HTTPS.
- Set `ALLOWED_ORIGINS` to the real Wix domains.
- Keep `CONSENT_LOG_PATH` on persistent storage.
- Monitor 4xx/5xx errors.
- Use Listmonk for campaigns, opens, clicks, unsubscribes and bounces.
