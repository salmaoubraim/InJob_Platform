/**
 * Catalogue et données démo fixes (accueil, candidat, admin, messagerie).
 * Les 4 cartes accueil ne changent jamais.
 */

export const DEMO_LANDING_OFFERS = [
  {
    id_offre: 'catalog-infirmier',
    titre: 'Infirmier(ère)',
    description:
      'Soins infirmiers en clinique, surveillance des patients et collaboration avec l\'équipe médicale.',
    image: 'https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?w=400',
    recruteur_nom: 'Clinique Al Amal',
    recruteur_contact: 'Sara Bennani',
    entreprise: 'Clinique Al Amal',
    ville: 'Casablanca',
    salaire: '5 000 – 7 000 MAD',
    type_contrat: 'CDI',
    nombre_postes: 2,
    date_publication: '2026-06-01',
    date_publication_label: '01 juin 2026',
    date_limite: '2026-07-15',
    date_limite_label: '15 juillet 2026',
    categorie: 'Santé',
    metier: 'Infirmier Polyvalent',
    urgence: 'Prioritaire',
  },
  {
    id_offre: 'catalog-avocat',
    titre: 'Avocat(e)',
    description:
      'Conseil juridique, rédaction d\'actes et représentation des clients devant les tribunaux.',
    image: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=400',
    recruteur_nom: 'Cabinet Juridique Benali',
    recruteur_contact: 'Karim Benali',
    entreprise: 'Cabinet Juridique Benali',
    ville: 'Rabat',
    salaire: '8 000 – 12 000 MAD',
    type_contrat: 'CDI',
    nombre_postes: 1,
    date_publication: '2026-06-01',
    date_publication_label: '01 juin 2026',
    date_limite: '2026-07-20',
    date_limite_label: '20 juillet 2026',
    categorie: 'Juridique',
    metier: 'Assistant(e) avocat',
  },
  {
    id_offre: 'catalog-dev',
    titre: 'Développeur Full Stack',
    description: 'React, Laravel, API REST. Équipe agile, télétravail partiel possible.',
    image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400',
    recruteur_nom: 'TechMaroc SARL',
    recruteur_contact: 'Leila Mansouri',
    entreprise: 'TechMaroc SARL',
    ville: 'Agadir',
    salaire: '10 000 – 15 000 MAD',
    type_contrat: 'CDI',
    nombre_postes: 2,
    date_publication: '2026-05-28',
    date_publication_label: '28 mai 2026',
    date_limite: '2026-08-01',
    date_limite_label: '01 août 2026',
    categorie: 'Informatique & tech',
    metier: 'Développeur Full Stack',
    urgence: 'Urgent',
  },
  {
    id_offre: 'catalog-commercial',
    titre: 'Commercial Terrain',
    description:
      'Prospection clients, présentation des offres d\'assurance et suivi du portefeuille.',
    image: 'https://images.unsplash.com/photo-1556761175-4b46a572b786?w=400',
    recruteur_nom: 'Assurance Atlas',
    recruteur_contact: 'Yassine Ouardi',
    entreprise: 'Assurance Atlas',
    ville: 'Marrakech',
    salaire: '4 000 MAD + commission',
    type_contrat: 'CDD',
    nombre_postes: 3,
    date_publication: '2026-05-25',
    date_publication_label: '25 mai 2026',
    date_limite: '2026-06-30',
    date_limite_label: '30 juin 2026',
    categorie: 'Commerce & vente',
    metier: 'Commercial Terrain',
  },
];

const PEINTRE_IMAGE =
  'https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=600&h=400&fit=crop';

