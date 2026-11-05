import AdminPageShell from '../../components/admin/AdminPageShell';

const SECTIONS = {
  utilisateurs: {
    title: 'Gestion des utilisateurs',
    subtitle:
      'Consultez et gérez les comptes candidats, recruteurs et administrateurs de la plateforme InJob.',
    items: ['Liste des candidats', 'Liste des recruteurs', 'Validation des comptes', 'Suspension / activation'],
  },
  offres: {
    title: 'Gestion des offres',
    subtitle:
      'Supervisez toutes les offres publiées, modérez le contenu et assurez la conformité aux catégories métiers.',
    items: ['Offres actives', 'Offres expirées', 'Modération', 'Statistiques par métier'],
  },
  categories: {
    title: 'Catégories & métiers',
    subtitle:
      'Organisez les secteurs d\'activité : peinture, coiffure, ménage, commerce, santé, juridique, informatique, etc.',
    items: ['Créer une catégorie', 'Associer aux offres', 'Descriptions métiers'],
  },
  messagerie: {
    title: 'Messages',
    subtitle: 'Supervision des échanges entre candidats et recruteurs (modération et signalements).',
    items: ['Conversations récentes', 'Messages signalés', 'Archives'],
  },
  avis: {
    title: 'Avis & commentaires',
    subtitle: 'Modération des avis laissés sur la plateforme et sur les entreprises recruteuses.',
    items: ['Avis en attente', 'Notes moyennes', 'Commentaires signalés'],
  },
  notifications: {
    title: 'Notifications',
    subtitle: 'Alertes système, nouvelles inscriptions, offres et candidatures.',
    items: ['Alertes plateforme', 'Historique', 'Paramètres d\'envoi'],
  },
  statistiques: {
    title: 'Statistiques',
    subtitle: 'Indicateurs clés : utilisateurs, offres, candidatures et activité par ville.',
    items: ['Tableau de bord analytique', 'Export des données', 'Tendances mensuelles'],
  },
  parametres: {
    title: 'Paramètres',
    subtitle: 'Configuration générale de la plateforme InJob (logo, emails, règles).',
    items: ['Informations légales', 'Emails automatiques', 'Maintenance'],
  },
};

export default function AdminSectionPage({ section }) {
  const config = SECTIONS[section] || {
    title: 'Section',
    subtitle: '',
    items: [],
  };

  return (
    <AdminPageShell title={config.title} subtitle={config.subtitle}>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {config.items.map((item) => (
          <div
            key={item}
            className="bg-white rounded-2xl p-6 border border-gray-100 auth-card hover:shadow-md transition-shadow"
          >
            <h3 className="font-semibold text-text-dark">{item}</h3>
            <p className="text-sm text-text-secondary mt-2">
              Module prévu au cahier des charges — connexion API à venir.
            </p>
          </div>
        ))}
      </div>
    </AdminPageShell>
  );
}
