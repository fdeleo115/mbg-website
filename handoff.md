# Handoff — Moot Board of Governors website

_Updated: July 2026 · For whoever (human or AI) picks this up next._

---

## 1. The goal

Build and maintain the website for the **Moot Board of Governors (MBG)** — a
**national umbrella body** for undergraduate pre-law / mooting societies at
universities across Canada. Members are the societies themselves (each
represented on the Board), plus individual recognized pre-law members.

Hard requirements:
- **Separate page per section** (not a one-page scroll); everything reachable
  from the landing page.
- **Non-technical editors** manage everything through a forms-based `/admin`
  panel — **no code**.
- **Survives handoff**: next exec takes over via GitHub + Cloudflare logins.
- **Free hosting**, high traffic tolerance.
- Branding: **Forest green `#1d3a2f` + antique gold `#c8a44d` + cream `#faf7f0`**,
  Playfair Display serif + Inter, Lady-Justice/scales crest logo.
- **MUST look visibly distinct from GHPLS**, the site this was cloned from
  (`~/Claude/GHPLS/site`). Visitors should not think they're the same site.
  This drove the July 2026 redesign (see §2).

---

## 2. Current state — LIVE, redesigned, working

- **Live URL:** https://mbg-website.fdeleo115.workers.dev
- **Repo:** https://github.com/fdeleo115/mbg-website (branch `main`, public).
- **Latest commit:** `fea6a38` "Redesign site distinct from GHPLS; new IA, Gala
  tab, searchable members" (pushed; auto-deploys).
- **Stack:** Eleventy (11ty v3 via npx) + Decap CMS (`/admin/`) + **GitHub
  OAuth login**, served by a **Cloudflare Worker**.

### Hosting model — IMPORTANT: this is a Worker, not classic Pages
Cloudflare set this up via **Workers Builds** (connected to Git). Every push to
`main` auto-builds and deploys.
- **Build command:** `npx @11ty/eleventy`  (produces `_site/`)
- **Deploy command:** `npx wrangler deploy`
- `wrangler.toml` (`name = "mbg-website"`, `[assets] directory = "./_site"`).
- `worker.js` is the entry point: serves `_site`, routes `/api/auth` +
  `/api/callback` (CMS login), and sets security headers — a **strict CSP for
  the public site** (`script-src 'self' 'unsafe-inline'` — inline scripts like
  the members search + nav toggle ARE allowed) and a **looser Decap CSP for
  `/admin`**.
- **CMS login works.** Editors sign in with **GitHub**. Access = **GitHub repo
  collaborators with Write access** (Settings → Collaborators), NOT email invites.
- **OAuth secrets** are Cloudflare Worker **Secrets** (`GITHUB_OAUTH_CLIENT_ID`
  + `GITHUB_OAUTH_CLIENT_SECRET`). Safe from deploys — `wrangler.toml` has no
  `[vars]` block.

### The redesign (what makes it distinct from GHPLS)
`src/styles.css` was rewritten as an editorial / "register" design language.
The CSS **variable names are inherited** (`--navy` = forest, `--peach` = gold) —
templates reference them inline, so keep the names; the values are forest/gold.
Divergences from GHPLS:
- **Nav:** light cream masthead (not a dark translucent bar), gold underline on
  hover/active. Collapses to a hamburger **≤1140px** (11 tabs need the room);
  fits one line ≥1141px.
- **Homepage** (`src/pages/index.njk`): forest hero + a numbered **"The
  Register"** index of every section (replaced the GHPLS `portal-card` grid —
  those classes are gone).
- **Page headers:** cream, left-aligned, with a faint crest watermark (not
  centred dark banners).
- **Cards / boxes:** flat hairline frames + gold keyline, squared 4px radius.
  Repeating content uses ruled **"ledger" lists** (competitions, resources,
  news/events, members) instead of GHPLS icon-card grids. About uses numbered
  serif principles (no icons).

### Information architecture (11 nav tabs + Home)
Home · About · **Member Societies** · **Pre-Law Members** · **The Board** ·
**Elected Officials** · Competitions · **Championship & Gala** ·
**News & Events** · Resources · Contact · (Privacy · Terms in footer).

### CMS collections (`admin/config.yml`)
- **societies** (`src/societies/`) — school, province, logo, **`representatives`
  list** (name/role/photo + fit/zoom/focal), legacy single `president` fallback.
- **board** (`src/board/`) — society **representatives**; `status` field splits
  **Current / Alumni** (+ optional `term`). Photo fit/zoom/focal.
- **officials** (`src/officials/`) — the elected exec who RUN the board (Chair,
  VP, Secretary…), distinct from board reps. Also Current / Alumni. Photo controls.
- **members** (`src/members/`) — individual recognized people (name, university,
  society, **`year` = "member since"**, blurb, photo). Rendered as a
  **searchable / sortable / compact directory** (client-side JS in
  `members.njk`; sorts alphabetically server-side for the no-JS fallback).
- **competitions** (`src/competitions/`) — upcoming/completed, results, photo controls.
- **events** (`src/events/`) — surfaced on the News & Events page (no standalone
  Events tab anymore).
- **news** (`src/news/`) — each post → its own article page; also listed on News
  & Events.
