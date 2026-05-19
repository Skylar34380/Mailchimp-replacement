# Subscribe API

This service receives website subscription form submissions and forwards valid subscribers to Listmonk.

```text
Website form -> Subscribe API -> Listmonk public subscription API
```

It is intentionally small: no Express, no database dependency, and no build step.

## Endpoints

```text
GET  /health
POST /api/subscribe
```

`POST /api/subscribe` accepts JSON or form-encoded input.

Example JSON:

```json
{
  "email": "reader@example.com",
  "name": "Reader Name",
  "source": "https://www.example.com/newsletter",
  "consentText": "I agree to receive newsletter updates.",
  "company": "Example Co",
  "role": "Marketing Manager",
  "interests": ["product updates", "events"]
}
```

It also accepts fields like `firstName`, `lastName`, `pageUrl`, `company`, `role`, and `interests`.

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
  --data '{"email":"reader@example.com","name":"Reader Name","source":"website-home"}'
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

This starts the API on a random local port, submits a fake subscriber, verifies the response, and checks that a consent log entry was written.

## Connect To Listmonk

1. Run Listmonk.
2. Create a public list such as `Newsletter Updates`.
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
  "email": "reader@example.com",
  "name": "Reader Name",
  "list_uuids": ["your-public-list-uuid"],
  "attribs": {
    "company": "Example Co",
    "role": "Marketing Manager",
    "interests": ["product updates", "events"]
  }
}
```

## Consent Log

Every successful validation attempt writes an append-only JSONL entry to:

```text
data/consent-log.jsonl
```

This records email, name, source, consent text, custom attributes, timestamp, user agent, origin and Listmonk response status.

## Website Setup

Configure the signup form on your website or app to send a webhook or custom form submit to:

```text
https://subscribe.your-domain.com/api/subscribe
```

Recommended fields:

- `email`
- `firstName`
- `lastName`
- `pageUrl`
- `source`
- `consentText`
- `company`
- `role`
- `interests`

Add a hidden honeypot field named `website`, `honeypot`, or `_gotcha`. Real users leave it empty; spam bots often fill it.

## Production Notes

- Put the API behind HTTPS.
- Set `ALLOWED_ORIGINS` to the real website domains.
- Keep `CONSENT_LOG_PATH` on persistent storage.
- Monitor 4xx/5xx errors.
- Use Listmonk for campaigns, opens, clicks, unsubscribes and bounces.
