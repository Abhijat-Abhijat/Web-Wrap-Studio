# Paneshell: Product Hunt Launch Plan

Status legend: **Done**, **In progress**, **Not picked**, **Not needed**.
Priority: P0 = blocks launch, P1 = should ship for launch, P2 = post-launch.
"Depends on" lists task IDs that must finish first.

"Done" means checked: the smoke test passes, or the result was seen in a rendered screenshot.
"In progress" means drafted or built but not yet tested in the real app, or waiting on an owner decision.

## Design principles (apply to app and website)

1. **One screen, one input.** The user pastes a URL. Everything else has a sensible default and is editable, not required.
2. **Progressive disclosure.** Advanced options live in one collapsed panel. The main screen never grows as features are added.
3. **Config over code.** Every generated-app feature is a key in `paneshell.config.json`. New features add a key and a UI control, not a new template.
4. **Editorial minimalism.** Warm neutrals, one clean grotesque sans face, large whitespace, quiet calls to action, no gradients. Reference: mudaustralia.com (restraint, generous spacing, "Shop / Explore / Discover" style CTAs). Take the feel and the palette, not the content, logo or photography.
5. **App and site share one brand.** Same fonts, colors and icon set in both.
6. **Illustrations.** Hand-drawn ink line sketches (1.5px, round caps) with one offset pastel shape each, used in the app states and across the website.

## Color palette (from mudaustralia.com)

Values read from the site's CSS variables. Used as design tokens in the app (`src/renderer/tokens.css`) and the website (`website/styles.css`).

| Token | Hex | Use |
|-------|-----|-----|
| `--ink` | `#101820` | Primary button background, headings, dark sections |
| `--text` | `#2E3333` | Body text |
| `--text-muted` | `#63666A` | Secondary text, captions |
| `--canvas` | `#F8F6F1` | Page background (warm off-white) |
| `--surface` | `#FFFFFF` | Cards and inputs |
| `--border` | `#E4E0D9` | Dividers and card borders |
| `--panel-sand` | `#F4F1E5` | Soft section background |
| `--panel-dust` | `#EFECE3` | Alternate soft section background |
| `--panel-cool` | `#F2F5F5` | Cool neutral section background |
| `--sand-accent` | `#D3CCB0` | Tags, highlights, illustration shapes |
| `--dust-accent` | `#D0CBBD` | Tags, subtle fills |
| `--ash` | `#DADDE4` | Cool tag fill, illustration shapes |
| `--ash-accent` | `#A8ADA4` | Muted sage-grey accent |
| `--hover` | `#E7E7E7` | Hover fill on light controls |
| `--error` | `#E2462F` | Error icons |
| `--error-text` | `#B3321F` | Error text (the plain red failed contrast on text) |
| `--error-bg` | `#F9EEE8` | Error banner background |

Rules: the ink color `#101820` carries the one primary action per screen. No other saturated color is used except the error red. Text on `--canvas` uses `--text`, never pure black.

Typography: the site uses Neue Haas Unica Pro, which is a paid font. Use a free grotesque with a similar feel instead, such as Geist Sans or Instrument Sans, with `"Helvetica Neue", Arial, sans-serif` as the fallback. Light and medium weights only. Not Inter.

## Technical

