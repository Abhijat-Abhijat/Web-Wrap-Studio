# 07 Demo script (TODO M8, M9)

Format: a 30-second capture with captions only, no voice-over, for the README GIF, the website hero and the Product Hunt video. Draft dated 2026-09-25.

Gates: the shots marked BUILD need in-app build (T10) and the build-progress screen (D4), which are not done yet. Until then, record shots 1 to 4 and 7 to 8, and cut shots 5 and 6 rather than faking them. The main screen must be the simplified one from D13 (one URL field, preview card, one "Create app" button).

## Capture rules

- 1280x800 window capture, Windows or macOS, light theme, system scaling 100 percent.
- Use a URL you own or a neutral site. No third-party logos or brand names on screen (trademark risk, see 06).
- Record one real, uncut run. Speed up only the build wait, and say so in a caption ("build sped up").
- GIF for the README: shots 1 to 4, under 10 MB, loops. Video for the site and Product Hunt: all shots.
- Captions: 32 px, `#101820` on `#F8F6F1`, bottom-left, one line, fade 0.2 s. No music required.

## 30-second shot list

| # | Time | On screen | Caption (exact) | App state |
|---|---|---|---|---|
| 1 | 0:00 to 0:03 | Empty main screen, cursor in the URL field | Paste a URL. | First-run state, URL field focused, nothing generated |
| 2 | 0:03 to 0:08 | URL pasted; preview card appears with name and icon filled in | Name and icon fill in. | URL valid, inspect finished, card shows title and favicon |
| 3 | 0:08 to 0:12 | Name edited by one word; output folder line visible with "Change" link | Edit anything. Or don't. | Name field editable, default output folder shown |
| 4 | 0:12 to 0:15 | Click "Create app"; success state | Project created. | Project written to the output folder |
| 5 | 0:15 to 0:22 | BUILD: build-progress screen with live log and progress bar (sped up) | Build the installer. No terminal. | T10 done; log streaming; only show "No terminal" if T12 is also done |
| 6 | 0:22 to 0:25 | BUILD: file manager showing the installer file, with its size visible | Installer: [measured size]. | Real installer in `dist/`; size read from the actual file |
| 7 | 0:25 to 0:28 | Editor showing the project folder and `paneshell.config.json` open | The project is plain Electron. Yours to edit. | Generated project opened in a code editor |
| 8 | 0:28 to 0:30 | End card, wordmark and site address | Free. No account. [WEBSITE_URL] | Static frame |

If T10 is not done, use this shorter cut (about 18 seconds): shots 1 to 4, then 7, then 8, and change shot 4's caption to "Project created. Build it with npm run dist." Do not show or imply an installer that was not produced.

## Product Hunt gallery frames

Size 1270x760 each, minimum 2 required by Product Hunt (see 05). Thumbnail is 240x240: the app icon on `#F8F6F1`, no text. Use the same window chrome and palette in all frames. Headline text is set in the site's grotesque face at large size, above or beside the screenshot.

| Frame | Headline (exact) | Sub-line (exact) | Required app state |
|---|---|---|---|
| 1 | Paste a URL. Get a desktop installer. | Free, local, no account. | Main screen with a URL pasted and the preview card visible with name and icon. Needs D13 |
| 2 | Name and icon, filled in. | Edit either before you create the app. | Preview card open, the name field showing a small edit, icon preview visible. Needs T31 and D6 |
| 3 | Build without a terminal. | Live log, one progress bar. | Build in progress at about 60 percent, log lines visible. Needs T10, T12 and D4; skip this frame if they are not done |
| 4 | Installers for Windows, macOS and Linux. | [measured size] on Windows. Electron is not small. | File manager showing the real installer files produced by CI or local builds, with sizes. Needs T28 or three real builds |
| 5 | The project is yours. | Plain Electron, one `paneshell.config.json`. | Code editor showing the project tree and `paneshell.config.json` with its keys visible. Needs nothing beyond today's generator |

Frames 1, 2 and 5 can be captured now. Frames 3 and 4 depend on unfinished work; do not mock them with fake output.

## Accuracy checklist before publishing

- Every size shown is read from a real file.
- "No terminal" appears only if the recorded run needed no terminal at any point, including Node setup.
- The wrapped site is one you own or have permission to show.
- The app state in each frame matches the released version, not a branch.
