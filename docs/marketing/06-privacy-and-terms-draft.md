# 06 Privacy statement and terms (TODO M13)

**Draft, not legal advice.** Author and publisher: Abhijat (individual), contact abhijat.tech@gmail.com; jurisdiction India; licence MIT. This is plain-language starting text written for a small open-source desktop tool. Have a qualified lawyer in your jurisdiction review it before publishing, especially the liability, governing law and content-responsibility sections. Placeholders in square brackets must be filled in by the owner. Nothing here has been checked against any specific law (for example GDPR or CCPA).

The privacy statement is only accurate if the software behaves this way. Before publishing, verify in the code that Paneshell makes no network requests except the ones listed below. TODO T31 (auto-fill name and icon) and T13 (preview) will make network requests to the site the user entered; T26 (opt-in error reporting) and T24 (auto-update) would add more. Update the text when those land.

---

## Privacy statement

Last updated: `[DATE]`

**Short version.** Paneshell does not collect personal data and has no telemetry by default. We do not require an account.

**What runs where.** Paneshell runs on your computer. The URL you enter, the names, icons and settings you choose, and the projects it creates stay on your computer, in the folder you pick.

**Network requests the app makes.** The app contacts only the website address you enter, to read its title and icon and, if you use a preview, to display it. `[Confirm against the code.]` Those requests go from your computer straight to that website and are subject to that website's own privacy policy. `[If auto-update is added: The app checks GitHub Releases for updates; GitHub receives your IP address and the request as it does for any download. You can turn this off in settings.]`

**Telemetry and crash reports.** None by default. `[If T26 ships: You can choose to send crash reports. This is off until you turn it on. A report contains X and does not contain your URLs unless you add them.]`

**Apps you generate.** Apps created with Paneshell are separate programs. They load the website you chose and behave like a browser window for that site. That site may collect data under its own policy. We do not receive anything from generated apps, and the generator adds no analytics to them unless you add your own.

**Our website.** https://paneshell.abhijat.co.in `[If using privacy-friendly analytics such as Plausible (W12): We measure page visits without cookies and without storing personal data. If you use no analytics, say so.]` Downloads are served by GitHub `[or your host]`, which may log requests under its own policy.

**Waitlist or email.** `[If a waitlist form exists (M15): We store your email address only to tell you about `[what]`. We do not sell it. You can ask us to delete it at abhijat.tech@gmail.com.]`

**Your choices.** Because we hold no data about you, there is nothing to delete for the app itself. For website or email data, contact abhijat.tech@gmail.com.

**Changes.** If this changes, the date above changes and the change is noted in the changelog.

**Contact.** abhijat.tech@gmail.com

---

## Terms of use (draft)

Last updated: `[DATE]`

**1. What this is.** Paneshell is free software released under the MIT license. The license text in the `LICENSE` file governs your use of the source code. These terms cover use of the app and website in addition to that license; where they conflict, the license governs the code.

**2. Your projects belong to you.** The projects and installers you generate belong to you. Paneshell does not claim ownership of them and does not require attribution in them.

**3. You are responsible for what you wrap.** You may wrap only websites you own, or that you have permission to package, or that the site's terms allow. Wrapping a third-party site and distributing it may infringe copyright, trademark or that site's terms of service. You are responsible for that decision and for what you distribute. Do not use the tool to impersonate another service, to hide malicious content, or to phish.

**4. Generated apps and signing.** Generated installers are unsigned unless you sign them. Operating systems may warn users about unsigned software. Code signing and notarization are your responsibility.

**5. No warranty.** The software is provided "as is", without warranty of any kind, express or implied, including fitness for a particular purpose. Builds may fail or produce apps that do not work with some websites.

**6. Limit of liability.** To the extent the law allows, the authors are not liable for any damages arising from use of the software or of apps you generate. `[Lawyer: adjust for your jurisdiction; some places do not allow some limits.]`

**7. Third-party software.** Generated apps include Electron and other open-source components under their own licenses. `[Link to third-party notices file.]`

**8. Changes and ending.** We may change these terms; the date above will change. You may stop using the software at any time.

**9. Governing law.** These terms are governed by the laws of India, and the courts of India have jurisdiction. `[Lawyer: confirm the specific court/city.]`

**10. Contact.** abhijat.tech@gmail.com

---

## Notes for the owner

- Publish the statement and terms on the site (W9 footer) and link from the README.
- "We" means Abhijat, an individual, unless this changes.
- If you add hosted builds (04, Option B), both documents need a rewrite: accounts, stored data, payment and abuse handling.
