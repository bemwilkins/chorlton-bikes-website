# Image Optimization for SEO

This document outlines the image optimizations that have been implemented for better SEO and accessibility.

## ✅ What's Been Optimized

### 1. Service Card Images
- **Added aria-labels**: All service cards now have descriptive `aria-label` attributes
- **SEO-friendly descriptions**: Each aria-label includes:
  - Service name
  - Brief description of what the service does
  - Location context (South Manchester, Manchester)
- **Accessibility**: Screen readers can now understand what each service card represents

**Example:**
```html
<div class="service-card service-card-bg" 
     aria-label="Surplus Food Collections service - Chorlton Bikes volunteers collecting and delivering surplus food to foodbanks">
```

### 2. Partner Logos
- **Descriptive alt text**: Partner logos now have meaningful alt text instead of generic "Partner logo 1"
- **Partner name mapping**: Created a mapping system that automatically assigns proper alt text based on filename
- **SEO-friendly**: Alt text includes partner name and context

**Example:**
- Before: `alt="Partner logo 1"`
- After: `alt="Transport for Greater Manchester partner"`

### 3. Hero Section
- **Aria-label added**: Hero section now has descriptive aria-label
- **Decorative elements marked**: Background images marked with `aria-hidden="true"` since they're decorative

### 4. Existing Optimizations (Already in Place)
- ✅ Logo images have proper alt text
- ✅ Real Living Wage logo has descriptive alt text
- ✅ Lazy loading implemented for partner logos
- ✅ Image error handling in place

## 📋 Recommendations for Future Images

### File Naming Best Practices
When adding new images, use descriptive, SEO-friendly filenames:

**Good Examples:**
- `chorlton-bikes-cargo-bike-delivery-manchester.jpg`
- `surplus-food-collection-service.jpg`
- `community-trishaw-rides-south-manchester.jpg`

**Avoid:**
- `img1.jpg`, `photo.png`, `image_001.jpg`

### Image Format Recommendations
- **Photos**: Use `.jpg` or `.webp` (WebP is smaller, better for web)
- **Logos/Graphics**: Use `.png` or `.svg` (SVG is best for logos)
- **Screenshots**: Use `.png` or `.webp`

### Image Compression
Before uploading images:
1. **Resize images** to the maximum size they'll be displayed (don't upload 4000px wide images if they'll only show at 800px)
2. **Compress images** using tools like:
   - [TinyPNG](https://tinypng.com/) - Free, easy to use
   - [Squoosh](https://squoosh.app/) - Google's compression tool
   - [ImageOptim](https://imageoptim.com/) - Mac app
3. **Target file sizes**:
   - Hero/carousel images: 200-500KB max
   - Service card images: 100-300KB max
   - Partner logos: 10-50KB max

### Alt Text Guidelines
When adding new images, follow these alt text guidelines:

1. **Be descriptive but concise** (125 characters or less)
2. **Include context** relevant to the page
3. **Don't start with "Image of..."** - screen readers already announce it's an image
4. **Include keywords naturally** when relevant

**Good Examples:**
- `alt="Chorlton Bikes electric cargo bike delivering food to Manchester foodbank"`
- `alt="Community trishaw ride through Chorlton with older passenger"`
- `alt="NHS medical specimen transport in specialized container"`

**Avoid:**
- `alt="image"`
- `alt="photo"`
- `alt="picture of bike"`

### Image Dimensions
For better performance, specify image dimensions when possible:

```html
<img src="image.jpg" alt="Description" width="800" height="600" loading="lazy">
```

This helps browsers reserve space and prevents layout shift.

## 🔍 Current Image Status

### Service Card Images
- ✅ All have aria-labels
- ✅ Descriptive and SEO-friendly
- ⚠️ Consider converting to `<img>` tags with proper alt text for even better SEO (currently using CSS background images)

### Partner Logos
- ✅ Descriptive alt text
- ✅ Lazy loading enabled
- ✅ Error handling in place

### Hero Carousel
- ✅ Aria-labels on section
- ✅ Decorative elements marked
- ⚠️ Consider adding preload hints for first carousel image

### Logos
- ✅ Proper alt text
- ✅ Error handling

## 🚀 Next Steps (Optional Improvements)

1. **Convert service card background images to `<img>` tags**
   - Better for SEO
   - Better for accessibility
   - Allows proper alt text (currently using aria-label)

2. **Add image preloading**
   - Preload first carousel image
   - Preload critical above-the-fold images

3. **Implement responsive images**
   - Use `<picture>` element with different sizes
   - Serve smaller images on mobile devices

4. **Add image dimensions**
   - Specify width/height attributes
   - Prevents layout shift (CLS - Cumulative Layout Shift)

5. **Consider WebP format**
   - Convert existing images to WebP where possible
   - Smaller file sizes, same quality
   - Add fallback for older browsers

## 📊 SEO Impact

These optimizations help with:
- ✅ **Accessibility**: Screen readers can understand images
- ✅ **SEO**: Search engines can index image content
- ✅ **User Experience**: Better descriptions help users understand content
- ✅ **Rich Snippets**: Proper alt text can help images appear in image search

## 🛠️ Tools for Image Optimization

- **Compression**: [TinyPNG](https://tinypng.com/), [Squoosh](https://squoosh.app/)
- **Format Conversion**: [CloudConvert](https://cloudconvert.com/)
- **SEO Check**: [Google PageSpeed Insights](https://pagespeed.web.dev/)
- **Accessibility Check**: [WAVE](https://wave.webaim.org/)

---

**Note**: All current optimizations are live and working. The optional improvements listed above can be implemented gradually as time permits.

