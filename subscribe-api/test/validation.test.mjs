import test from "node:test";
import assert from "node:assert/strict";
import { normalizeSubscribeInput, validateSubscribeInput } from "../src/validation.mjs";

test("normalizes common website contact fields", () => {
  const input = normalizeSubscribeInput({
    firstName: " Ada ",
    lastName: " Lovelace ",
    email: " ADA@EXAMPLE.COM ",
    pageUrl: "https://www.example.com/newsletter",
    company: "Example Co",
    interests: "product,events",
  });

  assert.equal(input.name, "Ada Lovelace");
  assert.equal(input.email, "ada@example.com");
  assert.equal(input.source, "https://www.example.com/newsletter");
  assert.deepEqual(input.attributes, {
    company: "Example Co",
    interests: ["product", "events"],
    pageUrl: "https://www.example.com/newsletter",
  });
});

test("validates required email", () => {
  const errors = validateSubscribeInput(normalizeSubscribeInput({ email: "not-an-email" }));
  assert.equal(errors.length, 1);
  assert.equal(errors[0].field, "email");
});

test("rejects honeypot spam", () => {
  const errors = validateSubscribeInput(
    normalizeSubscribeInput({ email: "reader@example.com", website: "spam-value" })
  );
  assert.equal(errors.some((error) => error.field === "honeypot"), true);
});
