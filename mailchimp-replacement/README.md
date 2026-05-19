# OMM Mailchimp Replacement With Listmonk

This folder is a starter setup for replacing Mailchimp with [listmonk](https://github.com/knadh/listmonk), a self-hosted newsletter and mailing list manager.

## Why Listmonk

- Open source newsletter manager
- Self-hosted with Postgres
- Built-in subscribers, lists, campaigns, templates, imports and unsubscribe handling
- REST APIs for integrating Wix forms or a future OMM admin dashboard

## Run Locally

```bash
cd mailchimp-replacement
cp .env.example .env
docker compose up -d
```

If Docker says it cannot connect to the Docker daemon, open Docker Desktop first and wait until it says Docker is running.

Then open:

```text
http://localhost:9000
```

The subscribe API runs at:

```text
http://localhost:8787
```

## First Setup Checklist

1. Change `LISTMONK_ADMIN_PASSWORD` and `POSTGRES_PASSWORD` in `.env`.
2. Open `http://localhost:9000`.
3. Create or confirm the admin account.
4. Create a public list, for example `OMM Property Updates`.
5. Configure SMTP in listmonk settings:
   - low-cost option: Amazon SES
   - simpler option: Postmark, Mailgun, SMTP2GO or another SMTP provider
6. Import Mailchimp contacts.
7. Test subscribe, unsubscribe and a test campaign before sending anything real.

## Wix Integration Options

### Option A: Direct Public Subscription API

Point the Wix signup form to listmonk's public subscription endpoint:

```text
POST https://newsletter.your-domain.com/api/public/subscription
```

Payload:

```json
{
  "email": "buyer@example.com",
  "name": "Buyer Name",
  "list_uuids": ["LIST_UUID_FROM_LISTMONK"]
}
```

This is the fastest path if Wix lets the form submit to an external endpoint.

### Option B: Small Middleware API

Use a tiny API between Wix and listmonk:

```text
Wix form -> /api/subscribe -> listmonk
```

This gives you:

- spam protection
- logging
- consent capture
- source tracking
- better error messages
- room for AI workflows later

This repo now includes that service in:

```text
../subscribe-api
```

Docker Compose starts it as `subscribe-api`, available locally at:

```text
http://localhost:8787/api/wix/subscribe
```

## Mailchimp Migration Checklist

1. Export Mailchimp contacts.
2. Preserve statuses:
   - subscribed -> confirmed/enabled
   - unsubscribed -> unsubscribed or blocklisted
   - cleaned -> do not re-send unless manually reviewed
3. Preserve consent fields:
   - opt-in time
   - opt-in IP
   - marketing permissions
   - source/tag
4. Import into listmonk.
5. Send a small internal test campaign.
6. Send to a tiny real segment first.

## Australia Compliance Notes

For commercial email in Australia, keep:

- consent evidence
- sender identity and contact details
- clear unsubscribe link
- unsubscribe requests honoured within 5 working days

Do not import unsubscribed Mailchimp contacts as active subscribers.

## Production Hosting

Possible hosting paths:

- VPS with Docker Compose, Caddy and HTTPS
- Railway / Northflank / PikaPods / similar container hosting
- AWS EC2 or Lightsail + Amazon SES

For your friend, the most economical production setup is usually:

```text
listmonk on a small VPS + Amazon SES
```

Keep regular Postgres backups.
