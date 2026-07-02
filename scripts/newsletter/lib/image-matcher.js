export function slugify(title) {
  return title
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export const SECTION_IMAGE_HINTS = {
  'chorlton-open-gardens': {
    preferredFiles: ['open_gardens.jpg', 'chorlton-open-gardens.jpg'],
    maxImages: 1,
    keywords: ['open-garden', 'open_garden', 'opengarden', 'open-gardens', 'cog', 'garden'],
    alt: 'Trishaw rides at Chorlton Open Gardens',
  },
  'british-cycling-volunteer-day': {
    preferredFiles: ['british_cycling_1.png', 'british_cycling_2.jpg', 'british-cycling-volunteer-day.jpg'],
    maxImages: 2,
    keywords: ['british-cycling', 'british_cycling', 'volunteer', 'bc-'],
    alt: 'British Cycling Volunteer Day with Chorlton Bikes',
  },
  'our-first-trishaw-wedding': {
    preferredFiles: ['trishaw_wedding_1.jpg', 'trishaw_wedding_2.jpg', 'trishaw-wedding.jpg'],
    maxImages: 2,
    keywords: ['wedding', 'registry', 'deansgate', 'bride', 'groom', 'married'],
    alt: 'First trishaw wedding transport in Manchester',
  },
  'community-ride-2026-save-the-date': {
    preferredFiles: ['community-ride.jpg'],
    maxImages: 1,
    keywords: ['community-ride', 'community_ride', 'save-the-date', 'september', 'ride-2026'],
    alt: 'Community Ride 2026',
  },
  'meeting-with-councillor-grace-worrall': {
    preferredFiles: ['grace_worrall.jpg', 'councillor-meeting.jpg'],
    maxImages: 1,
    keywords: ['grace', 'worrall', 'councillor', 'council', 'meeting'],
    alt: 'Meeting with Councillor Grace Worrall',
  },
  'tesco-roadshow-for-emmeline-s': {
    preferredFiles: ['tesco_roadshow_1.jpg', 'tesco_roadshow_2.jpg', 'emmelines-tesco.jpg'],
    maxImages: 2,
    keywords: ['tesco', 'emmeline', 'roadshow', 'stretford', 'pantry', 'food-donation'],
    alt: 'Tesco roadshow food donation collection for Emmeline\'s Pantry',
  },
  'tandem-hire-bike-library': {
    preferredFiles: ['tandem_hire_1.jpg', 'tandem_hire_2.jpg', 'bike-library-1.jpg', 'bike-library-2.jpg'],
    maxImages: 2,
    keywords: ['tandem', 'brompton', 'bike-library', 'bike_library', 'library', 'hire'],
    alt: 'Bike library tandem and Brompton hire',
  },
};

function normalizeFilename(name) {
  return name.toLowerCase().replace(/\.[a-z0-9]+$/i, '').replace(/[_\s]+/g, '-');
}

function fileGroupKey(filename) {
  const base = normalizeFilename(filename);
  return base.replace(/-\d+$/, '').replace(/-\d+[a-z]?$/, '');
}

function scoreFileForSection(filename, sectionSlug) {
  const hints = SECTION_IMAGE_HINTS[sectionSlug];
  if (!hints) {
    return 0;
  }

  const normalized = normalizeFilename(filename);
  const group = fileGroupKey(filename);

  let score = 0;
  for (const keyword of hints.keywords) {
    if (normalized.includes(keyword) || group.includes(keyword)) {
      score += keyword.length;
    }
  }

  if (normalized.includes(sectionSlug.slice(0, 12))) {
    score += 5;
  }

  return score;
}

export function matchFilesToSections(filenames, sectionSlugs) {
  const assignments = Object.fromEntries(sectionSlugs.map((slug) => [slug, []]));
  const unmatched = [];

  // Map every image to the most relevant section by filename score.
  for (const file of filenames) {
    let bestSlug = null;
    let bestScore = -1;
    for (const slug of sectionSlugs) {
      const score = scoreFileForSection(file, slug);
      if (score > bestScore) {
        bestScore = score;
        bestSlug = slug;
      }
    }

    if (bestSlug && bestScore > 0) {
      assignments[bestSlug].push(file);
    } else {
      unmatched.push(file);
    }
  }

  // If a file has no keyword match, still place it to avoid leaving assets unused.
  for (const file of unmatched) {
    const target = sectionSlugs.reduce((current, slug) =>
      assignments[slug].length < assignments[current].length ? slug : current,
    sectionSlugs[0]);
    assignments[target].push(file);
  }

  return assignments;
}

export function layoutForImageCount(count) {
  if (count >= 3) {
    return 'three-col';
  }
  if (count === 2) {
    return 'two-col';
  }
  if (count === 1) {
    return 'single';
  }
  return undefined;
}

export function buildImageMapping(sectionSlug, files, altDefault) {
  if (!files.length) {
    return null;
  }

  const layout = layoutForImageCount(files.length);
  const images = files.map((file, index) => ({
    file,
    alt: files.length > 1 ? `${altDefault} ${index + 1}` : altDefault,
  }));

  return { images, layout };
}