export const DEMO_CANDIDAT_OFFERS = [
  ...DEMO_LANDING_OFFERS,
  {
    id_offre: 'candidat-peintre',
    titre: 'Peintre en bâtiment',
    description:
      'Application peinture intérieure/extérieure, préparation des supports, finitions. Expérience chantier exigée.',
    image: PEINTRE_IMAGE,
    recruteur_nom: 'Déco Maroc SARL',
    recruteur_contact: 'Karim Benali',
    entreprise: 'Déco Maroc SARL',
    ville: 'Casablanca',
    salaire: '6 500 MAD',
    type_contrat: 'CDI',
    nombre_postes: 3,
    date_publication: '2026-06-01',
    date_publication_label: '01 juin 2026',
    date_limite: '2026-08-04',
    date_limite_label: '04 août 2026',
    categorie: 'Peinture & décoration',
    metier: 'Peintre en bâtiment',
  },
  {
    id_offre: 'candidat-comptable',
    titre: 'Comptable',
    description: 'Tenue de comptabilité, déclarations fiscales et reporting mensuel.',
    image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400',
    recruteur_nom: 'Fiduciaire Reda',
    recruteur_contact: 'Reda El Fassi',
    entreprise: 'Fiduciaire Reda',
    ville: 'Fès',
    salaire: '6 000 – 9 000 MAD',
    type_contrat: 'CDI',
    nombre_postes: 1,
    date_publication: '2026-05-20',
    date_publication_label: '20 mai 2026',
    date_limite: '2026-07-10',
    date_limite_label: '10 juillet 2026',
    categorie: 'Finance',
    metier: 'Comptable',
  },
  {
    id_offre: 'candidat-medecin',
    titre: 'Médecin Généraliste',
    description: 'Consultations, diagnostics et suivi des patients en centre de santé.',
    image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400',
    recruteur_nom: 'Centre de Santé Oasis',
    recruteur_contact: 'Dr. Amine Tazi',
    entreprise: 'Centre de Santé Oasis',
    ville: 'Agadir',
    salaire: '15 000 – 20 000 MAD',
    type_contrat: 'CDI',
    nombre_postes: 2,
    date_publication: '2026-05-18',
    date_publication_label: '18 mai 2026',
    date_limite: '2026-08-15',
    date_limite_label: '15 août 2026',
    categorie: 'Santé',
    metier: 'Médecin Généraliste',
  },
];

/** Recruteurs éligibles + offres postulées (page Avis candidat — fallback démo). */
export const DEMO_CANDIDAT_AVIS_ELIGIBLES = [
  {
    id_recruteur: 'demo-deco-maroc',
    nom_entreprise: 'Déco Maroc SARL',
    recruteur_nom: 'Karim Benali',
    recruteur_prenom: 'Karim',
    nb_offres_postulees: 1,
    offres: [
      {
        id_offre: 'demo-offre-peintre',
        titre: 'Peintre en bâtiment',
        ville: 'Casablanca',
      },
    ],
  },
  {
    id_recruteur: 'demo-salon-elegance',
    nom_entreprise: 'Salon Élégance Rabat',
    recruteur_nom: 'Sanae Alaoui',
    recruteur_prenom: 'Sanae',
    nb_offres_postulees: 1,
    offres: [
      {
        id_offre: 'demo-offre-coiffeur',
        titre: 'Coiffeur / Coiffeuse',
        ville: 'Rabat',
      },
    ],
  },
  {
    id_recruteur: 'demo-tech-maroc',
    nom_entreprise: 'TechMaroc SARL',
    recruteur_nom: 'Leila Mansouri',
    recruteur_prenom: 'Leila',
    nb_offres_postulees: 1,
    offres: [
      {
        id_offre: 'catalog-dev',
        titre: 'Développeur Full Stack',
        ville: 'Agadir',
      },
    ],
  },
];

export const DEMO_CANDIDAT_MES_AVIS = [
  {
    id: 'demo-avis-1',
    note: 5,
    commentaire:
      'Processus de candidature clair et recruteur très réactif. Je recommande cette offre.',
    date_label: 'il y a 3 jours',
    offre_titre: 'Peintre en bâtiment',
    entreprise: 'Déco Maroc SARL',
    recruteur_nom: 'Karim Benali',
    recruteur_photo_url: null,
    is_demo: true,
  },
  {
    id: 'demo-avis-2',
    note: 4,
    commentaire:
      'Bonne communication du recruteur. Le déroulement du processus a été fluide et transparent.',
    date_label: 'il y a 5 jours',
    offre_titre: 'Coiffeur / Coiffeuse',
    entreprise: 'Salon Élégance Rabat',
    recruteur_nom: 'Sanae Alaoui',
    recruteur_photo_url: null,
    is_demo: true,
  },
];

export const DEMO_CANDIDAT_AVIS_RECUS = [
  {
    id: 'demo-eval-1',
    note: 5,
    commentaire:
      'Profil sérieux, bonne expérience chantier. Communication excellente pendant le processus.',
    date_label: 'il y a 2 jours',
    offre_titre: 'Peintre en bâtiment',
    entreprise: 'Déco Maroc SARL',
    recruteur_nom: 'Karim Benali',
    recruteur_photo_url: null,
    is_demo: true,
  },
  {
    id: 'demo-eval-2',
    note: 4,
    commentaire:
      'Candidat motivé, compétences techniques solides. Entretien constructif et professionnel.',
    date_label: 'il y a 4 jours',
    offre_titre: 'Coiffeur / Coiffeuse',
    entreprise: 'Salon Élégance Rabat',
    recruteur_nom: 'Sanae Alaoui',
    recruteur_photo_url: null,
    is_demo: true,
  },
];

