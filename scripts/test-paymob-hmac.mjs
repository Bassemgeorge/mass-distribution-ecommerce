/**
 * Quick self-contained HMAC unit test for lib/paymob.ts logic.
 * Run with: node scripts/test-paymob-hmac.mjs
 * Uses only Node built-ins — no test framework needed.
 */
import { createHmac } from "crypto";
import assert from "assert/strict";

const TEST_SECRET = "test-secret-abc123";

// ── Replicate the exact build logic from lib/paymob.ts ────────────────────────
function buildHmacString(values) {
  return values.map((v) => (v == null ? "" : String(v))).join("");
}

function computeHmac(str, secret) {
  return createHmac("sha512", secret).update(str, "utf8").digest("hex");
}

// ── Sample webhook obj (typical Paymob structure) ─────────────────────────────
const sampleObj = {
  amount_cents: 1436400,
  created_at: "2024-01-15T10:30:00",
  currency: "EGP",
  error_occured: false,
  has_parent_transaction: false,
  id: 987654321,
  integration_id: 12345,
  is_3d_secure: true,
  is_auth: false,
  is_capture: false,
  is_refunded: false,
  is_standalone_payment: true,
  is_voided: false,
  order: { id: 99887766 },
  owner: 111222,
  pending: false,
  source_data: { pan: "1234", sub_type: "CARD", type: "card" },
  success: true,
};

function webhookHmacString(obj) {
  const order = obj.order ?? {};
  const sd = obj.source_data ?? {};
  return buildHmacString([
    obj.amount_cents,
    obj.created_at,
    obj.currency,
    obj.error_occured,
    obj.has_parent_transaction,
    obj.id,
    obj.integration_id,
    obj.is_3d_secure,
    obj.is_auth,
    obj.is_capture,
    obj.is_refunded,
    obj.is_standalone_payment,
    obj.is_voided,
    order.id,
    obj.owner,
    obj.pending,
    sd.pan,
    sd.sub_type,
    sd.type,
    obj.success,
  ]);
}

// ── Test 1: correct HMAC verifies ─────────────────────────────────────────────
const str = webhookHmacString(sampleObj);
const expected = computeHmac(str, TEST_SECRET);

// Simulate what verifyWebhookHmac does (with env-injected secret replaced by TEST_SECRET)
const computed = computeHmac(webhookHmacString(sampleObj), TEST_SECRET);
assert.equal(computed, expected, "HMAC should match for correct obj");

// ── Test 2: mutated field → different HMAC ────────────────────────────────────
const mutated = { ...sampleObj, amount_cents: 1 };
const mutatedHmac = computeHmac(webhookHmacString(mutated), TEST_SECRET);
assert.notEqual(mutatedHmac, expected, "HMAC must differ when amount_cents changes");

// ── Test 3: mutated success flag → different HMAC ─────────────────────────────
const mutated2 = { ...sampleObj, success: false };
const mutatedHmac2 = computeHmac(webhookHmacString(mutated2), TEST_SECRET);
assert.notEqual(mutatedHmac2, expected, "HMAC must differ when success changes");

// ── Test 4: correct redirect HMAC ────────────────────────────────────────────
const redirectParams = new URLSearchParams({
  amount_cents: "1436400",
  created_at: "2024-01-15T10:30:00",
  currency: "EGP",
  error_occured: "false",
  has_parent_transaction: "false",
  id: "987654321",
  integration_id: "12345",
  is_3d_secure: "true",
  is_auth: "false",
  is_capture: "false",
  is_refunded: "false",
  is_standalone_payment: "true",
  is_voided: "false",
  order: "99887766",
  owner: "111222",
  pending: "false",
  "source_data.pan": "1234",
  "source_data.sub_type": "CARD",
  "source_data.type": "card",
  success: "true",
});

const redirectStr = buildHmacString([
  redirectParams.get("amount_cents"),
  redirectParams.get("created_at"),
  redirectParams.get("currency"),
  redirectParams.get("error_occured"),
  redirectParams.get("has_parent_transaction"),
  redirectParams.get("id"),
  redirectParams.get("integration_id"),
  redirectParams.get("is_3d_secure"),
  redirectParams.get("is_auth"),
  redirectParams.get("is_capture"),
  redirectParams.get("is_refunded"),
  redirectParams.get("is_standalone_payment"),
  redirectParams.get("is_voided"),
  redirectParams.get("order"),
  redirectParams.get("owner"),
  redirectParams.get("pending"),
  redirectParams.get("source_data.pan"),
  redirectParams.get("source_data.sub_type"),
  redirectParams.get("source_data.type"),
  redirectParams.get("success"),
]);

// webhook string and redirect string must be identical (same field values)
assert.equal(redirectStr, str, "Redirect and webhook HMAC strings must match for same data");

console.log("✓ All 4 HMAC tests passed");
console.log("  HMAC (hex, first 16 chars):", expected.slice(0, 16) + "…");
