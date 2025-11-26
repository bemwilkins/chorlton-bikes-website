# Performance Optimization Guide

This document outlines the performance optimizations implemented and recommendations for further improvements.

## ✅ Optimizations Implemented

### 1. Google Fonts - Non-Blocking Load
- **Issue**: Google Fonts was blocking render (750ms delay)
- **Fix**: 
  - Added `media="print"` and `onload` to make fonts load asynchronously
  - Fonts now load without blocking page render
  - Added fallback `<noscript>` tag for users without JavaScript

### 2. LCP Image Optimization
- **Issue**: LCP image (carousel) wasn't discoverable in initial HTML
- **Fix**:
  - Added preload link for first carousel image with `fetchpriority="high"`
  - Added hidden `<img>` tag in HTML so browser can discover it early
  - Image now loads with high priority

### 3. Third-Party Script Deferral
- **Issue**: Instagram, Facebook, and Paperform scripts were loading immediately, causing:
  - 679 KiB of unused JavaScript
  - 2.5s of main-thread work
  - Long critical path (1,412ms from Instagram)
- **Fix**:
  - Deferred all third-party scripts using `requestIdleCallback`
  - Paperform scripts now load only when forms are visible (IntersectionObserver)
  - Scripts load after page is interactive, not blocking initial render

### 4. Resource Preloading
- Added preload hints for:
  - First carousel image (LCP)
  - CSS file
  - JavaScript file
- Helps browser prioritize critical resources

## 📊 Expected Performance Improvements

Based on the issues identified:

- **Render blocking**: ~750ms improvement (Google Fonts)
- **LCP**: Should improve significantly (image now discoverable + fetchpriority)
- **Main-thread work**: ~2.5s reduction (deferred scripts)
- **Unused JavaScript**: 679 KiB deferred (not blocking initial load)
- **Critical path**: Should reduce from 1,412ms (Instagram no longer blocking)

**Expected new score**: Should improve from 55 to 70-80+ (depending on image optimization)

## 🔧 Remaining Optimizations Needed

### 1. Image Compression (High Priority)
**Current Issue**: 18,097 KiB potential savings

**Images to optimize:**
- Carousel images (01.png - 10.png): Currently 2-3.6 MB each
- Service card images: Currently 672 KB - 3.6 MB each

**Recommendations:**
1. **Compress all images** using tools like:
   - [TinyPNG](https://tinypng.com/) - Free, easy
   - [Squoosh](https://squoosh.app/) - Google's tool
   - [ImageOptim](https://imageoptim.com/) - Mac app

2. **Convert to WebP format**:
   - WebP provides 25-35% better compression than PNG
   - Modern browsers support it
   - Add fallback for older browsers

3. **Target file sizes**:
   - Carousel images: 200-500 KB (currently 2-3.6 MB)
   - Service card images: 100-300 KB (currently 672 KB - 3.6 MB)

4. **Resize images**:
   - Carousel images should be max 1920px wide (not 4000px+)
   - Service card images should match their display size

**Estimated savings**: 18,097 KiB (18 MB)

### 2. Cache Headers (Medium Priority)
**Current Issue**: Resources have 10-minute cache TTL (should be longer)

**Problem**: GitHub Pages doesn't allow custom cache headers via `.htaccess`

**Solutions**:
1. **Use a CDN** (Cloudflare, etc.) - Can set cache headers
2. **Service Worker** - Can cache resources with longer TTL
3. **Accept limitation** - 10 minutes is better than no cache

**Estimated impact**: 41,831 KiB savings on repeat visits

### 3. Further Script Optimization (Low Priority)
**Current Issue**: Some unused JavaScript still loads

**Recommendations**:
1. **Lazy load Instagram/Facebook embeds**:
   - Only load when user scrolls to social section
   - Use IntersectionObserver (already implemented for Paperform)

2. **Remove unused Stripe code** (if not needed):
   - 294 KiB of unused Stripe JavaScript
   - Only include if you're using Stripe payments

### 4. CSS Optimization (Low Priority)
**Current**: CSS is already minified and reasonably sized (9.3 KiB)

**Optional improvements**:
- Critical CSS inlining (first 14KB)
- Remove unused CSS (if any)

## 🚀 Quick Wins (Do These First)

### Priority 1: Compress Images
1. Go to [TinyPNG](https://tinypng.com/)
2. Upload all carousel images (01.png - 10.png)
3. Download compressed versions
4. Replace in `assets/images/carousel/`
5. Repeat for service card images

**Time**: 30 minutes
**Impact**: ~18 MB savings, significant performance boost

### Priority 2: Convert to WebP (Optional but Recommended)
1. Use [Squoosh](https://squoosh.app/) to convert images
2. Keep PNG as fallback
3. Update HTML to use `<picture>` element with WebP + PNG fallback

**Time**: 1-2 hours
**Impact**: Additional 25-35% compression

## 📈 Monitoring Performance

### Tools to Use:
1. **Google PageSpeed Insights**: https://pagespeed.web.dev/
2. **Lighthouse** (Chrome DevTools): Built into Chrome
3. **WebPageTest**: https://www.webpagetest.org/

### Key Metrics to Track:
- **Performance Score**: Target 90+
- **LCP (Largest Contentful Paint)**: Target < 2.5s
- **FID (First Input Delay)**: Target < 100ms
- **CLS (Cumulative Layout Shift)**: Target < 0.1
- **TTFB (Time to First Byte)**: Target < 600ms

## 🔍 Current Performance Status

**Before optimizations:**
- Performance Score: 55/100
- Render blocking: 750ms
- Main-thread work: 2.5s
- Unused JavaScript: 679 KiB
- Image savings: 18,097 KiB

**After current optimizations:**
- Render blocking: Fixed (fonts non-blocking)
- Main-thread work: Reduced (scripts deferred)
- LCP: Improved (image discoverable)
- **Still needed**: Image compression

## 📝 Implementation Notes

### Script Loading Strategy
- Critical scripts (script.js) load immediately
- Third-party scripts load after page is interactive
- Paperform loads only when forms are visible
- Uses `requestIdleCallback` for optimal timing

### Font Loading Strategy
- Fonts load asynchronously
- `display=swap` ensures text is visible immediately
- Fallback fonts used until custom fonts load

### Image Loading Strategy
- First carousel image preloaded with high priority
- Hidden img tag makes it discoverable in HTML
- Other images load as needed by carousel

## 🛠️ Tools for Optimization

- **Image Compression**: [TinyPNG](https://tinypng.com/), [Squoosh](https://squoosh.app/)
- **Performance Testing**: [PageSpeed Insights](https://pagespeed.web.dev/)
- **Bundle Analysis**: Chrome DevTools Coverage tab
- **Network Analysis**: Chrome DevTools Network tab

---

**Next Steps**: Focus on image compression - this will have the biggest impact on performance score.

