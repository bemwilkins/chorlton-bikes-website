# Domain Redirect Setup: chorltonbikedeliveries.coop → chorltonbikes.coop

This guide will help you redirect all traffic from the old domain (`chorltonbikedeliveries.coop`) to the new domain (`chorltonbikes.coop`).

## Option 1: Using Cloudflare (Recommended - Best for SEO)

Cloudflare offers a free plan that includes proper HTTP 301 redirects, which is best for SEO.

### Step 1: Set Up Cloudflare

1. Sign up for a free Cloudflare account at https://www.cloudflare.com
2. Add your domain `chorltonbikedeliveries.coop` to Cloudflare
3. Cloudflare will scan your DNS records
4. Update your nameservers at Gandi.net to point to Cloudflare's nameservers (Cloudflare will provide these)

### Step 2: Configure Redirect in Cloudflare

1. In Cloudflare dashboard, go to **Rules** > **Redirect Rules**
2. Click **Create rule**
3. Configure the redirect:
   - **Rule name**: Redirect old domain to new
   - **If the incoming request matches**: 
     - **Field**: Hostname
     - **Operator**: equals
     - **Value**: `chorltonbikedeliveries.coop`
   - **Then the settings are**:
     - **Status code**: 301 (Permanent Redirect)
     - **Destination URL**: `https://chorltonbikes.coop`
     - **Preserve query string**: Yes (to preserve any URL parameters)
     - **Preserve path**: Yes (to redirect specific pages if needed)
4. Click **Deploy**

### Step 3: Handle www Subdomain (if needed)

If you also want to redirect `www.chorltonbikedeliveries.coop`:

1. Create another redirect rule:
   - **Field**: Hostname
   - **Operator**: equals
   - **Value**: `www.chorltonbikedeliveries.coop`
   - **Status code**: 301
   - **Destination URL**: `https://chorltonbikes.coop`

### Benefits of Cloudflare Method:
- ✅ Proper HTTP 301 redirects (best for SEO)
- ✅ Preserves link equity
- ✅ Fast and reliable
- ✅ Free plan available
- ✅ Can preserve URL paths (e.g., `/old-page` → `https://chorltonbikes.coop/old-page`)

---

## Option 2: DNS-Level Redirect at Gandi.net (If Available)

Some DNS providers offer URL forwarding/redirects at the DNS level.

1. Log in to Gandi.net
2. Go to domain management for `chorltonbikedeliveries.coop`
3. Look for **URL Forwarding** or **Redirect** options
4. Set up redirect:
   - **From**: `chorltonbikedeliveries.coop` (and `www.chorltonbikedeliveries.coop` if needed)
   - **To**: `https://chorltonbikes.coop`
   - **Type**: 301 Permanent Redirect
   - **Preserve path**: Yes (if option available)

**Note**: Gandi.net may or may not offer this feature. Check their documentation or support.

---

## Option 3: GitHub Pages Redirect Page (Less Ideal)

If the above options aren't available, you can create a redirect page on the old domain.

### Step 1: Set Up Old Domain on GitHub Pages

1. Create a new repository (or use existing) for the old domain
2. Point `chorltonbikedeliveries.coop` to this repository via GitHub Pages
3. Configure DNS at Gandi.net to point to GitHub Pages (same as you did for the new domain)

### Step 2: Create Redirect HTML File

Create an `index.html` file in the repository with this content:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="refresh" content="0; url=https://chorltonbikes.coop">
    <link rel="canonical" href="https://chorltonbikes.coop">
    <title>Redirecting to Chorlton Bikes...</title>
    <script>
        // Immediate redirect
        window.location.replace("https://chorltonbikes.coop" + window.location.pathname + window.location.search + window.location.hash);
    </script>
</head>
<body>
    <p>Redirecting to <a href="https://chorltonbikes.coop">chorltonbikes.coop</a>...</p>
</body>
</html>
```

### Step 3: Create CNAME File

Create a `CNAME` file with:
```
chorltonbikedeliveries.coop
```

### Limitations of This Method:
- ⚠️ Not a true HTTP 301 redirect (less SEO-friendly)
- ⚠️ May not preserve all link equity
- ⚠️ Requires maintaining a separate repository

---

## Recommended Approach

**Use Option 1 (Cloudflare)** - It's free, provides proper 301 redirects, and is the best solution for SEO and user experience.

## Testing the Redirect

After setting up the redirect:

1. Visit `https://chorltonbikedeliveries.coop` - should redirect to `https://chorltonbikes.coop`
2. Visit `https://www.chorltonbikedeliveries.coop` - should also redirect
3. Test with a path: `https://chorltonbikedeliveries.coop/old-page` - should redirect to `https://chorltonbikes.coop/old-page` (if path preservation is enabled)
4. Check redirect type: Use a tool like https://httpstatus.io/ to verify it's a 301 redirect

## Important Notes

- **301 vs 302**: Always use 301 (Permanent Redirect) for domain changes - this tells search engines the move is permanent
- **Preserve paths**: If you have specific pages on the old domain, preserving paths will redirect them to the same path on the new domain
- **SSL/HTTPS**: Ensure both domains have valid SSL certificates
- **Search engines**: After redirect is set up, you may want to submit the old domain's sitemap to search engines to help them understand the redirect

