# 01 Positioning brief (TODO M1)

Status: draft for owner review. Date: 2026-09-25.
Method: product-lens diagnostic (who, pain, why now, MVP, anti-goal, success metric), then the competitive-platform-analysis brief fields (identity, offer, target, differentiator, scoping consequence, strategic tension). Competitor facts are in 02-competitors.md with sources.

Fact vs inference: statements about what WebWrap Studio does today come from TODO.md. Statements about competitors are sourced in 02. Anything labelled "inference" is my judgment, not a measured fact. There is no user research behind the personas below; they are hypotheses to test.

## What the product is, today

WebWrap Studio is an Electron desktop app. Verified in the code on 2026-09-25 (`src/main/generator.js`, `src/renderer`, `../website`):

- **Single input.** The user pastes a URL; the app inspects it and fills in the name and icon automatically (IPC `webwrap:inspect-url`), with a default output folder.
- **Config-driven output.** The generated project has a `webwrap.config.json` (keys today: `url`, `name`, `window.width/height`, `openExternalLinksInBrowser`, `singleInstance`) that the template `main.js` reads. New features become new keys.
- **Installer targets.** The generated project ships electron-builder config and `dist:win`, `dist:linux`, `dist:mac` scripts; the studio repo has a three-OS GitHub Actions workflow.
- **In-app build: in progress.** There is no build IPC handler in `main.js` yet. Until in-app build (T10) and missing-Node handling (T12) land and pass on all three OSes, a user still needs Node and a terminal to produce an installer. Every "no terminal" claim below depends on this.
- **Landing site: built** as static pages in `../website` (home, download, FAQ, changelog); not yet deployed.
- Not yet in code: tray, custom CSS/JS injection, permissions and user-agent options, auto-update, signing.

## Audience (hypothesis personas)

1. **The internal-tool owner.** Works at a small company or agency. Has a web dashboard, admin panel or client portal and wants a double-clickable app to hand to non-technical colleagues or clients. Can use a GUI, will not use npm. Needs an installer file they can email.
2. **The indie maker with a web product.** Built a web app (Next.js, Rails, anything) and wants a "Download for Windows/Mac" button without learning Electron. Comfortable with a terminal but has better things to do. Cares about the icon, name and window looking right.
3. **The power user with a web app they live in.** Wants a separate window, dock icon and Alt-Tab entry for a service such as a dashboard or a wiki. This persona is best served by WebCatalog, Fluid or Chrome's "Install page as app" today, so it is the weakest fit (see anti-goals).
4. **The learner or hobbyist developer.** Wants to see what an Electron project looks like and get a working starting point they can edit. Values that the output is a real, readable project.

Primary: 1 and 2. Persona 4 is a natural secondary and costs nothing extra because the output is a plain project.

## Pain (what people do today)

- Nativefier, the best-known tool, is archived and read-only since 2023-09-29, and its own maintainers recommend browser shortcuts for casual use or Electron directly for custom wrappers (sources in 02). It is also a command-line tool installed through npm.
- Pake is actively maintained and produces small apps, but it is a CLI and its local build needs a Rust and Node toolchain; its online build option runs through GitHub Actions (02). PakePlus adds a GUI on the same Tauri approach, but its cloud packaging needs a GitHub token (02).
- Hosted services (Websktop, WebsiteToApp, Appy Pie) take a URL in a browser and return an installer, with per-app, per-build or subscription pricing (02). Their claims are single-source and untested by me.
- WebCatalog has a GUI but is a subscription product; the free tier is limited to 2 apps (02). It is built for running apps inside its own workspace; whether it exports an installer you can distribute is unverified.
- Writing an Electron wrapper by hand or with Electron Forge or electron-builder works but requires Node, config files and code signing knowledge.
- Chrome and Edge can install any page as an app, but the result is a browser-managed shortcut, not a standalone installer you can hand to someone else (inference from 02 sources: the feature installs for the current user).

Frequency and severity are not measured. I do not have numbers for how many people attempt this per month. That should be tested (see open questions).

## Why now (inference)

The obvious incumbent (Nativefier) is unmaintained, which leaves a slot for "the maintained, friendly one". The second pass showed the slot is not empty: Pake is maintained and large (61.7k stars), PakePlus is a GUI with 14.9k stars, and several hosted services sell the same paste-a-URL flow (02). The remaining gap is narrower: local, free, no account, and you keep an editable project.

