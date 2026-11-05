import { Check } from 'lucide-react';
import { CANDIDATURE_TIMELINE, getCandidatureStatut } from '../../utils/candidatureStatus';

const STEP_LABELS = {
  en_attente: 'Envoyée',
  entretien_programme: 'Entretien',
  acceptee: 'Décision',
};

export default function CandidatureTimeline({ statut }) {
  const currentIdx = CANDIDATURE_TIMELINE.indexOf(statut);
  const isRefused = statut === 'refusee';

  return (
    <div className="flex items-center gap-1 sm:gap-2 mt-4 pt-4 border-t border-gray-100">
      {CANDIDATURE_TIMELINE.map((step, idx) => {
        const done = isRefused ? idx === 0 : idx <= currentIdx;
        const active = !isRefused && idx === currentIdx;
        const st = getCandidatureStatut(step);
        return (
          <div key={step} className="flex-1 flex flex-col items-center min-w-0">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                done
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-text-secondary'
              } ${active ? 'ring-2 ring-primary/30' : ''}`}
            >
              {done ? <Check className="w-4 h-4" /> : idx + 1}
            </div>
            <p className="text-[10px] sm:text-xs text-text-secondary mt-1 text-center truncate w-full">
              {STEP_LABELS[step] || st.label}
            </p>
          </div>
        );
      })}
      {isRefused && (
        <div className="flex-1 flex flex-col items-center">
          <div className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-xs font-bold">
            ✕
          </div>
          <p className="text-[10px] sm:text-xs text-red-600 mt-1">Refusée</p>
        </div>
      )}
    </div>
  );
}
