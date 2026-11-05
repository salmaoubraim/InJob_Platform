import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/** Remonte en haut de page à chaque changement de route (évite d'atterrir sur le footer). */
export function useScrollToTopOnNavigate() {
  const { pathname, search, hash } = useLocation();

  useEffect(() => {
    if (hash) return;
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname, search, hash]);
}
