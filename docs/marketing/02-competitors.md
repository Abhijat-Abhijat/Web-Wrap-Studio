# 02 Competitors (TODO M2)

Date checked: 2026-09-25 (first pass), updated 2026-09-25 (second pass). Method: competitive-platform-analysis (scope and tier the set) plus market-research standards (sourced claims, dated data, unverified flagged).

Evidence rule: a fact is "verified" when two independent sources agree (for example a repository page and the package registry, or a vendor page and a third-party listing). "Single source" means one page, usually the vendor's own, so it is a marketing claim. "UNVERIFIED" means I could not confirm it. Vendor pages state what the vendor wants you to believe; sizes and signing claims in particular are unmeasured by me.

Scope rule from 01: weight by who is served (a non-developer who needs an installer) rather than by technology.

## What changed in the second pass

- Hosted "URL to desktop app" services exist (Websktop, WebsiteToApp, Appy Pie, Website to Software) and so does a GUI for Tauri packaging (PakePlus). "No terminal" is therefore not unique. See 01 for the revised angle.
- WebCatalog runs on Electron (verified). Whether it exports a shareable installer is still UNVERIFIED.
- Coherence X now sells at $39.99 for one Mac (X6), up from about $30 in the 2021 to 2022 sources.
- electron-builder, Electron Forge and Electron are all MIT (verified, two sources each).
- Fluid: last version is 2.1.2; release date cannot be confirmed. Its listing on AlternativeTo says discontinued while fluidapp.com is still online, so those sources conflict.
- Electron size: measured figures added below.

## Tiers

**Direct, local tools** (same job, run on your machine)
- Nativefier (archived)
- Pake (CLI, Tauri)
- PakePlus (GUI, Tauri, cloud build via GitHub Actions or local)

**Direct, hosted services** (paste a URL in a browser dashboard, download an installer)
- Websktop
- WebsiteToApp
- Appy Pie website-to-desktop
- Website to Software

**Adjacent** (partial overlap)
- WebCatalog (Electron workspace with custom apps)
- Fluid (Mac only)
- Coherence X / Unite (Mac only, paid)
- Chrome and Edge "Install page as app"
- PWABuilder (needs a web app manifest; targets store packages)

**Do-it-yourself substitute**
- Electron Forge and electron-builder (the route Paneshell generates configs for)

## Comparison table

