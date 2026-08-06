# Ben Obaje — Portfolio

Editorial portfolio site for Ben Obaje, Creative Strategist — Culture · Brands · Live Experience.

Pure static HTML/CSS/JS. No build step, no dependencies. Deployable as-is to GitHub Pages, Vercel, Netlify or any static host.

## Structure

```
index.html            Homepage — hero, client marquee, selected work, statement
work.html             Case study index
work/remy-martin.html       Rémy Martin — 1738 Accord Royal (2022)
work/senter-festival.html   Senter Festival, Sri Lanka (2025)
work/nothing-phone.html     Nothing — Phone (1) Launch (2022)
work/mightyjaxx-flexx.html  MightyJaxx — FLEXX (2024)
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
| `assets/img/music/afrojunior.jpg` | Music page hero | Landscape, ~2400×1150 |

Keep files under ~500 KB each where possible (export at quality ~80).

## Local preview

```
python3 -m http.server 8000
# then open http://localhost:8000
```
