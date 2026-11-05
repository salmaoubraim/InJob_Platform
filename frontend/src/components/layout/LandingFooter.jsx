import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Briefcase, Mail, Phone, MapPin } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useAuthModal } from '../../context/AuthModalContext';
import { landingHash } from '../../utils/paths';
import { scrollToSection } from '../../utils/scrollToSection';
import { isLandingPath, navigateToLandingSection } from '../../utils/landingNavigation';
import { getOffersPathForRole } from '../../utils/offersNavigation';

const FOOTER_LINKS = [
  {
    title: 'Plateforme',
    links: [
      { label: 'Accueil', sectionId: null, isRoute: true },
      { label: 'Offres', sectionId: 'offres', isRoute: false },
      { label: 'Fonctionnalités', sectionId: 'features', isRoute: false },
      { label: 'À propos', sectionId: 'about', isRoute: false },
    ],
  },
  {
    title: 'Compte',
    links: [
      { label: 'Connexion', action: 'login' },
      { label: 'Inscription candidat', action: 'register', role: 'candidat' },
      { label: 'Inscription recruteur', action: 'register', role: 'recruteur' },
    ],
  },
  {
    title: 'Légal',
    links: [
      { label: 'Conditions d\'utilisation', to: '/contact', isPage: true },
      { label: 'Confidentialité', to: '/contact', isPage: true },
      { label: 'Contact', to: '/contact', isPage: true },
    ],
  },
];

export default function LandingFooter() {
  const { openLogin, openRegister } = useAuthModal();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const onLanding = isLandingPath(pathname);
  const offersPath = user?.role ? getOffersPathForRole(user.role) : '/offres';

  const handleAccountLink = (item) => {
    if (item.action === 'login') openLogin();
    else openRegister(item.role);
  };

  const goToSection = (sectionId, e) => {
    e?.preventDefault();
    if (sectionId === 'offres' && (user?.role || !onLanding)) {
      navigate(offersPath);
      return;
    }
    if (onLanding) {
      scrollToSection(sectionId);
      return;
    }
    navigateToLandingSection(navigate, sectionId);
  };

  return (
    <footer className="w-full bg-white border-t border-gray-100 shrink-0">
      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-14 box-border">
        <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8 lg:justify-between">
          <div className="w-full">
            <Link to="/" className="inline-flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                <Briefcase className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-text-dark">InJob</span>
            </Link>
            <p className="text-sm text-text-secondary leading-relaxed max-w-xs">
              La plateforme marocaine qui relie talents et entreprises, partout au Royaume.
            </p>
          </div>

          {FOOTER_LINKS.map((section) => (
            <div key={section.title} className="w-full min-w-0">
              <h4 className="font-semibold text-text-dark mb-4">{section.title}</h4>
              <ul className="space-y-2.5">
                {section.links.map((link) => (
                  <li key={link.label}>
                    {link.action ? (
                      <button
                        type="button"
                        onClick={() => handleAccountLink(link)}
                        className="text-sm text-text-secondary hover:text-primary transition-colors text-start"
                      >
                        {link.label}
                      </button>
                    ) : link.isRoute ? (
                      <Link
                        to="/"
                        className="text-sm text-text-secondary hover:text-primary transition-colors"
                      >
                        {link.label}
                      </Link>
                    ) : link.isPage ? (
                      <Link
                        to={link.to}
                        className="text-sm text-text-secondary hover:text-primary transition-colors"
                      >
                        {link.label}
                      </Link>
                    ) : link.sectionId === 'offres' && (user?.role || !onLanding) ? (
                      <Link
                        to={offersPath}
                        className="text-sm text-text-secondary hover:text-primary transition-colors"
                      >
                        {link.label}
                      </Link>
                    ) : (
                      <a
                        href={landingHash(link.sectionId)}
                        onClick={(e) => goToSection(link.sectionId, e)}
                        className="text-sm text-text-secondary hover:text-primary transition-colors"
                      >
                        {link.label}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="w-full mt-12 pt-10 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">
          <div className="flex items-start gap-3 w-full">
            <div className="w-10 h-10 rounded-xl bg-primary-soft flex items-center justify-center shrink-0">
              <Mail className="w-5 h-5 text-primary" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-text-dark">Email</p>
              <a
                href="mailto:contact@injob.ma"
                className="text-sm text-text-secondary hover:text-primary break-all"
              >
                contact@injob.ma
              </a>
            </div>
          </div>
          <div className="flex items-start gap-3 w-full">
            <div className="w-10 h-10 rounded-xl bg-primary-soft flex items-center justify-center shrink-0">
              <Phone className="w-5 h-5 text-primary" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-text-dark">Téléphone</p>
              <p className="text-sm text-text-secondary">+212 5 22 00 00 00</p>
            </div>
          </div>
          <div className="flex items-start gap-3 w-full">
            <div className="w-10 h-10 rounded-xl bg-primary-soft flex items-center justify-center shrink-0">
              <MapPin className="w-5 h-5 text-primary" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-text-dark">Adresse</p>
              <p className="text-sm text-text-secondary">Agadir, Maroc</p>
            </div>
          </div>
        </div>

        <p className="w-full mt-10 text-center text-xs text-text-secondary">
          © {new Date().getFullYear()} InJob. Tous droits réservés. — Emploi au Maroc
        </p>
      </div>
    </footer>
  );
}
