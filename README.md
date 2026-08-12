# Ben Obaje — Portfolio

Editorial portfolio site for Ben Obaje, Creative Strategist — Culture · Brands · Live Experience.

Pure static HTML/CSS/JS. No build step, no dependencies. Deployable as-is to GitHub Pages, Vercel, Netlify or any static host.

## Structure

```
index.html            Homepage — hero, client marquee, selected work, statement
concepts.html         Concept index — original ideas ahead of their briefs
concepts/concept-01.html    Concept 001 — detail page
concepts/concept-02.html    Concept 002 — detail page
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
```

## Image uploads

Every image slot renders a styled placeholder showing the exact file path it
expects. Drop images at these paths (JPG, sRGB) and they appear automatically —
no code changes needed.

| File path | Used on | Orientation / suggested size |
|---|---|---|
| `assets/img/hero.jpg` | Homepage hero | Landscape, ~2400×1150 |
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
| `assets/img/concepts/concept-01-a.jpg` | Concept 001 — What It Looks Like | Landscape 16:9 |
| `assets/img/concepts/concept-01-b.jpg` | Concept 001 — What It Looks Like | Landscape 16:9 |
| `assets/img/concepts/concept-02.jpg` | Concept 002 — index card + detail hero | Landscape 16:9 |
| `assets/img/concepts/concept-02-a.jpg` | Concept 002 — What It Looks Like | Landscape 16:9 |
| `assets/img/concepts/concept-02-b.jpg` | Concept 002 — What It Looks Like | Landscape 16:9 |
| `assets/img/concepts/concept-03.jpg` | Concept 003 — index card + detail hero | Landscape 16:9 |
| `assets/img/concepts/concept-03-a.jpg` | Concept 003 — What It Looks Like | Landscape 16:9 |
| `assets/img/concepts/concept-03-b.jpg` | Concept 003 — What It Looks Like | Landscape 16:9 |

Keep image files under ~500 KB each where possible (export at quality ~80).

## Video uploads

Same placeholder system — drop an `.mp4` (H.264, 1080p, ideally under ~50 MB)
at these paths and it appears with native player controls, using the case
study's hero image as its poster frame:

| File path | Used on |
|---|---|
| `assets/video/remy.mp4` | Rémy Martin — The Execution |
| `assets/video/senter.mp4` | Senter Festival — The Execution |
| `assets/video/flexx.mp4` | MightyJaxx FLEXX — The Execution |

(Wahbanana embeds its sketch directly from YouTube, so no upload needed there.)

## Local preview

```
python3 -m http.server 8000
# then open http://localhost:8000
```
