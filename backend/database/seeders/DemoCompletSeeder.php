<?php

namespace Database\Seeders;

use App\Models\Avis;
use App\Models\AvisRecruteur;
use App\Models\AvisRecruteurCandidat;
use App\Models\Candidat;
use App\Models\Candidature;
use App\Models\Categorie;
use App\Models\CV;
use App\Models\Message;
use App\Models\Notification;
use App\Models\OffreEmploi;
use App\Models\Recruteur;
use App\Models\Utilisateur;
use App\Services\NotificationService;
use App\Support\CandidatCompetenceSync;
use App\Support\CandidatureDomainGuard;
use App\Support\CandidatureNotificationPresenter;
use App\Support\DemoCvPdfWriter;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Schema;

class DemoCompletSeeder extends Seeder
{
    public function run(): void
    {
        OffreEmploi::query()->update(['est_publie' => true, 'statut' => 'active']);

        $candidatsData = [
            [
                'email' => 'omar.amrani@injob.ma',
                'prenom' => 'Omar',
                'nom' => 'Amrani',
                'ville' => 'Casablanca',
                'competences' => 'React, Laravel, JavaScript',
                'domaine' => 'Informatique & tech',
            ],
            [
                'email' => 'sara.amrani@injob.ma',
                'prenom' => 'Sara',
                'nom' => 'Amrani',
                'ville' => 'Rabat',
                'competences' => 'Coiffure, coloration',
                'domaine' => 'Coiffure & esthétique',
            ],
            [
                'email' => 'yassine.ouardi@injob.ma',
                'prenom' => 'Yassine',
                'nom' => 'Ouardi',
                'ville' => 'Agadir',
                'competences' => 'Développement web, React',
                'domaine' => 'Informatique & tech',
            ],
            [
                'email' => 'leila.mansouri@injob.ma',
                'prenom' => 'Leila',
                'nom' => 'Mansouri',
                'ville' => 'Marrakech',
                'competences' => 'Vente, relation client',
                'domaine' => 'Commerce & vente',
            ],
        ];

        $candidatModels = [];
        foreach ($candidatsData as $c) {
            $cat = Categorie::where('nom_categorie', $c['domaine'])->first();

            $user = Utilisateur::firstOrCreate(
                ['email' => $c['email']],
                [
                    'nom' => $c['nom'],
                    'prenom' => $c['prenom'],
                    'mot_de_passe' => 'Candidat@2024',
                    'telephone' => '+2126'.random_int(10000000, 99999999),
                    'role' => 'candidat',
                ]
            );

            $candidatModels[] = Candidat::firstOrCreate(
                ['id_user' => $user->id_user],
                [
                    'id_categorie' => $cat?->id_categorie,
                    'ville' => $c['ville'],
                    'adresse' => $c['ville'].', Maroc',
                    'competences' => $c['competences'],
                    'experience' => '2 à 5 ans',
                ]
            );

            if ($cat && $candidatModels[count($candidatModels) - 1]->id_categorie !== $cat->id_categorie) {
                $candidatModels[count($candidatModels) - 1]->update(['id_categorie' => $cat->id_categorie]);
            }

            $latest = $candidatModels[count($candidatModels) - 1];
            CandidatCompetenceSync::applyTo($latest);
            $this->ensureDemoCv($latest, $c['prenom']);
        }

        $offres = OffreEmploi::with('recruteur.utilisateur')->where('est_publie', true)->get();
        if ($offres->isEmpty()) {
            return;
        }

        $this->purgeInconsistentCandidatures();
        $this->syncRecruteurDomains();

        $statuts = ['en_attente', 'acceptee', 'refusee'];
        $i = 0;

        try {
        foreach ($candidatModels as $candidat) {
            $matchingOffres = $offres->filter(function ($o) use ($candidat) {
                if (! $candidat->id_categorie || ! $o->id_categorie) {
                    return true;
                }

                return (int) $candidat->id_categorie === (int) $o->id_categorie;
            });

            if ($matchingOffres->isEmpty()) {
                $i++;

                continue;
            }

            $offre = $matchingOffres->values()[$i % $matchingOffres->count()];
            $statut = $statuts[$i % count($statuts)];

            $attrs = [
                'statut' => $statut,
                'date_candidature' => now()->subDays(5 - $i),
            ];
            if ($statut === 'entretien_programme' && Schema::hasColumn('candidatures', 'date_entretien')) {
                $attrs['date_entretien'] = now()->addDays(3);
            }

            $candidature = Candidature::firstOrCreate(
                [
                    'id_offre' => $offre->id_offre,
                    'id_candidat' => $candidat->id_candidat,
                ],
                $attrs
            );

            if ($candidature->wasRecentlyCreated === false) {
                $update = ['statut' => $statut];
                if (Schema::hasColumn('candidatures', 'date_entretien')) {
                    $update['date_entretien'] = $statut === 'entretien_programme'
                        ? now()->addDays(3)
                        : null;
                }
                $candidature->update($update);
            }

            $user = $candidat->utilisateur ?? Utilisateur::find($candidat->id_user);
            $recruteurUser = $offre->recruteur?->utilisateur;

            if ($user && $recruteurUser) {
                Message::firstOrCreate(
                    [
                        'expediteur' => $user->id_user,
                        'destinataire' => $recruteurUser->id_user,
                        'contenu' => "Bonjour, je suis intéressé(e) par l'offre « {$offre->titre} ». Disponible pour un entretien.",
                    ],
                    ['date_envoi' => now()->subDays(2)]
                );

                Message::firstOrCreate(
                    [
                        'expediteur' => $recruteurUser->id_user,
                        'destinataire' => $user->id_user,
                        'contenu' => 'Merci pour votre candidature. Pouvez-vous confirmer votre disponibilité pour un entretien cette semaine ?',
                    ],
                    ['date_envoi' => now()->subDay()]
                );

                Message::firstOrCreate(
                    [
                        'expediteur' => $user->id_user,
                        'destinataire' => $recruteurUser->id_user,
                        'contenu' => 'Oui, je suis disponible du lundi au jeudi. Merci pour votre retour rapide.',
                    ],
                    ['date_envoi' => now()->subHours(12)]
                );
            }

            $i++;
        }
        } catch (\Throwable $e) {
            // Candidatures : schéma local parfois incomplet — on continue le reste du seed
        }

        try {
            $this->seedMessageNotifications();
        } catch (\Throwable $e) {
            // Notifications messages
        }

        try {
            $this->seedNotifications();
        } catch (\Throwable $e) {
            // Table notifications : exécuter database/notifications_table.sql si besoin
        }

        try {
            $this->seedAvis($candidatModels, $offres);
        } catch (\Throwable $e) {
            // Table avis : exécuter les migrations 2026_06_04_000005 si besoin
        }

        try {
            $this->seedAvisRecruteurCandidat($candidatModels, $offres);
        } catch (\Throwable $e) {
            // Table avis_recruteur_candidat : migration 2026_06_05_000004
        }

        try {
            $this->seedAvisRecruteurs($candidatModels, $offres);
        } catch (\Throwable $e) {
            // Table avis_recruteurs : migration 2026_06_05_000012
        }

        try {
            $this->seedCrossDomainCandidatures($candidatModels);
        } catch (\Throwable $e) {
            // Candidatures démo multi-domaines
        }
    }

