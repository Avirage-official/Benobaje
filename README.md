# Ben Obaje — Portfolio

Editorial portfolio site for Ben Obaje, Creative Strategist — Culture · Brands · Live Experience.

Pure static HTML/CSS/JS. No build step, no dependencies. Deployable as-is to GitHub Pages, Vercel, Netlify or any static host.

## Structure

```
index.html            Homepage — hero, client marquee, selected work, statement
concepts.html         Concept index — original ideas ahead of their briefs
concepts/concept-01.html    Concept 001 — Velocity vs. Coherence (on time as a brand attribute)
concepts/concept-02.html    Concept 002 — The Quiet Signal (proximity over scale)
concepts/concept-03.html    Concept 003 — detail page
work.html             Case study index
work/remy-martin.html       Rémy Martin — 1738 Accord Royal (2022)
work/senter-festival.html   Senter Festival, Sri Lanka (2025)
work/nothing-phone.html     Nothing — Phone (1) Launch (2022)
work/mightyjaxx-flexx.html  MightyJaxx — FLEXX (2024)
work/wahbanana.html         Wahbanana — Platform-Native Comedy (2023–24)
about.html            Analyst-to-strategist story, expertise, toolkit
music.html            AFROJUNIOR — releases, DJ sets, curated rooms
contact.html          Contact
css/style.css         Full design system
js/main.js            Nav, scroll reveals, image placeholder handling

shop/index.html        Tyco — product grid
shop/checkout.html     Tyco — shipping form + Revolut embedded payment
shop/order-confirmed.html   Tyco — order status tracker
css/shop.css            Tyco's own visual system (self-contained, no dependency on style.css)
js/shop.js, js/checkout.js, js/order-status.js   Tyco client-side logic
api/create-order.js          Creates the Revolut order + a pending Supabase row
api/order-status.js          Polled by order-confirmed.html
api/webhooks/revolut.js      Payment confirmed → marks paid → creates the Merchize order
api/webhooks/merchize.js     Fulfilment status → updates Supabase
lib/products.js, lib/revolut.js, lib/merchize.js, lib/supabase.js, lib/http.js   Server-side helpers (api/** only)
sql/orders.sql                SQL to run once in Supabase
```

## Image uploads

Every image slot renders a styled placeholder showing the exact file path it
expects. Drop images at these paths (JPG, sRGB) and they appear automatically —
no code changes needed.

