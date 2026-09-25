# WebWrap Studio brand kit

Working name. See `name-check.md`: the name has collisions and may change. Only the wordmark text depends on it.

## The mark

A browser window (rounded square with a toolbar line and one dot) with a second corner arc wrapped around its bottom-right. The window becomes an app tile, and the arc is the wrap. Flat, one stroke weight, round caps.

## Files

| File | Use |
|------|-----|
| `logo-mark.svg` | Mark alone, ink on transparent. Website header, docs, in-app about screen. |
| `logo-wordmark.svg` | Mark and name. Website header, README, social. Text uses a font stack (Geist Sans, Instrument Sans, Helvetica Neue, Arial). It is live text, not paths, so it renders in the fallback font unless the font is installed. Convert to paths in a design tool before print. |
| `app-icon.svg` | Master for the app icon (ink tile, canvas mark, 1024 px, mark has about 18% padding). |
| `favicon.svg` | Website favicon and small sizes. Same tile with a heavier stroke for 16 px. |
| `../build/icon.png` | 1024 px app icon used by electron-builder. Rendered from `app-icon.svg`. |
| `icon-512.png`, `icon-256.png` | Renders of `app-icon.svg`. |
| `icon-32.png`, `icon-16.png` | Renders of `favicon.svg`. |
| `icon-placeholder.png` | The old placeholder icon, kept for reference. |

## Colors

| Token | Hex | Use in the brand files |
|-------|-----|------------------------|
| `--ink` | `#101820` | Mark, wordmark, icon tile |
| `--canvas` | `#F8F6F1` | Mark on dark, page background |

All other tokens are in `TODO.md` and `src/renderer/tokens.css`. No gradients, no other saturated colors.

## Rules

- Clear space: keep at least the width of the toolbar dot times 4 (one quarter of the mark's width) free on all sides.
- Minimum size: mark 16 px (use `favicon.svg`), wordmark 120 px wide.
- On light backgrounds use ink. On ink or photos use canvas `#F8F6F1`; edit the stroke color, do not add effects.
- Do not stretch, rotate, outline, add shadows or gradients, recolor to a brand color, or redraw the arc.
- Do not put the mark on a busy image without a solid ink or canvas panel behind it.
- Do not use the placeholder icon anywhere public.

## Regenerate the PNGs

Use an Electron script that loads each SVG in a hidden transparent window, sets the content size to the target pixels, calls `capturePage()` then `toPNG()`. Run it with `ELECTRON_RUN_AS_NODE` unset.

## Still needs a designer

Optical alignment of the mark, wordmark converted to paths with a licensed or open font, `.ico` and `.icns` checks on real OS docks and taskbars, and a final name.
