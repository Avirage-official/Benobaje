/**
 * Merchize API helper — creates a fulfilment order once a Revolut payment
 * has been confirmed.
 *
 * NOTE ON ACCURACY: Merchize gives each store its own base URL (Merchize
 * dashboard → API), so MERCHIZE_API_BASE_URL below is required, not
 * guessed. The request field names (external_id, shipping fields, items[])
 * follow Merchize's documented order-import shape, but you have the fuller
 * reference doc they sent you — check createMerchizeOrder()'s payload
 * against it and adjust field names if anything differs before going live.
 *
 * Env vars (Vercel → Project → Settings → Environment Variables):
 *   MERCHIZE_API_BASE_URL — your store's base URL, from the Merchize
 *                            dashboard's API page (looks like
 *                            https://<something>.merchize.com)
 *   MERCHIZE_ACCESS_TOKEN — Bearer access token, same dashboard page
 *   MERCHIZE_WEBHOOK_KEY  — the value Merchize sends in the
 *                            merchize-webhook-key header on webhook calls
 */

function baseUrl() {
  const url = process.env.MERCHIZE_API_BASE_URL;
  if (!url) throw new Error("MERCHIZE_API_BASE_URL is not set");
  return url.replace(/\/+$/, "");
}

/**
 * shipping: { email, firstName, lastName, address1, address2, city,
 *             region, postcode, countryCode, phone }
 * items: [{ variantCode, quantity }]
 */
async function createMerchizeOrder({ externalId, shipping, items }) {
  const res = await fetch(baseUrl() + "/api/beta/orders", {
    method: "POST",
    headers: {
      Authorization: "Bearer " + process.env.MERCHIZE_ACCESS_TOKEN,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      external_id: externalId,
      is_test: process.env.MERCHIZE_MODE !== "live",
      shipping_method: "standard",
      shipping: {
        email: shipping.email,
        firstname: shipping.firstName,
        lastname: shipping.lastName,
        address_1: shipping.address1,
        address_2: shipping.address2 || "",
        city: shipping.city,
        region: shipping.region,
        postcode: shipping.postcode,
        country_id: shipping.countryCode,
        telephone: shipping.phone
      },
      items: items.map((item) => ({
        variant_code: item.variantCode,
        quantity: item.quantity
      }))
    })
  });

  if (!res.ok) {
    throw new Error("Merchize order creation failed: " + res.status + " " + (await res.text()));
  }
  return res.json();
}

module.exports = { createMerchizeOrder };
