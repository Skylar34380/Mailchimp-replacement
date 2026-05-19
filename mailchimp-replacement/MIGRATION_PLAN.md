# Mailchimp To Listmonk Migration Plan For OMM

## Goal

Replace Mailchimp while keeping the Wix website live.

Wix remains responsible for the website and property pages. Listmonk replaces Mailchimp for newsletters, subscriber lists and campaigns.

## Target Architecture

```text
Wix signup/contact form
  -> listmonk public subscription endpoint
  -> Listmonk subscribers/lists
  -> SMTP provider
  -> recipient inbox
```

Optional later:

```text
Wix/CSV property updates
  -> OMM AI admin dashboard
  -> newsletter draft generator
  -> listmonk campaign API
```

## Phase 1: Local Proof Of Concept

1. Run listmonk locally.
2. Create list: `OMM Property Updates`.
3. Add 3-5 test subscribers.
4. Configure test SMTP.
5. Send a test campaign.
6. Confirm unsubscribe works.

Exit criteria:

- Friend can see listmonk dashboard.
- Test email sends successfully.
- Unsubscribe link works.

## Phase 2: Mailchimp Export

Export:

- subscribed contacts
- unsubscribed contacts
- cleaned contacts
- tags/groups
- marketing permissions
- opt-in time/IP if available
- previous campaign HTML if needed

Rules:

- subscribed contacts can be imported as active/confirmed if consent is valid.
- unsubscribed contacts must not become active again.
- cleaned/bounced contacts should stay inactive or excluded.

## Phase 3: Production Listmonk

1. Deploy listmonk and Postgres.
2. Put it behind HTTPS, for example `newsletter.ommelb.com.au`.
3. Configure SMTP provider.
4. Set sender identity, footer address and unsubscribe template.
5. Import contacts.
6. Send test campaigns.

## Phase 4: Wix Form Replacement

Change Wix signup form submission:

- direct to listmonk public subscription endpoint, or
- to the included `subscribe-api` middleware, which is the recommended path.

Recommended captured fields:

- email
- name
- source page
- timestamp
- consent text/version
- preferred suburbs or project type, if useful

## Phase 5: AI Newsletter Workflow

Add a small admin tool:

1. Admin selects recent property projects.
2. AI generates campaign subject and body.
3. Admin edits/approves.
4. Tool creates draft campaign in listmonk.
5. Admin sends from listmonk.

This creates a strong AI-agent portfolio project without replacing Wix immediately.

## Campaign Analytics

Listmonk replaces the Mailchimp dashboard for this use case:

- campaign sends
- opens/views
- link clicks
- bounces
- unsubscribes
- subscriber status

Open tracking is never perfectly accurate because Apple Mail Privacy Protection and image blocking affect all email tools, including Mailchimp. Treat open rate as a directional metric and use click rate as a stronger engagement signal.
