import { useEffect, useRef, useState } from 'react';
import { Plus, ImagePlus, X } from 'lucide-react';
import AuthField from '../auth/AuthField';
import SubmitButton from '../auth/SubmitButton';
import {
  createOffre,
  fetchCategories,
  fetchMetiers,
  updateOffre,
} from '../../services/offreService';
import { getApiErrorMessage } from '../../utils/apiErrors';
import { useAuth } from '../../context/AuthContext';
import {
  getRecruteurDomainFromUser,
} from '../../utils/recruteurDomain';

const INPUT = 'bg-white border border-gray-200 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20';

function resolveMetierPayload(metierText, metiers) {
  const trimmed = metierText.trim();
  if (!trimmed) return {};

  const matched = metiers.find(
    (m) => m.nom_metier.toLowerCase() === trimmed.toLowerCase()
  );

  return matched ? { id_metier: matched.id_metier } : { nom_metier: trimmed };
}

function parseSalaireForForm(job) {
  if (job?.salaire_brut != null) {
    return String(job.salaire_brut);
  }
  if (!job?.salaire || job.salaire === 'À discuter') {
    return '';
  }
  const digits = String(job.salaire).replace(/\D/g, '');
  return digits || '';
}

export default function RecruteurPublishOffer({ editingOffer = null, onCancelEdit, onPublished }) {
  const { user, refreshUser } = useAuth();
  const imageInputRef = useRef(null);
  const [categories, setCategories] = useState([]);
  const [metiers, setMetiers] = useState([]);
  const [domain, setDomain] = useState({ id: null, label: null });
  const [domainLoading, setDomainLoading] = useState(true);
  const [form, setForm] = useState({
    titre: '',
    description: '',
    id_categorie: '',
    metier: '',
    ville: '',
    salaire: '',
    nombre_postes: '1',
    date_expiration: '',
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    let cancelled = false;

    const loadDomain = async () => {
      setDomainLoading(true);
      try {
        const cats = await fetchCategories();

        if (cancelled) return;

        setCategories(cats);

        const resolved = getRecruteurDomainFromUser(user);
        setDomain({
          id: resolved.id,
          label: resolved.label || null,
        });

        if (!editingOffer && resolved.id) {
          setForm((prev) => ({ ...prev, id_categorie: resolved.id }));
        }
      } catch {
        if (!cancelled) {
          setDomain({ id: null, label: null });
          setCategories([]);
        }
      } finally {
        if (!cancelled) {
          setDomainLoading(false);
        }
      }
    };

    loadDomain();

    return () => {
      cancelled = true;
    };
  }, [user, editingOffer]);

  useEffect(() => {
    if (!form.id_categorie) {
      setMetiers([]);
      return;
    }

    fetchMetiers(form.id_categorie)
      .then(setMetiers)
      .catch(() => setMetiers([]));
  }, [form.id_categorie]);

  useEffect(() => {
    if (!editingOffer) {
      return;
    }

    setForm({
      titre: editingOffer.titre || '',
      description: editingOffer.description || '',
      id_categorie: editingOffer.id_categorie ? String(editingOffer.id_categorie) : '',
      metier: editingOffer.metier || '',
      ville: editingOffer.ville || '',
      salaire: parseSalaireForForm(editingOffer),
      nombre_postes: String(editingOffer.nombre_postes ?? 1),
      date_expiration: editingOffer.date_limite || '',
    });
    setImageFile(null);
    setImagePreview(editingOffer.image || '');
    setError('');
    setSuccess('');
    if (imageInputRef.current) {
      imageInputRef.current.value = '';
    }
  }, [editingOffer]);

  const resetCreateForm = () => {
    setForm({
      titre: '',
      description: '',
      id_categorie: domain.id || '',
      metier: '',
      ville: '',
      salaire: '',
      nombre_postes: '1',
      date_expiration: '',
    });
    clearImage();
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Veuillez choisir une image (JPG, PNG ou WebP).');
      e.target.value = '';
      return;
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setError('');
  };

  const clearImage = () => {
    setImageFile(null);
    setImagePreview('');
    if (imageInputRef.current) {
      imageInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!form.titre.trim() || !form.description.trim()) {
      setError('Titre et description sont obligatoires.');
      return;
    }

    if (!form.id_categorie) {
      setError('Veuillez choisir une catégorie.');
      return;
    }

    const payload = {
      titre: form.titre.trim(),
      description: form.description.trim(),
      id_categorie: Number(form.id_categorie),
      ...resolveMetierPayload(form.metier, metiers),
      ville: form.ville.trim() || undefined,
      type_contrat: 'CDI',
      salaire: form.salaire ? Number(form.salaire) : undefined,
      nombre_postes: Number(form.nombre_postes) || 1,
      date_expiration: form.date_expiration || undefined,
    };

    setLoading(true);
    try {
      const data = editingOffer
        ? await updateOffre(editingOffer.id_offre, payload, imageFile)
        : await createOffre(payload, imageFile);

      setSuccess(data.message);
      if (editingOffer) {
        onCancelEdit?.();
      } else {
        resetCreateForm();
      }
      onPublished?.();
      refreshUser().catch(() => {});
    } catch (err) {
      setError(getApiErrorMessage(err, 'Publication impossible.'));
    } finally {
      setLoading(false);
    }
  };

  const metierListId = 'metiers-publish-list';

  const isEditing = Boolean(editingOffer);

  return (
    <section id="recruteur-offer-form" className="bg-white rounded-2xl p-6 sm:p-8 auth-card">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-10 h-10 rounded-xl bg-primary-soft flex items-center justify-center">
          <Plus className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-lg font-bold text-text-dark">
            {isEditing ? 'Modifier l\'offre' : 'Publier une offre'}
          </h2>
          <p className="text-sm text-text-secondary">
            {isEditing
              ? 'Modifiez les informations ci-dessous puis enregistrez.'
              : 'Votre offre sera visible par les candidats après publication.'}
          </p>
        </div>
        {isEditing && (
          <button
            type="button"
            onClick={() => {
              resetCreateForm();
              onCancelEdit?.();
            }}
            className="shrink-0 px-3 py-2 rounded-xl border border-gray-200 text-sm text-text-secondary hover:bg-bg-page"
          >
            Annuler
          </button>
        )}
      </div>

      {success && (
        <div className="mb-4 p-3 rounded-xl bg-[#ECFDF5] text-success text-sm border border-accent/30">
          {success}
        </div>
      )}
      {error && (
        <div className="mb-4 p-3 rounded-xl bg-red-50 text-error text-sm">{error}</div>
      )}

      {domainLoading ? (
        <p className="text-sm text-text-secondary py-4">Chargement du formulaire…</p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <AuthField
            label="Titre du poste"
            name="titre"
            value={form.titre}
            onChange={(e) => setForm({ ...form, titre: e.target.value })}
            placeholder={
              domain.label?.includes('Santé')
                ? 'Ex : Infirmier(ère) polyvalent(e)'
                : 'Ex : Développeur Full Stack'
            }
            inputClassName={INPUT}
          />

          <AuthField
            label="Catégorie"
            type="select"
            name="id_categorie"
            value={form.id_categorie}
            onChange={(e) =>
              setForm({ ...form, id_categorie: e.target.value, metier: '' })
            }
            inputClassName={INPUT}
          >
            <option value="">Choisir une catégorie</option>
            {categories.map((c) => (
              <option key={c.id_categorie} value={c.id_categorie}>
                {c.nom_categorie}
              </option>
            ))}
          </AuthField>

          <div>
            <label htmlFor="metier" className="block text-sm font-medium text-text-dark mb-1.5">
              Métier
            </label>
            <input
              id="metier"
              name="metier"
              list={metierListId}
              value={form.metier}
              onChange={(e) => setForm({ ...form, metier: e.target.value })}
              disabled={!form.id_categorie}
              placeholder={
                form.id_categorie
                  ? 'Ex : Développeur Frontend'
                  : 'Chargement des métiers…'
              }
              className={`w-full px-4 py-3 rounded-xl outline-none text-text-dark disabled:bg-gray-50 disabled:text-text-secondary ${INPUT}`}
            />
            <datalist id={metierListId}>
              {metiers.map((m) => (
                <option key={m.id_metier} value={m.nom_metier} />
              ))}
            </datalist>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-dark mb-1.5">Description</label>
            <textarea
              rows={4}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Missions, profil recherché, avantages..."
              className={`w-full px-4 py-3 rounded-xl outline-none resize-y min-h-[100px] text-text-dark ${INPUT}`}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-dark mb-1.5">
              Image de l&apos;offre
            </label>
            <div className="flex flex-col sm:flex-row gap-4 items-start">
              <div className="relative w-full sm:w-40 h-28 rounded-xl border border-gray-200 bg-gray-50 overflow-hidden shrink-0">
                {imagePreview ? (
                  <>
                    <img src={imagePreview} alt="Aperçu" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={clearImage}
                      className="absolute top-1.5 right-1.5 p-1 rounded-lg bg-white/90 text-text-secondary hover:text-error shadow-sm"
                      aria-label="Retirer l'image"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-text-secondary gap-1">
                    <ImagePlus className="w-6 h-6" />
                    <span className="text-xs">Aucune image</span>
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp,image/jfif"
                  onChange={handleImageChange}
                  className="block w-full text-sm text-text-secondary file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-medium file:bg-primary-soft file:text-primary hover:file:bg-primary/10"
                />
                <p className="text-xs text-text-secondary mt-1.5">
                  JPG, PNG ou WebP — 2 Mo max. Optionnel.
                </p>
              </div>
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            <AuthField
              label="Ville"
              name="ville"
              value={form.ville}
              onChange={(e) => setForm({ ...form, ville: e.target.value })}
              placeholder="Casablanca"
              inputClassName={INPUT}
            />
            <AuthField
              label="Salaire (MAD)"
              name="salaire"
              type="number"
              value={form.salaire}
              onChange={(e) => setForm({ ...form, salaire: e.target.value })}
              placeholder="Optionnel"
              inputClassName={INPUT}
            />
            <AuthField
              label="Nombre de postes"
              name="nombre_postes"
              type="number"
              min={1}
              value={form.nombre_postes}
              onChange={(e) => setForm({ ...form, nombre_postes: e.target.value })}
              inputClassName={INPUT}
            />
          </div>

          <AuthField
            label="Date limite (optionnel)"
            type="date"
            name="date_expiration"
            value={form.date_expiration}
            onChange={(e) => setForm({ ...form, date_expiration: e.target.value })}
            inputClassName={INPUT}
          />

          <div className="flex justify-start">
            <SubmitButton
              loading={loading}
              className="!w-auto !h-10 !text-sm px-5"
            >
              {isEditing ? 'Enregistrer' : 'Publier l\'offre'}
            </SubmitButton>
          </div>
        </form>
      )}
    </section>
  );
}
