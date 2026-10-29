# Ibrahim Javed, portfolio

Research and data analyst in Lahore. Data in, decisions out. A tabbed single-page portfolio with work you can interact with.

## Tabs

- **Home:** who I am, headline results, and quick links.
- **Case studies:** a live QA tool (invented sample records), a test-site walkthrough, a self-updating dashboard (invented data), and an editable market-sizing model.
- **Excel:** a valuation of Philip Morris (Pakistan) Limited with an editable forecast builder.
- **Python and Stata:** four regression and forecasting projects, and an odds-ratio explorer for an ordered-logit thesis.
- **Projects:** every project with skill filters, plus the toolkit.
- **About:** experience, education, and contact.

Each tab has its own link, for example `#excel` or `#stata`.

## Run it locally

No build step. From this folder:

```
python3 -m http.server 8000
```

Then open http://localhost:8000.

## Structure

```
index.html            the page
assets/style.css      styles (light and dark themes)
assets/main.js        interactive pieces and tab routing
assets/img/           portrait and charts from the Python notebooks
assets/og-image.jpg   link preview image
tools/                the QA tool demo page
robots.txt, sitemap.xml, favicon.svg, 404.html, .nojekyll
```

## Notes

Dashboard and QA tool demos use invented data. Figures in the case studies come from my own analysis files.
