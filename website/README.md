# Paneshell website

Static HTML, CSS and one small script. No build step. Open `index.html` or serve the folder.

## Deploy

`.github/workflows/pages.yml` publishes this folder to GitHub Pages on every push to `main` that touches `website/`.
Enable it once: repository Settings, Pages, Source = GitHub Actions.
Production URL: https://paneshell.abhijat.co.in (`CNAME` file in this folder). In Pages settings set the custom domain and enable HTTPS. DNS: a CNAME record `webwrapstudio` on `abhijat.co.in` pointing to `abhijat-abhijat.github.io`.

All internal links and assets are relative, so the site works under a subpath or the domain root.

