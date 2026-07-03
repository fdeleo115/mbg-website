# Setting up the Moot Board of Governors site

This deploys the site on **Cloudflare Pages** with a **GitHub-login CMS** at `/admin` — the
same free, no-server setup GHPLS runs on. Editors change content through a form-based admin;
every save commits to GitHub and auto-redeploys. Budget ~30–45 min the first time.

You'll need: a **GitHub** account, a **Cloudflare** account (free), and this folder on your Mac.

---

## Step 1 — Put the code on GitHub

```bash
cd ~/Claude/Shield
git init
git add -A
git commit -m "Initial commit — Moot Board of Governors site"
```

Create an empty repo named **`mbg-website`** at https://github.com/new (no README/gitignore —
the folder already has them). Then connect and push (replace the URL if your username differs):

```bash
git branch -M main
git remote add origin https://github.com/fdeleo115/mbg-website.git
git push -u origin main
```

> The repo can be **public or private** — the CMS logs in as a repo collaborator either way.

---

## Step 2 — Deploy on Cloudflare Pages

1. Go to https://dash.cloudflare.com → **Workers & Pages** → **Create** → **Pages** →
   **Connect to Git**, and pick the `mbg-website` repo.
2. Build settings:
   - **Framework preset:** None
   - **Build command:** `npx @11ty/eleventy`
   - **Build output directory:** `_site`
3. Click **Save and Deploy**. After ~1 min you'll get a live URL like
   `https://mbg-website.pages.dev`. **Copy that URL** — you need it next.

The `functions/` folder is picked up automatically as Cloudflare Pages Functions — that's what
powers the `/api/auth` and `/api/callback` login routes. Nothing extra to configure for them.

---

## Step 3 — Create a GitHub OAuth app (the CMS login)

1. https://github.com/settings/developers → **OAuth Apps** → **New OAuth App**.
2. Fill in:
   - **Application name:** `MBG CMS`
   - **Homepage URL:** your Pages URL, e.g. `https://mbg-website.pages.dev`
   - **Authorization callback URL:** that URL **+ `/api/callback`**, e.g.
     `https://mbg-website.pages.dev/api/callback`
3. **Register**, then **Generate a new client secret**. Keep the **Client ID** and
   **Client secret** on screen for the next step. (Treat the secret like a password.)

---

## Step 4 — Give Cloudflare the OAuth keys

In the Cloudflare dashboard → your **Pages project** → **Settings** → **Environment variables**
→ add two **Production** variables:

| Name | Value |
|------|-------|
| `GITHUB_OAUTH_CLIENT_ID` | the Client ID from Step 3 |
| `GITHUB_OAUTH_CLIENT_SECRET` | the Client secret from Step 3 |

Save, then **Deployments → Retry deployment** so the new variables take effect.

---

## Step 5 — Point the CMS at your live site

Edit `admin/config.yml` (lines at the top) so they match reality:

```yaml
backend:
  name: github
  repo: fdeleo115/mbg-website          # <- your actual GitHub repo
  branch: main
  base_url: https://mbg-website.pages.dev   # <- your live Pages URL (no trailing slash)
  auth_endpoint: api/auth
```

Also update the public URL in `src/_data/site.json` (`url`), which feeds the sitemap, and the
`Sitemap:` line in `src/robots.txt`. Then commit and push:

```bash
git add -A && git commit -m "Point CMS and sitemap at live URL" && git push
```

Cloudflare redeploys automatically on every push (~1 min).

---

## Step 6 — Log in and test the CMS

1. Visit `https://<your-site>/admin/`.
2. Click **Login with GitHub**, authorize the app.
3. Try editing something (e.g. add a News post) and **Publish**. It should commit to the repo
   and appear on the live site within a minute.

**To let other execs edit:** add them as **collaborators** on the GitHub repo
(repo → Settings → Collaborators). Once they accept, they log in at `/admin/` with their own
GitHub account. No developer needed to hand off.

---

## Step 7 (optional) — Custom domain

In the Pages project → **Custom domains** → add e.g. `mootboardofgovernors.ca`. Cloudflare walks
you through the DNS records. After it's live, update `base_url` in `admin/config.yml`, the GitHub
OAuth app's Homepage + callback URLs (Step 3), and `site.url` / `robots.txt` to the new domain.

---

## ⚠️ Contact form — one thing to decide

The contact form is currently wired for **Netlify Forms** (`data-netlify="true"`), which does
**not** work on Cloudflare Pages. Pick one:

- **Easiest:** sign up for a free form backend like **Web3Forms** (web3forms.com) or **Formspree**
  and point the form at it — I can wire this up in `src/pages/contact.njk` in ~2 minutes once you
  have an access key.
- **Or** host the site on **Netlify** instead of Cloudflare (Netlify Forms then works out of the
  box, and you can use Netlify Identity for CMS login instead of the GitHub OAuth app). Trade-off:
  GHPLS moved *off* Netlify when its free credits ran out.

Until then, the form renders but submissions go nowhere. The email/Instagram/LinkedIn contact
links do work.

---

## Everyday reference

- **Local preview:** `cd ~/Claude/Shield && npx @11ty/eleventy --serve`
- **Publish a change:** edit → `git add -A && git commit -m "..." && git push` (auto-deploys)
- **Heads-up:** if execs edit via `/admin`, the live repo gets commits your Mac doesn't have —
  always `git pull --rebase origin main` before you push, or the push will be rejected.
- **Editors:** add/remove via GitHub repo collaborators.
