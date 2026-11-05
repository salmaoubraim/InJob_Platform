import { useCallback, useEffect, useState } from 'react';
import { Filter } from 'lucide-react';
import PageShell from '../../components/ui/PageShell';
import Card from '../../components/ui/Card';
import JobOffersList from '../../components/offres/JobOffersList';
import OfferDetailButton from '../../components/offres/OfferDetailButton';
import { CANDIDAT_OFFERS_GRID_CLASS } from '../../constants/offersGrid';
import CvUploadBanner from '../../components/candidat/CvUploadBanner';
import {
  CANDIDAT_OFFERS_LIMIT,
  fetchCandidatOffres,
  fetchCategories,
  fetchMetiers,
} from '../../services/offreService';
import { DEMO_CANDIDAT_OFFERS, filterDemoOffers } from '../../constants/demoCatalog';
import { MOROCCO_CITIES_GEO } from '../../utils/moroccoCitiesGeo';

const CONTRATS = ['CDI', 'CDD', 'Stage', 'Freelance', 'Intérim', 'Alternance'];

export default function CandidatOffresPage() {
  const [categories, setCategories] = useState([]);
  const [metiers, setMetiers] = useState([]);
  const [idCategorie, setIdCategorie] = useState('');
  const [idMetier, setIdMetier] = useState('');
  const [ville, setVille] = useState('');
  const [typeContrat, setTypeContrat] = useState('');
  const [filterKey, setFilterKey] = useState(0);
  const [useApi, setUseApi] = useState(true);

  useEffect(() => {
    fetchCategories()
      .then(setCategories)
      .catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    if (!idCategorie) {
      setMetiers([]);
      setIdMetier('');
      return;
    }

    fetchMetiers(idCategorie)
      .then(setMetiers)
      .catch(() => setMetiers([]));
  }, [idCategorie]);

  const loadOffres = useCallback(
    async (q) => {
      const filters = {
        ville: ville || undefined,
        type_contrat: typeContrat || undefined,
        id_categorie: idCategorie || undefined,
        id_metier: idMetier || undefined,
      };

      if (useApi) {
        try {
          const data = await fetchCandidatOffres(q, filters);
          if (Array.isArray(data) && data.length > 0) {
            return data;
          }
        } catch {
          setUseApi(false);
        }
      }

      return filterDemoOffers(DEMO_CANDIDAT_OFFERS, {
        q,
        ville: ville || undefined,
        typeContrat: typeContrat || undefined,
        categorie: categories.find((c) => String(c.id_categorie) === String(idCategorie))
          ?.nom_categorie,
        metier: metiers.find((m) => String(m.id_metier) === String(idMetier))?.nom_metier,
      }).slice(0, CANDIDAT_OFFERS_LIMIT);
    },
    [ville, typeContrat, idCategorie, idMetier, filterKey, useApi, categories, metiers]
  );

  return (
    <PageShell
      title="Offres d'emploi"
      subtitle="Consultez toutes les offres, filtrez par domaine ou métier et postulez dans votre spécialité."
    >
      <CvUploadBanner />

      <Card className="border border-gray-100 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-9 h-9 rounded-xl bg-primary-soft flex items-center justify-center">
            <Filter className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-text-dark">Filtres</h2>
            <p className="text-xs text-text-secondary">Affinez votre recherche d&apos;emploi</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div>
            <label className="text-xs font-medium text-text-secondary">Catégorie</label>
            <select
              value={idCategorie}
              onChange={(e) => {
                setIdCategorie(e.target.value);
                setIdMetier('');
              }}
              className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm bg-white focus:border-primary focus:ring-2 focus:ring-primary/20"
            >
              <option value="">Toutes les catégories</option>
              {categories.map((c) => (
                <option key={c.id_categorie} value={c.id_categorie}>
                  {c.nom_categorie}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-medium text-text-secondary">Métier</label>
            <select
              value={idMetier}
              onChange={(e) => setIdMetier(e.target.value)}
              disabled={!idCategorie}
              className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:bg-gray-50 disabled:text-gray-400"
            >
              <option value="">Tous les métiers</option>
              {metiers.map((m) => (
                <option key={m.id_metier} value={m.id_metier}>
                  {m.nom_metier}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-medium text-text-secondary">Ville</label>
            <select
              value={ville}
              onChange={(e) => setVille(e.target.value)}
              className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm bg-white focus:border-primary focus:ring-2 focus:ring-primary/20"
            >
              <option value="">Toutes les villes</option>
              {MOROCCO_CITIES_GEO.map((c) => (
                <option key={c.name} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-medium text-text-secondary">Type de contrat</label>
            <select
              value={typeContrat}
              onChange={(e) => setTypeContrat(e.target.value)}
              className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm bg-white focus:border-primary focus:ring-2 focus:ring-primary/20"
            >
              <option value="">Tous les contrats</option>
              {CONTRATS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => setFilterKey((k) => k + 1)}
            className="px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-dark transition-colors"
          >
            Appliquer les filtres
          </button>
          <button
            type="button"
            onClick={() => {
              setIdCategorie('');
              setIdMetier('');
              setVille('');
              setTypeContrat('');
              setFilterKey((k) => k + 1);
            }}
            className="px-4 py-2.5 rounded-xl text-sm font-medium text-text-secondary border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            Réinitialiser
          </button>
        </div>
      </Card>

      <JobOffersList
        key={filterKey}
        fetchFn={loadOffres}
        maxItems={CANDIDAT_OFFERS_LIMIT}
        countLabel
        cardVariant="landing"
        useDemoCatalog={!useApi}
        gridClassName={CANDIDAT_OFFERS_GRID_CLASS}
        title=""
        emptyHint="Aucune offre ne correspond à vos filtres."
        renderAction={(job) => (
          <OfferDetailButton job={job} basePath="/candidat/offres" />
        )}
      />
    </PageShell>
  );
}
