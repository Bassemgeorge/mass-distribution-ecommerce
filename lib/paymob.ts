import { createHmac, timingSafeEqual } from "crypto";

// Paymob "transaction processed" HMAC fields — order is fixed by Paymob's spec.
// booleans must be sent as the string "true" or "false".
function buildHmacString(values: (unknown)[]): string {
  return values
    .map((v) => (v == null ? "" : String(v)))
    .join("");
}

function computeHmac(str: string, secret: string): string {
  return createHmac("sha512", secret).update(str, "utf8").digest("hex");
}

function safeCompare(a: string, b: string): boolean {
  try {
    const ba = Buffer.from(a, "utf8");
    const bb = Buffer.from(b, "utf8");
    if (ba.length !== bb.length) return false;
    return timingSafeEqual(ba, bb);
  } catch {
    return false;
  }
}

/**
 * Verify HMAC from a Paymob webhook POST.
 * @param obj  body.obj from the webhook payload
 * @param hmac the `hmac` query-string parameter from the webhook URL
 */
export function verifyWebhookHmac(obj: Record<string, unknown>, hmac: string): boolean {
  const secret = process.env.PAYMOB_HMAC_SECRET;
  if (!secret || !hmac) return false;

  const order = (obj.order ?? {}) as Record<string, unknown>;
  const sd = (obj.source_data ?? {}) as Record<string, unknown>;

  const str = buildHmacString([
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

  const expected = computeHmac(str, secret);
  return safeCompare(expected, hmac.toLowerCase());
}

/**
 * Verify HMAC from a Paymob redirect GET.
 * @param params URLSearchParams from the redirect URL
 */
export function verifyRedirectHmac(params: URLSearchParams): boolean {
  const secret = process.env.PAYMOB_HMAC_SECRET;
  if (!secret) return false;

  const hmac = params.get("hmac") ?? "";
  if (!hmac) return false;

  const str = buildHmacString([
    params.get("amount_cents"),
    params.get("created_at"),
    params.get("currency"),
    params.get("error_occured"),
    params.get("has_parent_transaction"),
    params.get("id"),
    params.get("integration_id"),
    params.get("is_3d_secure"),
    params.get("is_auth"),
    params.get("is_capture"),
    params.get("is_refunded"),
    params.get("is_standalone_payment"),
    params.get("is_voided"),
    params.get("order"),
    params.get("owner"),
    params.get("pending"),
    params.get("source_data.pan"),
    params.get("source_data.sub_type"),
    params.get("source_data.type"),
    params.get("success"),
  ]);

  const expected = computeHmac(str, secret);
  return safeCompare(expected, hmac.toLowerCase());
}

// ---------------------------------------------------------------------------
// Internal helpers exposed for testing only
// ---------------------------------------------------------------------------
export { buildHmacString, computeHmac };
