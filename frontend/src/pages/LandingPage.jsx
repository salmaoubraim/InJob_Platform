import { lazy, Suspense } from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  Building2,
  Shield,
  Zap,
  MapPin,
  Loader2,
} from 'lucide-react';
import AppHeader from '../components/layout/AppHeader';
import LandingFooter from '../components/layout/LandingFooter';
import HeroImage from '../components/landing/HeroImage';
import LandingRecentOffers from '../components/landing/LandingRecentOffers';
import LandingCategories from '../components/landing/LandingCategories';
import LandingPartners from '../components/landing/LandingPartners';
import LandingStats from '../components/landing/LandingStats';
import { useLandingHashScroll } from '../hooks/useLandingHashScroll';
import { useAuthModal } from '../context/AuthModalContext';
const MoroccoMap = lazy(() => import('../components/landing/MoroccoMap'));

const FEATURES = [
  {
    icon: Search,
    title: 'Recherche intelligente',
    desc: 'Filtrez par ville, catégorie et compétences pour trouver l\'offre idéale.',
  },
  {
    icon: Building2,
    title: 'Espace recruteur',
    desc: 'Publiez vos offres et gérez les candidatures en un seul endroit.',
  },
  {
    icon: Shield,
    title: 'Données sécurisées',
    desc: 'Vos informations personnelles sont protégées et traitées en toute confidentialité.',
  },
  {
    icon: Zap,
    title: 'Candidature rapide',
    desc: 'Postulez en quelques clics avec votre profil et votre CV.',
  },
];

const ABOUT_SECTIONS = [
  {
    title: 'Notre histoire',
    text: 'InJob est née à Agadir avec l\'ambition d\'offrir une expérience de recherche d\'emploi moderne, accessible et pensée pour le marché marocain.',
  },
  {
    title: 'Notre mission',
    text: 'Faciliter la rencontre entre candidats motivés et recruteurs exigeants, en rendant chaque étape simple et transparente.',
  },
  {
    title: 'Pour qui ?',
    text: 'Candidats en quête d\'opportunités, entreprises qui recrutent et une équipe dédiée à faire grandir l\'écosystème emploi au Maroc.',
  },
];

