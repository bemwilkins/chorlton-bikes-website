# Branding Guide

This guide will help you update the website with your brand colors and logos from your Google Slides presentation.

## Quick Start

1. **Get your brand colors** from the Google Slides deck
2. **Update colors** in `styles.css` (see below)
3. **Add logo files** to `assets/images/` folder
4. **Test** the website locally

## Brand Colors

### Finding Your Colors

To extract colors from your Google Slides presentation:

1. **Method 1: Using Google Slides**
   - Open your presentation
   - Select an element with your brand color
   - Go to Format → Format options → Fill color
   - Click "Custom" to see the hex code

2. **Method 2: Using a Color Picker Tool**
   - Use browser extensions like "ColorZilla" or "Eye Dropper"
   - Or use online tools like [Coolors Image Picker](https://coolors.co/image-picker)
   - Take a screenshot and upload it to extract colors

3. **Method 3: Inspect Element**
   - Right-click on colored elements in your slides
   - Use browser dev tools to inspect the color values

### Updating Colors

Once you have your color codes, update `styles.css`:

```css
:root {
    --primary-color: #YOUR_PRIMARY_COLOR;      /* Main brand color */
    --secondary-color: #YOUR_SECONDARY_COLOR;  /* Secondary brand color */
    --accent-color: #YOUR_ACCENT_COLOR;        /* Accent/highlight color */
}
```

**Example:**
If your primary color is a deep green `#1a5f2e`, update it like this:
```css
--primary-color: #1a5f2e;
```

The colors will automatically update throughout the entire website including:
- Navigation bar
- Buttons
- Headings
- Links
- Background gradients
- Footer accents

## Logo Files

### Required Logo

**`logo.png`** - Main logo for navigation bar
- Location: `assets/images/logo.png`
- Recommended size: 200px width (or 50px height)
- Format: PNG with transparent background
- Will automatically appear in the navigation bar

### Optional Logos

**`logo-white.png`** - White version for dark backgrounds
- Location: `assets/images/logo-white.png`
- Recommended size: 300px width
- Format: PNG with transparent background
- Use for hero section and footer (uncomment in HTML)

### Logo Placement

The logo is already set up in the navigation bar. To add it to other sections:

1. **Hero Section**: Uncomment this line in `index.html`:
   ```html
   <!-- <img src="assets/images/logo-white.png" alt="Chorlton Bikes" class="hero-logo"> -->
   ```

2. **Footer**: Uncomment this line in `index.html`:
   ```html
   <!-- <img src="assets/images/logo-white.png" alt="Chorlton Bikes" class="footer-logo"> -->
   ```

### Logo Tips

- **SVG format** is best for scalability (update file extension in HTML if using SVG)
- Ensure **transparent backgrounds** for best appearance
- Keep file sizes **under 200KB** for fast loading
- Test logos on both **light and dark backgrounds**

## Testing Your Changes

1. Open `index.html` in a web browser
2. Check that:
   - Logo appears correctly in navigation
   - Colors match your brand guidelines
   - Text is readable on all backgrounds
   - Site looks good on mobile (resize browser window)

## Need Help?

If you need assistance extracting colors or preparing logos:
- Share your Google Slides presentation link
- Or provide the color codes and logo files directly
- Contact: hello@chorltonbikes.coop


