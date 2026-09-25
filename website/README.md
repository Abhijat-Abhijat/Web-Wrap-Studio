# WebWrap Studio website

Static HTML, CSS and one small script. No build step. Open `index.html` or serve the folder.

## Deploy

`.github/workflows/pages.yml` publishes this folder to GitHub Pages on every push to `main` that touches `website/`.
Enable it once: repository Settings, Pages, Source = GitHub Actions.
Interim URL: https://abhijat-abhijat.github.io/Web-Wrap-Studio/

All internal links and assets are relative, so the site works under the `/Web-Wrap-Studio/` subpath.

## Moving to a custom domain

The site URL appears as `https://abhijat-abhijat.github.io/Web-Wrap-Studio` in the canonical, og:url, og:image and
twitter:image tags of each `.html` file (and the JSON-LD `url` in `index.html`), in `sitemap.xml` and in the
`Sitemap:` line of `robots.txt`. Run this once from this folder (Git Bash), replacing the domain:

    sed -i 's#https://abhijat-abhijat.github.io/Web-Wrap-Studio#https://YOUR-DOMAIN#g' *.html sitemap.xml robots.txt

Then add a `CNAME` file containing the domain. Note that `robots.txt` is only read at a domain root, so it takes
effect once the custom domain exists.
