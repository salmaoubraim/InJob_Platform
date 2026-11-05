import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { scrollToSection } from '../utils/scrollToSection';
import {
  consumePendingScroll,
  isLandingPath,
} from '../utils/landingNavigation';

function scrollWhenReady(sectionId, attempt = 0) {
  if (scrollToSection(sectionId)) return;
  if (attempt < 50) {
    window.setTimeout(() => scrollWhenReady(sectionId, attempt + 1), 80);
  }
}

/** Scroll vers #offres, #features… après arrivée sur l'accueil (ex. depuis Contact). */
export function useLandingHashScroll() {
  const { pathname, hash, state } = useLocation();

  useEffect(() => {
    if (!isLandingPath(pathname)) return;

    const pending = consumePendingScroll();
    const fromHash = hash.replace('#', '').trim();
    const id = state?.scrollTo || pending || fromHash;
    if (!id) return;

    window.scrollTo(0, 0);

    const start = () => scrollWhenReady(id);
    const t1 = window.setTimeout(start, 80);
    const t2 = window.setTimeout(start, 400);

    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, [pathname, hash, state]);
}
