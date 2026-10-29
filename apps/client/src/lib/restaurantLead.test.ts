import assert from "node:assert/strict";
import { test } from "node:test";
import {
  buildRestaurantLeadPayload,
  isRestaurantLeadAcknowledged,
  readRestaurantAttribution,
  restaurantCampaignHref,
  validateRestaurantLead,
  type RestaurantLeadValues,
} from "./restaurantLead";

const validLead: RestaurantLeadValues = {
  name: "Μαρία Παπαδοπούλου",
  company: "Το Καφέ",
  area: "Αθήνα",
  phone: "+30 210 1234567",
  email: "owner@example.com",
  role: "owner",
  platforms: ["efood", "Wolt"],
  goal: "reduce",
  fulfilment: "own",
  timing: "30-days",
  consent: true,
  website: "",
};

test("restaurant lead validates real qualification and excludes contradictory platform answers", () => {
  assert.equal(validateRestaurantLead(validLead).success, true);
  for (const patch of [
    { consent: false },
    { role: "" },
    { platforms: [] },
    { platforms: ["Καμία", "efood"] },
    { fulfilment: "" },
    { email: "invalid" },
    { phone: "123" },
    { phone: "call me tomorrow 1234567890" },
    { website: "https://spam.example" },
  ]) {
    assert.equal(validateRestaurantLead({ ...validLead, ...patch }).success, false, JSON.stringify(patch));
  }
});

test("campaign attribution includes only allowlisted bounded values and never query identifiers", () => {
  const attribution = readRestaurantAttribution(`?utm_source=google&utm_campaign=hello%0Aworld&utm_content=${"a".repeat(400)}&gclid=private&email=private@example.com&token=secret`, "/el/online-paraggelies?token=secret#form");
  assert.deepEqual(attribution, {
    landingPath: "/el/online-paraggelies",
    campaign: { utm_source: "google", utm_campaign: "hello world", utm_content: "a".repeat(100) },
  });
  assert.equal(JSON.stringify(attribution).includes("secret"), false);
  assert.deepEqual(readRestaurantAttribution("", "https://external.example"), { landingPath: "/", campaign: {} });
});

test("campaign links preserve destination query/hash but do not leak attribution to external links", () => {
  assert.equal(restaurantCampaignHref("/el/online-paraggelies?demo=1#axiologisi", "?utm_source=meta&gclid=secret"), "/el/online-paraggelies?demo=1&utm_source=meta#axiologisi");
  assert.equal(restaurantCampaignHref("https://example.com/demo", "?utm_source=meta"), "https://example.com/demo");
  assert.equal(restaurantCampaignHref("//example.com/demo", "?utm_source=meta"), "//example.com/demo");
});

test("contact payload stays inside existing backend limits and carries readable business qualification", () => {
  const payload = buildRestaurantLeadPayload(validLead, "transition", readRestaurantAttribution("?utm_campaign=delivery_switch", "/el/meiosi-kostous-delivery"));
  assert.deepEqual(Object.keys(payload), ["name", "email", "subject", "message"]);
  assert.match(payload.message, /Στόχος: Θέλω περισσότερες απευθείας παραγγελίες/);
  assert.match(payload.message, /Πλατφόρμες: efood, Wolt/);
  assert.match(payload.message, /utm_campaign: delivery_switch/);
  assert.ok(payload.message.length <= 5000);
  assert.ok(payload.subject.length <= 200);
  const largest = buildRestaurantLeadPayload({ ...validLead, company: "α".repeat(150), name: "α".repeat(100), area: "α".repeat(100) }, "ordering", {
    landingPath: `/${"x".repeat(500)}`,
    campaign: { utm_source: "x".repeat(1000), utm_campaign: "x".repeat(1000), utm_medium: "x".repeat(1000), utm_content: "x".repeat(1000), utm_term: "x".repeat(1000) },
  });
  assert.ok(largest.message.length <= 5000);
  assert.ok(largest.subject.length <= 200);
});

test("success requires a positive acknowledgement, not merely HTTP 200", () => {
  assert.equal(isRestaurantLeadAcknowledged(true, { success: true }), true);
  for (const payload of [null, "<html>Site fallback</html>", {}, { ok: true }, { success: false }, { success: "true" }]) {
    assert.equal(isRestaurantLeadAcknowledged(true, payload), false);
  }
  assert.equal(isRestaurantLeadAcknowledged(false, { success: true }), false);
});
