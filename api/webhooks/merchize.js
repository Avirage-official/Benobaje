/**
 * POST /api/webhooks/merchize
 *
 * Receives Merchize's fulfilment status webhooks (order accepted, shipped,
 * tracking added, etc.) and updates the matching Supabase order row.
 *
 * NOTE ON ACCURACY: Merchize's docs (as shared) cover auth + retry rules
 * but not the exact event payload shape. The field lookups below try a
 * handful of plausible names (external_id / order_id / status / tracking)
 * defensively — check the actual payload Merchize sends (log it once, or
 * check their Events reference) and tighten this once confirmed.
 *
 * Set the webhook URL in your Merchize dashboard to:
 *   https://<your-domain>/api/webhooks/merchize
 *
 * Retry rule per Merchize: up to 5 attempts/day over 3 days, and they
 * expect an HTTP 200 — so this responds 200 as soon as the key is valid
 * and the update is applied, matching that contract.
 */

const { supabaseSelectOne, supabaseUpdate } = require("../../lib/supabase");

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.status(405).end();
    return;
  }

  const providedKey = req.headers["merchize-webhook-key"];
  if (!providedKey || providedKey !== process.env.MERCHIZE_WEBHOOK_KEY) {
    console.warn("Merchize webhook: invalid or missing merchize-webhook-key header");
    res.status(401).end();
    return;
  }

  const event = req.body || {};

  try {
    const externalId = event.external_id || (event.order && event.order.external_id);
    const merchizeOrderId = event.order_id || event.id || (event.order && event.order.id);
    const status = event.status || event.fulfillment_status || (event.order && event.order.status);
    const trackingNumber = event.tracking_number || (event.tracking && event.tracking.number);
    const trackingUrl = event.tracking_url || (event.tracking && event.tracking.url);

    const order = externalId
      ? await supabaseSelectOne("orders", { external_ref: externalId })
      : merchizeOrderId
      ? await supabaseSelectOne("orders", { merchize_order_id: merchizeOrderId })
      : null;

    if (!order) {
      console.error("Merchize webhook: no matching order for", externalId || merchizeOrderId);
    } else {
      const patch = { updated_at: new Date().toISOString() };
      if (status) patch.merchize_status = status;
      if (trackingNumber) patch.tracking_number = trackingNumber;
      if (trackingUrl) patch.tracking_url = trackingUrl;
      if (merchizeOrderId && !order.merchize_order_id) patch.merchize_order_id = merchizeOrderId;

      await supabaseUpdate("orders", { external_ref: order.external_ref }, patch);
    }
  } catch (err) {
    console.error("Merchize webhook processing failed", err);
  }

  res.status(200).end();
};