export function demoOffresForRecruteurAvis(idRecruteur) {
  const match = DEMO_CANDIDAT_AVIS_ELIGIBLES.find(
    (r) => String(r.id_recruteur) === String(idRecruteur)
  );
  return match?.offres ?? [];
}

export function mergeCandidatAvisEligibles(apiList) {
  const api = Array.isArray(apiList) ? apiList : [];
  if (api.length > 0) {
    return api;
  }
  return DEMO_CANDIDAT_AVIS_ELIGIBLES.map(({ offres, ...r }) => r);
}

export function mergeCandidatMesAvis(apiList) {
  const api = Array.isArray(apiList) ? apiList : [];
  return api.length > 0 ? api : DEMO_CANDIDAT_MES_AVIS;
}

export function mergeCandidatAvisRecus(apiList) {
  const api = Array.isArray(apiList) ? apiList : [];
  return api.length > 0 ? api : DEMO_CANDIDAT_AVIS_RECUS;
}

export const DEMO_CANDIDAT_APPLICATIONS = [
  {
    id_candidature: 'demo-app-1',
    statut: 'en_attente',
    date_candidature: '2026-06-01',
    date_label: '01/06/2026',
    offre_titre: 'Développeur Full Stack',
    recruteur_nom: 'TechMaroc SARL',
    ville: 'Agadir',
    image: DEMO_LANDING_OFFERS[2].image,
  },
  {
    id_candidature: 'demo-app-2',
    statut: 'acceptee',
    date_candidature: '2026-05-28',
    date_label: '28/05/2026',
    offre_titre: 'Designer UI/UX',
    recruteur_nom: 'Studio Créatif Marrakech',
    ville: 'Marrakech',
    image: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400',
  },
];

export const DEMO_MESSAGING_CONVERSATION = {
  id_user: 9001,
  prenom: 'Clinique',
  nom: 'Al Amal',
  role: 'recruteur',
  photo_url: null,
  unread_count: 0,
  messages: [
    {
      id_message: 'dm-1',
      contenu:
        'Bonjour, nous avons bien reçu votre candidature pour le poste d\'infirmier. Pouvez-vous nous envoyer votre diplôme ?',
      date_label: '02/06/2026 09:15',
      is_mine: false,
      lu: true,
      expediteur_photo: null,
    },
    {
      id_message: 'dm-2',
      contenu:
        'Bonjour, merci pour votre retour. Je vous envoie mon diplôme dès aujourd\'hui.',
      date_label: '02/06/2026 14:30',
      is_mine: true,
      lu: true,
    },
    {
      id_message: 'dm-3',
      contenu:
        'Parfait, merci. Nous vous contacterons pour un entretien la semaine prochaine.',
      date_label: '03/06/2026 10:00',
      is_mine: false,
      lu: true,
      expediteur_photo: null,
    },
    {
      id_message: 'dm-4',
      contenu: 'Très bien, je reste disponible. Merci !',
      date_label: '03/06/2026 11:45',
      is_mine: true,
      lu: true,
    },
  ],
};

export const DEMO_MESSAGING_CONVERSATION_RECRUTEUR = {
  id_user: 2001,
  prenom: 'Omar',
  nom: 'Alami',
  role: 'candidat',
  photo_url: null,
  unread_count: 0,
  messages: [
    {
      id_message: 'dm-1',
      contenu:
        'Bonjour, nous avons bien reçu votre candidature pour le poste d\'infirmier. Pouvez-vous nous envoyer votre diplôme ?',
      date_label: '02/06/2026 09:15',
      is_mine: true,
      lu: true,
      expediteur_photo: null,
    },
    {
      id_message: 'dm-2',
      contenu:
        'Bonjour, merci pour votre retour. Je vous envoie mon diplôme dès aujourd\'hui.',
      date_label: '02/06/2026 14:30',
      is_mine: false,
      lu: true,
    },
    {
      id_message: 'dm-3',
      contenu:
        'Parfait, merci. Nous vous contacterons pour un entretien la semaine prochaine.',
      date_label: '03/06/2026 10:00',
      is_mine: true,
      lu: true,
      expediteur_photo: null,
    },
    {
      id_message: 'dm-4',
      contenu: 'Très bien, je reste disponible. Merci !',
      date_label: '03/06/2026 11:45',
      is_mine: false,
      lu: true,
    },
  ],
};

export const DEMO_MESSAGING_CONTACTS = [
  { id_user: 9001, label: 'Clinique Al Amal (recruteur)', prenom: 'Clinique', nom: 'Al Amal', role: 'recruteur' },
  { id_user: 9002, label: 'TechMaroc SARL (recruteur)', prenom: 'TechMaroc', nom: 'SARL', role: 'recruteur' },
];

