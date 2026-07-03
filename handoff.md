# Handoff — Moot Board of Governors website

_Written: July 2026 · For whoever (human or AI) picks this up next._

## 1. The goal

Build and maintain the website for the **Moot Board of Governors (MBG)** — a
**national umbrella body** for undergraduate pre-law / mooting societies at
universities across Canada. Its members are the societies themselves, each
represented on the Board by its president or a delegate.

Hard requirements (inherited from the GHPLS project it was cloned from):
- **Separate page per section** (not a one-page scroll).
- **Non-technical editors** manage everything — societies, board, competitions,
  events, news, resources, page text — through a forms-based `/admin` panel with
  **no code**.
- **Survives handoff**: next exec takes over via GitHub + Cloudflare logins.
- **Free hosting**, high traffic tolerance.
- Branding: **Forest green `#1d3a2f` + antique gold `#c8a44d` + cream `#faf7f0`**,
  Playfair Display serif + Inter, Lady-Justice/scales crest logo.

Cloned from the GHPLS site at `~/Claude/GHPLS/site` (same stack, reskinned +
restructured for a national board instead of a single club).

## 2. Current state — LIVE and working

- **Live URL:** https://mbg-website.fdeleo115.workers.dev
- **Repo:** https://github.com/fdeleo115/mbg-website (branch `main`, **public**).
- **Stack:** Eleventy (11ty) static site generator + Decap CMS (`/admin/`) +
  **GitHub OAuth login**, served by a **Cloudflare Worker**.
- **Hosting model — IMPORTANT, this is a Worker, not classic Pages:**
  Cloudflare detected `wrangler.toml` and set the project up via **Workers
  Builds** (connected to Git). Every push to `main` auto-builds and deploys.
  - **Build command:** `npx @11ty/eleventy`  (produces `_site/`)
  - **Deploy command:** `npx wrangler deploy`
  - `wrangler.toml` (`name = "mbg-website"`, `[assets] directory = "./_site"`)
    tells the Worker to serve the built site.
  - `worker.js` is the entry point: serves `_site` static assets, routes
    `/api/auth` + `/api/callback` (imported from `functions/api/*`) for the CMS
    login, and sets security headers — a **strict CSP for the public site** and
    a **looser Decap-compatible CSP for `/admin`**.
- **CMS login works** (verified). Editors sign in with their **GitHub account**.
  Access = **GitHub repo collaborators with write access** (NOT email invites).
  Owner (fdeleo115) has access; add execs via repo Settings → Collaborators.
- **OAuth secrets** live as Cloudflare Worker **Secrets** (encrypted):
  `GITHUB_OAUTH_CLIENT_ID` + `GITHUB_OAUTH_CLIENT_SECRET`, from a GitHub OAuth
  App whose callback is `https://mbg-website.fdeleo115.workers.dev/api/callback`.
  These are safe from being wiped — `wrangler.toml` has **no `[vars]` block**, so
  deploys don't overwrite dashboard secrets.

### Pages (all separate, all in nav)
Home · About (mandate + mission cards + FAQ) · Member Societies · Board ·
Competitions · Events · News · Resources · Contact · Privacy · Terms.

### CMS collections (`admin/config.yml`)
- **Member Societies** (`src/societies/`) — school, province, rep, blurb, links, logo.
- **Board Representatives** (`src/board/`) — name, role, society, order, photo.
- **Competitions** (`src/competitions/`) — upcoming/completed, results, register link, photo.
- **Events** (`src/events/`) · **News** (`src/news/`, each post → own article page)
  · **Resources** (`src/resources/`) · **Page Content** (Site Settings + About).
- Most image fields have a **drag-to-position focal point** (`admin/cms-extras.js`).
- Every collection **except News** sets `permalink: false` in its folder's
  `*.json` so the entries feed pages/listings but don't generate standalone pages.

### Design system
Palette remapped in `src/styles.css` `:root` (kept GHPLS variable *names*
`--navy`/`--peach`/`--cream`, changed the *values* to forest/gold/cream). Added
`.societies-grid`, `.society-card`, `.news-*`, and `.comp-status` styles at the
bottom. Logo at `assets/logo.jpg` (+ `logo.png` transparent, `logo-white.png`
for dark backgrounds).

## 3. Files actively being edited / most likely to touch next