- **resources** (`src/resources/`) — category, file/link.
- **Page Content** (files): Site Settings (`site.json`), About (`about.json`),
  **Championship & Gala (`gala.json`)** — intro, two component statuses
  (proposed/planned/confirmed), banquet date/location, and an editable **awards
  list**.
- Image fields have a **drag focal point** (`admin/cms-extras.js`), extended to
  resolve images inside list items (per-society reps).

### Championship & Gala (`/gala/`)
One flagship tab. A **proposed** national championship ("The Governors' Cup",
badged *Under Consideration*) + a **planned** awards banquet ("The Governors'
Gala", badged *Planned*). Status badges encode certainty
(proposed → planned → confirmed). Award categories are CMS-editable.

---

## 3. Files actively being edited / most likely to touch next

- `src/_data/site.json` — **still placeholder** socials (`instagram.com`,
  `linkedin.com`) + email (`info@prelawmootboard.ca`). Update via /admin →
  Page Content → Site Settings.
- **Seed/demo data** is placeholder and should be replaced with real orgs/people:
  - `src/members/member-*.md` — 6 fake members (Amara Singh, etc.).
  - `src/board/*.md`, `src/officials/*.md` — mostly "Representative TBA".
  - `src/societies/*.md` — only GHPLS is real (and now has an uploaded logo).
  - `src/competitions/`, `src/events/`, `src/news/` — sample entries.
- `src/_data/gala.json` — banquet date/location are blank; award recipients blank.
- `src/pages/contact.njk` — form renders but **goes nowhere** (leftover
  `data-netlify` attrs do nothing on Cloudflare). Recommended: **Web3Forms**.
- `.eleventy.js` — `monthShort`/`dayNum` filters have a **UTC off-by-one** (a
  Sept 20 event shows "SEP 19"); fix by using UTC date methods or appending a
  local time when parsing.
- `src/styles.css` — contains **dead CSS** from the old GHPLS components
  (`mission-card`, `win-card`, `news-card`, `materials-*`, `schedule-*`,
  `contact-links`, old `member-list/member-row`). Harmless but trimmable.

---

## 4. What was tried that failed (so you don't repeat it)

1. **`git push` rejected (non-fast-forward).** A **CMS edit landed on the remote**
   while working (a real GHPLS logo was uploaded + president field tweaked).
   Fix: `git pull --rebase origin main`, resolve the `GHPLS.md` conflict by
   **keeping both** the uploaded `logo`/`logoPosition` AND the new
   `representatives` list, then `git rebase --continue` and push. **ALWAYS
   `git pull --rebase origin main` before pushing** — execs edit via CMS and
   those commits land on `main` directly.
2. **Nunjucks has no `format` filter** for zero-padded numbers
   (`"%02d" | format(...)`). Fix: put the literal numerals in the data array.
3. **Nunjucks lacks `selectattr`/`rejectattr`** (that's Jinja2). Fix: added a
   custom `where(arr, key, value)` filter in `.eleventy.js` to split
   current/alumni.
4. **Focal-point CMS widget only resolved top-level images.** Inside a list
   (per-society reps) the image is nested. Fix: `admin/cms-extras.js` now parses
   Decap's `forID` (`<listName>-<index>-`) to find the sibling image, with a
   safe checkerboard fallback.
5. **Running `npx @11ty/eleventy` while the `--serve` preview is also running**
   produces confusing "Writing … from ./terms/index.html" output (two builds
   racing). Harmless; just rely on the preview server's own rebuild, or stop it
   first.
6. **Preview dev server drops** occasionally mid-session — restart it (launch
   config `.claude/launch.json`, name `mbg`).
7. (Earlier, still true) Cloudflare offered the **Workers** path (not Pages)
   because it detected `wrangler.toml` — that's correct here; keep the **Build
   command** set so `_site/` exists before `wrangler deploy`.

---

## 5. Next step I'd take

1. **Replace placeholder content with real data** via `/admin`: member
   societies, board reps, elected officials, and the first real pre-law members;
   fill in the Gala banquet date/location; update Site Settings socials + email.
2. **Fix the event-date off-by-one** in `.eleventy.js` (`monthShort`/`dayNum`
   using UTC methods) — quick, and now visible on the News & Events page.
3. **Wire the contact form** — add a Web3Forms access key and POST to their
   endpoint in `src/pages/contact.njk` (free, no backend).
4. **(When the members list grows large)** add pagination or letter-tabbed
   sections to `/members/` — today every name ships in the page HTML, fine for
   hundreds, heavy at true thousands.
5. **(Optional)** custom domain (update `base_url` in `admin/config.yml`, the
   OAuth callback, `site.url`, and the sitemap line); move Privacy/Terms into
   the CMS; trim dead CSS from `styles.css`.

---

## Quick reference

- **Local dev:** `cd ~/Claude/Shield && npx @11ty/eleventy --serve --port=8088`
  (launch config `.claude/launch.json`, name `mbg`).
- **Build:** `npx @11ty/eleventy` → `_site/`.
- **Admin:** https://mbg-website.fdeleo115.workers.dev/admin (GitHub login).
- **Add an editor:** GitHub repo → Settings → Collaborators → add with Write.
- **OAuth App:** github.com/settings/developers → "Moot Board of Governors CMS".
  Callback must equal `<site-url>/api/callback`.
- **Deploy:** `git pull --rebase origin main` → then `git push` (Cloudflare
  auto-builds & deploys from `main`).