    private function seedAvis(array $candidats, $offres): void
    {
        $samples = [
            [
                'note' => 5,
                'commentaire' => 'Processus de candidature clair et recruteur très réactif. Je recommande cette offre.',
            ],
            [
                'note' => 4,
                'commentaire' => 'Bonne expérience de recrutement. L\'équipe a répondu rapidement à mes questions.',
            ],
            [
                'note' => 5,
                'commentaire' => 'Offre conforme à la description. Entretien professionnel et suivi impeccable.',
            ],
        ];

        $i = 0;
        foreach ($candidats as $candidat) {
            $matchingOffres = $offres->filter(function ($o) use ($candidat) {
                if (! $candidat->id_categorie || ! $o->id_categorie) {
                    return false;
                }

                return (int) $candidat->id_categorie === (int) $o->id_categorie;
            });

            if ($matchingOffres->isEmpty()) {
                $i++;

                continue;
            }

            $offre = $matchingOffres->values()[$i % $matchingOffres->count()];
            $sample = $samples[$i % count($samples)];

            $avis = Avis::firstOrCreate(
                [
                    'id_user' => $candidat->id_user,
                    'id_offre' => $offre->id_offre,
                ],
                [
                    'note' => $sample['note'],
                    'commentaire' => $sample['commentaire'],
                    'created_at' => now()->subDays(3 - $i),
                ]
            );

            $recruteurUserId = $offre->recruteur?->id_user;
            $auteur = trim(($candidat->utilisateur?->prenom ?? '').' '.($candidat->utilisateur?->nom ?? ''));

            if ($recruteurUserId && $avis->wasRecentlyCreated) {
                NotificationService::send(
                    $recruteurUserId,
                    'avis',
                    'Nouvel avis reçu',
                    "{$auteur} a laissé un avis sur « {$offre->titre} » ({$avis->note}/5).",
                    '/recruteur/avis'
                );
            }

            $i++;
        }
    }

