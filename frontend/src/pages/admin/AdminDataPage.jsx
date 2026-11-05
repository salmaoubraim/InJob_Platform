import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import AdminPageShell from '../../components/admin/AdminPageShell';
import StatusBadge from '../../components/ui/StatusBadge';
import { getCandidatureStatut } from '../../utils/candidatureStatus';
import {
  fetchAdminUsers,
  fetchAdminOffres,
  fetchAdminCategories,
  fetchAdminCandidatures,
} from '../../services/adminService';
import { DEMO_ADMIN_STATS } from '../../constants/demoCatalog';

const CONFIG = {
  utilisateurs: {
    title: 'Gestion des utilisateurs',
    subtitle: 'Candidats, recruteurs et administrateurs inscrits sur InJob.',
    load: fetchAdminUsers,
    columns: ['Nom', 'Email', 'Rôle', 'Ville / Entreprise'],
    row: (u) => [
      `${u.prenom} ${u.nom}`,
      u.email,
      u.role,
      u.entreprise || u.ville || '—',
    ],
  },
  offres: {
    title: 'Gestion des offres',
    subtitle: 'Toutes les offres publiées et brouillons des recruteurs.',
    load: fetchAdminOffres,
    columns: ['Titre', 'Entreprise', 'Ville', 'Catégorie', 'Statut', 'Candidatures'],
    row: (o) => [
      o.titre,
      o.entreprise,
      o.ville,
      o.categorie,
      o.est_publie ? 'Publiée' : 'Brouillon',
      String(o.nb_candidatures),
    ],
  },
  categories: {
    title: 'Catégories & métiers',
    subtitle: 'Secteurs d\'activité liés aux offres.',
    load: fetchAdminCategories,
    columns: ['Catégorie', 'Description', 'Nb offres'],
    row: (c) => [c.nom_categorie, c.description || '—', String(c.nb_offres)],
  },
};

export default function AdminDataPage({ section }) {
  if (section === 'candidatures') {
    return <AdminCandidaturesTable />;
  }

  const config = CONFIG[section];
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!config) {
      setLoading(false);
      return;
    }
    setLoading(true);
    config
      .load()
      .then((data) => setRows(Array.isArray(data) ? data : []))
      .catch(() => setRows([]))
      .finally(() => setLoading(false));
  }, [section]);

  if (!config) return null;

  return (
    <AdminPageShell title={config.title} subtitle={config.subtitle}>
      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : rows.length === 0 ? (
        <div className="bg-white rounded-2xl p-10 text-center auth-card text-text-secondary">
          Aucune donnée.
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 auth-card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-bg-page/50">
                {config.columns.map((col) => (
                  <th key={col} className="text-left px-4 py-3 font-semibold text-text-dark">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={i} className="border-b border-gray-50 hover:bg-bg-page/30 transition-colors">
                  {config.row(row).map((cell, j) => (
                    <td key={j} className="px-4 py-3 text-text-secondary">
                      {section === 'offres' && config.columns[j] === 'Statut' ? (
                        <StatusBadge
                          label={row.est_publie ? 'Publiée' : 'Brouillon'}
                          variant={row.est_publie ? 'success' : 'warning'}
                        />
                      ) : section === 'utilisateurs' && config.columns[j] === 'Rôle' ? (
                        <StatusBadge label={row.role} variant="primary" />
                      ) : (
                        cell
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminPageShell>
  );
}

function demoCandidaturesRows() {
  return DEMO_ADMIN_STATS.candidatures_recentes_table.map((row, index) => ({
    id_candidature: `demo-${index}`,
    candidat: row.candidat,
    offre: row.offre,
    entreprise: row.recruteur,
    statut: row.statut,
    date_label: row.date,
  }));
}

function AdminCandidaturesTable() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminCandidatures()
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setRows(data);
        } else {
          setRows(demoCandidaturesRows());
        }
      })
      .catch(() => setRows(demoCandidaturesRows()))
      .finally(() => setLoading(false));
  }, []);

  return (
    <AdminPageShell
      title="Candidatures"
      subtitle="Dernières candidatures sur la plateforme."
    >
      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : rows.length === 0 ? (
        <div className="bg-white rounded-2xl p-10 text-center auth-card text-text-secondary">
          Aucune candidature pour le moment.
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 auth-card overflow-x-auto">
          <table className="w-full text-sm min-w-[640px]">
            <thead>
              <tr className="border-b border-gray-100 bg-bg-page/50">
                <th className="text-left px-4 py-3">Candidat</th>
                <th className="text-left px-4 py-3">Offre</th>
                <th className="text-left px-4 py-3">Entreprise</th>
                <th className="text-left px-4 py-3">Statut</th>
                <th className="text-left px-4 py-3">Date</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id_candidature} className="border-b border-gray-50 hover:bg-bg-page/30">
                  <td className="px-4 py-3 font-medium text-text-dark">{r.candidat}</td>
                  <td className="px-4 py-3">{r.offre}</td>
                  <td className="px-4 py-3">{r.entreprise}</td>
                  <td className="px-4 py-3">
                    {(() => {
                      const st = getCandidatureStatut(r.statut);
                      return <StatusBadge label={st.label} variant={st.variant} />;
                    })()}
                  </td>
                  <td className="px-4 py-3 text-text-secondary">{r.date_label}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminPageShell>
  );
}
