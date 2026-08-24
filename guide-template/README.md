# TrueHull guides: how to publish an article

This folder is **not deployed** (the Pages workflow publishes `public/` only). It
holds the article template the marketing side fills in. The live guides live at
`public/guides/`.

## Where things live

- `public/guides/index.html` — the guides landing page (the list of articles).
- `public/guides/guides.css` — shared styles for the index and all articles.
- `public/guides/<slug>/index.html` — one folder per article. The folder name is
  the URL slug, so `public/guides/how-to-check-a-used-boat/index.html` serves at
  `https://gettruehull.com/guides/how-to-check-a-used-boat/`.
- `guide-template/article-template.html` — the template to copy for a new article.
- `public/guides/how-to-check-a-used-boat-before-you-buy/index.html` — a worked
  **sample** article (marked as a sample; replace or remove before real launch).

## Publish a new article

1. Pick a short, hyphenated **slug** (lowercase, no trademark symbol, no spaces).
2. Copy `guide-template/article-template.html` to
   `public/guides/<slug>/index.html`.
3. Replace every `{{PLACEHOLDER}}` in that file (they are listed in the comment
   at the top of the template): title, description, dates, kicker, read time,
   share image, the article body, and related links.
4. Write the body as `<h2>` sections with `<p>`, `<ul>`, and `<ol>`. Keep exactly
   one `<h1>` (already in the header). No inline `style=` attributes or inline
   `<script>` (the CSP blocks them).
5. Add a card for the article in `public/guides/index.html` (copy an existing
   `<a class="guide-card">` block).
6. Add a `<url>` block for the article in `public/sitemap.xml` (copy an existing
   one; update `<loc>` and `<lastmod>`).
7. Preview locally, then follow the repo's push discipline: branch, show
   `git diff --stat`, and get owner confirmation before pushing to `main`.

## Rules the copy must follow

These come from `docs/plans/landing-review-brief.md` in the app repo and are
non-negotiable:

- **No pricing** anywhere.
- **No em dashes** in any copy. Use commas, periods, or colons.
- **One trademark symbol per page** and it rides the nav wordmark (already in the
  template). Do not add a second in the title, the prose, or the footer. **Never
  the circled-R symbol.** Never a mark symbol in `<title>`, `aria-label`, or a URL.
  In prose, the mark is an adjective on a generic noun ("TrueHull risk report"),
  never a possessive or a plural.
- **BARD-off.** Do not claim TrueHull searches a Coast Guard accident record, and
  do not use the literal accident-search phrase the deploy gate blocks. It is fine
  to frame accident history as something a records check does not reveal.
- **Records routing hedge.** Say "routes you to official and authoritative
  sources." Never "official sources only" (NICB is a non-profit). Never a verb
  implying TrueHull performs, queries, retrieves, stores, or verifies the search.
- **Coming-soon honesty.** Never imply the service is live or already in use. The
  waitlist call to action and "when it is ready" framing are how the pages say it.
- **No competitor names. No storm-map screenshots or interactive demo. No hard
  per-report counts** (say "a dozen-plus"; verify any number against the app).
- **Self-contained.** No new external requests. Reuse `/styles.css`,
  `/guides/guides.css`, the vendored fonts, and `/assets/site.js`.

## Deploy gates (do not trip them)

`.github/workflows/pages.yml` fails the build if `public/` contains the literal
`PLACEHOLDER-FORM-ID`, or if it carries the affirmative Coast Guard
accident-search claim while `BARD_LIVE` is not `true`. Keep both out of every
guide page.
