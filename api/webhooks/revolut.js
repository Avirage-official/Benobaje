/**
 * POST /api/webhooks/revolut
 *
 * Receives Revolut's payment webhooks. On ORDER_COMPLETED: marks the order
 * paid in Supabase, then creates the fulfilment order in Merchize.
 *
 * bodyParser is disabled below because signature verification needs the
 * exact raw bytes Revolut sent — parsing and re-serializing the JSON would
 * change the bytes and break the HMAC check.
 *
 * Set the webhook URL in your Revolut dashboard to:
 *   https://<your-domain>/api/webhooks/revolut
 */

const { getRawBody } = require("../../lib/http");
const { verifyRevolutSignature } = require("../../lib/revolut");
const { supabaseSelectOne, supabaseUpdate } = require("../../lib/supabase");
const { createMerchizeOrder } = require("../../lib/merchize");

module.exports.config = { api: { bodyParser: false } };

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.status(405).end();
    return;
  }

  const rawBody = await getRawBody(req);

  const valid = verifyRevolutSignature({
    rawBody: rawBody,
    signatureHeader: req.headers["revolut-signature"],
    timestampHeader: req.headers["revolut-request-timestamp"],
    secret: process.env.REVOLUT_WEBHOOK_SECRET
  });

  if (!valid) {
    console.warn("Revolut webhook: signature verification failed");
    res.status(401).end();
    return;
  }

  let event;
  try {
    event = JSON.parse(rawBody);
  } catch (err) {
    res.status(400).end();
    return;
  }

  // Acknowledge receipt fast — do the work, but always end with 200 once
  // the event is validated, so Revolut doesn't spend its retry budget on
  // an event we've already recorded. Failures past this point are logged
  // for manual follow-up rather than surfaced as a webhook failure.
  try {
    if (event.event === "ORDER_COMPLETED") {
      const revolutOrderId = event.order_id || (event.order && event.order.id);
      const order = await supabaseSelectOne("orders", { revolut_order_id: revolutOrderId });

      if (!order) {
        console.error("Revolut webhook: no matching order for", revolutOrderId);
      } else if (order.merchize_order_id) {
        // already processed — webhook retried, do nothing further
      } else {
        await supabaseUpdate(
          "orders",
          { external_ref: order.external_ref },
          { revolut_status: "paid", updated_at: new Date().toISOString() }
        );

        const shipping = order.shipping;
        const merchizeOrder = await createMerchizeOrder({
          externalId: order.external_ref,
          shipping: shipping,
          items: [{ variantCode: order.variant_code, quantity: order.quantity }]
        });

        await supabaseUpdate(
          "orders",
          { external_ref: order.external_ref },
          {
            merchize_order_id: merchizeOrder.id || merchizeOrder.order_id || null,
            merchize_status: "submitted",
            updated_at: new Date().toISOString()
          }
        );
      }
    }
  } catch (err) {
    console.error("Revolut webhook processing failed", err);
  }

  res.status(200).end();
};
