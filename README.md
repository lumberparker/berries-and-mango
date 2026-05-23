# Berries & Mango — Static Site

A static one-page site for **Berries & Mango**, a Mexican design studio.
Built with vanilla HTML, CSS and JavaScript using **BEM** naming and a per-block file structure.

## Stack

- HTML5 (single `index.html`)
- CSS organised by block (BEM); one `@import` entry-point: `styles.css`
- Vanilla JS, one script per concern; no build step

## Project structure

```
.
├── index.html              ← only entry; links only styles.css + scripts
├── styles.css              ← single CSS entry-point: @import-only
├── README.md
│
├── Fonts/
│   └── fonts.css           ← @font-face + Google Fonts + type tokens
│
├── Blocks/                 ← one CSS file per section, BEM
│   ├── loader.css
│   ├── page.css            ← base reset, colour & spacing tokens
│   ├── header.css
│   ├── hero.css
│   ├── marquee.css
│   ├── conoce.css          ← about-us
│   ├── propiedades.css     ← studio's "flavour profile" / values
│   ├── presentaciones.css  ← service formats / packages
│   ├── showcase.css        ← portfolio grid
│   ├── productos.css       ← services as products
│   ├── encuentra.css       ← contact section
│   └── footer.css
│
├── scripts/                ← one JS file per concern
│   ├── loader.js           ← fake progress + fade-out on load
│   ├── header.js           ← sticky state + mobile burger
│   ├── marquee.js          ← reduced-motion + tab-blur pause
│   ├── showcase.js         ← IntersectionObserver fade-in
│   ├── encuentra.js        ← contact form handler (mock)
│   └── main.js             ← year stamp + anchor scroll offset
│
└── assets/
    ├── fonts/              ← self-hosted woff2/woff files
    ├── images/             ← brand imagery, work thumbnails
    ├── jsons/              ← static data feeds
    └── videos/             ← hero/showcase video
```

## BEM conventions

- **Block:** standalone component → `.hero`, `.showcase`, `.encuentra`
- **Element:** child of a block → `.hero__heading`, `.showcase__media`
- **Modifier:** variant or state → `.hero__cta--primary`, `.propiedades__item--mango`, `.is-scrolled`

Each block lives in its own file inside `Blocks/`. State classes use the
`is-*` convention (`is-hidden`, `is-scrolled`, `is-menu-open`).

## Visual system

Tokens live in `Blocks/page.css` (palette, spacing, radii, motion) and
`Fonts/fonts.css` (type stack). The palette mirrors berriesandmango.com:

| Token            | Hex       | Use                          |
| ---------------- | --------- | ---------------------------- |
| `--color-cream`  | `#faf9f5` | Page background              |
| `--color-soft`   | `#efebe8` | Footer text / muted surfaces |
| `--color-ink`    | `#000000` | Text, buttons, footer bg     |
| `--color-mango`  | `#fcad22` | Primary accent               |
| `--color-coral`  | `#ffafa9` | Encuentra background, tiles  |
| `--color-violet` | `#6776ff` | Tile accent                  |
| `--color-rust`   | `#e26248` | Loader bg, eyebrow accent    |
| `--color-green`  | `#4b9b21` | Tile accent                  |
| `--color-blue`   | `#2652f2` | Tile accent                  |

Fonts (free stand-ins for the real proprietary set):

- Display headings → **Apple Garamond Light** (fallback **EB Garamond**)
- UI / H1 → **Inter**
- Body → **Sora**
- Mono accents → **Space Mono**

If/when licensed Apple Garamond files are added to `assets/fonts/`,
uncomment the `@font-face` block at the top of `Fonts/fonts.css`.

## Adding content

Sections marked with `<!-- TODO: ... -->` in `index.html` are content
slots. Replace placeholder copy and the colour-block media placeholders
(`.hero__media-placeholder`, `.conoce__media-placeholder`, `.showcase__media[data-bg]`)
with real imagery in `assets/images/`.

## Running locally

No build, no dependencies. Either:

```bash
# Python
python3 -m http.server 8000

# or any other static server
npx serve .
```

Then open <http://localhost:8000>.

## Adding a new section

1. Create `Blocks/<name>.css` with BEM classes scoped to `.<name>`.
2. Append `@import url("Blocks/<name>.css");` to `styles.css`.
3. Add the section markup to `index.html`.
4. (Optional) Add a `scripts/<name>.js` and include it before `main.js`.