    private function seedCrossDomainCandidatures(array $candidats): void
    {
        $pairs = [
            ['email' => 'omar.amrani@injob.ma', 'titre' => 'Peintre'],
            ['email' => 'sara.amrani@injob.ma', 'titre' => 'Coiffeur'],
        ];

        foreach ($pairs as $pair) {
            $user = Utilisateur::where('email', $pair['email'])->first();
            $candidat = $user
                ? collect($candidats)->first(fn ($c) => (int) $c->id_user === (int) $user->id_user)
                : null;
            $offre = OffreEmploi::where('titre', 'like', '%'.$pair['titre'].'%')->first();

            if (! $candidat || ! $offre) {
                continue;
            }

            Candidature::firstOrCreate(
                [
                    'id_offre' => $offre->id_offre,
                    'id_candidat' => $candidat->id_candidat,
                ],
                [
                    'statut' => 'en_attente',
                    'date_candidature' => now()->subDays(4),
                ]
            );
        }
    }

    private function seedAvisRecruteurs(array $candidats, $offres): void
    {
        if (! Schema::hasTable('avis_recruteurs')) {
            return;
        }

        $samples = [
            [
                'note' => 5,
                'commentaire' => 'Processus de candidature clair et recruteur très réactif. Je recommande cette offre.',
            ],
            [
                'note' => 4,
                'commentaire' => 'Bonne expérience de recrutement. Communication professionnelle et délais respectés.',
            ],
            [
                'note' => 5,
                'commentaire' => 'Offre conforme à la description. Entretien structuré et suivi impeccable.',
            ],
        ];

        $i = 0;
        foreach ($candidats as $candidat) {
            $candidature = Candidature::query()
                ->where('id_candidat', $candidat->id_candidat)
                ->with('offre.recruteur')
                ->first();

            if (! $candidature?->offre?->recruteur) {
                $i++;

                continue;
            }

            $offre = $candidature->offre;
            $sample = $samples[$i % count($samples)];

            AvisRecruteur::firstOrCreate(
                [
                    'id_candidat' => $candidat->id_candidat,
                    'id_recruteur' => $offre->id_recruteur,
                    'id_offre' => $offre->id_offre,
                ],
                [
                    'note' => $sample['note'],
                    'commentaire' => $sample['commentaire'],
                    'created_at' => now()->subDays(3 - ($i % 3)),
                ]
            );

            $i++;
        }
    }

    private function seedAvisRecruteurCandidat(array $candidats, $offres): void
    {
        if (! Schema::hasTable('avis_recruteur_candidat')) {
            return;
        }

        $samples = [
            [
                'note' => 5,
                'commentaire' => 'Excellent profil technique, communication claire et bonne maîtrise de React. Recommandé pour un poste senior.',
            ],
            [
                'note' => 4,
                'commentaire' => 'Candidat motivé avec un bon parcours. Entretien constructif, quelques axes d\'amélioration sur la gestion de projet.',
            ],
        ];

        $i = 0;
        foreach ($candidats as $candidat) {
            $candidature = Candidature::query()
                ->where('id_candidat', $candidat->id_candidat)
                ->with('offre.recruteur')
                ->first();

            if (! $candidature?->offre?->recruteur) {
                $i++;

                continue;
            }

            $offre = $candidature->offre;
            $recruteur = $offre->recruteur;
            $sample = $samples[$i % count($samples)];

            $avis = AvisRecruteurCandidat::firstOrCreate(
                [
                    'id_recruteur' => $recruteur->id_recruteur,
                    'id_candidat' => $candidat->id_candidat,
                    'id_offre' => $offre->id_offre,
                ],
                [
                    'note' => $sample['note'],
                    'commentaire' => $sample['commentaire'],
                    'created_at' => now()->subDays(2 - ($i % 2)),
                ]
            );

            $candidatUserId = $candidat->id_user;
            $entreprise = $recruteur->nom_entreprise ?: 'Recruteur';

            if ($candidatUserId && $avis->wasRecentlyCreated) {
                NotificationService::send(
                    $candidatUserId,
                    'avis',
                    'Nouvel avis de recruteur',
                    "{$entreprise} vous a évalué(e) pour « {$offre->titre} » ({$avis->note}/5).",
                    '/candidat/avis'
                );
            }

            $i++;
        }
    }

