export const JUNE_2026_FALLBACKS = {
  'chorlton-open-gardens': {
    source: '05-2026/chorlton-open-gardens.jpg',
    dest: 'chorlton-open-gardens.jpg',
    alt: 'Trishaw rides at Chorlton Open Gardens',
  },
  'british-cycling-volunteer-day': {
    source: '05-2026/trishaw-training-1.jpg',
    dest: 'british-cycling-volunteer-day.jpg',
    alt: 'Trishaw training and volunteer riders',
  },
  'our-first-trishaw-wedding': {
    source: '04-2026/trishaw-open-gardens.jpg',
    dest: 'trishaw-wedding.jpg',
    alt: 'Chorlton Bikes trishaw in the community',
  },
  'community-ride-2026-save-the-date': {
    source: '04-2026/community-ride.jpg',
    dest: 'community-ride.jpg',
    alt: 'Community Ride 2026',
  },
  'meeting-with-councillor-grace-worrall': {
    source: '02-2026/kings-award.jpg',
    dest: 'councillor-meeting.jpg',
    alt: 'Chorlton Bikes community visit',
  },
  'tesco-roadshow-for-emmeline-s': {
    source: '02-2026/emmelines-pantry.jpg',
    dest: 'emmelines-tesco.jpg',
    alt: 'Emmeline\'s Pantry food donation collection',
  },
  'tandem-hire-bike-library': {
    sources: [
      { source: '02-2026/chatty-cafe.jpg', dest: 'bike-library-1.jpg' },
      { source: '04-2026/new-riders.jpg', dest: 'bike-library-2.jpg' },
    ],
    alt: 'Chorlton Bikes trishaw and riders',
    layout: 'two-col',
  },
};

export function fallbacksForMonth(month, year) {
  if (month.toLowerCase() === 'june' && year === 2026) {
    return JUNE_2026_FALLBACKS;
  }
  return {};
}
