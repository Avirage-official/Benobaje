/**
 * Revolut Merchant API helpers — order creation + webhook signature check.
 *
 * NOTE ON ACCURACY: this is built from Revolut's public developer docs
 * (developer.revolut.com/docs/merchant) — the order-creation field names in
 * particular are Revolut's documented shape as of writing, but Revolut runs
 * both a "legacy" and a current Merchant API side by side. Confirm the
 * request/response fields against your own Business dashboard → API docs
 * before going live, and adjust createRevolutOrder() if anything differs.
 *
 * Env vars (Vercel → Project → Settings → Environment Variables):
 *   REVOLUT_SECRET_KEY     — server-side secret API key, used to create orders
 *   REVOLUT_PUBLIC_KEY     — public key, safe to expose to the browser,
 *                            used to mount the Checkout widget client-side
 *   REVOLUT_WEBHOOK_SECRET — signing secret shown when you create the
 *                            webhook in the Revolut dashboard
 *   REVOLUT_MODE           — "sandbox" or "prod" (defaults to "sandbox")
 *   REVOLUT_API_BASE_URL   — optional override if Revolut's base URL for
 *                            your account differs from the defaults below
 */

const crypto = require("crypto");

function apiBase() {
  if (process.env.REVOLUT_API_BASE_URL) {
    return process.env.REVOLUT_API_BASE_URL.replace(/\/+$/, "");
  }
  const mode = process.env.REVOLUT_MODE || "sandbox";
  return mode === "prod"
    ? "https://merchant.revolut.com/api/1.0"
    : "https://sandbox-merchant.revolut.com/api/1.0";
}

/**
 * Creates a Revolut order. amountMinor is the charge in the currency's
 * smallest unit (e.g. cents) — never trust this from the client, it must
 * come from the server-side product catalog (lib/products.js).
 */
async function createRevolutOrder({ amountMinor, currency, externalRef, email }) {
  const res = await fetch(apiBase() + "/orders", {
    method: "POST",
    headers: {
      Authorization: "Bearer " + process.env.REVOLUT_SECRET_KEY,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      amount: amountMinor,
      currency: currency,
      merchant_order_ext_ref: externalRef,
      capture_mode: "AUTOMATIC",
      customer_email: email
    })
  });

  if (!res.ok) {
    throw new Error("Revolut order creation failed: " + res.status + " " + (await res.text()));
  }
  return res.json(); // expected: { id, token, public_id, state, ... }
}

/**
 * Registers a webhook with Revolut — there's no dashboard UI for this on
 * some account tiers, so it's done via the API instead (see
 * api/admin/register-revolut-webhook.js, meant to be hit once).
 * Returns { id, signing_secret, ... } — save signing_secret as
 * REVOLUT_WEBHOOK_SECRET in Vercel.
 */
async function createRevolutWebhook({ url, events }) {
  const res = await fetch(apiBase() + "/webhooks", {
    method: "POST",
    headers: {
      Authorization: "Bearer " + process.env.REVOLUT_SECRET_KEY,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ url, events })
  });
  if (!res.ok) {
    throw new Error("Revolut webhook creation failed: " + res.status + " " + (await res.text()));
  }
  return res.json();
}

function timingSafeEqual(a, b) {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

/**
 * Verifies the Revolut-Signature header against the raw request body.
 * rawBody MUST be the exact bytes Revolut sent — do not use a re-serialized
 * JSON.parse(...) then JSON.stringify(...) copy, the signature won't match.
 */
function verifyRevolutSignature({ rawBody, signatureHeader, timestampHeader, secret }) {
  if (!signatureHeader || !timestampHeader || !secret) return false;

  let timestamp = parseInt(timestampHeader, 10);
  if (!Number.isFinite(timestamp)) return false;
  if (timestamp < 1e12) timestamp *= 1000; // tolerate seconds vs. milliseconds

  const fiveMinutesMs = 5 * 60 * 1000;
  if (Math.abs(Date.now() - timestamp) > fiveMinutesMs) return false; // replay window

  const payloadToSign = "v1." + timestampHeader + "." + rawBody;
  const expected = "v1=" + crypto.createHmac("sha256", secret).update(payloadToSign).digest("hex");

  // header can carry multiple comma-separated signatures during secret rotation
  return signatureHeader
    .split(",")
    .map((s) => s.trim())
    .some((sig) => sig.length === expected.length && timingSafeEqual(sig, expected));
}

module.exports = { createRevolutOrder, createRevolutWebhook, verifyRevolutSignature, apiBase };
