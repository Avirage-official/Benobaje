/**
 * One-time setup route — Revolut's dashboard doesn't expose webhook
 * creation on every account tier, so this registers it via their API
 * instead. Visit it once after deploying, then delete/ignore it (it's
 * safe to leave in place; re-running just creates another webhook — check
 * Revolut's dashboard/GET /webhooks if you run it more than once).
 *
 * Usage: GET https://<your-domain>/api/admin/register-revolut-webhook?key=<ADMIN_SETUP_KEY>
 *
 * Set ADMIN_SETUP_KEY yourself in Vercel env vars first — any random
 * string. It's just a lock so a stranger can't hit this URL and register
 * webhooks pointed at their own server.
 *
 * On success, copy the returned "signing_secret" into REVOLUT_WEBHOOK_SECRET
 * in Vercel, then redeploy.
 */

const { createRevolutWebhook } = require("../../lib/revolut");

module.exports = async (req, res) => {
  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const key = req.query && req.query.key;
  if (!process.env.ADMIN_SETUP_KEY || key !== process.env.ADMIN_SETUP_KEY) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const proto = req.headers["x-forwarded-proto"] || "https";
  const host = req.headers.host;
  const webhookUrl = proto + "://" + host + "/api/webhooks/revolut";

  try {
    const webhook = await createRevolutWebhook({
      url: webhookUrl,
      events: ["ORDER_COMPLETED"]
    });
    res.status(200).json({
      message: "Webhook created. Save signing_secret below as REVOLUT_WEBHOOK_SECRET in Vercel, then redeploy.",
      registeredUrl: webhookUrl,
      webhook: webhook
    });
  } catch (err) {
    console.error("register-revolut-webhook failed", err);
    res.status(500).json({ error: err.message });
  }
};
