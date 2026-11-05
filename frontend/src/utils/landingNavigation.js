const PENDING_SCROLL_KEY = 'injob_pending_scroll';

/** True when the current route is the landing page (with or without basename). */
export function isLandingPath(pathname) {
  const normalized = pathname.replace(/\/$/, '') || '/';
  return normalized === '/' || normalized === '' || normalized.endsWith('/injob');
}

export function setPendingScroll(sectionId) {
  try {
    sessionStorage.setItem(PENDING_SCROLL_KEY, sectionId);
  } catch {
    /* ignore */
  }
}

export function consumePendingScroll() {
  try {
    const id = sessionStorage.getItem(PENDING_SCROLL_KEY);
    if (id) sessionStorage.removeItem(PENDING_SCROLL_KEY);
    return id;
  } catch {
    return null;
  }
}

/** Section active sur l'accueil (hash URL ou « accueil » par défaut). */
export function readLandingSection(locationHash = '') {
  const hash = (locationHash || window.location.hash).replace('#', '').trim();
  return hash || 'accueil';
}

/** Vers l'accueil puis scroll vers la section (sans saut hash navigateur). */
export function navigateToLandingSection(navigate, sectionId) {
  setPendingScroll(sectionId);
  navigate({ pathname: '/' }, { state: { scrollTo: sectionId } });
}
