# Newsletter Stack With Listmonk

This folder runs the full local newsletter stack:

```text
subscribe-api + Listmonk + Postgres
```

## Services

- `subscribe-api`: receives website subscription form submissions
- `listmonk`: manages subscribers, lists, campaigns, analytics and unsubscribes
- `postgres`: Listmonk database

## Run Locally

```bash
cd newsletter-stack
cp .env.example .env
docker compose up -d --build
```

If Docker says it cannot connect to the Docker daemon, open Docker Desktop first and wait until it says Docker is running.

Then open:

```text
Listmonk:      http://localhost:9000
Subscribe API: http://localhost:8787/health
```

## First Setup Checklist

1. Change `LISTMONK_ADMIN_PASSWORD` and `POSTGRES_PASSWORD` in `.env`.
2. Open `http://localhost:9000`.
3. Create or confirm the admin account.
4. Create a public list, for example `Newsletter Updates`.
5. Copy the list UUID.
6. Put the UUID in `.env` as `LISTMONK_LIST_UUIDS`.
7. Set `LISTMONK_DRY_RUN=false`.
8. Configure SMTP in Listmonk settings:
   - low-cost option: Amazon SES
   - simpler option: Postmark, Mailgun, SMTP2GO or another SMTP provider
9. Test subscribe, unsubscribe and a test campaign before sending anything real.

## Website Integration

Point your website signup form to the subscribe API:

```text
POST https://subscribe.your-domain.com/api/subscribe
```

Example payload:

```json
{
  "email": "reader@example.com",
  "name": "Reader Name",
  "source": "website-home",
  "consentText": "I agree to receive newsletter updates."
}
```

## Existing Contact Migration

If you are migrating from another email platform:

1. Export subscribed contacts.
2. Preserve unsubscribed, cleaned and bounced statuses.
3. Do not import unsubscribed contacts as active subscribers.
4. Preserve consent fields when available:
   - opt-in time
   - opt-in IP
   - marketing permissions
   - source/tag
5. Import active contacts into Listmonk.
6. Send a small internal test campaign.
7. Send to a tiny real segment first.

## Production Hosting

Possible hosting paths:

- VPS with Docker Compose, Caddy and HTTPS
- Railway / Northflank / PikaPods / similar container hosting
- AWS EC2 or Lightsail + Amazon SES

For a low-cost production setup:

```text
Listmonk on a small VPS + Amazon SES
```

Keep regular Postgres backups.