    private function seedMessageNotifications(): void
    {
        if (! Schema::hasColumn('messages', 'lu')) {
            return;
        }

        Message::with(['expediteurUser', 'destinataireUser'])->get()->each(function (Message $msg) {
            $dest = $msg->destinataireUser;
            if (! $dest) {
                return;
            }

            $expNom = trim(($msg->expediteurUser?->prenom ?? '').' '.($msg->expediteurUser?->nom ?? ''));
            $lien = match ($dest->role) {
                'recruteur' => '/recruteur/messagerie',
                'admin' => '/admin/messagerie',
                default => '/candidat/messagerie',
            };

            $titre = 'Nouveau message';
            if (Notification::where('id_user', $dest->id_user)->where('titre', $titre)->where('message', 'like', '%'.$expNom.'%')->exists()) {
                return;
            }

            NotificationService::send(
                $dest->id_user,
                'message',
                $titre,
                "{$expNom} vous a envoyé un message.",
                $lien.'?to='.$msg->expediteur
            );
        });
    }

    private function syncRecruteurDomains(): void
    {
        Recruteur::query()->each(function (Recruteur $recruteur) {
            if ($recruteur->id_categorie) {
                return;
            }

            $domain = OffreEmploi::query()
                ->where('id_recruteur', $recruteur->id_recruteur)
                ->whereNotNull('id_categorie')
                ->value('id_categorie');

            if ($domain) {
                $recruteur->update(['id_categorie' => $domain]);
            }
        });
    }

    private function purgeInconsistentCandidatures(): void
    {
        Candidature::with(['candidat.metier', 'candidat.competencesMetiers', 'offre.metier'])->get()
            ->each(function (Candidature $c) {
                if (! $c->candidat || ! $c->offre) {
                    return;
                }

                if (! CandidatureDomainGuard::canApply($c->candidat, $c->offre)) {
                    $c->delete();
                }
            });
    }

    private function ensureDemoCv(Candidat $candidat, string $prenom): void
    {
        $user = $candidat->utilisateur ?? Utilisateur::find($candidat->id_user);
        $nom = $user?->nom ?? 'Candidat';
        $ville = $candidat->ville ?? 'Maroc';
        $competences = $candidat->competences ?? 'Competences professionnelles';

        $slug = strtolower($prenom.'_'.$nom);
        $slug = preg_replace('/[^a-z0-9_]/', '', str_replace(' ', '_', $slug));
        $diskName = "cv_exemple_{$slug}.pdf";
        $displayName = "CV_{$prenom}_{$nom}_InJob.pdf";
        $webPath = '/cvs/'.$diskName;
        $fullPath = public_path('cvs/'.$diskName);

        DemoCvPdfWriter::write(
            $fullPath,
            "CV — {$prenom} {$nom}",
            [
                "Nom : {$prenom} {$nom}",
                "Ville : {$ville}, Maroc",
                "Competences : {$competences}",
                'Experience : 2 a 5 ans',
                'Email : '.($user?->email ?? 'candidat@injob.ma'),
                '',
                'Document PDF exemple InJob — remplacable par votre propre CV.',
            ]
        );

        $existing = CV::where('id_candidat', $candidat->id_candidat)->first();
        if ($existing) {
            if (str_ends_with(strtolower($existing->chemin_fichier), '.pdf')) {
                return;
            }
            $old = public_path(ltrim($existing->chemin_fichier, '/'));
            if (is_file($old) && str_ends_with(strtolower($old), '.txt')) {
                @unlink($old);
            }
            $existing->update([
                'nom_fichier' => $displayName,
                'chemin_fichier' => $webPath,
            ]);

            return;
        }

        CV::create([
            'id_candidat' => $candidat->id_candidat,
            'nom_fichier' => $displayName,
            'chemin_fichier' => $webPath,
        ]);
    }

