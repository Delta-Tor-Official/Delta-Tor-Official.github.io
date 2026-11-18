# DeltaTor official site

The static site for [DeltaTor](https://github.com/Delta-Kronecker/Delta-Tor), built for GitHub Pages.

No build step. No dependencies. Open `index.html` or serve the folder:

```sh
python -m http.server 8000
```

## What is here

| Path | Purpose |
| --- | --- |
| `index.html` | The whole page and its copy |
| `assets/site.css` | Page styles, built on the Blueprint sheet system |
| `assets/tokens.css` | Colour, type, spacing and motion tokens |
| `assets/base.css` | Base rules shared by the sheet system |
| `assets/site.js` | Race demonstration, nav behaviour, latest-release links |
| `assets/app-icon-*.png` | App icon at 32, 48, 180 and 256 px; used for the favicon, touch icon and nav mark |
| `.github/workflows/pages.yml` | Deploys the folder to GitHub Pages on every push to `main` |

## Deploy

1. Push this folder to the repository that owns the Pages site. For a root site the repository must be named `<user>.github.io`; here that is `Delta-Tor-Official.github.io`, so the address is `https://delta-tor-official.github.io/`.
2. In the repository, open **Settings → Pages**.
3. Under **Build and deployment → Source**, choose **GitHub Actions**.
4. Push to `main` (or run the `Deploy to GitHub Pages` workflow manually). The workflow publishes the directory as-is.

If you prefer the branch source instead, choose **Deploy from a branch**, then `main` and `/ (root)`. No build is required.

## Downloads

The static links point at release `v2.3.0`:

- `deltator-v2.3.0-universal.apk`
- `deltator-win64-v2.0.0.zip`
- `deltator-v2.3.0-arm64-v8a.apk`
- `deltator-v2.3.0-armeabi-v7a.apk`

On load, `assets/site.js` asks the GitHub API for the latest release and rewrites those links, sizes, version and date. If the request fails or JavaScript is off, the static links above still work. After a release that changes asset naming, update the static `href` values and `data-size` text in `index.html` so the no-JavaScript fallback stays current.

The API call is unauthenticated and limited by GitHub to 60 requests per hour per address. The site adds no analytics, cookies or third-party scripts beyond Google Fonts.

## Editing

- Copy lives in `index.html`; there are no templating placeholders.
- Colours, type and spacing live in `assets/tokens.css`; `assets/site.css` only uses those tokens.
- The page is set in Chakra Petch, IBM Plex Sans and IBM Plex Mono, loaded from Google Fonts.
- The icon comes from the app itself (`Windows/assets/app/DeltaTor.ico` and the Android launcher). Replace the four PNGs in `assets/` if the app icon changes.
- The release facts in the hero title block, the privacy register and the download panels come from the project README and the v2.3.0 release. Keep them in step with the product.

## License

The site content is published under the same MIT license as DeltaTor.