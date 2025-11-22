# Chorlton Bikes Website

A modern, responsive one-page website for Chorlton Bikes - a Community Benefit Society providing sustainable bike delivery services in South Manchester.

## Features

- **Responsive Design**: Works beautifully on desktop, tablet, and mobile devices
- **Sticky Navigation**: Navbar stays at the top while scrolling
- **Mobile Menu**: Hamburger menu for mobile devices
- **Image Carousel**: Hero section with automatic image carousel
- **Form Integration**: Google Apps Script integration for bike donation form
- **Paperform Integration**: Embedded forms for membership and donations
- **Social Media Feeds**: Instagram and Facebook feed embeds
- **Partner Carousel**: Infinite scrolling partner logo carousel
- **SEO Friendly**: Semantic HTML structure
- **Fast Loading**: Lightweight and optimized

## File Structure

```
CHORLTON_BIKES_WEBSITE/
├── index.html                    # Main HTML file
├── styles.css                    # All styles
├── script.js                     # JavaScript functionality
├── google-apps-script-code.js   # Google Apps Script code (for reference)
├── GOOGLE_APPS_SCRIPT_SETUP.md   # Setup instructions for Google Apps Script
├── README.md                     # This file
└── assets/
    └── images/
        ├── carousel/             # Hero carousel images (01.png, 02.png, etc.)
        ├── partners/             # Partner logos
        ├── services/             # Service card background images
        ├── logo-white.png        # White logo for navigation
        ├── logo-green.png        # Green logo for stats grid
        ├── logo.png              # Fallback logo
        └── real-living-wage-logo.webp  # Footer logo
```

## Setup

### 1. Google Apps Script (Bike Donation Form)

The bike donation form uses Google Apps Script to send emails with attachments. See `GOOGLE_APPS_SCRIPT_SETUP.md` for detailed setup instructions.

### 2. Paperform Integration

- **Membership Form**: Embedded via iframe from `https://chorlton-bike-deliveries.paperform.co/`
- **Donation Form**: Placeholder ready for Paperform embed

### 3. Images

- **Carousel Images**: Place numbered images (01.png, 02.png, etc.) in `assets/images/carousel/`
- **Service Images**: Place service images in `assets/images/services/` (see README in that folder)
- **Partner Logos**: Place partner logos in `assets/images/partners/` (see README in that folder)

## Deployment

### GitHub Pages

1. Push this repository to GitHub
2. Go to Settings > Pages
3. Select your branch (main) and folder (root)
4. Your site will be live at `https://yourusername.github.io/repository-name`

### Other Hosting

- Upload all files to your hosting provider
- Ensure `index.html` is in the root directory
- No server-side configuration needed

## Customization

### Colors

Edit the CSS variables in `styles.css`:
```css
:root {
    --bg-cream: #fffde7;
    --light-green: #b3d41f;
    --logo-green: #008037;
    --orange: #ff8210;
    /* ... */
}
```

### Content

- Update text content directly in `index.html`
- Modify section structure as needed
- Add or remove service cards as needed

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Support

For questions or issues, contact: hello@chorltonbikes.coop

## License

© 2025 Chorlton Bikes. All Rights Reserved.