    private function seedNotifications(): void
    {
        $candidatSamples = [
            ['type' => 'candidature', 'titre' => 'Candidature acceptée', 'message' => 'Votre candidature pour « Coiffeur / Coiffeuse » a été acceptée. Félicitations !', 'lien' => '/candidat/candidatures'],
            ['type' => 'entretien', 'titre' => 'Entretien programmé', 'message' => 'Un entretien est prévu dans 3 jours pour l\'offre « Développeur Full Stack ».', 'lien' => '/candidat/candidatures'],
            ['type' => 'message', 'titre' => 'Nouveau message', 'message' => 'Déco Maroc SARL vous a envoyé un message. Consultez votre messagerie.', 'lien' => '/candidat/messagerie'],
            ['type' => 'offre', 'titre' => 'Nouvelle offre', 'message' => 'Une offre correspondant à votre profil a été publiée à Casablanca.', 'lien' => '/candidat/offres'],
        ];

        $recruteurSamples = [
            ['type' => 'message', 'titre' => 'Nouveau message', 'message' => 'Un candidat vous a contacté via la messagerie InJob.', 'lien' => '/recruteur/messagerie'],
            ['type' => 'offre', 'titre' => 'Offre publiée', 'message' => 'Votre offre est en ligne et visible par les candidats.', 'lien' => '/recruteur/offres'],
        ];

        $adminSamples = [
            ['type' => 'inscription', 'titre' => 'Nouveau candidat', 'message' => 'Un candidat s\'est inscrit sur la plateforme InJob.', 'lien' => '/admin/utilisateurs'],
            ['type' => 'candidature', 'titre' => 'Activité plateforme', 'message' => '5 nouvelles candidatures ont été enregistrées cette semaine.', 'lien' => '/admin/candidatures'],
            ['type' => 'offre', 'titre' => 'Offres actives', 'message' => 'Les recruteurs ont publié de nouvelles offres au Maroc.', 'lien' => '/admin/offres'],
            ['type' => 'avis', 'titre' => 'Nouvel avis', 'message' => 'Un avis 5 étoiles a été publié sur InJob.', 'lien' => '/admin/avis'],
        ];

        foreach (Utilisateur::where('role', 'candidat')->get() as $i => $user) {
            foreach ($candidatSamples as $j => $sample) {
                if (! Notification::where('id_user', $user->id_user)->where('titre', $sample['titre'])->exists()) {
                    NotificationService::send($user->id_user, $sample['type'], $sample['titre'], $sample['message'], $sample['lien']);
                }
            }
        }

        foreach (Utilisateur::where('role', 'recruteur')->get() as $user) {
            foreach ($recruteurSamples as $sample) {
                if (! Notification::where('id_user', $user->id_user)->where('titre', $sample['titre'])->exists()) {
                    NotificationService::send($user->id_user, $sample['type'], $sample['titre'], $sample['message'], $sample['lien']);
                }
            }
        }

        $this->seedRecruteurCandidatureNotifications();

        $admin = Utilisateur::where('role', 'admin')->first();
        if ($admin) {
            foreach ($adminSamples as $sample) {
                if (! Notification::where('id_user', $admin->id_user)->where('titre', $sample['titre'])->exists()) {
                    NotificationService::send($admin->id_user, $sample['type'], $sample['titre'], $sample['message'], $sample['lien']);
                }
            }
        }
    }

    private function seedRecruteurCandidatureNotifications(): void
    {
        $recruteurUserIds = Utilisateur::where('role', 'recruteur')->pluck('id_user');

        Notification::query()
            ->where('type', 'candidature')
            ->whereIn('id_user', $recruteurUserIds)
            ->delete();

        Recruteur::with('utilisateur')->each(function (Recruteur $recruteur) {
            if (! $recruteur->id_user) {
                return;
            }

            Candidature::with(['candidat.utilisateur', 'offre'])
                ->whereHas('offre', fn ($q) => $q->where('id_recruteur', $recruteur->id_recruteur))
                ->orderByDesc('date_candidature')
                ->limit(6)
                ->get()
                ->each(function (Candidature $candidature) use ($recruteur) {
                    $nom = trim(
                        ($candidature->candidat?->utilisateur?->prenom ?? '').' '
                        .($candidature->candidat?->utilisateur?->nom ?? '')
                    );
                    $offreTitre = $candidature->offre?->titre;

                    if (! $nom || ! $offreTitre) {
                        return;
                    }

                    $payload = CandidatureNotificationPresenter::forRecruteur(
                        $nom,
                        $offreTitre,
                        $candidature->id_candidature
                    );

                    Notification::updateOrCreate(
                        [
                            'id_user' => $recruteur->id_user,
                            'type' => 'candidature',
                            'titre' => $payload['titre'],
                            'message' => $payload['message'],
                        ],
                        [
                            'lien' => $payload['lien'],
                            'lu' => false,
                            'created_at' => $candidature->date_candidature ?? now(),
                        ]
                    );
                });
        });
    }
}
