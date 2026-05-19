const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function normalizeSubscribeInput(input = {}) {
  const firstName = clean(input.firstName ?? input.first_name ?? "");
  const lastName = clean(input.lastName ?? input.last_name ?? "");
  const suppliedName = clean(input.name ?? "");
  const email = clean(input.email ?? "").toLowerCase();

  const name = suppliedName || [firstName, lastName].filter(Boolean).join(" ");
  const source = clean(input.source ?? input.page ?? input.pageUrl ?? input.page_url ?? "website");
  const consentText = clean(
    input.consentText ??
      input.consent_text ??
      input.consent ??
      "I agree to receive newsletter updates."
  );
  const attributes = pruneEmpty({
    company: clean(input.company ?? input.organization ?? ""),
    role: clean(input.role ?? input.jobTitle ?? input.job_title ?? ""),
    interests: cleanList(input.interests ?? input.interest ?? input.tags ?? ""),
    pageUrl: clean(input.pageUrl ?? input.page_url ?? ""),
  });

  return {
    email,
    name,
    source,
    consentText,
    attributes,
    honeypot: clean(input.website ?? input.honeypot ?? input._gotcha ?? ""),
  };
}

export function validateSubscribeInput(input) {
  const errors = [];

  if (!input.email) {
    errors.push({ field: "email", message: "Email is required." });
  } else if (!emailPattern.test(input.email)) {
    errors.push({ field: "email", message: "Email is invalid." });
  }

  if (input.honeypot) {
    errors.push({ field: "honeypot", message: "Spam submission rejected." });
  }

  return errors;
}

function clean(value) {
  return String(value ?? "").trim().slice(0, 500);
}

function cleanList(value) {
  if (Array.isArray(value)) {
    return value.map((item) => clean(item)).filter(Boolean);
  }

  return clean(value)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function pruneEmpty(input) {
  return Object.fromEntries(
    Object.entries(input).filter(([, value]) =>
      Array.isArray(value) ? value.length > 0 : Boolean(value)
    )
  );
}
