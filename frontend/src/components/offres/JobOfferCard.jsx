import { useEffect, useState } from 'react';
import { MapPin, Banknote, Calendar, UserCheck } from 'lucide-react';

const FALLBACK_IMG =
  'https://images.unsplash.com/photo-1497215728101-856f4fa09074?w=600&q=80';

function postesBracket(count) {
  const n = Number(count) || 1;
  const label = n > 1 ? `${n} postes` : '1 poste';
  return `[${label}]`;
}

export default function JobOfferCard({ job, action, showPublisher = false, variant = 'default' }) {
  const [imgSrc, setImgSrc] = useState(job.image || FALLBACK_IMG);

  useEffect(() => {
    setImgSrc(job.image || FALLBACK_IMG);
  }, [job.id_offre, job.image]);

  const isExpired =
    job.date_limite &&
    new Date(job.date_limite) < new Date(new Date().toDateString());

  const entrepriseNom = job.recruteur_nom || job.entreprise || 'Recruteur';
  const recruteurPersonne = job.recruteur_contact || job.recruteur_prenom || null;
  const isLanding = variant === 'landing';

  return (
    <article className="bg-white rounded-2xl overflow-hidden auth-card flex flex-col h-full w-full min-w-0 hover:shadow-lg transition-shadow duration-300">
      <div className="px-4 pt-3.5 pb-2.5 flex flex-wrap sm:flex-nowrap items-center gap-x-2 gap-y-1 text-xs sm:text-sm border-b border-gray-100 bg-gradient-to-r from-primary-soft/40 to-transparent transition-colors duration-300">
        <span className="inline-flex shrink-0 font-semibold text-primary bg-white/90 px-2.5 py-1 rounded-lg shadow-sm ring-1 ring-primary/10">
          {postesBracket(job.nombre_postes)}
        </span>
        <span className="text-text-secondary/80 select-none shrink-0" aria-hidden="true">
          •
        </span>
        <p className="min-w-0 flex-1 text-text-secondary leading-snug">
          <span className="whitespace-nowrap">
            {showPublisher ? 'Publié par :' : 'Recruteur :'}
          </span>{' '}
          <span
            className="font-semibold text-text-dark break-words sm:truncate sm:inline-block sm:max-w-[min(100%,14rem)] sm:align-bottom"
            title={recruteurPersonne ? `${recruteurPersonne} — ${entrepriseNom}` : entrepriseNom}
          >
            {recruteurPersonne ? `${recruteurPersonne} — ${entrepriseNom}` : entrepriseNom}
          </span>
        </p>
      </div>

      <div className="aspect-[4/3] overflow-hidden bg-gray-100 shrink-0 relative">
        <img
          src={imgSrc}
          alt={job.titre || 'Offre'}
          className="w-full h-full object-cover"
          loading="lazy"
          onError={() => setImgSrc(FALLBACK_IMG)}
        />
        <div className="absolute top-2 left-2 flex flex-wrap gap-1.5 max-w-[90%]">
          {job.urgence && (
            <span className="text-[10px] font-bold uppercase tracking-wide text-white bg-red-500 px-2 py-0.5 rounded-full shadow-sm">
              {job.urgence}
            </span>
          )}
          {job.categorie && (
            <span className="text-[10px] font-semibold text-primary bg-white/95 px-2 py-0.5 rounded-full shadow-sm">
              {job.categorie}
            </span>
          )}
        </div>
        {job.type_contrat && (
          <span className="absolute bottom-2 left-2 text-xs font-semibold text-primary bg-white/95 px-2 py-0.5 rounded-full shadow-sm">
            {job.type_contrat}
          </span>
        )}
      </div>

      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-semibold text-text-dark leading-snug">{job.titre}</h3>
        {job.metier && (
          <span className="inline-flex self-start mt-2 text-[11px] font-medium text-text-dark bg-gray-100 px-2.5 py-1 rounded-lg">
            {job.metier}
          </span>
        )}
        {!job.metier && job.categorie && !isLanding && (
          <p className="text-xs text-primary mt-1 font-medium">{job.categorie}</p>
        )}
        {job.date_publication_label && (
          <p className="text-xs text-text-secondary mt-2">
            Publié le {job.date_publication_label}
          </p>
        )}
        {job.ville && (
          <p className="text-sm text-text-secondary mt-2 flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 shrink-0" />
            {job.ville}
          </p>
        )}
        <p className="text-sm text-text-secondary mt-1 flex items-center gap-1">
          <Banknote className="w-3.5 h-3.5 shrink-0" />
          {job.salaire}
        </p>

        {job.date_limite_label && !isLanding && (
          <p
            className={`text-sm mt-2 flex items-center gap-1 ${
              isExpired ? 'text-error font-medium' : 'text-text-secondary'
            }`}
          >
            <Calendar className="w-3.5 h-3.5 shrink-0" />
            <span>
              Date limite : {job.date_limite_label}
              {isExpired ? ' (expirée)' : ''}
            </span>
          </p>
        )}

        {job.nb_candidatures != null && (
          <p className="text-xs text-text-secondary mt-1.5 flex items-center gap-1">
            <UserCheck className="w-3.5 h-3.5 shrink-0 text-primary" />
            {job.nb_candidatures} candidature{job.nb_candidatures !== 1 ? 's' : ''}
          </p>
        )}

        {!isLanding && (
          <p className="text-xs text-text-secondary mt-3 leading-relaxed flex-1 line-clamp-3">
            {job.description}
          </p>
        )}
        {isLanding && <div className="flex-1" />}
        {action && <div className="mt-4">{action}</div>}
      </div>
    </article>
  );
}
