import { motion } from 'framer-motion';
import { Briefcase, Quote } from 'lucide-react';
import { Link } from 'react-router-dom';

const TAGLINES = {
  login: {
    title: 'Bienvenue sur InJob 🇲🇦',
    subtitle:
      'La plateforme marocaine qui connecte les talents aux meilleures opportunités.',
  },
  register_candidat: {
    title: 'Trouvez votre emploi idéal',
    subtitle: 'Des milliers d\'offres au Maroc, adaptées à votre profil.',
  },
  register_recruteur: {
    title: 'Recrutez les meilleurs talents',
    subtitle: 'Publiez vos offres et trouvez les candidats qu\'il vous faut.',
  },
  register: {
    title: 'Rejoignez InJob',
    subtitle: 'Choisissez votre profil et créez votre compte en quelques minutes.',
  },
};

export default function AuthLayout({
  children,
  variant = 'login',
  role,
  showMobileLogo = true,
}) {
  const tagKey =
    variant === 'register' && role
      ? `register_${role}`
      : variant;
  const tagline = TAGLINES[tagKey] || TAGLINES.login;

  return (
    <div className="min-h-screen bg-bg-page flex flex-col lg:flex-row">
      <motion.aside
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="hidden lg:flex lg:w-1/2 relative overflow-hidden flex-col justify-between p-12"
        style={{
          background: 'linear-gradient(135deg, #2D3FCC 0%, #4361EE 100%)',
        }}
      >
        <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-white/10 animate-float-blob" />
        <div className="absolute bottom-32 left-8 w-48 h-48 rounded-full bg-white/15 animate-float-blob" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 right-16 w-32 h-32 rounded-full bg-accent/20 animate-float-blob" style={{ animationDelay: '4s' }} />

        <Link to="/" className="flex items-center gap-3 text-white relative z-10">
          <div className="w-11 h-11 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur">
            <Briefcase className="w-6 h-6" />
          </div>
          <span className="text-2xl font-bold tracking-tight">InJob</span>
        </Link>

        <div className="relative z-10 space-y-4 max-w-md">
          <h1 className="text-4xl font-bold text-white leading-tight">
            {tagline.title}
          </h1>
          <p className="text-white/85 text-lg leading-relaxed">{tagline.subtitle}</p>
        </div>

        <div className="relative z-10 bg-white/95 backdrop-blur rounded-xl p-5 auth-card max-w-sm">
          <div className="flex gap-1 text-primary mb-2">
            <Quote className="w-5 h-5 fill-primary/20" />
          </div>
          <p className="text-text-dark text-sm leading-relaxed italic">
            « Trouvé mon emploi en 2 semaines grâce à InJob ! »
          </p>
          <div className="flex items-center gap-3 mt-4">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">
              YK
            </div>
            <div>
              <p className="text-sm font-semibold text-text-dark">Yasmine K.</p>
              <p className="text-xs text-text-secondary">Développeuse — Casablanca</p>
            </div>
          </div>
        </div>
      </motion.aside>

      <div className="flex-1 flex items-center justify-center p-4 sm:p-8 lg:p-10 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md"
        >
          {showMobileLogo && (
            <Link to="/" className="lg:hidden flex items-center justify-center gap-2 mb-6">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                <Briefcase className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-text-dark">InJob</span>
            </Link>
          )}

          <div className="bg-white rounded-2xl p-6 sm:p-10 auth-card">{children}</div>
        </motion.div>
      </div>
    </div>
  );
}
