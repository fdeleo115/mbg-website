# Moot Board of Governors — site handoff

Built from the GHPLS site as a template. Same stack: **Eleventy + Decap CMS + GitHub OAuth via Cloudflare**, hosted as a static site (Netlify config included).

## Run it locally
```bash
cd Shield
npx @11ty/eleventy --serve --port=8088   # dev server with live reload
npx @11ty/eleventy                        # one-off build into _site/
```

## What's done
- **Forest & Gold** palette (`#1d3a2f` / `#c8a44d` / `#faf7f0`) applied in `src/styles.css`.
- Pages: Home, About/Mandate, Member Societies, Board, Competitions, Events, News, Resources, Contact, Privacy, Terms.
- Data model (CMS-editable collections):
  - `src/societies/` — member pre-law societies (school, province, rep, logo, links)
  - `src/board/` — board representatives roster
  - `src/competitions/` — national competitions (upcoming/completed, results, register link)
  - `src/events/` — events calendar
  - `src/news/` — announcements; each post gets its own article page
  - `src/resources/` — guides, moot problems, packages
- Sample content seeded in each collection so pages aren't empty — replace via the CMS or by editing the markdown.
- CMS admin at `/admin` (`admin/config.yml`) with all the new collections + a drag-to-position photo focal point.

## ⚠️ Placeholders to replace before going live
1. ~~Official name~~ — **done**: "Moot Board of Governors" / "MBG" set in `src/_data/site.json`.
2. ~~Logo~~ — **done**: the Moot Board of Governors crest is installed at `assets/logo.jpg` (also `logo.png` transparent, `logo-white.png` for dark backgrounds).
3. **GitHub repo** — `admin/config.yml` `backend.repo` is set to `fdeleo115/npmb-website` (placeholder). Create the repo and update.
4. **OAuth / Cloudflare Worker** — `admin/config.yml` `base_url` (`https://npmb.fdeleo115.workers.dev`) and `wrangler.toml` `name = "npmb"` are placeholders. Re-deploy the Worker (`worker.js` + `functions/api/*`) and set `GITHUB_OAUTH_CLIENT_ID` / `GITHUB_OAUTH_CLIENT_SECRET` for a new GitHub OAuth app, same as GHPLS.
5. **Social + email** — Instagram/LinkedIn/email in `src/_data/site.json` are placeholders.
6. **Domain** — `site.url` in `site.json`, the sitemap, and `robots.txt` point to `prelawmootboard.netlify.app` (placeholder).

## Notes
- `YYYY-MM-DD` dates are parsed as UTC, so they can display one day earlier in western time zones — inherited from the GHPLS template; fix in `.eleventy.js` `dateFormat` if it matters.
- Member societies, board reps, competitions, events, and resources don't generate their own pages (set via `permalink: false` in each folder's `*.json`); only News posts do.
