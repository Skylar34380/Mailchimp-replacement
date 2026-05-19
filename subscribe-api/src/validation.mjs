const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function normalizeSubscribeInput(input = {}) {
  const firstName = clean(input.firstName ?? input.first_name ?? "");
  const lastName = clean(input.lastName ?? input.last_name ?? "");
  const suppliedName = clean(input.name ?? "");
  const email = clean(input.email ?? "").toLowerCase();

  const name = suppliedName || [firstName, lastName].filter(Boolean).join(" ");
  const source = clean(input.source ?? input.page ?? input.pageUrl ?? input.page_url ?? "wix");
  const consentText = clean(
    input.consentText ??
      input.consent_text ??
      input.consent ??
      "I agree to receive property updates from Off Market Melbourne."
  );

  return {
    email,
    name,
    source,
    consentText,
    suburbPreference: clean(input.suburbPreference ?? input.suburb ?? ""),
    projectTypePreference: clean(input.projectTypePreference ?? input.projectType ?? input.project_type ?? ""),
    honeypot: clean(input.website ?? input.company ?? input.honeypot ?? ""),
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
