# WebWrap Studio

Desktop app builder. Turn a website into a wrapped Electron app.

## Build the installers

```
npm install
npm run dist        # builds for whatever OS you're on
npm run dist:win     # .exe (NSIS) — build on Windows, or a Windows CI runner
npm run dist:linux   # .deb — build on Linux
npm run dist:mac     # .dmg — build on macOS
```

Output lands in `dist/`. Cross-building a `.dmg` from Linux/Windows isn't
reliable (Apple's tooling and code signing are macOS-only), and a clean
`.exe` build wants Windows or Wine. The included
`.github/workflows/build.yml` builds all three on their native OS via
GitHub Actions — push a tag like `v1.0.0` or run it manually from the
Actions tab, then download the three artifacts.

Before shipping, replace `build/icon.png` with your own 1024×1024 icon —
the one included is a placeholder.

## Install

- **Windows** — run `WebWrap-Studio-Setup-<version>.exe`. It's an NSIS
  installer with `allowToChangeInstallationDirectory` on, so the user picks
  a folder and gets Start Menu + desktop shortcuts.
- **Linux (Debian/Ubuntu)** — `sudo dpkg -i webwrap-studio_<version>_amd64.deb`
  (or double-click it in a graphical package manager). It registers a
  `.desktop` entry and appears in the app menu.
- **macOS** — open the `.dmg`, drag WebWrap Studio into `Applications`.

## Uninstall

- **Windows** — Settings → Apps → WebWrap Studio → Uninstall (NSIS writes a
  real uninstaller and registry entry, so it shows up there normally).
- **Linux** — `sudo apt remove webwrap-studio` (or `sudo dpkg -r webwrap-studio`).
- **macOS** — drag WebWrap Studio from `Applications` to the Trash.

None of these leave background services or daemons running — the app has
no installer scripts beyond what electron-builder generates, so uninstall
is a plain removal on every platform.

## Project layout

```
src/main/main.js       Electron main process, window + IPC handlers
src/main/preload.js     Safe bridge exposing window.webwrap to the UI
src/renderer/           The UI (index.html, styles.css, renderer.js)
build/icon.png          App icon (replace with your own)
```

Each project WebWrap Studio generates for a wrapped site ships with its own
`package.json` and the same three `dist:*` scripts, so the apps your users
create are installable and uninstallable the same way.