| Tool | Platforms | Tech | Size of output | Price | Maintained? | Needs terminal? | Sources |
|---|---|---|---|---|---|---|---|
| Nativefier | Windows, macOS, Linux | Electron, Node, TypeScript | Not stated; Electron baseline applies | Free, MIT | No. Archived 2023-09-29 | Yes (npm CLI) | [repo](https://github.com/nativefier/nativefier), [issue 1577](https://github.com/nativefier/nativefier/issues/1577), [Snyk](https://snyk.io/advisor/npm-package/nativefier) |
| Pake | macOS, Windows, Linux | Tauri, Rust | Vendor claim: under 10 MB | Free. Repo page shows "GPL-3.0 with output exception"; apps you build stay yours. One aggregator says MIT, which conflicts, so treat the licence as GPL-3.0 per the repo | Yes. V3.17.2 released 2026-09-25 (GitHub API and releases page) | Yes for the CLI; a web/GitHub Actions builder also exists | [repo](https://github.com/tw93/Pake), [releases](https://github.com/tw93/Pake/releases), [Better Stack](https://betterstack.com/community/guides/linux/pake-explained/) |
| PakePlus | Desktop client for Windows, macOS, Linux; builds desktop and mobile apps | Tauri 2, Rust | Vendor claim: under 5 MB | Free, MIT (repo page, 14.9k stars) | Yes per site and repo; release date not checked | No terminal for the client. Cloud packaging needs a GitHub token with repo, Actions and admin permissions; local packaging needs no token | [repo](https://github.com/Sjj1024/PakePlus), [site](https://pakeplus.com/), [guide](https://pakeplus.com/guide/) |
| Websktop | Windows .exe; macOS .dmg/.app; Linux .AppImage (vendor pages) | Says "wrapper architecture", not Electron or Tauri; Windows build uses WebView2 | Windows installer about 4 MB (vendor claim) | Free tier with 0 apps and 0 builds; $10 per app and $2 per build beyond that (vendor page); a search summary lists paid plans from $12 per month, which conflicts | Unknown | No, browser dashboard | [home](https://websktop.net/), [URL to EXE](https://websktop.net/url-to-exe), [website-to-desktop-app page](https://websktop.net/website-to-desktop-app) (the home page, re-fetched 2026-09-26, describes pay-as-you-go ($10 per app, $2 per build, no subscription), so the $12 per month figure is not supported; source https://websktop.net/) |
| WebsiteToApp | Windows 10/11 .exe; Android APK/AAB | Native shell, "no Electron" (vendor) | 50 to 80 MB (vendor) | Free trial, watermarked, 15 days; $45 one time for unbranded | Unknown | No | [vendor page](https://websitetoapp.app/convert/website-to-exe-to-app); single source, so all details are vendor claims |
| Appy Pie website-to-desktop | .EXE/.MSI, .DMG/.PKG, .AppImage/.deb | Chromium-based engine, cloud build (vendor) | Not stated | Free trial; subscription price not shown | Unknown | No | [vendor page](https://www.appypie.com/convert-website-to-desktop-app); single source. Claims EV signing and Apple notarization; not tested |
| Website to Software | Windows, macOS | Wrapper, cloud | Not stated | Not disclosed on page | Unknown | No | [vendor page](https://www.websitetosoftware.com/); single source. The page also claims Y Combinator backing, which I did not verify |
| WebCatalog | Desktop app for Windows, macOS, Linux; also browser extension and web app | Electron (the archived open-source repo says Electron and React, and current listings say Electron with a Chromium-based engine). The repo moved to closed source in 2022 | Not stated | Free: 2 apps, 2 profiles, 1 space; Pro $5 per user per month billed annually ($6 monthly); Business $8 annually ($10 monthly) | Yes (2026 pricing page and reviews) | No | [pricing](https://webcatalog.io/en/pricing), [legacy repo](https://github.com/webcatalog/webcatalog-app), [Dupple review](https://dupple.com/reviews/webcatalog) |
| Fluid | macOS only (10.12 or later) | WebKit implied | The Fluid download is 6.3 MB (measured via the server's Content-Length: 6,264,150 bytes) | Free; $5 perpetual licence for extra features | UNVERIFIED. Latest version 2.1.2 (site changelog and Homebrew cask agree; the cask is not deprecated or disabled as of 2026-09-26, https://formulae.brew.sh/api/cask/fluid.json); the zip's Last-Modified header is 2026-02-03, which is a file timestamp, not a release date. AlternativeTo says discontinued, though fluidapp.com is online | No | [fluidapp.com](https://fluidapp.com), [changelog](https://fluidapp.com/changelog.html), [Homebrew cask](https://formulae.brew.sh/api/cask/fluid.json), [AlternativeTo](https://alternativeto.net/software/fluid/about/) |
| Coherence X | macOS | Chromium-based engine; sibling Unite uses WebKit | Not stated | X6: $39.99 one Mac, $59.99 three Macs, $99.99 five Macs; Setapp $9.99 per month (vendor page and search summary of the same vendor pages) | Sells X6, so appears active; release date not checked | No | [BZG buy page](https://www.bzgapps.com/buycoherence), [BZG product page](https://www.bzgapps.com/coherence), [Setapp](https://setapp.com/apps/coherence-pro) |
| Chrome / Edge "Install page as app" | Windows, macOS, Linux, ChromeOS | Browser PWA install; works for sites without a manifest | Uses the installed browser | Free | Yes (browser features) | No | [MDN](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Installing), [web.dev](https://web.dev/learn/pwa/installation/), [ChromeOS.dev](https://chromeos.dev/en/web/desktop-progressive-web-apps) |
| PWABuilder | Packages for Microsoft Store (MSIX), Google Play (Android), iOS Xcode project | Reads your PWA manifest; fills gaps in an incomplete one | Not applicable | Free (not confirmed on the page I could fetch) | Yes, active issue tracker; its packaging service has had outages ([issue 5303](https://github.com/pwa-builder/PWABuilder/issues/5303)) | No | [Microsoft Learn](https://learn.microsoft.com/en-us/microsoft-edge/progressive-web-apps/how-to/microsoft-store), [GitHub issue 5470](https://github.com/pwa-builder/pwabuilder/issues/5470). Requires a site you control that can be a PWA, so it is a poor fit for wrapping an arbitrary URL |
| Electron Forge | Windows, macOS, Linux | Electron; Node 22.17.0 or later and Git | Electron baseline | Free, MIT (repo page and npm registry agree; @electron-forge/cli 7.11.2) | Yes. Latest release v7.11.2 on 2026-05-20 (GitHub API) | Yes | [repo](https://github.com/electron/forge), [npm](https://registry.npmjs.org/@electron-forge/cli/latest), [electronforge.io](https://www.electronforge.io/) |
| electron-builder | Windows, macOS, Linux | NSIS, MSI, AppX, dmg, pkg, AppImage, snap, deb, rpm targets; code signing and notarization supported; Node 22.12 or later for the current major | Electron baseline | Free, MIT (repo page and npm registry agree) | Yes. electron-builder@26.16.1 released 2026-09-07 (GitHub API) | Yes | [repo](https://github.com/electron-userland/electron-builder), [npm](https://registry.npmjs.org/electron-builder/latest), [electron.build](https://www.electron.build/) |

## Electron size

Measured, not quoted:

- Official Electron 44.4.5 release archives (GitHub API asset sizes, 2026-09-23): Windows x64 zip 158.2 MB, Linux x64 zip 123.0 MB, macOS arm64 zip 130.4 MB. These are the bare runtime before any app code, compressed. Source: [Electron releases](https://github.com/electron/electron/releases), read through the GitHub API.
- Local measurement on this machine: `node_modules/electron/dist` (Electron 38.8.6, Windows) is 325 MB unpacked, of which `electron.exe` is 210 MB.
- Secondary sources say a hello world is about 115 MB, and installers are "usually more than 100 MB" ([Go Wombat on Medium](https://medium.com/gowombat/how-to-reduce-the-size-of-an-electron-app-installer-a2bc88a37732), [search summary of several blogs](https://www.codestudy.net/blog/electron-builder-app-size-is-too-large/)). These are consistent with the primary figures once compression is considered.

How to measure a Paneshell installer: run `npm run dist:win` (or the platform you have) and read the file sizes in `dist/`; run `npm run pack` and check the size of `dist/win-unpacked` for the installed footprint. Quote those numbers, with the Electron version and OS, in the README and listing. Until measured, say "roughly 100 MB or more to download, several hundred MB installed" and mark it approximate.

Note: the installed `node_modules` shows Electron 38.8.6, while `package.json` asks for `^32.0.0` and electron-builder `^25.0.0`. The current majors are 44 and 26. Worth checking before a release (outside this doc's scope).

## What the table says (inference)

1. **The "no terminal" slot is contested.** Hosted services (Websktop, WebsiteToApp, Appy Pie) and PakePlus (GUI) already let a non-developer paste a URL and get an installer. Websktop claims a 4 MB Windows installer and no Node install. The differences left for Paneshell are: it is local (the URL and site never go to a third-party build service), free, open source, has no per-app or per-build fee, and outputs a plain Electron project you can edit.
2. **Pake and PakePlus win on size.** Do not fight that. PakePlus needs a GitHub token for cloud packaging, which is a real barrier for the non-developer persona.
3. **Nativefier's slot is empty** because it is archived and CLI-only.
4. **WebCatalog** is a workspace product built on Electron. I could not confirm that it exports an installer you can hand to someone else. The legacy open-source repo generated apps with electron-packager, but that code is from before the 2022 closed-source move. Treat "does not export installers" as UNVERIFIED and test the current app before claiming it.
5. **Fluid and Coherence X are Mac only.** Price anchors: $5 (Fluid) and $39.99 (Coherence X, one Mac).
6. **Chrome "Install page as app"** remains the free substitute for one person's own use.
7. **Hosted-service risk for us:** they hold your URL and build on their servers. That is a privacy point in our favour, but I found no evidence that customers care; it is a hypothesis.

## Scoring (selection stage, 1 to 5, my judgment)

| Candidate | Tier | Offer overlap | Distinctiveness | Commercial credibility | Include |
|---|---|---|---|---|---|
| Pake | Direct, local | 5 | 4 (size) | 4 | Yes, must profile |
| PakePlus | Direct, local GUI | 5 | 4 (size, GUI) | 3 | Yes, closest GUI rival |
| Websktop | Direct, hosted | 5 | 4 (size, no Node) | 2 (young, single source) | Yes |
| WebsiteToApp | Direct, hosted | 4 | 2 | 2 | Brief mention |
| Appy Pie | Direct, hosted | 4 | 2 | 3 | Brief mention |
| Nativefier | Direct, local | 5 | 2 | 3 (archived) | Yes, cautionary case |
| WebCatalog | Adjacent | 3 | 3 | 4 | Yes |
| Fluid | Adjacent | 3 | 2 | 2 | Price anchor |
| Coherence X / Unite | Adjacent | 3 | 2 | 3 | Brief mention |
| Chrome/Edge PWA install | Substitute | 3 | 1 | 5 | Yes |
| PWABuilder | Adjacent | 2 | 2 | 4 | Brief mention |
| Electron Forge / electron-builder | DIY | 4 | 2 | 5 | Yes, reference |

## Still not verified

- Whether WebCatalog's current custom apps export a shareable installer (no primary documentation found; its docs domain did not resolve for me).
- Fluid's last release date and whether it is maintained.
- Websktop, WebsiteToApp, Appy Pie and Website to Software: all facts are single-source vendor claims; sizes, signing and prices were not tested. Websktop's paid pricing is contradicted by one aggregator.
- Pake's licence text itself (I read the repo page summary, not the LICENSE file; an aggregator says MIT).
- Whether macOS builds can be produced from Windows with electron-builder (the README says it is unreliable; not re-tested).
- Download counts or revenue for any tool.
- Not searched: Wails, Neutralino, Tauri templates other than Pake and PakePlus.

## Sources

Listed inline. All accessed 2026-09-25 (search results are US-only summaries; each vendor page was fetched and summarised by a tool, not read line by line).