export default function LandingPage() {
  const { openRegister } = useAuthModal();
  useLandingHashScroll();

  return (
    <div className="min-h-screen bg-bg-page flex flex-col">
      <AppHeader />

      <main className="flex-1">
        <section id="accueil" className="relative overflow-hidden scroll-section">
          <div className="absolute -top-32 -end-32 w-96 h-96 rounded-full bg-primary/10 animate-float-blob" />
          <div className="absolute bottom-0 start-10 w-64 h-64 rounded-full bg-primary-pale/20 animate-float-blob" style={{ animationDelay: '3s' }} />

          <div
            className="max-w-6xl mx-auto px-4 sm:px-6 pt-14 pb-20 relative"
            data-section-content
          >
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-soft text-primary text-sm font-semibold mb-6">
                  <MapPin className="w-4 h-4" />
                  Plateforme 100% Marocaine — Agadir
                </span>
                <h1 className="text-4xl sm:text-5xl font-bold text-text-dark leading-tight">
                  Votre avenir professionnel commence{' '}
                  <span className="text-primary">ici</span>
                </h1>
                <p className="mt-5 text-lg text-text-secondary leading-relaxed">
                  Chaque opportunité compte. Rejoignez des milliers de talents et d&apos;entreprises qui construisent déjà leur succès avec InJob —
                  <strong className="text-text-dark font-medium">
                    {' '}
                    osez le prochain chapitre de votre carrière.
                  </strong>
                </p>
                <div className="mt-10 flex flex-col sm:flex-row gap-4">
                  <button
                    type="button"
                    onClick={() => openRegister('candidat')}
                    className="inline-flex items-center justify-center h-12 px-8 rounded-xl bg-primary text-white font-semibold hover:bg-primary-dark hover:-translate-y-px transition-all shadow-lg shadow-primary/25 text-center"
                  >
                    Je cherche un emploi
                  </button>
                  <button
                    type="button"
                    onClick={() => openRegister('recruteur')}
                    className="inline-flex items-center justify-center h-12 px-8 rounded-xl bg-primary-soft text-primary font-semibold hover:bg-primary-pale hover:-translate-y-px transition-all shadow-sm border-2 border-primary-light/70 text-center"
                  >
                    Je recrute
                  </button>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.15, duration: 0.5 }}
                className="relative w-full"
              >
                <HeroImage />
              </motion.div>
            </div>

            <LandingStats />
          </div>
        </section>

        <section id="offres" className="py-16 bg-white scroll-section">
          <div className="max-w-6xl mx-auto px-4 sm:px-6" data-section-content>
            <h2 className="text-3xl font-bold text-text-dark text-center">Offres d&apos;emploi</h2>
            <div className="mt-10">
              <LandingRecentOffers />
            </div>
          </div>
        </section>

        <LandingCategories />
        <LandingPartners />

        <section id="carte-maroc" className="py-16 scroll-section">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center mb-8">
            <h2 className="text-3xl font-bold text-text-dark">Explorez le Maroc</h2>
            <p className="text-text-secondary mt-3 max-w-2xl mx-auto">
              Carte interactive des villes couvertes par InJob.
            </p>
          </div>
        </section>

        <section className="pb-20 scroll-section">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col items-center">
            <Suspense
              fallback={
                <div className="h-[480px] rounded-2xl bg-white auth-card flex items-center justify-center gap-3 text-text-secondary">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  Chargement de la carte...
                </div>
              }
            >
              <MoroccoMap />
            </Suspense>
          </div>
        </section>

        <section id="features" className="py-20 bg-white scroll-section">
          <div className="max-w-6xl mx-auto px-4 sm:px-6" data-section-content>
            <h2 className="text-3xl font-bold text-text-dark text-center mb-4">
              Pourquoi InJob ?
            </h2>
            <p className="text-text-secondary text-center max-w-xl mx-auto mb-12">
              Une plateforme complète pour candidats et recruteurs.
            </p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {FEATURES.map((feature, i) => {
                const Icon = feature.icon;
                return (
                  <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.08 }}
                    className="p-6 rounded-2xl bg-bg-page hover:shadow-lg transition-shadow auth-card"
                  >
                    <div className="w-11 h-11 rounded-xl bg-primary-soft flex items-center justify-center text-primary mb-4">
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="font-semibold text-text-dark">{feature.title}</h3>
                    <p className="text-sm text-text-secondary mt-2 leading-relaxed">
                      {feature.desc}
                    </p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        <section id="about" className="py-20 scroll-section">
          <div className="max-w-6xl mx-auto px-4 sm:px-6" data-section-content>
            <h2 className="text-3xl font-bold text-text-dark text-center mb-4">
              À propos d&apos;InJob
            </h2>
            <p className="text-text-secondary text-center max-w-2xl mx-auto mb-12">
              La plateforme marocaine qui rapproche les talents et les entreprises, où que vous soyez au Royaume.
            </p>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {ABOUT_SECTIONS.map((section) => (
                <div
                  key={section.title}
                  className="bg-white rounded-2xl p-6 auth-card"
                >
                  <h3 className="font-semibold text-primary text-lg">{section.title}</h3>
                  <p className="mt-3 text-sm text-text-secondary leading-relaxed">
                    {section.text}
                  </p>
                </div>
              ))}
            </div>

            <div
              className="mt-8 rounded-2xl p-8 text-white text-center max-w-3xl mx-auto auth-card"
              style={{ background: 'linear-gradient(135deg, #4361EE, #A8C4FF)' }}
            >
              <p className="text-3xl mb-2">🇲🇦</p>
              <p className="text-lg font-semibold">Fièrement marocain — basé à Agadir</p>
              <p className="mt-2 text-white/90 text-sm max-w-md mx-auto">
                Simplicité, confiance et proximité : trois valeurs qui guident chaque fonctionnalité de l&apos;application InJob.
              </p>
            </div>
          </div>
        </section>
      </main>

      <LandingFooter />
    </div>
  );
}
