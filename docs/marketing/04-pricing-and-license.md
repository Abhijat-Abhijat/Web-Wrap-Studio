# 04 Pricing and license (TODO M4, M5)

**This is the owner's decision.** Below are options and a recommendation. Nothing here is legal or tax advice. Every price is a hypothesis anchored on competitor prices I could verify; none comes from customer research.

## Verified price anchors (see 02)

- WebCatalog Pro $5 per user per month billed annually, Business $8; free tier limited to 2 apps.
- Fluid: free, $5 license for extras (Mac only).
- Coherence X X6: $39.99 for one Mac, $59.99 for three, $99.99 for five; Setapp $9.99 per month (vendor buy page, checked 2026-09-25).
- Websktop (hosted): $10 per app and $2 per build beyond a free tier (vendor page; one search summary says plans from $12 per month, unconfirmed). WebsiteToApp (hosted): $45 one time for an unbranded Windows .exe (single vendor page).
- Pake, PakePlus, Nativefier: free open source.

## What could cost money to run

Only things that are not local. As designed today, Paneshell runs on the user's machine and costs nothing per user. Costs appear only if you add: hosted builds (CI minutes, especially macOS runners), code signing certificates (Windows certificate, Apple Developer Program membership), or an update server. I have not verified current prices for these; check them before setting any paid tier. TODO T23 (signing) and T28 (signed releases) mean you will carry the certificate cost yourself for the app's own releases regardless of model.

## Option A: Free and open source, no paid tier at launch

Everything is free, code is public. Optional donations or sponsor link.

- For: matches the "no account, no subscription" differentiator in 01; simplest launch; open source is what Show HN and r/electronjs reward; no payment, tax or refund handling.
- Against: no revenue; you bear signing and hosting costs; maintainers of Nativefier ended up with an unmaintained project, and a free-only tool with no funding can go the same way (inference).
- Fits: solo owner testing whether anyone wants this.

## Option B: Free core, paid convenience later

Free: the desktop app, local builds, GitHub Actions workflow. Paid (later, not at launch): hosted cloud build (no Node, no CI setup) and/or signing service, sold per build pack or as a monthly plan.

- For: charges for things that cost you money; the free core keeps the differentiator; signing is a real pain for the persona in 01, so there is a plausible willingness to pay (inference, untested).
- Against: needs accounts and a backend, which conflicts with the no-account, no-telemetry positioning; hosted builds mean you handle arbitrary user URLs on your infrastructure (abuse and legal exposure); more support load.
- Fits: after launch, if users ask for it. Test with a waitlist (M15) before building.
- Price hypothesis to test, not recommend: a range near the anchors above, for example a few dollars per month or a one-off per-app fee. I have no evidence for a specific number.

## Option C: One-time paid license for the app (Fluid-style)

Free trial or free with limits, one-time license (Fluid's $5 is the low anchor, Coherence X's about $30 the high one).

- For: familiar on desktop; no backend; predictable.
- Against: contradicts open source unless the paid part is a binary-only or convenience build; a free open-source rival (Pake) already exists, so a paid GUI must clearly earn it; hurts Product Hunt and Hacker News reception if the tool is otherwise open.
- Fits: only if you go source-available and closed distribution, which I do not recommend at this stage.

Hosted competitors charge per app or per build ($10 and $2 for Websktop). That gives a usage-based price reference for a future Option B, and shows the local, free option has a real price advantage over them. It is not evidence that anyone would pay you.

## Recommendation

**Option A at launch, with a written commitment to test Option B afterwards.** Reasons: the audience is unproven; the differentiator in 01 is "free, no account, you own the project"; and paid features (cloud build, signing) do not exist yet (T10, T23 are Not picked). Add a "notify me about hosted builds" field on the site (W9, M15) and let its signup count decide whether to build B. Set a threshold now so you do not rationalise later, for example a number of signups you consider meaningful; I cannot supply that number.

## License

Two separate questions.

**1. License for Paneshell's own code (M5).**
- **MIT** (recommended). Short, permissive, familiar to the audience, and identical to Nativefier's license (verified, see 02), so no friction for people switching. Allows anyone to fork it, including commercially. That risk is real but low for a small tool, and it matches the "you own everything" message.
- **Apache-2.0.** Adds an explicit patent grant and a NOTICE requirement. Reasonable if you fear patent disputes or expect corporate contributors. Slightly heavier for a small tool.
- **GPL-3.0.** Pake uses GPL-3.0 with an exception for built apps (verified, 02). GPL protects against closed forks but creates doubt about generated output. If you choose GPL you must state clearly that generated projects are yours to license as you wish, as Pake does.
- **Source-available (BSL and similar).** Only if you plan Option C or a competing hosted service. Not recommended here; it reduces goodwill on the launch channels.

**2. License of the generated project.** State explicitly, in the README and app footer, that the output belongs to the user and carries no Paneshell license obligation. The template files should carry either no license header or one the user can remove. Confirm the generator's own template code is covered by the same permissive license.

**Dependencies.** The app and the generated projects depend on Electron and electron-builder. Verified 2026-09-25 from each repo page and the npm registry: Electron is MIT (v44.4.5), electron-builder is MIT (26.15.3 on npm; GitHub release 26.16.1), Electron Forge is MIT (7.11.2). Electron ships Chromium and other components with their own licences (`LICENSES.chromium.html`, a 15 MB file in the Electron distribution here). Pake's repo shows GPL-3.0 with an output exception, but it is a competitor, not a dependency. Still run a license check on `package.json` dependencies before publishing, and add a third-party notices file. Also note that Chromium inside Electron carries its own notices, which Electron ships.

Related: T27 requires replacing placeholder author, homepage and license in `package.json`; set license to the chosen SPDX id (`MIT`) at the same time and add a `LICENSE` file.

## Decisions the owner must make (all still OPEN; recommendations above)

1. Free at launch (A), or hold a paid tier open (B or C)? Recommendation: A.
2. MIT, Apache-2.0, or GPL-3.0 for the app? Recommendation: MIT (all main dependencies are MIT, so there is no licence conflict; `package.json` currently says `UNLICENSED` and `private: true`, which must change with T27).
3. Who is the legal entity (individual or company) for the licence copyright line, terms and privacy statement? Currently unset.
4. Who owns the Windows signing certificate and Apple Developer account, and does that cost come out of a sponsor or donation link?
