// Single source of truth for Yumbite brand contact info.
// NOTE: FACEBOOK_URL is a placeholder. Replace with the exact Facebook
// profile URL supplied by the restaurant owner.
export const BRAND = {
  name: 'Yumbite',
  tagline: 'Bite Into Happiness',
  secondaryTagline: 'Good Food • Good Mood',
  phoneDisplay: '01313-886160',
  phoneDial: '01313886160',
  phoneHref: 'tel:01313886160',
  addressLines: ['CXRJ+JH7', 'Buddhist Temple Rd', "Cox's Bazar, Bangladesh"],
  addressShort: "CXRJ+JH7, Buddhist Temple Rd, Cox's Bazar",
  mapsQuery: "Yumbite, Buddhist Temple Road, Cox's Bazar",
  hours: 'Open · Closes 11 PM',
  hoursLong: 'Open Daily · 11 AM - 11 PM',
  rating: '5.0',
  reviewCount: 2,
  FACEBOOK_URL: 'https://www.facebook.com/yumbite.coxsbazar',
};

// ---------------------------------------------------------------------------
// Apply admin-edited site settings (Admin → Settings) onto the brand.
// Called once at app startup, and also after Admin → Settings save.
// Components re-render via App state when BRAND updates.
// ---------------------------------------------------------------------------
export function applySiteSettings(s = {}) {
  if (s.restaurantName && String(s.restaurantName).trim()) {
    BRAND.name = String(s.restaurantName).trim();
    BRAND.mapsQuery = `${BRAND.name}, Buddhist Temple Road, Cox's Bazar`;
  }
  if (s.tagline !== undefined) BRAND.tagline = String(s.tagline || '');
  if (s.phone && String(s.phone).trim()) {
    const digits = String(s.phone).replace(/\D/g, '');
    BRAND.phoneDisplay = String(s.phone).trim();
    BRAND.phoneDial = digits;
    BRAND.phoneHref = `tel:${digits}`;
  }
  if (s.address && String(s.address).trim()) {
    const full = String(s.address).trim();
    BRAND.addressShort = full;
    const parts = full.split(',').map((x) => x.trim()).filter(Boolean);
    BRAND.addressLines = parts.length >= 3
      ? [parts[0], parts.slice(1, -1).join(', '), parts[parts.length - 1]]
      : [full];
  }
  if (s.hours && String(s.hours).trim()) {
    BRAND.hours = String(s.hours).trim();
    BRAND.hoursLong = String(s.hours).trim();
  }

  // ---- Hero Section ----
  if (s.heroSmallHeading !== undefined) BRAND.heroSmallHeading = String(s.heroSmallHeading || '');
  if (s.heroMainHeadingLine1 !== undefined) BRAND.heroMainHeadingLine1 = String(s.heroMainHeadingLine1 || '');
  if (s.heroMainHeadingLine2 !== undefined) BRAND.heroMainHeadingLine2 = String(s.heroMainHeadingLine2 || '');
  if (s.heroDescription !== undefined) BRAND.heroDescription = String(s.heroDescription || '');
  if (s.heroDecorativeText !== undefined) BRAND.heroDecorativeText = String(s.heroDecorativeText || '');
  if (s.heroPrimaryButtonText !== undefined) BRAND.heroPrimaryButtonText = String(s.heroPrimaryButtonText || '');
  if (s.heroPrimaryButtonLink !== undefined) BRAND.heroPrimaryButtonLink = String(s.heroPrimaryButtonLink || '');
  if (s.heroSecondaryButtonText !== undefined) BRAND.heroSecondaryButtonText = String(s.heroSecondaryButtonText || '');
  if (s.heroSecondaryButtonLink !== undefined) BRAND.heroSecondaryButtonLink = String(s.heroSecondaryButtonLink || '');
  if (s.heroBackgroundImage !== undefined) BRAND.heroBackgroundImage = String(s.heroBackgroundImage || '');

  // ---- About Section ----
  if (s.aboutSectionLabel !== undefined) BRAND.aboutSectionLabel = String(s.aboutSectionLabel || '');
  if (s.aboutSectionTitle !== undefined) BRAND.aboutSectionTitle = String(s.aboutSectionTitle || '');
  if (s.aboutDescription !== undefined) BRAND.aboutDescription = String(s.aboutDescription || '');
  if (s.aboutFeature1Title !== undefined) BRAND.aboutFeature1Title = String(s.aboutFeature1Title || '');
  if (s.aboutFeature1Description !== undefined) BRAND.aboutFeature1Description = String(s.aboutFeature1Description || '');
  if (s.aboutFeature2Title !== undefined) BRAND.aboutFeature2Title = String(s.aboutFeature2Title || '');
  if (s.aboutFeature2Description !== undefined) BRAND.aboutFeature2Description = String(s.aboutFeature2Description || '');
  if (s.aboutFeature3Title !== undefined) BRAND.aboutFeature3Title = String(s.aboutFeature3Title || '');
  if (s.aboutFeature3Description !== undefined) BRAND.aboutFeature3Description = String(s.aboutFeature3Description || '');
  if (s.aboutFeature4Title !== undefined) BRAND.aboutFeature4Title = String(s.aboutFeature4Title || '');
  if (s.aboutFeature4Description !== undefined) BRAND.aboutFeature4Description = String(s.aboutFeature4Description || '');
  if (s.aboutCTAText !== undefined) BRAND.aboutCTAText = String(s.aboutCTAText || '');
  if (s.aboutCTALink !== undefined) BRAND.aboutCTALink = String(s.aboutCTALink || '');

  // ---- Popular Menu Section ----
  if (s.popularSectionTitle !== undefined) BRAND.popularSectionTitle = String(s.popularSectionTitle || '');
  if (s.popularSectionDescription !== undefined) BRAND.popularSectionDescription = String(s.popularSectionDescription || '');
  if (s.viewFullMenuButtonText !== undefined) BRAND.viewFullMenuButtonText = String(s.viewFullMenuButtonText || '');
  if (s.viewFullMenuButtonLink !== undefined) BRAND.viewFullMenuButtonLink = String(s.viewFullMenuButtonLink || '');

  // ---- Footer ----
  if (s.footerTagline !== undefined) BRAND.footerTagline = String(s.footerTagline || '');
  if (s.footerCopyright !== undefined) BRAND.footerCopyright = String(s.footerCopyright || '');
}

export function openFacebook() {
  if (typeof window !== 'undefined') {
    window.open(BRAND.FACEBOOK_URL, '_blank', 'noopener,noreferrer');
  }
}

export function openMaps() {
  if (typeof window !== 'undefined') {
    const query = encodeURIComponent(BRAND.mapsQuery || BRAND.addressShort || BRAND.name);
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank', 'noopener,noreferrer');
  }
}

export function callYumbite() {
  if (typeof window !== 'undefined') {
    window.location.href = BRAND.phoneHref || `tel:${BRAND.phoneDial}`;
  }
}