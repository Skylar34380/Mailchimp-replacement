import test from "node:test";
import assert from "node:assert/strict";
import { normalizeSubscribeInput, validateSubscribeInput } from "../src/validation.mjs";

test("normalizes Wix-style contact fields", () => {
  const input = normalizeSubscribeInput({
    firstName: " Ada ",
    lastName: " Lovelace ",
    email: " ADA@EXAMPLE.COM ",
    pageUrl: "https://www.ommelb.com.au/",
    suburb: "Yarraville",
  });

  assert.equal(input.name, "Ada Lovelace");
  assert.equal(input.email, "ada@example.com");
  assert.equal(input.source, "https://www.ommelb.com.au/");
  assert.equal(input.suburbPreference, "Yarraville");
});

test("validates required email", () => {
  const errors = validateSubscribeInput(normalizeSubscribeInput({ email: "not-an-email" }));
  assert.equal(errors.length, 1);
  assert.equal(errors[0].field, "email");
});

test("rejects honeypot spam", () => {
  const errors = validateSubscribeInput(
    normalizeSubscribeInput({ email: "buyer@example.com", website: "spam-company" })
  );
  assert.equal(errors.some((error) => error.field === "honeypot"), true);
});
