/**
 * Minimal Supabase REST (PostgREST) client — no @supabase/supabase-js
 * dependency, just fetch. Keeps this repo dependency-free like the rest of
 * the site. Uses the service role key, so this file must only ever be
 * imported from server-side code (api/**), never shipped to the browser.
 *
 * Env vars required (set in Vercel → Project → Settings → Environment
 * Variables): SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 */

function supabaseHeaders(extra) {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  return Object.assign(
    {
      apikey: key,
      Authorization: "Bearer " + key,
      "Content-Type": "application/json"
    },
    extra || {}
  );
}

function baseUrl() {
  const url = process.env.SUPABASE_URL;
  if (!url) throw new Error("SUPABASE_URL is not set");
  return url.replace(/\/+$/, "");
}

async function supabaseInsert(table, row) {
  const res = await fetch(baseUrl() + "/rest/v1/" + table, {
    method: "POST",
    headers: supabaseHeaders({ Prefer: "return=representation" }),
    body: JSON.stringify(row)
  });
  if (!res.ok) {
    throw new Error("Supabase insert into " + table + " failed: " + res.status + " " + (await res.text()));
  }
  const rows = await res.json();
  return rows[0];
}

/** match: e.g. { revolut_order_id: "abc123" } — simple equality filters only */
async function supabaseUpdate(table, match, patch) {
  const params = new URLSearchParams();
  Object.keys(match).forEach((key) => params.append(key, "eq." + match[key]));
  const res = await fetch(baseUrl() + "/rest/v1/" + table + "?" + params.toString(), {
    method: "PATCH",
    headers: supabaseHeaders({ Prefer: "return=representation" }),
    body: JSON.stringify(patch)
  });
  if (!res.ok) {
    throw new Error("Supabase update on " + table + " failed: " + res.status + " " + (await res.text()));
  }
  const rows = await res.json();
  return rows[0] || null;
}

async function supabaseSelectOne(table, match) {
  const params = new URLSearchParams();
  Object.keys(match).forEach((key) => params.append(key, "eq." + match[key]));
  params.append("limit", "1");
  const res = await fetch(baseUrl() + "/rest/v1/" + table + "?" + params.toString(), {
    method: "GET",
    headers: supabaseHeaders()
  });
  if (!res.ok) {
    throw new Error("Supabase select on " + table + " failed: " + res.status + " " + (await res.text()));
  }
  const rows = await res.json();
  return rows[0] || null;
}

module.exports = { supabaseInsert, supabaseUpdate, supabaseSelectOne };
