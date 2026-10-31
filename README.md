# Good Things

A small, responsive recipe ingredient finder built from [`recipes.csv`](./recipes.csv). Select a recipe to see only the ingredients whose amounts are greater than zero.

## Run locally

Serve this directory over HTTP (the page fetches `recipes.csv`):

```sh
python -m http.server 8000
```

Then open `http://localhost:8000`.

## GitHub Pages

The workflow in `.github/workflows/pages.yml` deploys the site when changes are pushed to `main`. In the repository's **Settings → Pages**, set the build and deployment source to **GitHub Actions**. This setting must be enabled once before the first deployment.