- `src/_data/site.json` — **still has placeholder socials + email**
  (`instagram.com`, `linkedin.com`, `info@prelawmootboard.ca`). Update via
  `/admin` → Page Content → Site Settings, or edit the file.
- Sample content in `src/societies/`, `src/board/`, `src/competitions/`,
  `src/events/`, `src/news/`, `src/resources/` is **seed/demo data** — replace
  with the real orgs and people (GHPLS is the only real member seeded so far).
- `src/pages/contact.njk` — form is **not wired to send anywhere** (see below).
- `src/_headers` — present and passed through in `.eleventy.js`, but since this
  deploys as a Worker, `worker.js` sets the real headers; `_headers` is belt-and-
  suspenders and only takes effect if ever moved to Pages.

## 4. What was tried that failed (so you don't repeat it)

1. **File-rename `for f in $files` loop** (renaming NPMB→MBG across files) —
   mis-split on newlines and applied nothing. Fixed with
   `grep -rl … | while IFS= read -r f; do sed …; done`.
2. **`git push` → "repository not found."** The local remote was set but the
   GitHub repo didn't exist yet. Fixed with `gh repo create fdeleo115/mbg-website`
   then `git push -u origin main`. (Repo must exist before you can push to it.)
3. **Cloudflare repo picker only showed `ghpls-website`.** The Cloudflare GitHub
   App only had access to that one repo. Fixed at
   github.com/settings/installations → Cloudflare → Configure → add `mbg-website`
   (or "All repositories").
4. **Cloudflare prefilled `npx wrangler deploy` with no output-directory field.**
   It detected `wrangler.toml` and offered the **Workers** path, not Pages. We
   **went with Workers** (it's what `worker.js` + `wrangler.toml` are built for,
   and matches the `.workers.dev` login URL). Key fix: also set a **Build
   command** (`npx @11ty/eleventy`) so `_site/` exists before `wrangler deploy`.
5. **Worker deployed as `mbg-website` but `wrangler.toml` said `name = "mbg"`** —
   name mismatch risked creating a second Worker. Fixed `wrangler.toml` →
   `name = "mbg-website"` to match the live URL.
6. **`git pull --rebase` → "cannot pull with rebase: unstaged changes."** Harmless
   here (a rebuilt `_site`); the subsequent `git add -A && commit && push`
   fast-forwarded fine. Still: **`git pull --rebase origin main` before pushing**
   once execs start editing via CMS, or pushes will be rejected.
7. **Preview dev server dropped after renaming `.claude/launch.json`** name
   npmb→mbg — just restart it with the new name.

## 5. Next step I'd take

1. **Replace placeholder socials + email** in Site Settings (currently generic).
2. **Enter the real member societies + board reps** via `/admin` and delete the
   demo entries (UBC/McGill/Alberta "Representative TBA", sample competitions,
   the launch news post if not wanted).
3. **Wire the contact form** — it currently renders but goes nowhere (has leftover
   `data-netlify` attributes that do nothing on Cloudflare). Recommended:
   **Web3Forms** (free, no backend) — add the access key and post to their
   endpoint in `src/pages/contact.njk`. Until then, rely on the email/IG links.
4. **(Optional) Custom domain** — add one in the Worker's Settings → Domains &
   Routes, then update `base_url` in `admin/config.yml`, the OAuth App callback
   URL, `site.url` in `site.json`, and the `robots.txt` sitemap line to match.
5. **(Optional) Move Privacy/Terms into the CMS** — same open item as GHPLS;
   they're currently hardcoded in `src/pages/privacy.njk` / `terms.njk`.

## Quick reference

- **Local dev:** `cd ~/Claude/Shield && npx @11ty/eleventy --serve --port=8088`
- **Build:** `npx @11ty/eleventy` → outputs to `_site/`  (uses 11ty v3 via npx;
  `package.json` still pins `^2.0.1` but v3 builds fine)
- **Admin:** https://mbg-website.fdeleo115.workers.dev/admin
- **Add an editor:** GitHub repo → Settings → Collaborators → Add people (Write).
  They log in at `/admin` with GitHub. Remove = delete them from Collaborators.
- **OAuth App:** github.com/settings/developers → "Moot Board of Governors CMS".
  Callback must equal `<site-url>/api/callback`.
- **Deploy:** just `git push` (Cloudflare auto-builds & deploys from `main`).
