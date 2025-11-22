# Hero Carousel Images

The hero section includes an image carousel that automatically cycles through images.

## How to Add Images

1. **Name your images** with 2-digit numbers: `01.png`, `02.png`, `03.png`, etc. (up to `99.png`)
2. **Place them** in the `assets/images/carousel/` folder
3. **The carousel will automatically detect and use them** in numerical order

## Image Requirements

- **Format**: PNG or JPG
- **Recommended size**: 2000px width or larger
- **Aspect ratio**: 16:9 or similar landscape format
- **File size**: Keep under 500KB per image for fast loading
- **Naming**: Must use 2-digit format (01, 02, 03... not 1, 2, 3)

## How It Works

- Images are automatically detected and sorted numerically
- The carousel transitions every 5 seconds with a smooth crossfade
- Images cycle infinitely
- If no images are found, the hero section will show a fallback

## Reordering Images

To change the order, simply rename the files with different numbers. For example:
- To move an image to the front: rename it to `01.png` (and renumber others)
- To add a new image: use the next available number (e.g., `14.png`)