export const DEMO_MESSAGING_CONTACTS_RECRUTEUR = [
  { id_user: 2001, label: 'Omar Alami (candidat)', prenom: 'Omar', nom: 'Alami', role: 'candidat' },
  { id_user: 2002, label: 'Sara Bennani (candidat)', prenom: 'Sara', nom: 'Bennani', role: 'candidat' },
];

export const DEMO_MESSAGING_CONTACTS_CANDIDAT = [
  { id_user: 9001, label: 'Clinique Al Amal (recruteur)', prenom: 'Clinique', nom: 'Al Amal', role: 'recruteur' },
  { id_user: 9002, label: 'TechMaroc SARL (recruteur)', prenom: 'TechMaroc', nom: 'SARL', role: 'recruteur' },
];

export const DEMO_ADMIN_STATS = {
  candidats: 1247,
  recruteurs: 89,
  offres_actives: 342,
  candidatures_mois: 486,
  candidatures_par_mois: [
    { label: 'Jan', count: 65 },
    { label: 'Fév', count: 82 },
    { label: 'Mar', count: 91 },
    { label: 'Avr', count: 110 },
    { label: 'Mai', count: 143 },
    { label: 'Jun', count: 98 },
  ],
  offres_par_secteur: [
    { label: 'Santé', count: 35, pct: 35 },
    { label: 'Tech', count: 28, pct: 28 },
    { label: 'Juridique', count: 18, pct: 18 },
    { label: 'Commerce', count: 19, pct: 19 },
  ],
  inscriptions_recentes: [
    { nom: 'Yassine Ouardi', date: '04/06/2026', statut: 'Actif' },
    { nom: 'Sara Bennani', date: '03/06/2026', statut: 'Actif' },
    { nom: 'Omar Alami', date: '02/06/2026', statut: 'Actif' },
    { nom: 'Leila Mansouri', date: '01/06/2026', statut: 'Actif' },
    { nom: 'Karim Benali', date: '31/05/2026', statut: 'Inactif' },
  ],
  candidatures_recentes_table: [
    { candidat: 'Omar Alami', offre: 'Infirmier(ère)', recruteur: 'Clinique Al Amal', date: '01/06/2026', statut: 'en_attente' },
    { candidat: 'Sara Bennani', offre: 'Développeur Full Stack', recruteur: 'TechMaroc SARL', date: '28/05/2026', statut: 'acceptee' },
    { candidat: 'Leila Mansouri', offre: 'Commercial Terrain', recruteur: 'Assurance Atlas', date: '25/05/2026', statut: 'refusee' },
    { candidat: 'Yassine Ouardi', offre: 'Comptable', recruteur: 'Fiduciaire Reda', date: '22/05/2026', statut: 'en_attente' },
    { candidat: 'Fatima Zahraoui', offre: 'Médecin Généraliste', recruteur: 'Centre de Santé Oasis', date: '20/05/2026', statut: 'acceptee' },
  ],
};

export const DEMO_RECRUTEUR_STATS = {
  offres_publiees: 5,
  offres_actives: 5,
  candidatures_recues: 12,
  candidatures_en_attente: 4,
  candidatures_acceptees: 6,
  entreprise: 'Tech Solutions Maroc',
  recent_candidatures: [
    { id_candidature: 'r1', candidat: 'Yassine Ouardi', offre: 'Développeur Full Stack', statut: 'en_attente', date_label: 'il y a 2 jours' },
    { id_candidature: 'r2', candidat: 'Omar Alami', offre: 'Développeur Full Stack', statut: 'acceptee', date_label: 'il y a 5 jours' },
  ],
  mes_offres: [
    { titre: 'Développeur Full Stack', candidatures: 5, statut: 'active' },
    { titre: 'Designer UI/UX', candidatures: 3, statut: 'active' },
  ],
};

export function getDemoOfferById(offerId) {
  return DEMO_CANDIDAT_OFFERS.find((o) => o.id_offre === offerId) ?? null;
}

export function filterDemoOffers(
  offers,
  { q = '', ville = '', typeContrat = '', categorie = '', metier = '' } = {}
) {
  const term = q.trim().toLowerCase();
  return offers.filter((o) => {
    if (ville && o.ville !== ville) return false;
    if (typeContrat && o.type_contrat !== typeContrat) return false;
    if (categorie && o.categorie !== categorie) return false;
    if (metier && o.metier !== metier) return false;
    if (!term) return true;
    const hay = `${o.titre} ${o.recruteur_nom} ${o.ville} ${o.categorie} ${o.metier || ''}`.toLowerCase();
    return hay.includes(term);
  });
}
