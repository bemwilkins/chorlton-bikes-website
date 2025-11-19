# Chorlton Bikes Website

A simple, modern one-page website for Chorlton Bikes - a Community Benefit Society providing sustainable bike delivery services in South Manchester.

## Features

- **Responsive Design**: Works beautifully on desktop, tablet, and mobile devices
- **Modern UI**: Clean, professional design with smooth animations
- **Airtable Integration**: Membership and donation forms connected to Airtable
- **SEO Friendly**: Semantic HTML structure
- **Fast Loading**: Lightweight and optimized

## Branding Setup

### Adding Your Logo

1. Place your logo file(s) in the `assets/images/` directory:
   - `logo.png` - Main logo for navigation (recommended: 200px width, transparent background)
   - `logo-white.png` (optional) - White version for hero/footer sections

2. The logo will automatically appear in the navigation bar. If the logo file is missing, the text "Chorlton Bikes" will display instead.

3. To add logos to the hero section or footer, uncomment the relevant `<img>` tags in `index.html`.

### Updating Brand Colors

The brand colors are defined at the top of `styles.css` in the `:root` section. To update them:

1. Open `styles.css`
2. Find the `:root` section (lines 8-26)
3. Update these variables with your brand colors from your Google Slides deck:
   ```css
   --primary-color: #YOUR_PRIMARY_COLOR;
   --secondary-color: #YOUR_SECONDARY_COLOR;
   --accent-color: #YOUR_ACCENT_COLOR;
   ```

4. To get color codes from your Google Slides:
   - Open your presentation
   - Use a color picker tool (like [Coolors](https://coolors.co/image-picker) or browser extensions)
   - Or use the "Format options" in Google Slides to see the hex code

The colors will automatically update throughout the entire website.

## Setup Instructions

### 1. Airtable Configuration

Before deploying, you need to set up your Airtable integration:

1. Create an Airtable base with two tables:
   - **Members** table with fields:
     - Name (Single line text)
     - Email (Email)
     - Phone (Phone number)
     - Address (Long text)
     - Message (Long text)
     - Date (Date)
   
   - **Donations** table with fields:
     - Name (Single line text)
     - Email (Email)
     - Amount (Number)
     - Message (Long text)
     - Date (Date)

2. Get your Airtable API credentials:
   - Go to https://airtable.com/api
   - Select your base
   - Copy your Base ID and API Key

3. Update `script.js`:
   - Replace `YOUR_BASE_ID` with your Airtable Base ID
   - Replace `YOUR_API_KEY` with your Airtable API Key
   - Adjust table names if needed (default: 'Members' and 'Donations')

### 2. Deployment

#### Option 1: Static Hosting (Recommended)
- Upload all files to your hosting provider
- Ensure `index.html` is in the root directory
- No server-side configuration needed

#### Option 2: GitHub Pages
1. Push this repository to GitHub
2. Go to Settings > Pages
3. Select your branch and folder
4. Your site will be live at `https://yourusername.github.io/repository-name`

#### Option 3: Netlify/Vercel
- Drag and drop the folder or connect your Git repository
- These platforms handle everything automatically

### 3. Security Note (Important!)

**⚠️ Exposing Airtable API keys in frontend JavaScript is not secure for production use.**

For a production site, consider these alternatives:

**Option A: Use Airtable Forms (Easiest)**
- Create forms in Airtable
- Embed them using iframes in the HTML
- No API keys needed, but less customizable

**Option B: Use a Serverless Function (Recommended)**
- Create a Netlify Function or Vercel Function
- Store API keys as environment variables
- Forms submit to your function, which then calls Airtable
- More secure and still customizable

**Option C: Current Approach (Quick Setup)**
- Works for quick launch and testing
- API keys will be visible in browser source
- Fine for low-stakes data collection
- Can migrate to Option B later

### 4. Domain Configuration

To use your `chorltonbikes.coop` domain:
1. Point your domain's DNS to your hosting provider
2. Configure SSL certificate (most hosting providers do this automatically)
3. Update any email addresses in the HTML if needed

## File Structure

```
CHORLTON_BIKES_WEBSITE/
├── index.html          # Main HTML file
├── styles.css          # All styles
├── script.js           # JavaScript and Airtable integration
└── README.md           # This file
```

## Customization

### Colors
Edit the CSS variables in `styles.css`:
```css
:root {
    --primary-color: #2d5016;
    --secondary-color: #4a7c2a;
    --accent-color: #6ba644;
    /* ... */
}
```

### Content
- Update text content directly in `index.html`
- Modify section structure as needed
- Add or remove work cards in the "Our Work" section

### Forms
- Form fields can be modified in `index.html`
- Update the corresponding field names in `script.js` to match your Airtable schema

## Notes

- The website uses Airtable's REST API which requires API keys to be exposed in the frontend. For production, consider:
  - Using Airtable's webhook feature with a serverless function (Netlify Functions, Vercel Functions)
  - Setting up a simple backend API to handle form submissions
  - Using Airtable's form feature and embedding it instead

- For the open social event date (26th November), you may want to add more details or a link to register when available.

## Support

For questions or issues, contact: hello@chorltonbikes.coop

## License

© 2024 Chorlton Bikes. All Rights Reserved.