| File path | Used on | Orientation / suggested size |
|---|---|---|
| `assets/img/hero.jpg` | Homepage hero | Landscape, ~2400×1150 |
| `assets/img/showreel-poster.jpg` | Homepage — Showreel poster frame | Landscape 21:10, ~2400px wide |
| `assets/img/portrait.jpg` | About | Portrait 4:5, ~1600×2000 |
| `assets/img/work/remy-hero.jpg` | Rémy Martin hero + thumbnails | Landscape 16:9, ~2400px wide |
| `assets/img/work/remy-01.jpg` | Rémy Martin — execution | Landscape 16:9 |
| `assets/img/work/remy-02.jpg` | Rémy Martin — execution | Landscape 16:9 |
| `assets/img/work/senter-hero.jpg` | Senter hero + thumbnails | Landscape 16:9, ~2400px wide |
| `assets/img/work/senter-01.jpg` | Senter — execution | Landscape 16:9 |
| `assets/img/work/senter-02.jpg` | Senter — execution | Landscape 16:9 |
| `assets/img/work/nothing-hero.jpg` | Nothing hero + thumbnails | Landscape 16:9, ~2400px wide |
| `assets/img/work/nothing-01.jpg` | Nothing — execution | Landscape 16:9 |
| `assets/img/work/nothing-02.jpg` | Nothing — execution | Landscape 16:9 |
| `assets/img/work/flexx-hero.jpg` | FLEXX hero + thumbnails | Landscape 16:9, ~2400px wide |
| `assets/img/work/flexx-01.jpg` | FLEXX — execution | Landscape 16:9 |
| `assets/img/work/flexx-02.jpg` | FLEXX — execution | Landscape 16:9 |
| `assets/img/work/wahbanana-hero.jpg` | Wahbanana hero + thumbnails | Landscape 16:9, ~2400px wide |
| `assets/img/work/wahbanana-01.jpg` | Wahbanana — execution | Landscape 16:9 |
| `assets/img/work/wahbanana-02.jpg` | Wahbanana — execution | Landscape 16:9 |
| `assets/img/music/afrojunior.jpg` | Music page hero | Landscape, ~2400×1150 |
| `assets/img/concepts/concept-01.jpg` | Concept 001 — index card + detail hero | Landscape 16:9 |
| `assets/img/concepts/velocity-deck-key-visual.jpg` | Concept 001 — Visual Direction Deck, key visual | Landscape 21:10, ~2400px wide. A close, warm shot of a single amber whiskey drop mid-fall into a glass, backlit, dark background, one small accent of royal-blue light reflected somewhere (a rim light or blurred blue bokeh) |
| `assets/img/concepts/velocity-deck-bridge.jpg` | Concept 001 — Visual Direction Deck, "The Bridge" imagery-style tile | Landscape 4:3, ~1600×1200. A real, warm-lit, candid (not posed) photo of an older and younger person's hands both near a poured glass, mid-conversation |
| `assets/img/concepts/velocity-deck-packaging.jpg` | Concept 001 — Visual Direction Deck, sample execution | Square 1:1 or portrait, ~1600px+. A mocked Instagram post or product packaging shot — bottle/label with the drip-cycle motif subtly integrated, gold/brown palette, one small royal-blue accent (foil stamp or light reflection), modern serif logotype |
| `assets/img/concepts/concept-02.jpg` | Concept 002 — index card + detail hero | Landscape 16:9 |
| `assets/img/concepts/concept-03.jpg` | Concept 003 — index card + detail hero | Landscape 16:9 |
| `assets/img/concepts/concept-03-a.jpg` | Concept 003 — What It Looks Like | Landscape 16:9 |
| `assets/img/concepts/concept-03-b.jpg` | Concept 003 — What It Looks Like | Landscape 16:9 |

Keep image files under ~500 KB each where possible (export at quality ~80).

The Visual Direction Deck's other three graphics — the drip motif (imagery-style
tile), the tempo waveform (sonic identity), and the 9am–9pm full-cycle strip —
are rendered live as inline SVG in `concepts/concept-01.html`, not images.
No files needed for those; edit the `<svg>` markup directly to adjust them.

## Video uploads

Same placeholder system — drop an `.mp4` (H.264, 1080p, ideally under ~50 MB)
at these paths and it appears with native player controls, using the case
study's hero image (or, for the showreel, its own poster image above) as its
poster frame:

| File path | Used on |
|---|---|
| `assets/video/showreel.mp4` | Homepage — Showreel, below Selected Work — plays silently on loop as soon as it's in view (no click, no controls, no audio track needed). Keep it short, ~15–30s |
| `assets/video/remy.mp4` | Rémy Martin — The Execution |
| `assets/video/senter.mp4` | Senter Festival — The Execution |
| `assets/video/flexx.mp4` | MightyJaxx FLEXX — The Execution |

(Wahbanana embeds its sketch directly from YouTube, so no upload needed there.)

## Audio uploads

Concept pages can carry a music/sound player instead of (or alongside) video —
same placeholder contract as images and video: drop an `.mp3` at the path
below and the concept's scrub player syncs playback to it automatically.
Until then, the interactive mechanic still works, driven by a simulated
timer, and shows "sound design in production" instead of a broken player.

| File path | Used on | Notes |
|---|---|---|
| `assets/audio/concepts/velocity-drip.mp3` | Velocity vs. Coherence — the drip player | Continuous ~60–90s soundscape: a single slow drip building to a full pour around two-thirds in, then receding — mapped to the 6am–midnight timeline |
| `assets/audio/concepts/quiet-signal.mp3` | The Quiet Signal — the tuner | ~20–30s of layered noise/chatter thinning out into near-silence or a single clear tone as it plays — mapped to the noise-to-signal timeline |

## Local preview

```
python3 -m http.server 8000
# then open http://localhost:8000
```

