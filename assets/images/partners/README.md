# Partner Logos

## How to Add Partner Logos

1. **Add your logo files** to this folder (`assets/images/partners/`)
   - Supported formats: `.png`, `.jpg`, `.jpeg`, `.svg`, `.gif`, `.webp`
   - Recommended size: 200px width, 120px height (or similar aspect ratio)
   - Keep file sizes reasonable for web (under 500KB recommended)

2. **Update the logo list** in `script.js`:
   - Open `script.js`
   - Find the `partnerLogos` array (around line 450)
   - Add your logo filenames to the array, e.g.:
   ```javascript
   const partnerLogos = [
       'partner1.png',
       'partner2.jpg',
       'partner3.svg',
   ];
   ```

3. **Save and refresh** your browser to see the logos cycling across the screen!

## Tips

- Use transparent backgrounds (PNG) for best results
- Ensure logos are high quality but optimized for web
- The carousel will automatically duplicate logos for seamless infinite scrolling
- Logos will pause on hover for better user experience

