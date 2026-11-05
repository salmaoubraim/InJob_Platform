import { useNavigate } from 'react-router-dom';
import {
  Banknote,
  Briefcase,
  Calendar,
  MapPin,
  MessageCircle,
  User,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useAuthModal } from '../../context/AuthModalContext';
import ApplyOfferButton from './ApplyOfferButton';

const FALLBACK_IMG =
  'https://images.unsplash.com/photo-1497215728101-856f4fa09074?w=800&q=80';

export default function OffreDetailView({ offer, showApply = false }) {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { openLogin } = useAuthModal();

  const contactName = offer.recruteur_contact || offer.recruteur_prenom || null;
  const entrepriseNom = offer.entreprise || offer.recruteur_nom;
  const isExpired =
    offer.date_limite &&
    new Date(offer.date_limite) < new Date(new Date().toDateString());

  const handleContact = () => {
    if (isAuthenticated && user?.role === 'candidat') {
      navigate('/candidat/messagerie');
      return;
    }
    if (isAuthenticated && user?.role === 'recruteur') {
      navigate('/recruteur/messagerie');
      return;
    }
    openLogin();
  };

  return (
    <div className="max-w-3xl mx-auto">
      <article className="bg-white rounded-2xl overflow-hidden auth-card">
        <div className="aspect-[21/9] sm:aspect-[2/1] overflow-hidden bg-gray-100">
          <img
            src={offer.image || FALLBACK_IMG}
            alt={offer.titre}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="p-6 sm:p-8 space-y-6">
          <div>
            {offer.categorie && (
              <p className="text-sm font-semibold text-primary">{offer.categorie}</p>
            )}
            {offer.metier && (
              <span className="inline-flex mt-2 text-xs font-medium text-text-dark bg-gray-100 px-3 py-1 rounded-full">
                {offer.metier}
              </span>
            )}
            <h1 className="text-2xl sm:text-3xl font-bold text-text-dark mt-1">
              {offer.titre}
            </h1>
            {offer.type_contrat && (
              <span className="inline-flex mt-3 text-xs font-semibold text-primary bg-primary-soft px-3 py-1 rounded-full">
                {offer.type_contrat}
              </span>
            )}
          </div>

          <div className="grid sm:grid-cols-2 gap-4 text-sm">
            {offer.ville && (
              <p className="flex items-center gap-2 text-text-secondary">
                <MapPin className="w-4 h-4 shrink-0 text-primary" />
                {offer.ville}
              </p>
            )}
            {offer.salaire && (
              <p className="flex items-center gap-2 text-text-secondary">
                <Banknote className="w-4 h-4 shrink-0 text-primary" />
                {offer.salaire}
              </p>
            )}
            {offer.nombre_postes != null && (
              <p className="flex items-center gap-2 text-text-secondary">
                <Briefcase className="w-4 h-4 shrink-0 text-primary" />
                {offer.nombre_postes} poste{offer.nombre_postes > 1 ? 's' : ''}
              </p>
            )}
            {offer.date_limite_label && (
              <p
                className={`flex items-center gap-2 ${
                  isExpired ? 'text-error font-medium' : 'text-text-secondary'
                }`}
              >
                <Calendar className="w-4 h-4 shrink-0 text-primary" />
                Date limite : {offer.date_limite_label}
                {isExpired ? ' (expirée)' : ''}
              </p>
            )}
          </div>

          <div>
            <h2 className="text-lg font-semibold text-text-dark">Description du poste</h2>
            <p className="mt-3 text-text-secondary leading-relaxed">{offer.description}</p>
          </div>

          <div className="rounded-xl bg-bg-page border border-gray-100 p-5 space-y-3">
            <h2 className="text-lg font-semibold text-text-dark">Recruteur</h2>
            {entrepriseNom && (
              <p className="flex items-start gap-2 text-text-secondary">
                <Briefcase className="w-4 h-4 shrink-0 mt-0.5 text-primary" />
                <span>
                  Entreprise :{' '}
                  <strong className="text-text-dark">{entrepriseNom}</strong>
                </span>
              </p>
            )}
            <p className="flex items-start gap-2 text-text-secondary">
              <User className="w-4 h-4 shrink-0 mt-0.5 text-primary" />
              <span>
                Recruteur :{' '}
                <strong className="text-text-dark">
                  {contactName || 'Non renseigné'}
                </strong>
              </span>
            </p>
            {offer.date_publication_label && (
              <p className="text-sm text-text-secondary">
                Annonce publiée le {offer.date_publication_label}
              </p>
            )}
            {contactName && (
              <button
                type="button"
                onClick={handleContact}
                className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-2.5 rounded-xl text-sm font-semibold bg-primary text-white hover:bg-primary-dark transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                Contacter {contactName.split(' ')[0]}
              </button>
            )}
          </div>

          {showApply && (
            <ApplyOfferButton
              offreId={offer.id_offre}
              offreTitre={offer.titre}
              offer={offer}
            />
          )}
        </div>
      </article>
    </div>
  );
}
