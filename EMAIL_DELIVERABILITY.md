# Email deliverability for chorltonbikes.coop

If people report that emails from **@chorltonbikes.coop** (Google Workspace) are going to spam, use this guide to check and fix.

---

## 1. Check your current setup

Before changing anything, verify what’s already in place for **chorltonbikes.coop**.

### Free online checkers

Use any of these (enter `chorltonbikes.coop`):

- **MXToolbox / MXScan** – [https://mxtoolbox.com/SuperTool.aspx](https://mxtoolbox.com/SuperTool.aspx) or [https://mxscan.me](https://mxscan.me) – SPF, DKIM, DMARC, MX, blacklists in one go.
- **Red Sift Investigate** – [https://redsift.com/tools/investigate](https://redsift.com/tools/investigate) – Send a test email from your domain; it reports gaps in authentication.
- **DMARCLY** – [https://dmarcly.com/tools](https://dmarcly.com/tools) – Individual SPF/DKIM/DMARC checkers and wizards.

### What to look for

- **SPF** – Record exists and includes `_spf.google.com` (and any other senders you use).
- **DKIM** – Google’s DKIM is enabled in Admin and the DNS record it gives you is published and correct.
- **DMARC** – You have a `_dmarc.chorltonbikes.coop` TXT record (even if policy is `p=none`).

If any of these are missing or wrong, fix them first (see below).

---

## 2. Prevent spam: SPF, DKIM, DMARC (Google Workspace)

Google (and other providers) increasingly require proper authentication. For Gmail in particular, senders to personal Gmail must use **SPF or DKIM**; bulk senders (e.g. &gt;5,000/day) should use **SPF, DKIM, and DMARC**.

All of this is configured in **DNS** for `chorltonbikes.coop` (at your domain registrar or DNS host) and in **Google Admin** for DKIM.

### SPF (Sender Policy Framework)

- **Purpose:** Tells receiving servers which mail servers are allowed to send for `@chorltonbikes.coop`.
- **Where:** DNS TXT record for the root of the domain (often “Host” = `@` or blank).
- **Value (Google Workspace only):**  
  `v=spf1 include:_spf.google.com ~all`
- If you also send from another service (e.g. Mailchimp, Amazon SES), add its `include:` before `~all`. Only one SPF record per domain; combine with multiple `include:` as needed.
- **Reference:** [Google: Set up SPF](https://support.google.com/a/answer/33786)

### DKIM (DomainKeys Identified Mail)

- **Purpose:** Cryptographically signs messages so receivers can confirm they weren’t altered and came from your domain.
- **Where:**  
  1. **Google Admin** – Turn on and generate the record.  
  2. **DNS** – Publish the TXT record Google gives you.
- **Steps:**
  1. Go to [Google Admin](https://admin.google.com) → **Apps** → **Google Workspace** → **Gmail** → **Authenticate email**.
  2. Click **Generate new record** (or use existing). Copy the **Host name** and **TXT record value**.
  3. At your DNS host, add a TXT record with that host name and value.
  4. After DNS has propagated (often within an hour), back in Admin click **Start authentication** and save.
- **Reference:** [Google: Set up DKIM](https://support.google.com/a/answer/174124)

### DMARC (reporting and policy)

- **Purpose:** Tells receivers what to do with messages that fail SPF/DKIM (reject, quarantine, or allow) and sends you reports.
- **Where:** DNS TXT record for host `_dmarc.chorltonbikes.coop` (or `_dmarc` depending on your DNS UI).

**Policy values:**

- `p=none` – Monitoring only; no action. MXToolbox and others flag this as “DMARC policy not enabled” and recommend moving to enforcement for better deliverability.
- `p=quarantine` – Failed messages go to spam/quarantine. **Recommended next step** once you’re happy SPF/DKIM are working.
- `p=reject` – Failed messages can be rejected. Strongest; use after `p=quarantine` has been stable.

**To fix “DMARC Policy Not Enabled” (e.g. after MXToolbox):**  
Edit your existing DMARC TXT record. Change only the `p=` part:

- **Before:** `v=DMARC1; p=none; rua=mailto:hello@chorltonbikes.coop`
- **After (recommended):** `v=DMARC1; p=quarantine; rua=mailto:hello@chorltonbikes.coop`

Keep `rua=mailto:...` so you still get reports. Save the record at your DNS host; propagation is usually within an hour. Re-run MXToolbox to confirm the policy test passes.
- **Reference:** [Google: Set up DMARC](https://support.google.com/a/answer/2466580)

### Order and timing

1. Add or fix **SPF** first.
2. Enable **DKIM** in Admin and add the DKIM TXT record in DNS.
3. Wait at least 24–48 hours, then add **DMARC** with `p=none` and check reports.
4. Re-run the checkers above to confirm all three pass for `chorltonbikes.coop`.

---

## 3. Newsletter sent via Airtable

Your [newsletter README](newsletter/README.md) says the January 2026 newsletter is sent using **Airtable** (HTML body pasted into the “Send email” action).

- Airtable’s built-in “Send email” does **not** support configuring SPF/DKIM for your own domain. Messages sent “from” `hello@chorltonbikes.coop` (or similar) actually go out via Airtable’s servers, so:
  - SPF for `chorltonbikes.coop` won’t authorize Airtable.
  - There’s no DKIM for your domain on those emails.
- That often leads to **spam or “unverified”** treatment, especially with Gmail’s 2024+ sender rules.

**Options:**

1. **Send the newsletter from Google Workspace**  
   - Use Gmail/Workspace (e.g. BCC or a mail-merge tool that uses your Workspace account) so mail goes out from Google’s servers. Then your SPF/DKIM/DMARC for Google will apply and deliverability should improve.

2. **Use an email service that supports your domain**  
   - Use a provider that lets you add SPF/DKIM (and optionally DMARC) for `chorltonbikes.coop` (e.g. Mailchimp, SendGrid, Postmark, etc.) and send the same HTML from there instead of Airtable.

3. **Keep Airtable but reduce reliance on “from @chorltonbikes.coop”**  
   - If you keep sending via Airtable, some people will still see spam/unverified. You can add a line in the newsletter: “If this landed in spam, add hello@chorltonbikes.coop to your contacts or drag it to Inbox.”

---

## 4. Quick checklist

- [ ] Run a checker (MXScan, Red Sift, or DMARCLY) for `chorltonbikes.coop`.
- [ ] SPF TXT record exists and includes `_spf.google.com` (and any other senders).
- [ ] DKIM enabled in Google Admin and the DKIM TXT record added in DNS.
- [ ] DMARC TXT record for `_dmarc.chorltonbikes.coop` with an **enforcing** policy (`p=quarantine` or `p=reject`) and `rua` to an address you monitor (not only `p=none`).
- [ ] If newsletters are sent via Airtable “from” @chorltonbikes.coop, plan to move them to Google Workspace or an ESP with custom domain authentication.

---

## 5. Official references

- [Google: Set up SPF](https://support.google.com/a/answer/33786)
- [Google: Set up DKIM](https://support.google.com/a/answer/174124)
- [Google: Set up DMARC](https://support.google.com/a/answer/2466580)
- [Google: Email sender guidelines](https://support.google.com/a/answer/81126)
- [Google: Troubleshoot SPF issues](https://support.google.com/a/answer/10685928)