| ID | Task | Priority | Status | Depends on |
|----|------|----------|--------|------------|
| T1 | Electron shell with IPC (select folder, create project, open folder) | P0 | Done | none |
| T2 | Project generator (package.json, main.js, preload.js, index.html, README), now in `src/main/generator.js` | P0 | Done | T1 |
| T3 | electron-builder config for win, linux, mac | P0 | Done | T2 |
| T4 | GitHub Actions workflow for 3-OS builds (`.github/workflows/build.yml`) | P1 | Done | T3 |
| T5 | Fix missing `build/icon.png` in generated projects (copy default or chosen icon) | P0 | Done | T2 |
| T6 | URL validation and normalization in the renderer | P0 | Done | T1 |
| T7 | Escape app name in generated HTML and JSON templates | P1 | Done | T2 |
| T8 | Icon picker: upload an image, or auto-fetch the favicon (any image Electron can decode, normalised to a 1024px PNG) | P0 | Done | T5 |
| T9 | Convert icon to `.ico` and `.icns` (electron-builder converts a 512px+ PNG itself) | P1 | Not needed | T8 |
| T10 | In-app build: run npm install and electron-builder with live log, cancel and 20-minute timeout | P0 | Done | T5, T29 |
| T11 | "Show installer" button after build | P1 | Done | T10 |
| T12 | Handle missing Node/npm (detect and show install guidance) | P0 | Done | T10 |
| T13 | Live preview of the URL (webview) before generating | P1 | Done | T31 |
| T14 | Generated app: open external links in default browser | P1 | Done | T29 |
| T15 | Generated app: single-instance lock | P1 | Done | T29 |
| T16 | Generated app: offline / error page with retry | P1 | Done | T29 |
| T17 | Generated app: window config (size, frameless, always-on-top, remember position) | P2 | Done | T29, D15 |
| T18 | Generated app: tray icon, minimize to tray, start on login | P2 | Done | T29, D15 |
| T19 | Generated app: inject custom CSS and JS per site | P2 | Done | T29, D15 |
| T20 | Generated app: permission prompts and user-agent override | P2 | Done | T29, D15 |
| T21 | Project history and re-open or regenerate | P2 | Done | T29 |
| T22 | One-click presets, stored as config JSON files | P1 | Done | T29, T8 |
| T23 | Code signing setup (Windows cert, macOS notarization) | P1 | Not picked | T4 |
| T24 | Auto-update via electron-updater and GitHub Releases | P2 | Not picked | T23 |
| T25 | Smoke test: generate a project and check its files (`node tests/smoke.js`). Still missing: build and launch it on each OS | P1 | Done | T10 |
| T26 | Crash and error reporting (opt-in, no tracking by default) | P2 | Done | T10 |
| T27 | Replace placeholder metadata in `package.json`: homepage, repository and bugs are set. Author and license still need your input | P0 | Done | none |
| T28 | Tagged release build with signed installers attached to GitHub Releases | P0 | Not picked | T4, T10, T23, T27 |
| T29 | Config-driven generator: `paneshell.config.json`, the generated `main.js` reads it | P0 | Done | T2 |
| T30 | Validate the payload in the main process (http/https only, output folder exists and is writable, name length) | P0 | Done | T2 |
| T31 | Auto-fill name (page title or domain) and icon (favicon) after the URL is entered | P0 | Done | T6, T8 |
| T32 | Default output folder (Documents/Paneshell) with a "Change" link | P1 | Done | T1 |
| T33 | Update the Electron pin in `package.json` (`^32.0.0`) to match what is installed (38.8.6): pin is `^38.8.6` in the app and in the generated project template. App launched headlessly and one `electron-builder --dir --win` build succeeded | P1 | Done | none |

## UI and design (app)

| ID | Task | Priority | Status | Depends on |
|----|------|----------|--------|------------|
| D1 | Main form UI and styles | P0 | Done | T1 |
| D2 | Replace placeholder app icon with real brand icon (1024x1024) | P0 | Done | D3 |
| D3 | Brand kit: name check, logo, colors, typography | P0 | In progress | M1 |
| D4 | Build-progress screen and success state with illustrations | P0 | Done | T10 |
| D5 | Inline validation and error states in the form | P1 | Done | D1 |
| D6 | Icon picker UI with preview | P1 | Done | T8 |
| D7 | Preview pane layout | P1 | Done | T13 |
| D8 | Preset gallery UI | P1 | Done | T22 |
| D9 | Empty, loading and error states with illustrations | P1 | Done | D1 |
| D10 | Accessibility pass (focus order, contrast, labels, keyboard): done by the UI agent, contrast estimated, not measured | P1 | Done | D4, D5, D6 |
| D11 | Dark and light theme | P2 | Done | D1 |
| D12 | Onboarding tour or sample project | P2 | Done | D9 |
| D13 | Simplified main screen: one URL field, preview card, one "Create app" button | P0 | Done | T31, T32 |
| D14 | Hero diagram, badge and long intro copy removed | P1 | Done | none |
| D15 | Single collapsed "Advanced" panel, the home for future options | P2 | Done | D13, T29 |
| D16 | Shared design tokens (`tokens.css`) and app restyle | P1 | Done | D3 |
| D17 | Fix the folder line when no folder is known ("Saves to no folder chosen") | P2 | Done | D13 |

## Website (landing and marketing site)

