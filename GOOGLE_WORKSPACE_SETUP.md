# Google Workspace Setup for chorltonbikes.coop

This guide will help you add your custom domain `chorltonbikes.coop` to Google Workspace for email and other services.

## Step 1: Add Domain to Google Workspace

1. Log in to your Google Workspace Admin Console: https://admin.google.com
2. Go to **Domains** (in the left sidebar, under "Account")
3. Click **Add a domain** or **Manage domains**
4. Enter your domain: `chorltonbikes.coop`
5. Choose how you want to use this domain:
   - **Primary domain**: If this will be your main domain (replaces existing)
   - **Secondary domain**: If you want to keep your existing domain as primary
6. Click **Continue and verify domain ownership**

## Step 2: Verify Domain Ownership

Google will ask you to verify that you own the domain. You have a few options:

### Option A: Add TXT Record (Recommended)

1. Google will provide you with a **TXT record** to add to your DNS
2. It will look something like: `google-site-verification=xxxxxxxxxxxxxxxxxxxxx`
3. Go to your Gandi.net DNS management for `chorltonbikes.coop`
4. Add a new **TXT record**:
   - **Type**: TXT
   - **Name**: @ (or leave blank for root domain)
   - **Value**: The verification string Google provides (e.g., `google-site-verification=xxxxxxxxxxxxxxxxxxxxx`)
   - **TTL**: 3600 (or default)
5. Save the changes
6. Wait 5-10 minutes for DNS propagation
7. Go back to Google Workspace and click **Verify**

### Option B: Add HTML File (Alternative)

If TXT record doesn't work, Google may offer an HTML file upload option:
1. Download the HTML verification file from Google
2. Upload it to your website root (this won't work with GitHub Pages static hosting)
3. This option is less ideal for static sites

## Step 3: Set Up Email (MX Records)

After domain verification, you'll need to add MX records for email:

1. In Google Workspace Admin Console, go to **Apps** > **Google Workspace** > **Gmail**
2. Click **Set up Gmail** or **Routing**
3. Google will provide you with **MX records** to add
4. Go to Gandi.net DNS management
5. Add the MX records (typically 5 records):
   - **Type**: MX
   - **Name**: @ (or leave blank)
   - **Priority**: As provided by Google (usually 1, 5, 10, etc.)
   - **Value**: The mail server (e.g., `aspmx.l.google.com`)
   - **TTL**: 3600

Example MX records (Google will provide the exact ones):
```
Priority: 1    Value: aspmx.l.google.com
Priority: 5    Value: alt1.aspmx.l.google.com
Priority: 5    Value: alt2.aspmx.l.google.com
Priority: 10   Value: alt3.aspmx.l.google.com
Priority: 10   Value: alt4.aspmx.l.google.com
```

6. **Remove any existing MX records** for the domain
7. Save the changes
8. Wait for DNS propagation (usually 1-2 hours)

## Step 4: Create User Accounts

1. In Google Workspace Admin Console, go to **Users**
2. Click **Add new user** or **Invite users**
3. Create email addresses like:
   - `hello@chorltonbikes.coop`
   - `ben@chorltonbikes.coop`
   - etc.

## Step 5: Update Website Email Links (Optional)

Once email is set up, you can update email links in your website:
- Current: `hello@chorltonbikes.coop` (should already work)
- Update any other email addresses as needed

## Important Notes

### DNS Record Priority

When you have multiple services using the same domain:
- **A records** (for GitHub Pages): Keep all 4 A records
- **TXT records** (for Google verification): Add alongside A records
- **MX records** (for email): Add alongside A records
- These can all coexist in your DNS

### DNS Propagation

- TXT records: Usually 5-10 minutes
- MX records: Usually 1-2 hours
- Can take up to 48 hours in some cases

### Testing Email

After MX records propagate:
1. Send a test email to your new address
2. Check spam folder initially
3. Verify you can send emails from the new address

## Troubleshooting

### Domain Verification Fails

- Double-check the TXT record value (must match exactly)
- Ensure no typos in the record
- Wait longer for DNS propagation
- Try using a DNS checker: https://www.whatsmydns.net/#TXT/chorltonbikes.coop

### Email Not Working

- Verify all MX records are added correctly
- Check MX record priority values
- Ensure old MX records are removed
- Wait for full DNS propagation (can take 24-48 hours)

### Conflicts with GitHub Pages

- A records and MX records can coexist
- Both services will work simultaneously
- No conflicts between website hosting and email

## Current DNS Setup Summary

Your DNS should have:
- ✅ 4 A records pointing to GitHub Pages IPs
- ⏳ 1 TXT record for Google verification (add this)
- ⏳ 5 MX records for Gmail (add after verification)

All of these can exist together in your DNS zone.

