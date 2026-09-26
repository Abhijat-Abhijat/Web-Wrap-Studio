# 03 Tagline and pitch (TODO M3)

Based on the angle in 01: an installer for your website, no terminal. Claims here must stay true at launch. The lines marked "needs T10" only hold once in-app build ships.

## Eight tagline options

1. Turn a website into a desktop app. No terminal. (47 chars)
2. Paste a URL. Get a desktop installer. (36)
3. A desktop app from any URL, without the command line. (54)
4. Website in, Windows, Mac and Linux installers out. (51)
5. Package your web app for the desktop in one screen. (52)
6. The no-terminal way to wrap a website as an app. (49)
7. Your site as an installer, and the project is yours. (54)
8. Make a desktop app from a URL. Keep the source. (49)

Notes: 2, 4 and 7 promise an installer and need T10 (or the GitHub Actions build, T4, explained clearly). 1, 3, 5, 6 and 8 stay true if only scaffolding ships, but 1, 3 and 6 still imply no terminal, which needs T12. After the second competitor pass, "no terminal" is no longer unique (PakePlus and hosted services claim it), so it works better as a supporting line than as the headline.

Current state (2026-09-25): the single-input flow with automatic name and icon exists, the output is config-driven, and in-app build is in progress. That supports option 2 for the app and option 8 for the copy about ownership. Two more options that reflect the ownership angle, added in this pass:

9. Paste a URL. Get a desktop app you own. (38)
10. One URL in. An editable desktop app out. (39)

## Top pick

**"Paste a URL. Get a desktop installer."**

Reasoning:
- Two short sentences, each a step. It describes the whole product without a category word the reader must interpret.
- It says installer, not app. "App" invites comparison with browser shortcuts and WebCatalog; "installer" names the thing you can hand to someone, which is where we differ (see 01).
- It avoids a claim about speed, quality or size, none of which we can support against Pake.
- It fits the 60-character Product Hunt limit and reads cleanly as a website hero headline.

Runner-up: "Turn a website into a desktop app. No terminal." Use it if the launch audience is broader and the word "terminal" is the hook. Risk: it makes a negative promise a developer will test on day one.

If T10 has not shipped, fall back to option 8 or 9, which are accurate for scaffolding. This is a recommendation; the final wording is the owner's call.

Proposed secondary line under the headline: "Free, local, no account. The project is plain Electron and yours to edit."

## One-line pitch

Paneshell turns a URL into a desktop app project for Windows, macOS and Linux from a single screen, with no terminal and no account.

## Three-sentence pitch

Paste a website address into Paneshell and it creates a ready-to-build Electron project, driven by one `paneshell.config.json`, with the name and icon filled in for you, and it can produce installers for Windows, macOS and Linux (in-app build is in development; today the project includes build scripts and a GitHub Actions workflow). You do not need a terminal, an account or a subscription, and the project it generates is plain Electron code that you own and can edit. It is free and open source, and it is meant for people who need to give someone a real installer for a web app, not for people who want to organise browser tabs.

## Words to avoid in copy

Do not write "the only" or "first" no-terminal tool (false, see 02). Seamless, unleash, game-changer, effortless, revolutionary, "blazing fast", "lightweight" (untrue for Electron; Pake owns it). Do not claim "fast", "small" or "secure" without a measurement.

## Name: Paneshell

Say it "PAYN-shell" (pane as in window pane, shell as in app shell). Nine characters, so it fits Product Hunt's 40-character name limit with room to spare.

- Pane + shell: a window pane (the website) wrapped in a native app shell.
- The pane is the site you already have; the shell is the desktop app that hosts it.
- Short, one word, easy to type as a command, a repo name and an installer name (`Paneshell-Setup-<version>.exe`).
