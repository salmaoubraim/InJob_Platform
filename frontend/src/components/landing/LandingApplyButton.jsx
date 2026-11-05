import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useAuthModal } from '../../context/AuthModalContext';
import { postuler } from '../../services/candidatureService';
import { getApiErrorMessage } from '../../utils/apiErrors';
import { useToast } from '../../context/ToastContext';
import { isDemoOfferId, normalizeOfferId } from '../../utils/offerIds';

export default function LandingApplyButton({ offreId, offreTitre }) {
  const { isAuthenticated, user } = useAuth();
  const { openLogin } = useAuthModal();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState('');
  const toast = useToast();

  const handleClick = async () => {
    setFeedback('');
    if (!isAuthenticated) {
      openLogin();
      return;
    }
    if (user?.role !== 'candidat') {
      setFeedback('Seuls les candidats peuvent postuler.');
      return;
    }
    setLoading(true);
    try {
      if (isDemoOfferId(offreId)) {
        setFeedback('Candidature démo enregistrée !');
        toast.success(`Candidature démo pour « ${offreTitre} ». Consultez Mes candidatures.`);
        setTimeout(() => navigate('/candidat/candidatures'), 1500);
        return;
      }

      const numericId = normalizeOfferId(offreId);
      if (!numericId) {
        setFeedback('Offre invalide. Ouvrez l\'offre depuis la liste.');
        return;
      }

      await postuler(numericId);
      setFeedback('Candidature envoyée !');
      toast.success('Candidature envoyée — le recruteur est notifié.');
      setTimeout(() => navigate('/candidat/candidatures'), 1500);
    } catch (err) {
      setFeedback(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        className="w-full py-2.5 rounded-xl text-sm font-semibold bg-primary text-white hover:bg-primary-dark transition-colors disabled:opacity-60"
      >
        {loading ? 'Envoi…' : 'Postuler'}
      </button>
      {feedback && (
        <p className="text-xs mt-2 text-center text-text-secondary">{feedback}</p>
      )}
    </div>
  );
}