Note: this only serves the static pages. The `/api` functions (checkout,
webhooks) need Node — use `vercel dev` instead when working on the Tyco
shop (see below).

## Tyco shop — checkout, Revolut, Merchize, Supabase

`/shop` is a self-contained storefront: pick a product → shipping form →
Revolut's embedded payment widget → Revolut confirms payment via webhook →
that webhook creates the fulfilment order in Merchize → Merchize's webhook
reports status back → Supabase holds the order record throughout. Nothing
here shares code or styling with the rest of the portfolio on purpose.

### Environment variables

Set these in **Vercel → your project → Settings → Environment Variables**.
Nothing below should ever go in the repo, in a commit, or in any file
served to the browser.

| Variable | Where it comes from | Used by |
|---|---|---|
| `REVOLUT_SECRET_KEY` | Revolut Business → Merchant API settings | `api/create-order.js` (server-side order creation) |
| `REVOLUT_WEBHOOK_SECRET` | Shown when you create the webhook in the Revolut dashboard | `api/webhooks/revolut.js` (signature check) |
| `REVOLUT_MODE` | `sandbox` while testing, `prod` when live | picks the right Revolut base URL + embed script |
| `REVOLUT_API_BASE_URL` | Only needed if your account's API base URL differs from Revolut's documented defaults | overrides the sandbox/prod default |
| `MERCHIZE_API_BASE_URL` | Merchize dashboard → API page (your store's own base URL) | `api/webhooks/revolut.js` (creates the fulfilment order) |
| `MERCHIZE_ACCESS_TOKEN` | Same Merchize dashboard page | same |
| `MERCHIZE_WEBHOOK_KEY` | Same Merchize dashboard page — the value they send back in the `merchize-webhook-key` header | `api/webhooks/merchize.js` (validates incoming webhooks) |
| `SUPABASE_URL` | Supabase project → Settings → API | `lib/supabase.js` |
| `SUPABASE_SERVICE_ROLE_KEY` | Same page — the **service role** key, not the anon/public one | same |

Redeploy (or trigger a new deployment) after adding/changing env vars —
Vercel functions only pick up new values on the next deploy.

### Webhook URLs to register

Once deployed, give each provider your live function URL:

- Revolut dashboard → Webhooks → `https://<your-domain>/api/webhooks/revolut`
- Merchize dashboard → Webhooks → `https://<your-domain>/api/webhooks/merchize`

### Supabase setup

Run `sql/orders.sql` once in Supabase → SQL Editor. It creates the `orders`
table with RLS enabled and no public policies — only the service role key
(server-side only) can touch it.

### Before going live — two things to verify against your own docs

This was built from Revolut's public developer docs and the Merchize
reference you shared, but two specifics couldn't be fully confirmed and
are marked clearly in code comments:

1. **`lib/merchize.js`** — the order-creation field names (`external_id`,
   `shipping.*`, `items[].variant_code`) come from Merchize's general
   order-import shape. Check them against the fuller API reference you
   have (specifically the exact request schema and any required fields
   not listed here) and adjust the function body if anything differs.
2. **`api/webhooks/merchize.js`** — the webhook payload shape (which field
   holds status vs. tracking) is a best guess, since the docs you pasted
   covered auth/retry rules but not the event payload itself. Trigger a
   test event from the Merchize dashboard, log `req.body` once, and
   tighten the field lookups to match exactly what arrives.

Everything else (Revolut order creation, Checkout widget, webhook
signature verification, the Supabase writes) follows Revolut's documented
API directly and shouldn't need adjustment.

### What's still a placeholder

- **Products** (`lib/products.js` + the matching copy in `js/shop.js` /
  `js/checkout.js`): swap in your real Tyco catalog — names, prices, and
  especially `merchizeVariantCode` for each variant, which must match the
  exact variant code in your Merchize product catalog or fulfilment
  orders will fail.
- **Product images**: drop files at `assets/img/shop/<name>.jpg` matching
  the paths already wired into `js/shop.js` and `js/checkout.js`.
- This is a single-item "Buy Now" checkout, not a multi-item cart — each
  product links straight to its own checkout. A shared cart across
  multiple products is a natural next step once this is live and working.
