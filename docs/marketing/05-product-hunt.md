# 05 Product Hunt and launch posts (TODO M10, M11, M14, M16, M17)

Placeholders to fill before use: https://paneshell.abhijat.co.in, `[GITHUB_URL]`, `[VERSION]`, Abhijat. Nothing in this file should be published until the gates at the bottom are met. All claims assume T10 (in-app build), T12 (missing Node handling) and T28 (signed release) are Done; edit where they are not.

Verified about Product Hunt from public guides (search summaries, several sources agree): tagline limit is 60 characters; the daily cycle runs on Pacific time and starts at 12:01 AM Pacific; Tuesday to Thursday are the highest-traffic days; weekends have less traffic and less competition. Source pages: [Product Hunt preparing for launch](https://www.producthunt.com/launch/preparing-for-launch), [Screenhance](https://screenhance.com/blog/product-hunt-launch-checklist-2026), [LaunchPact](https://www.launchpact.io/blog/how-to-have-a-successful-product-hunt-launch). Product Hunt's own rules change; re-read the live launch form before submitting.

Description limit, checked 2026-09-25: Product Hunt's own [preparing-for-launch page](https://www.producthunt.com/launch/preparing-for-launch) says "Description (max 500 characters)" and tagline "max 60 characters"; it also gives 240x240 for the thumbnail (under 3 MB) and 1270x760 for gallery images, minimum 2 images. Third-party guides found by search (for example [Hetz](https://www.hetz.vc/news/how-to-successfully-launch-on-product-hunt-and-rank-in-the-top-3)) give 260 characters for the description. The two sources conflict, possibly because the limit changed or the guides describe an older form. Rule: keep the description under 260 characters so it fits either way, and confirm on the live form. The 500 figure is from Product Hunt itself, so I treat it as more likely current, but I read it through a page summariser, not the raw page.

## Listing draft

**Name:** Paneshell

**Tagline (37 characters):** Paste a URL. Get a desktop installer.

**Description (about 200 characters):**
Paneshell turns a website address into a desktop app for Windows, macOS and Linux. No terminal, no account. The generated project is plain Electron code you own. Free and open source.

**Topics:** Developer Tools, Productivity, Open Source, Windows, Mac (check that Linux and Electron exist as topics; unverified).

**Links:** Website https://paneshell.abhijat.co.in; GitHub `[GITHUB_URL]`.

**Demo:** `brand/demo/demo-final.mp4` (video) and `brand/demo/demo-final.gif` (gallery/GIF); also embedded in the README.

**Gallery (M9):** exact frames, on-screen text and required app states are in 07-demo-script.md. Sizes: 1270x760 gallery, 240x240 thumbnail. Add the 30-second demo (M8) first.

## Maker comment (first comment)

Hi, I'm Abhijat, the maker of Paneshell.

I wanted to give a web app to people who would never open a terminal, and the tools I found either needed one or were tied to a subscription. Nativefier, the well-known one, has been archived since 2023.

Paneshell is one screen. You paste a URL, check the name and icon it fills in, and press create. You get an Electron project and, with in-app build, an installer for Windows, macOS or Linux. The project is plain code with one config file, so you can edit it or leave the tool whenever you want. No account, no telemetry by default.

What it is not: it is not small. Electron ships Chromium, so an installer is `[measured size, e.g. "about N MB on Windows"]`; for reference, Electron's own runtime download is 123 to 158 MB. If size is your priority, Pake and PakePlus (Tauri) produce much smaller apps and I would point you there. Hosted services also exist; the difference is that Paneshell runs on your machine, costs nothing per app and gives you the project. Paneshell is for the case where you want a GUI, an installer to hand out, and a project you control.

It is free and open source (`[GITHUB_URL]`). `[Known limitations: unsigned installers on macOS and Windows show OS warnings; list what is true at launch.]`

I would like to know what you would wrap first, and where the flow got confusing.

## FAQ answers

**How is this different from Nativefier?** Nativefier is a command-line tool and is archived and read-only since September 2023. Paneshell is a graphical app and is maintained. Output is a plain Electron project, similar in spirit.

**How is this different from Pake?** Pake uses Tauri and produces much smaller apps (its repo says under 10 MB). It is a command-line tool. Paneshell uses Electron, so apps are larger, and trades that for a GUI and a familiar Electron project.

**How is this different from WebCatalog?** WebCatalog is a workspace for running web apps, with a free tier limited to 2 apps and paid plans starting at $5 per user per month billed annually. Paneshell makes a project and installer you can distribute and has no limits or account. `[Do not claim WebCatalog cannot export installers until tested; see 02.]`

**How is this different from PakePlus and hosted services like Websktop?** PakePlus is a free Tauri-based GUI with much smaller output; its cloud packaging needs a GitHub token. Hosted services build on their servers and charge per app, per build or by plan. Paneshell is local, free, and gives you an editable Electron project, at the cost of larger installers.

**Why not just use "Install page as app" in Chrome?** For your own use, do that; it is free and needs nothing. Paneshell is for when you need to give another person a standalone installer.

**Is it free?** Yes. `[Confirm after M4 and M5 decisions.]`

**Which license?** MIT (LICENSE file present). Contact: abhijat.tech@gmail.com.

**Why is my installer flagged as unsafe?** Unsigned installers trigger SmartScreen on Windows and Gatekeeper on macOS. `[State whether releases are signed once T23 is done.]` Generated apps are unsigned unless you add your own certificate.

**Is it legal to wrap any site?** You are responsible for having the right to package the site. Wrap sites you own or have permission to use. See the terms draft.

**What data do you collect?** None by default. No telemetry, no account. See the privacy statement.

**Can it be smaller?** Not with Electron. Ask if a Tauri option would matter to you.

**Does it need Node?** `[Depends on T12. If it bundles a build runtime, say no. If not, say it needs Node and where to get it.]`

## Decisions that stay with the owner (OPEN)

Audience (developers vs hand-it-to-others), free vs paid (recommend free at launch), licence (recommend MIT), legal entity, and launch date. Recommended gates before a date is picked are in the launch-date guidance below. Status update 2026-09-25: single-input flow, automatic name and icon, config-driven output and the landing site exist; in-app build (T10), missing-Node handling (T12) and signed releases (T28) are not confirmed done, so the "no terminal" claims in these drafts stay conditional.

## Launch-week checklist

Two weeks before
- [ ] T10, T12, T28 Done; three-OS smoke tests (T25) pass
- [ ] Site live with download links and checksums (W7, W14)
- [ ] Gallery images and 30-second video ready (M8, M9)
- [ ] Usability test with 5 people from the target personas; fix the top issues
- [ ] License and `package.json` metadata set (T27, M5); privacy and terms on the site (M13)
- [ ] Hunter or supporters confirmed (M14)

The week before
- [ ] Schedule the Product Hunt launch for 12:01 AM Pacific on a Tuesday, Wednesday or Thursday; confirm the launch form fields
- [ ] Draft and proofread every post below
- [ ] README rewrite with GIF and comparison table (M12)
- [ ] Verify a clean install and update on Windows, macOS and Linux from the released files
- [ ] Set up an inbox or issue template for feedback

Launch day
- [ ] Post the maker comment as soon as the listing is live
- [ ] Post Show HN and r/electronjs (spread across the day, not simultaneous; see rules below)
- [ ] Answer every comment; be at the keyboard for the first hours
- [ ] Message supporters individually, not in a mass blast

After
- [ ] Triage feedback; fix the top three issues (M18); publish a changelog
- [ ] Thank supporters and commenters; write up what you learned

## Show HN draft

Hacker News rules (verify on the live guidelines page before posting): title starts with "Show HN", link to something people can try, no asking for upvotes, reply to comments. Do not use a URL shortener or ask friends to vote.

**Title:** Show HN: Paneshell, paste a URL, get a desktop installer

**Text:**
I made a graphical app that turns a website URL into an Electron project and, with in-app build, installers for Windows, macOS and Linux. It is aimed at people who need to hand a web app to someone who does not use a terminal.

It exists because Nativefier has been archived since 2023 and the other options are command-line or token-based tools (Pake and PakePlus, which are great and much smaller because they use Tauri), hosted services that charge per build, or subscription products (WebCatalog). Output is a plain Electron project with one config file; no account, no telemetry by default.

Tradeoffs: installers are large (`[measured size]`) because Electron bundles Chromium. Installers are `[signed / unsigned]`. For a personal shortcut, Chrome's "Install page as app" is simpler.

Source: `[GITHUB_URL]`. Download: https://paneshell.abhijat.co.in. I would like feedback on the generated project structure and the first-run flow.

## r/electronjs draft

Check the subreddit's current rules on self-promotion before posting; use the flair the mods require.

**Title:** I built a GUI that scaffolds an Electron wrapper for any URL (open source)

**Body:**
Paneshell is an Electron app that generates an Electron project for a website. Paste a URL, it fills in name and icon, and writes a project with a `paneshell.config.json` that the template `main.js` reads. It builds with electron-builder for Windows, macOS and Linux and has a GitHub Actions workflow for three-OS builds.

Things I would like technical feedback on: the config-driven template, how the main process validates the payload (http and https only, writable output folder), and what you would want in the config that is not there. Limitations: large installers; `[list]`.

Repo: `[GITHUB_URL]`. Site: https://paneshell.abhijat.co.in.

## Supporter outreach template

Send individually to people who know you or have a reason to care. Do not ask anyone to upvote; ask them to look and comment honestly if they have something to say.

> Hi `[NAME]`,
>
> I'm launching Paneshell on Product Hunt on `[DATE]` (it goes live at 12:01 AM Pacific). It is a free, open-source app that turns a website URL into a desktop installer with no terminal. I would value your honest look at it, especially the first-run flow.
>
> If you have 5 minutes on launch day, the listing will be at `[PH_URL]`. A real comment about what worked or confused you helps more than a vote. If it is not your area, no problem at all.
>
> You can try it beforehand: https://paneshell.abhijat.co.in or `[GITHUB_URL]`.
>
> Thanks, Abhijat

Target list: 10 to 20 people (TODO M14). Keep a private tracker: name, relationship, contacted, replied.

## Launch-date guidance

- Today is Friday 2026-09-25. I am not picking a date because the gates matter more than the calendar.
- Choose a Tuesday, Wednesday or Thursday (higher traffic, more competition) unless you decide a weekend's lighter competition suits a small tool. Both trade-offs come from public guides, not from data on this product.
- Avoid dates that clash with major launch days such as big tech keynotes or large product releases; check the Product Hunt front page the week before.
- Do not launch before T10, T12, T28 and W14 are Done. A launch that says "no terminal" and then requires one will produce the most damaging comments.
- Leave at least one working week between the release build and launch to fix install problems found on other machines.
- Keep the three days after launch free for support.
