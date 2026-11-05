<?php

namespace Database\Seeders;

use App\Models\Candidat;
use App\Models\Candidature;
use App\Models\Categorie;
use App\Models\ContactMessage;
use App\Models\Metier;
use App\Models\Message;
use App\Models\OffreEmploi;
use App\Models\Recruteur;
use App\Models\Utilisateur;
use App\Services\NotificationService;
use App\Support\OffreImages;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Schema;

/**
 * Données de démo pour captures d'écran :
 * Sara DEV (recruteur), Omar/Sara Amrani (candidats), admin@injob.ma (messages contact).
 */
class ScreenshotDemoSeeder extends Seeder
{
    public function run(): void
    {
        $recruteurDev = Recruteur::query()
            ->whereHas('utilisateur', fn ($q) => $q->where('email', 'recruteur.dev@injob.ma'))
            ->first();

        if (! $recruteurDev) {
            $this->command?->error('Recruteur Sara DEV (recruteur.dev@injob.ma) introuvable.');

            return;
        }

        $catTech = Categorie::query()
            ->where('nom_categorie', 'Informatique & tech')
            ->first();

        if (! $catTech) {
            $this->command?->error('Catégorie Informatique & tech introuvable.');

            return;
        }

        $offres = $this->seedTechOffers($recruteurDev, $catTech);
        $this->seedDevCandidatures($offres);
        $this->seedAmraniCandidatures($offres);
        $this->seedContactMessagesFromOmar();
        $this->seedRecruteurMessages($recruteurDev);

        $this->command?->info('Données screenshot OK : offres Sara DEV, candidatures Amrani, messages contact admin.');
    }

    /** @return array<string, OffreEmploi> */
    private function seedTechOffers(Recruteur $recruteur, Categorie $catTech): array
    {
        $metiers = [
            'Développeur Full Stack' => 'React, Laravel, architecture complète.',
            'Développeur Frontend React' => 'Interfaces React, TypeScript et intégration API.',
            'Développeur PHP Laravel' => 'API REST, Laravel et MySQL.',
        ];

        $metierIds = [];
        foreach ($metiers as $nom => $desc) {
            $metierIds[$nom] = Metier::firstOrCreate(
                [
                    'id_categorie' => $catTech->id_categorie,
                    'nom_metier' => $nom,
                ],
                ['description' => $desc]
            )->id_metier;
        }

        $definitions = [
            'Développeur Full Stack' => [
                'description' => 'React, Laravel et MySQL. Équipe agile, télétravail partiel.',
                'id_metier' => $metierIds['Développeur Full Stack'],
                'type_contrat' => 'CDI',
                'salaire' => 15000,
                'nombre_postes' => 2,
                'image_offre' => OffreImages::DEV_FULLSTACK,
            ],
            'Développeur Frontend React' => [
                'description' => 'Création d\'interfaces modernes avec React, Tailwind CSS et intégration API.',
                'id_metier' => $metierIds['Développeur Frontend React'],
                'type_contrat' => 'CDI',
                'salaire' => 12000,
                'nombre_postes' => 1,
                'image_offre' => OffreImages::DEV_FRONTEND,
            ],
            'Développeur PHP Laravel' => [
                'description' => 'Développement d\'API et back-office avec Laravel, MySQL et bonnes pratiques.',
                'id_metier' => $metierIds['Développeur PHP Laravel'],
                'type_contrat' => 'CDD',
                'salaire' => 9000,
                'nombre_postes' => 1,
                'image_offre' => OffreImages::DEV_PHP,
            ],
        ];

        $offres = [];
        foreach ($definitions as $titre => $data) {
            $offres[$titre] = OffreEmploi::updateOrCreate(
                [
                    'id_recruteur' => $recruteur->id_recruteur,
                    'titre' => $titre,
                ],
                [
                    'id_categorie' => $catTech->id_categorie,
                    'id_metier' => $data['id_metier'],
                    'description' => $data['description'],
                    'ville' => 'Casablanca',
                    'type_contrat' => $data['type_contrat'],
                    'salaire' => $data['salaire'],
                    'nombre_postes' => $data['nombre_postes'],
                    'date_publication' => now()->toDateString(),
                    'date_expiration' => now()->addMonths(2)->toDateString(),
                    'statut' => 'active',
                    'est_publie' => true,
                    'image_offre' => $data['image_offre'],
                ]
            );
        }

        return $offres;
    }

    /** @param array<string, OffreEmploi> $offres */
    private function seedDevCandidatures(array $offres): void
    {
        $candidats = [
            'omar.amrani@injob.ma' => [
                'Développeur Full Stack' => ['statut' => 'acceptee', 'days_ago' => 8],
                'Développeur Frontend React' => ['statut' => 'en_attente', 'days_ago' => 3],
                'Développeur PHP Laravel' => ['statut' => 'entretien_programme', 'days_ago' => 5],
            ],
            'yassine.ouardi@injob.ma' => [
                'Développeur Full Stack' => ['statut' => 'refusee', 'days_ago' => 12],
                'Développeur Frontend React' => ['statut' => 'en_attente', 'days_ago' => 2],
            ],
            'leila.mansouri@injob.ma' => [
                'Développeur PHP Laravel' => ['statut' => 'en_attente', 'days_ago' => 4],
            ],
        ];

        foreach ($candidats as $email => $applications) {
            $candidat = $this->resolveCandidat($email);
            if (! $candidat) {
                continue;
            }

            foreach ($applications as $titre => $meta) {
                $offre = $offres[$titre] ?? null;
                if (! $offre) {
                    continue;
                }

                $this->upsertCandidature($candidat, $offre, $meta['statut'], $meta['days_ago']);
            }
        }
    }

