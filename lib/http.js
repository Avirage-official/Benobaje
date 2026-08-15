/**
 * Reads the exact raw request body as a string. Needed for webhook
 * signature verification (HMAC must be computed over the untouched bytes
 * Revolut sent, not a re-serialized JSON.parse/stringify copy).
 */
async function getRawBody(req) {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks).toString("utf8");
}

function sendJson(res, status, body) {
  res.status(status).setHeader("Content-Type", "application/json").send(JSON.stringify(body));
}

module.exports = { getRawBody, sendJson };
