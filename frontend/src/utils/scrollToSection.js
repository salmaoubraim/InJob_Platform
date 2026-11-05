import { landingHash } from './paths';

const HEADER_OFFSET = 72;

/** Scroll vers une section de l'accueil (contenu complet, pas seulement le titre). */
export function scrollToSection(sectionId, { updateHistory = true } = {}) {
  const section = document.getElementById(sectionId);
  if (!section) return false;

  const target =
    section.querySelector('[data-section-content]') ?? section;

  const top =
    target.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET;

  window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });

  if (updateHistory) {
    const base = (import.meta.env.BASE_URL || '/').replace(/\/?$/, '/');
    const nextUrl = sectionId === 'accueil' ? base : landingHash(sectionId);
    window.history.replaceState(null, '', nextUrl);
  }

  return true;
}