    /** @param array<string, OffreEmploi> $offres */
    private function seedAmraniCandidatures(array $offres): void
    {
        $sara = $this->resolveCandidat('sara.amrani@injob.ma');
        if ($sara) {
            $coiffure = OffreEmploi::query()->where('titre', 'like', '%Coiffeur%')->first();
            $peintre = OffreEmploi::query()->where('titre', 'like', '%Peintre%')->first();

            if ($coiffure) {
                $this->upsertCandidature($sara, $coiffure, 'entretien_programme', 6);
            }
            if ($peintre) {
                $this->upsertCandidature($sara, $peintre, 'en_attente', 2);
            }
        }

        $omar = $this->resolveCandidat('omar.amrani@injob.ma');
        if ($omar && isset($offres['Développeur Full Stack'])) {
            $this->upsertCandidature($omar, $offres['Développeur Full Stack'], 'acceptee', 8);
        }
    }

    private function seedContactMessagesFromOmar(): void
    {
        $messages = [
            [
                'nom' => 'Omar Amrani',
                'email' => 'omar.amrani@injob.ma',
                'message' => 'Bonjour, je suis candidat sur InJob et j\'aimerais savoir comment mettre à jour mon CV après une candidature. Merci pour votre aide.',
                'statut' => 'nouveau',
                'days_ago' => 1,
            ],
            [
                'nom' => 'Omar Amrani',
                'email' => 'omar.amrani@injob.ma',
                'message' => 'Suite à ma candidature chez Tech Solutions Maroc, pourriez-vous me confirmer le délai de traitement des dossiers ? Cordialement, Omar Amrani — Casablanca.',
                'statut' => 'nouveau',
                'days_ago' => 0,
            ],
            [
                'nom' => 'Omar Amrani',
                'email' => 'omar.amrani@injob.ma',
                'message' => 'Question sur la confidentialité des données : mes informations restent-elles visibles uniquement par les recruteurs concernés ? Merci.',
                'statut' => 'lu',
                'days_ago' => 3,
            ],
        ];

        foreach ($messages as $item) {
            $existing = ContactMessage::query()
                ->where('email', $item['email'])
                ->where('message', $item['message'])
                ->first();

            if ($existing) {
                continue;
            }

            $createdAt = now()->subDays($item['days_ago']);
            $payload = [
                'nom' => $item['nom'],
                'email' => $item['email'],
                'message' => $item['message'],
                'statut' => $item['statut'],
            ];

            if ($item['statut'] === 'lu' && Schema::hasColumn('contact_messages', 'date_lecture')) {
                $payload['date_lecture'] = $createdAt->copy()->addHours(2);
            }

            $msg = ContactMessage::create($payload);

            if (Schema::hasColumn('contact_messages', 'created_at')) {
                $msg->created_at = $createdAt;
                $msg->save();
            }

            if ($item['statut'] === 'nouveau') {
                NotificationService::notifyAdmins(
                    'contact',
                    'Nouveau message contact',
                    "{$item['nom']} — ".mb_substr($item['message'], 0, 80),
                    '/admin/messages'
                );
            }
        }
    }

    private function seedRecruteurMessages(Recruteur $recruteur): void
    {
        $recruteurUser = $recruteur->utilisateur;
        $omar = Utilisateur::where('email', 'omar.amrani@injob.ma')->first();

        if (! $recruteurUser || ! $omar) {
            return;
        }

        $offre = OffreEmploi::query()
            ->where('id_recruteur', $recruteur->id_recruteur)
            ->where('titre', 'Développeur Full Stack')
            ->first();

        if (! $offre) {
            return;
        }

        Message::firstOrCreate(
            [
                'expediteur' => $omar->id_user,
                'destinataire' => $recruteurUser->id_user,
                'contenu' => "Bonjour Sara, je suis très intéressé par l'offre « {$offre->titre} ». Mon profil React/Laravel correspond à votre fiche de poste.",
            ],
            ['date_envoi' => now()->subDays(2), 'lu' => false]
        );

        Message::firstOrCreate(
            [
                'expediteur' => $recruteurUser->id_user,
                'destinataire' => $omar->id_user,
                'contenu' => 'Bonjour Omar, merci pour votre candidature. Seriez-vous disponible pour un entretien technique jeudi à 14h ?',
            ],
            ['date_envoi' => now()->subDay(), 'lu' => false]
        );

        Message::firstOrCreate(
            [
                'expediteur' => $omar->id_user,
                'destinataire' => $recruteurUser->id_user,
                'contenu' => 'Parfait, je confirme ma disponibilité jeudi à 14h. Je prépare une démo de mon projet Laravel/React.',
            ],
            ['date_envoi' => now()->subHours(6), 'lu' => false]
        );
    }

    private function resolveCandidat(string $email): ?Candidat
    {
        $user = Utilisateur::where('email', $email)->first();

        return $user?->candidat;
    }

    private function upsertCandidature(Candidat $candidat, OffreEmploi $offre, string $statut, int $daysAgo): void
    {
        $attrs = [
            'statut' => $statut,
            'date_candidature' => now()->subDays($daysAgo),
        ];

        if (Schema::hasColumn('candidatures', 'date_entretien') && $statut === 'entretien_programme') {
            $attrs['date_entretien'] = now()->addDays(4);
        }

        Candidature::updateOrCreate(
            [
                'id_offre' => $offre->id_offre,
                'id_candidat' => $candidat->id_candidat,
            ],
            $attrs
        );

        NotificationService::notifyAdmins(
            'candidature',
            'Nouvelle candidature',
            "{$candidat->utilisateur?->prenom} {$candidat->utilisateur?->nom} — {$offre->titre}",
            '/admin/candidatures'
        );
    }
}
