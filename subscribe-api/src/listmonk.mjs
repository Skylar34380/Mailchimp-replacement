export async function subscribeToListmonk({ config, subscriber, requestMeta }) {
  const payload = {
    email: subscriber.email,
    name: subscriber.name,
    list_uuids: config.listUuids,
  };

  if (Object.keys(subscriber.attributes).length) {
    payload.attribs = subscriber.attributes;
  }

  if (config.dryRun) {
    return {
      ok: true,
      dryRun: true,
      status: 200,
      listmonkPayload: payload,
    };
  }

  if (!config.listUuids.length) {
    return {
      ok: false,
      status: 500,
      error: "LISTMONK_LIST_UUIDS is not configured.",
    };
  }

  const response = await fetch(`${config.listmonkUrl}/api/public/subscription`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "user-agent": "newsletter-subscribe-api/0.1",
    },
    body: JSON.stringify(payload),
  });

  const text = await response.text();
  let body;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = { raw: text };
  }

  return {
    ok: response.ok,
    status: response.status,
    body,
    requestMeta,
  };
}
