/**
 * POST /api/create-order
 *
 * Body: {
 *   productId, variantCode, quantity,
 *   customer:  { email, firstName, lastName, phone },
 *   shipping:  { address1, address2, city, region, postcode, countryCode }
 * }
 *
 * Looks the product up server-side (never trusts a price from the client),
 * creates a Revolut order for that amount, records a "pending_payment" row
 * in Supabase, and returns what the browser needs to mount the Revolut
 * Checkout widget.
 */

const crypto = require("crypto");
const { getVariant } = require("../lib/products");
const { createRevolutOrder } = require("../lib/revolut");
const { supabaseInsert } = require("../lib/supabase");

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    const body = req.body || {};
    const { productId, variantCode, customer, shipping } = body;
    const quantity = Math.max(1, parseInt(body.quantity, 10) || 1);

    const found = getVariant(productId, variantCode);
    if (!found) {
      res.status(400).json({ error: "Unknown product or variant" });
      return;
    }
    if (!customer || !customer.email || !shipping || !shipping.address1 || !shipping.countryCode) {
      res.status(400).json({ error: "Missing customer or shipping details" });
      return;
    }

    const { product, variant } = found;
    const amountMinor = variant.amountMinor * quantity;
    const externalRef = "tyco_" + crypto.randomUUID();

    const revolutOrder = await createRevolutOrder({
      amountMinor,
      currency: product.currency,
      externalRef,
      email: customer.email
    });

    await supabaseInsert("orders", {
      external_ref: externalRef,
      product_id: product.id,
      variant_code: variant.code,
      quantity: quantity,
      currency: product.currency,
      amount_minor: amountMinor,
      customer: customer,
      shipping: shipping,
      revolut_order_id: revolutOrder.id,
      revolut_status: "pending_payment"
    });

    res.status(200).json({
      externalRef: externalRef,
      revolutToken: revolutOrder.token,
      revolutPublicId: revolutOrder.public_id,
      revolutMode: process.env.REVOLUT_MODE === "prod" ? "prod" : "sandbox"
    });
  } catch (err) {
    console.error("create-order failed", err);
    res.status(500).json({ error: "Could not start checkout. Please try again." });
  }
};