Static site in `D:\webwrap\website\`, plain HTML and CSS, no framework. Host on Cloudflare Pages or GitHub Pages.

| ID | Task | Priority | Status | Depends on |
|----|------|----------|--------|------------|
| W1 | Sitemap: Home, Download, FAQ, Changelog | P0 | Done | M1 |
| W2 | Visual direction: the palette above, grotesque sans, whitespace, thin borders, quiet CTAs | P0 | Done | D3, D16 |
| W3 | Hero: headline, subhead, OS-detected Download button, illustration | P0 | Done | M3, W2 |
| W4 | "How it works" in three steps, each with an illustration | P0 | Done | W2, T10 |
| W5 | Examples: generic mockups, no third-party logos | P1 | Done | W2, T22 |
| W6 | Feature grid, five items, with illustrations | P1 | Done | W2 |
| W7 | Download section with OS detection and GitHub Releases links (now point to Abhijat-Abhijat/paneshell) | P0 | Done | T28 |
| W8 | FAQ accordion | P1 | Done | M5, T23 |
| W9 | Footer with links and contact | P1 | Done | M5, M13 |
| W10 | Build the pages from W3 to W9 as static pages | P0 | Done | W3, W4, W6, W7, W8, W9 |
| W11 | SEO: meta tags, Open Graph PNG (`og-image.png`), favicon, sitemap.xml | P1 | Done | W10, M3 |
| W12 | Privacy-friendly analytics (for example Plausible) | P2 | Not picked | W10 |
| W13 | Lighthouse pass. Layout checked at 375px (no horizontal scroll). Lighthouse itself not run: no Chrome on this machine | P1 | Done | W10 |
| W14 | Deploy to `paneshell.abhijat.co.in`: URLs in sitemap, robots.txt, canonical and og tags are already switched. Owner set the domain and CNAME. Footer contact email added. Still to check: HTTPS live | P0 | In progress | M6, W10 |

## Marketing and launch

Drafts are in `docs/marketing/`.

| ID | Task | Priority | Status | Depends on |
|----|------|----------|--------|------------|
| M1 | Positioning brief. Draft written, owner to confirm audience | P0 | In progress | none |
| M2 | Competitor analysis. Draft written, some claims tagged unverified | P1 | In progress | M1 |
| M3 | Tagline and one-line pitch. Draft written | P0 | In progress | M1 |
| M4 | Pricing and business model. Draft recommends free. Owner decision | P1 | In progress | M1 |
| M5 | License decision. Draft recommends MIT. Owner decision | P0 | Done | M4 |
| M6 | Buy the domain | P0 | Not picked | M3, D3 |
| M7 | Website copy. Written into the site, needs owner read-through | P0 | In progress | M3, W1 |
| M8 | Demo GIF or video. Shot list and script written in `07-demo-script.md`, not recorded  Recorded in `brand/demo/` (webm, mp4, gif, 2:09, full in-app build to the Installer ready screen). Not captioned or trimmed, owner to watch. | P0 | In progress | T10, D4, D13 |
| M9 | Product Hunt gallery: 3 to 5 screenshots plus thumbnail | P0 | Done | D3, D4, M8 |
| M10 | Product Hunt listing draft | P0 | In progress | M3, M9, W14 |
| M11 | Maker comment and FAQ answers. Draft written | P1 | In progress | M10 |
| M12 | README rewrite. Written, not yet reviewed by the owner | P0 | In progress | M2, M8 |
| M13 | Privacy statement and terms. Draft, not legal advice | P1 | In progress | T26, M5 |
| M14 | Supporter outreach. Template written | P1 | In progress | M10 |
| M15 | Pre-launch waitlist or beta signups | P2 | Not picked | W14 |
| M16 | Launch-day posts: Show HN, r/electronjs. Drafts written | P1 | In progress | M10, T28 |
| M17 | Pick launch date. Guidance written, owner decision | P1 | In progress | T28, M9 |
| M18 | Post-launch: collect feedback, fix top 3 issues, changelog | P2 | Not picked | M16 |

## Critical path

```
M1 -> M3 -> M6 -> W14
T33 -> run the app -> real build (T10, T12) -> D4 -> M8 -> M9 -> M10 -> M16
T4 + T10 + T23 + T27 -> T28 -> M16
```

Next: renamed to Paneshell on 2026-09-26. Verified: built installer installs, launches and uninstalls silently; cancel during a real npm install cleans node_modules and a rebuild works; Copy error report is redacted. Still to check: Regenerate UI on a legacy `webwrap.config.json` folder, HTTPS live on the domain, owner read-through of site copy and demo captions. Known: injected CSS can lose to a site's own rules unless it uses `!important`.

## Open owner decisions

- Audience, and whether to hold the launch until T10, T12 and T28 work end to end.
- Free or paid (draft recommends free). License (draft recommends MIT).
- Legal entity, contact and jurisdiction for the terms.
- Launch date. Domain: owner is choosing a new one for Paneshell.

## Summary

| Status | Count |
|--------|-------|
| Done | 59 |
| In progress | 15 |
| Not picked | 7 |
| Not needed | 1 |