## Differentiator

WebWrap Studio is the free, local, open-source option where you paste one URL and get a plain Electron project (and, once T10 ships, an installer) with no subscription, no per-app or per-build fee, and no third party seeing your URL.

Checkable differences:

1. **Local and account-free.** Hosted services build on their servers and charge per app, per build or by plan (02). PakePlus cloud packaging needs a GitHub token. WebWrap Studio needs neither once T10 and T12 land.
2. **You own the output.** The generated project is plain Electron plus one `webwrap.config.json`. Open it, edit it, leave the tool. Nothing phones home.
3. **One input.** URL in; name, icon and output folder are filled in automatically and editable.
4. **Cross-platform output from one GUI.** Fluid and Coherence X are Mac only.

Where it loses, stated plainly: size (Pake and PakePlus claim under 10 MB and under 5 MB; Websktop claims about 4 MB on Windows; Electron's own runtime archive is 123 to 158 MB, see 02), and "no terminal" is no longer unique.

## Anti-goals

- Not a browser or tab manager. No workspaces, profiles, sync or "app catalog". That is WebCatalog's ground.
- Not competing on installer size. Electron bundles Chromium. The official Electron 44.4.5 runtime archives are 123 to 158 MB compressed (02, measured from GitHub release assets). Pake's claim is under 10 MB. We lose that comparison and should say so plainly.
- Not a general Electron IDE or template marketplace.
- Not an account-based cloud service at launch. Local first.
- Not a way to wrap sites the user does not have the right to package. FAQ and terms should say the user is responsible (see 06).

## Strategic tension

**Ease for non-developers vs credibility with developers.** The audience that wants "no terminal" does not read GitHub or vote on Show HN. The audience that upvotes on Product Hunt and Hacker News is developers, who already know Pake and will point at the 100 MB installer size. A launch aimed at developers invites the size comparison; a launch aimed at non-developers has no obvious channel.

Secondary tension: the promise is "no terminal", but until T10 and T12 ship the user still needs Node and a terminal to build. Launching before that is the single largest positioning risk.

## Scoping consequence for competitors

Weight competitors by who they serve (non-developer who wants an installer), not by technology. Tier by that: Pake and Nativefier share the job but not the audience; WebCatalog and Fluid share the audience but not the job (distributable installer).

## Recommendation: the single sharpest angle

**"Paste a URL, get a desktop installer. Free, local, and the project is yours."** Lead with the one-input flow and ownership, aimed at persona 1 and 2 (people who need to hand someone an app). "No terminal" stays as a supporting line rather than the headline, because PakePlus and the hosted services already claim it, and a developer can test it on day one. Do not lead with "wrap any site as an app"; that describes a dozen products.

Supporting proof points, in order (each now backed by what exists): one input with name and icon filled in automatically; a generated project driven by one `webwrap.config.json`; installers for three operating systems via GitHub Actions today and in-app build when T10 ships; free, open source, no account, URL never leaves your machine except to fetch the site's title and icon.

Gate: do not say "installer without a terminal" publicly until T10 and T12 are Done and tested on all three OSes. Before then the accurate wording is "generates an Electron project with installer scripts and a CI workflow". If launch must happen earlier, that is the weaker but honest angle.

Recommendation, marked as such: the audience choice and launch timing below are the owner's.

## Metrics (how you would know it is working)

Proposed, not measured: (a) percentage of first-run users who reach a produced installer without opening a terminal, measured in a usability test with 5 people from persona 1 or 2 before launch; (b) GitHub stars and releases downloads as a rough interest signal; (c) count of repeat users who generate a second app. No telemetry by default (see 06), so (a) and (c) require voluntary feedback or opt-in.

## Open questions for the owner (all still OPEN)

1. Which persona is the launch audience: people who hand apps to others (1 and 2), or developers on Show HN? The copy, channel and even the gallery screenshots differ. My recommendation is 1 and 2 with developers as the amplifier, but you know who you can reach.
2. Will you hold the launch until in-app build (T10) and missing-Node handling (T12) work on all three OSes? If not, we need to rewrite the angle to something weaker and be explicit in the listing that a Node install is required.
3. Are you willing to state the installer-size cost openly (a 100 MB-plus download versus Pake's under 10 MB; measure your own installer first, see 02) and compete on "no terminal, you own the project" instead? If you plan to reduce size later (for example a Tauri output option), that changes the strategy and should be decided now.
