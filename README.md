#  Royal LePage Solutions — info subdomain

Companion site to royallepagesolutions.com (Bold Trail).

**Live URL:** https://info.royallepagesolutions.com

## Structure

- `index.html` — landing page
- `assets/css/header.css` — header styles (also injected into Bold Trail)
- `assets/css/styles.css` — site-wide styles (this subdomain only)
- `assets/js/header.js` — header injection + behavior (also injected into Bold Trail)
- `CNAME` — custom domain config for GitHub Pages
- `photos/brand/` — logo files and brand assets

## Deployment

This repo deploys automatically to GitHub Pages from the `main` branch.

## Bold Trail integration

The same `header.css` and `header.js` files are referenced from Bold Trail's custom code injection. To update the header across both sites, edit the files in this repo. Cache-bust by incrementing the version query string (`?v=1001` → `?v=1002`) wherever the files are referenced.

## Brand compliance

This site follows the Royal LePage 2024 Brand Guidelines:
- Approved colors only: Black, Red (#EA002A), White, plus warm grey secondary palette
- Approved font: Raleway
- No italics
- ® symbol on first occurrence per page
