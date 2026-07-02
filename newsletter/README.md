# Newsletter

Monthly newsletters are published as web pages and sent via Mailchimp. The web version is linked from the email as “Read this newsletter on the website”.

## Automation

Three-step pipeline: **parse → refine → generate**

```bash
npm install

# 1. Parse raw content from the ops Google Doc
npm run newsletter:parse-doc -- --month June --year 2026

# 2. Refine — in Cursor agent chat (recommended), or:
# npm run newsletter:refine -- --content newsletter/content/2026-06.raw.json

# 3. Generate the web page
npm run newsletter:generate -- --content newsletter/content/2026-06.json
```

Or all in one:

```bash
npm run newsletter:build -- --month June --year 2026
```

### AI refinement (Cursor agent — recommended)

**No Vercel account needed.** The `ai` npm package is just a library; we are not using Vercel hosting or AI Gateway.

**No OpenAI API key needed** for the normal workflow. Each month, open an agent chat in this repo and ask e.g.:

> Build the June 2026 newsletter

The agent will parse the Google Doc, refine the copy in chat (same job you currently give ChatGPT), write `newsletter/content/2026-06.json`, and generate the HTML. See `.cursor/rules/newsletter-monthly.mdc` for the full checklist.

### Optional: CLI refinement with OpenAI

If you prefer a fully scripted refine step (no agent), add to `.env`:

```
OPENAI_API_KEY=sk-...
NEWSLETTER_AI_MODEL=gpt-4o
```

Then:

```bash
npm run newsletter:refine -- --content newsletter/content/2026-06.raw.json
```

Preview the prompt without calling the API: add `--dry-run`.

### How the ops doc is structured

The shared Google Doc stacks months (newest at the top). Each month uses:

- A month heading line, e.g. `June` or `May 2026`
- Article sections starting with `* Section title`
- Prose paragraphs under each section (converted to bullet points in the newsletter)
- Optional `C2A: ...` lines for call-to-action notes (April format)
- Contact paragraphs containing `hello@chorltonbikes.coop` become email buttons automatically

Standard hello / thank-you copy comes from `newsletter/content/_defaults.json` unless the doc includes its own intro.

**Images** — ops drop photos in Google Drive `NEWSLETTER/MM-YYYY/`. Download with your **ben@chorltonbikes.coop** Google account (private — no public sharing).

**Google sign-in (one-time setup)**

Google blocks the default `gcloud` client for Drive access (“This app is blocked”). Use your own OAuth client instead:

1. Open [Google Cloud Console](https://console.cloud.google.com/) — any project is fine (create one e.g. `chorlton-bikes-newsletter` if needed)
2. **APIs & Services → Library** — enable **Google Drive API** and **Google Docs API**
3. **APIs & Services → OAuth consent screen**
   - If you have Google Workspace: choose **Internal** (only `@chorltonbikes.coop` users)
   - Otherwise: **External**, publishing status **Testing**, add **ben@chorltonbikes.coop** under Test users
   - Add scopes: `.../auth/drive.readonly` and `.../auth/documents.readonly`
4. **Credentials → Create credentials → OAuth client ID → Desktop app** — download the JSON
5. Save it as `google-oauth-client.json` in the repo root (already gitignored)
6. Run `npm run newsletter:google-login` — sign in as ben@chorltonbikes.coop in the browser

Then each month:

```bash
npm run newsletter:sync-images -- --month June --year 2026
```

**Manual alternative (no Google Cloud at all)**

If you don't want to set up Cloud Console, download images in the browser and let the script match them:

1. In Google Drive, open `NEWSLETTER/06-2026/` → select all → **Download** (ZIP)
2. Unzip into `assets/images/newsletter/06-2026/` (keep original filenames — matching uses them)
3. Run with download skipped:

```bash
npm run newsletter:sync-images -- --month June --year 2026 --skip-download
```

The matcher still assigns images to sections, applies two/three-column layouts, and regenerates HTML. Use fallbacks from earlier months only where a section has no match.

**Note:** OAuth only needs *any* Google Cloud project (e.g. a personal one) — it does not have to be under the Chorlton Bikes org. If you ever want full automation without manual ZIPs, a free personal project + Desktop OAuth client is enough.

The script downloads images, matches filenames to articles, tiles multi-image sections, and regenerates HTML.

### Mailchimp audience sync (Airtable → Mailchimp)

Add to `.env`:

```bash
AIRTABLE_TOKEN=...
AIRTABLE_BASE_ID=appT6YjaGO6hRmNaU
AIRTABLE_TABLE_ID=tblqgtpXroIv0cmZc
MAILCHIMP_API_KEY=...-usXX
MAILCHIMP_LIST_ID=...
```

Preview changes (no writes):

```bash
npm run newsletter:sync-audience -- --dry-run
```

Apply changes:

```bash
npm run newsletter:sync-audience
```

### Mailchimp campaign draft

```bash
npm run newsletter:mailchimp -- --month June --year 2026
```

Refresh an existing draft (e.g. after image fixes):

```bash
npm run newsletter:mailchimp -- --month June --year 2026 --campaign-id <id> --refresh
```

Images are uploaded to Mailchimp Content Studio automatically (so previews work before the website is deployed). The “read on website” link still points at `chorltonbikes.coop` — deploy the site before sending.

**Mailchimp plan note:** custom HTML campaigns require a **Standard** plan or higher. The free plan is phasing out HTML sending; if you see that banner, you’ll need to upgrade (~$20/month at your list size) or continue duplicating/editing campaigns manually in the Mailchimp UI.

Rules:
- Adds new Airtable contacts to Mailchimp
- Updates merge fields for existing subscribed contacts
- Never re-subscribes contacts who unsubscribed in Mailchimp
- Never unsubscribes anyone from Mailchimp based on Airtable

### Repo layout

- **newsletter/content/_defaults.json** – shared intro and thank-you copy
- **newsletter/content/YYYY-MM.json** – parsed content per month
- **newsletter/mappings/YYYY-MM.json** – optional image/CTA overrides per section
- **newsletter/templates/web.html.hbs** – web page template
- **newsletter/YYYY-MM.html** – generated web page (live after deploy)
- **scripts/newsletter/** – generator and Google Doc parser

## Files per month

- **YYYY-MM.html** – Web page, e.g. `2026-01.html`, `2026-02.html`. Live at `https://chorltonbikes.coop/newsletter/YYYY-MM.html`. Use this URL in the Mailchimp campaign for the “Read on website” link.

## Images

Images live in `assets/images/newsletter/` in subfolders by month (`01-2026/`, `02-2026/`, etc.). See that folder’s README for the section → filename mapping.
