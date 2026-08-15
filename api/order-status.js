/**
 * GET /api/order-status?ref=tyco_xxxxxxxx
 *
 * Used by shop/order-confirmed.html to show live status without exposing
 * the full order row (customer/shipping details) to the browser.
 */

const { supabaseSelectOne } = require("../lib/supabase");

module.exports = async (req, res) => {
  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const ref = req.query && req.query.ref;
  if (!ref) {
    res.status(400).json({ error: "Missing ref" });
    return;
  }

  try {
    const order = await supabaseSelectOne("orders", { external_ref: ref });
    if (!order) {
      res.status(404).json({ error: "Order not found" });
      return;
    }
    res.status(200).json({
      externalRef: order.external_ref,
      revolutStatus: order.revolut_status,
      merchizeStatus: order.merchize_status,
      trackingNumber: order.tracking_number,
      trackingUrl: order.tracking_url
    });
  } catch (err) {
    console.error("order-status failed", err);
    res.status(500).json({ error: "Could not load order status" });
  }
};
