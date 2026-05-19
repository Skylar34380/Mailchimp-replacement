# Newsletter Platform Migration Plan

## Goal

Move newsletter subscribers and campaigns from a hosted email marketing platform to a self-hosted Listmonk-based stack.

The public website can stay wherever it is hosted. This project only replaces the newsletter subscription and campaign management layer.

## Target Architecture

```text
Website signup form
  -> subscribe-api
  -> Listmonk subscribers/lists
  -> SMTP provider
  -> recipient inbox
```

Optional later:

```text
Website/content updates
  -> admin dashboard or automation script
  -> newsletter draft generator
  -> Listmonk campaign API
```

## Phase 1: Local Proof Of Concept

1. Run the stack locally.
2. Create list: `Newsletter Updates`.
3. Add 3-5 test subscribers.
4. Configure test SMTP.
5. Send a test campaign.
6. Confirm unsubscribe works.

Exit criteria:

- Listmonk dashboard is accessible.
- Test email sends successfully.
- Unsubscribe link works.

## Phase 2: Contact Export

Export from the existing email platform:

- subscribed contacts
- unsubscribed contacts
- cleaned/bounced contacts
- tags/groups
- marketing permissions
- opt-in time/IP if available
- previous campaign HTML if needed

Rules:

- subscribed contacts can be imported as active/confirmed if consent is valid.
- unsubscribed contacts must not become active again.
- cleaned/bounced contacts should stay inactive or excluded.

## Phase 3: Production Listmonk

1. Deploy Listmonk and Postgres.
2. Put it behind HTTPS, for example `newsletter.example.com`.
3. Configure SMTP provider.
4. Set sender identity, footer address and unsubscribe template.
5. Import contacts.
6. Send test campaigns.

## Phase 4: Website Form Replacement

Change website signup form submission to the included `subscribe-api` middleware.

Recommended captured fields:

- email
- name
- source page
- timestamp
- consent text/version
- optional segmentation fields, such as interests, region, tags or product type

## Phase 5: Newsletter Workflow

1. Admin selects content or updates to share.
2. Admin writes or generates campaign subject and body.
3. Admin edits/approves.
4. Admin creates a draft campaign in Listmonk.
5. Admin sends from Listmonk.

## Campaign Analytics

Listmonk can track:

- campaign sends
- opens/views
- link clicks
- bounces
- unsubscribes
- subscriber status

Open tracking is never perfectly accurate because Apple Mail Privacy Protection and image blocking affect all email tools. Treat open rate as a directional metric and use click rate as a stronger engagement signal.
