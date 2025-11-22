# Custom Domain Setup for chorltonbikes.coop

This guide will help you connect your custom domain `chorltonbikes.coop` to your GitHub Pages site.

## Step 1: Configure Domain in GitHub Pages

1. Go to your GitHub repository: https://github.com/bemwilkins/chorlton-bikes-website
2. Click on **Settings** (top menu)
3. Scroll down to **Pages** in the left sidebar
4. Under **Custom domain**, enter: `chorltonbikes.coop`
5. Click **Save**
6. GitHub will automatically create a `CNAME` file in your repository (or you may need to create it manually - see below)

### Optional: Create CNAME file manually

If GitHub doesn't create the CNAME file automatically, you can create it:

1. In your repository, click **Add file** > **Create new file**
2. Name the file exactly: `CNAME` (no extension)
3. In the file, enter: `chorltonbikes.coop`
4. Click **Commit changes**

## Step 2: Configure DNS at Gandi.net

You need to add DNS records at Gandi.net to point your domain to GitHub Pages.

### Option A: Using A Records (Recommended for root domain)

1. Log in to your Gandi.net account
2. Go to your domain management for `chorltonbikes.coop`
3. Navigate to **DNS Records** or **DNS Zone**
4. Add the following **A records** (these are GitHub Pages IP addresses):
   - **Type**: A
   - **Name**: @ (or leave blank for root domain)
   - **Value**: `185.199.108.153`
   - **TTL**: 3600 (or default)
   
   - **Type**: A
   - **Name**: @ (or leave blank)
   - **Value**: `185.199.109.153`
   - **TTL**: 3600
   
   - **Type**: A
   - **Name**: @ (or leave blank)
   - **Value**: `185.199.110.153`
   - **TTL**: 3600
   
   - **Type**: A
   - **Name**: @ (or leave blank)
   - **Value**: `185.199.111.153`
   - **TTL**: 3600

5. **Remove any existing A records** for the root domain (if any)
6. Save the changes

### Option B: Using CNAME (Alternative, but won't work for root .coop domain)

Note: CNAME records typically don't work for root domains (apex domains) like `chorltonbikes.coop`. However, if you want to use `www.chorltonbikes.coop`, you can:

1. Add a **CNAME record**:
   - **Type**: CNAME
   - **Name**: www
   - **Value**: `bemwilkins.github.io`
   - **TTL**: 3600

## Step 3: Wait for DNS Propagation

- DNS changes can take anywhere from a few minutes to 48 hours to propagate
- Typically takes 1-2 hours
- You can check propagation status at: https://www.whatsmydns.net/

## Step 4: Verify Setup

1. After DNS propagates, go back to GitHub Pages settings
2. You should see a green checkmark next to your custom domain
3. GitHub will automatically set up HTTPS/SSL (this may take a few hours)
4. Visit `https://chorltonbikes.coop` to verify it's working

## Troubleshooting

### Domain not working after 24 hours?

1. **Check DNS records**: Verify the A records are correct at Gandi.net
2. **Check CNAME file**: Ensure `CNAME` file exists in your repository root with `chorltonbikes.coop`
3. **Clear browser cache**: Try accessing in incognito/private mode
4. **Check GitHub Pages status**: Go to Settings > Pages and check for any error messages

### HTTPS not working?

- GitHub automatically provisions SSL certificates for custom domains
- This can take up to 24 hours after DNS is configured
- You'll see a warning in GitHub Pages settings until SSL is active
- Once active, you can enforce HTTPS in GitHub Pages settings

### Need to use www subdomain?

If you want both `chorltonbikes.coop` and `www.chorltonbikes.coop` to work:

1. Add `www.chorltonbikes.coop` to the CNAME file (one per line)
2. Or set up a redirect from www to the root domain at Gandi.net

## Important Notes

- **Keep the CNAME file**: Don't delete the CNAME file from your repository
- **DNS TTL**: Lower TTL values (like 300) can help with faster updates during setup, but you can increase it later
- **GitHub Pages limits**: Custom domains work with GitHub Pages free tier
- **SSL**: GitHub provides free SSL certificates for custom domains (Let's Encrypt)

## Current GitHub Pages URL

Your site is currently accessible at:
- https://bemwilkins.github.io/chorlton-bikes-website/

After domain setup, it will also be available at:
- https://chorltonbikes.coop

Both URLs will work once the domain is configured.

