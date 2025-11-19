# Deployment Guide - Chorlton Bikes Website

This guide covers multiple ways to deploy and share your website.

## Quick Options

### Option 1: Netlify Drop (Easiest - No Account Needed)

1. Go to [https://app.netlify.com/drop](https://app.netlify.com/drop)
2. Drag and drop the entire `CHORLTON_BIKES_WEBSITE` folder
3. You'll get a shareable link immediately (e.g., `https://random-name-123.netlify.app`)
4. You can customize the URL later if you create a free account

**Pros:** Instant, no setup, free
**Cons:** Random URL (unless you create account)

---

### Option 2: GitHub Pages (Best for Long-term)

#### Step 1: Initialize Git Repository

```bash
cd /Users/benwilkins/Git/CHORLTON_BIKES_WEBSITE
git init
git add .
git commit -m "Initial commit - Chorlton Bikes website"
```

#### Step 2: Create GitHub Repository

1. Go to [GitHub.com](https://github.com) and create a new repository
2. Name it `chorlton-bikes-website` (or any name you prefer)
3. **Don't** initialize with README, .gitignore, or license
4. Copy the repository URL (e.g., `https://github.com/yourusername/chorlton-bikes-website.git`)

#### Step 3: Push to GitHub

```bash
git remote add origin https://github.com/yourusername/chorlton-bikes-website.git
git branch -M main
git push -u origin main
```

#### Step 4: Enable GitHub Pages

1. Go to your repository on GitHub
2. Click **Settings** → **Pages** (in left sidebar)
3. Under "Source", select **main** branch and **/ (root)** folder
4. Click **Save**
5. Your site will be available at: `https://yourusername.github.io/chorlton-bikes-website/`

**Pros:** Free, permanent URL, version control
**Cons:** Requires GitHub account

---

### Option 3: Netlify with Git (Best for Updates)

1. Push your code to GitHub (follow Option 2, Steps 1-3)
2. Go to [Netlify.com](https://netlify.com) and sign up (free)
3. Click **Add new site** → **Import an existing project**
4. Connect your GitHub account and select your repository
5. Netlify will auto-detect settings (no build command needed)
6. Click **Deploy site**
7. You'll get a URL like `https://chorlton-bikes-website.netlify.app`
8. You can add a custom domain later

**Pros:** Free, custom domain support, automatic deployments on git push
**Cons:** Requires GitHub account

---

### Option 4: Vercel (Alternative to Netlify)

1. Push your code to GitHub (follow Option 2, Steps 1-3)
2. Go to [Vercel.com](https://vercel.com) and sign up (free)
3. Click **Add New Project**
4. Import your GitHub repository
5. Click **Deploy**
6. You'll get a URL like `https://chorlton-bikes-website.vercel.app`

**Pros:** Free, fast, easy
**Cons:** Requires GitHub account

---

## Recommended Approach

For sharing with your team quickly: **Use Netlify Drop (Option 1)**

For long-term hosting: **Use GitHub Pages (Option 2)** or **Netlify with Git (Option 3)**

---

## Custom Domain Setup (Later)

Once you have a deployment URL, you can add your custom domain `chorltonbikes.coop`:

### With Netlify:
1. Go to Site settings → Domain management
2. Add custom domain: `chorltonbikes.coop`
3. Follow DNS configuration instructions

### With GitHub Pages:
1. Add a `CNAME` file in your repository root with: `chorltonbikes.coop`
2. Configure DNS with your domain provider

---

## Testing Locally

Before deploying, test locally:

```bash
# Option 1: Python (if installed)
python3 -m http.server 8000

# Option 2: Node.js (if installed)
npx serve .

# Option 3: PHP (if installed)
php -S localhost:8000
```

Then visit: `http://localhost:8000`

---

## Next Steps After Deployment

1. **Add Airtable Forms**: Replace placeholders with actual embedded forms
2. **Add Partner Logos**: Update the partners section with actual logos
3. **Add Social Media Feeds**: Set up Instagram/Facebook embeds
4. **Add Images**: Replace placeholder images with real community photos
5. **Test All Links**: Make sure all email links and forms work

---

## Need Help?

If you run into issues:
- Check the browser console for errors
- Make sure all file paths are correct (case-sensitive on some servers)
- Verify images are in the `assets/images/` folder
- Test on mobile devices

