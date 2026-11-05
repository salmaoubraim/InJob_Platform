import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FileUser, Loader2, Lock } from 'lucide-react';
import { postuler } from '../../services/candidatureService';
import { fetchMyCv } from '../../services/cvService';
import { getApiErrorMessage } from '../../utils/apiErrors';
import { canApplyToOffer, DOMAIN_MISMATCH_MESSAGE } from '../../utils/offerDomain';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { isDemoOfferId, normalizeOfferId } from '../../utils/offerIds';

/**
 * Postuler depuis l'espace candidat : CV obligatoire + domaine professionnel compatible.
 */
export default function ApplyOfferButton({ offreId, offreTitre, offer }) {
  const navigate = useNavigate();
  const toast = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [hasCv, setHasCv] = useState(null);
  const [feedback, setFeedback] = useState('');

  const domainAllowed = canApplyToOffer(user, offer || { id_categorie: null, categorie: null });

  useEffect(() => {
    fetchMyCv()
      .then((list) => setHasCv(Array.isArray(list) && list.length > 0))
      .catch(() => setHasCv(false));
  }, []);

  const handleApply = async () => {
    setFeedback('');
    if (!domainAllowed) {
      setFeedback(DOMAIN_MISMATCH_MESSAGE);
      return;
    }
    if (hasCv === false) {
      setFeedback('Téléversez votre CV avant de postuler.');
      return;
    }
    setLoading(true);
    try {
      const isDemo = isDemoOfferId(offreId);
      const numericId = normalizeOfferId(offreId);

      if (!isDemo) {
        if (!numericId) {
          setFeedback('Offre invalide. Rechargez la page depuis la liste des offres.');
          return;
        }
        await postuler(numericId);
      }
      toast.success(
        isDemo
          ? `Candidature démo enregistrée pour « ${offreTitre} ». Consultez Mes candidatures.`
          : `Candidature envoyée pour « ${offreTitre} ». Le recruteur recevra votre CV.`
      );
      setTimeout(() => navigate('/candidat/candidatures'), 1200);
    } catch (err) {
      const msg = getApiErrorMessage(err);
      setFeedback(msg);
      if (msg.toLowerCase().includes('cv')) {
        setHasCv(false);
      }
    } finally {
      setLoading(false);
    }
  };

  if (hasCv === null) {
    return (
      <div className="flex justify-center py-2">
        <Loader2 className="w-5 h-5 animate-spin text-primary" />
      </div>
    );
  }

  if (!hasCv) {
    return (
      <div className="space-y-2">
        <p className="text-xs text-amber-800 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2 text-center">
          CV requis pour postuler (cahier des charges).
        </p>
        <Link
          to="/candidat/cv"
          className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-semibold bg-primary-soft text-primary hover:bg-primary-pale transition-colors"
        >
          <FileUser className="w-4 h-4" />
          Téléverser mon CV
        </Link>
      </div>
    );
  }

  if (!domainAllowed) {
    return (
      <div className="space-y-2" title={DOMAIN_MISMATCH_MESSAGE}>
        <button
          type="button"
          disabled
          className="w-full py-2.5 rounded-xl text-sm font-semibold bg-gray-200 text-gray-500 cursor-not-allowed flex items-center justify-center gap-2"
        >
          <Lock className="w-4 h-4" />
          Postuler indisponible
        </button>
        <p className="text-xs text-center text-text-secondary bg-gray-50 border border-gray-100 rounded-lg px-3 py-2">
          {DOMAIN_MISMATCH_MESSAGE}
        </p>
      </div>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleApply}
        disabled={loading}
        className="w-full py-2.5 rounded-xl text-sm font-semibold bg-primary text-white hover:bg-primary-dark transition-colors disabled:opacity-60"
      >
        {loading ? 'Envoi…' : 'Postuler avec mon CV'}
      </button>
      {feedback && (
        <p className="text-xs mt-2 text-center text-error">{feedback}</p>
      )}
    </div>
  );
}
