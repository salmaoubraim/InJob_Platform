<?php

use App\Models\AvisRecruteur;
use App\Models\AvisRecruteurCandidat;
use App\Models\Candidat;
use App\Models\Candidature;
use App\Models\OffreEmploi;
use App\Models\Recruteur;
use App\Models\Utilisateur;
use App\Support\OffreImages;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        OffreEmploi::query()
            ->where(function ($q) {
                $q->where('titre', 'like', '%Peintre%')
                    ->orWhere('titre', 'like', '%peintre%');
            })
            ->update(['image_offre' => OffreImages::PEINTURE]);

        $omar = $this->candidatByEmail('omar.alami@injob.ma');
        $sara = $this->candidatByEmail('sara.bennani@injob.ma');

        $peintre = OffreEmploi::where('titre', 'like', '%Peintre%')->first();
        $coiffeur = OffreEmploi::where('titre', 'like', '%Coiffeur%')->first();
        $fullStack = OffreEmploi::where('titre', 'like', '%Full Stack%')->first();

        if ($omar && $peintre) {
            $this->ensureCandidature($omar, $peintre, 'en_attente');
        }
        if ($omar && $fullStack) {
            $this->ensureCandidature($omar, $fullStack, 'acceptee');
        }
        if ($sara && $coiffeur) {
            $this->ensureCandidature($sara, $coiffeur, 'entretien_programme');
        }
        if ($sara && $peintre) {
            $this->ensureCandidature($sara, $peintre, 'en_attente');
        }

        if (! Schema::hasTable('avis_recruteurs')) {
            return;
        }

        $avisSamples = [
            [
                'email' => 'omar.alami@injob.ma',
                'offre_titre' => 'Peintre',
                'note' => 5,
                'commentaire' => 'Processus de candidature clair, recruteur réactif et offre conforme à l\'annonce. Entretien professionnel.',
            ],
            [
                'email' => 'sara.bennani@injob.ma',
                'offre_titre' => 'Coiffeur',
                'note' => 4,
                'commentaire' => 'Bonne communication du recruteur. Le déroulement du processus a été fluide et transparent.',
            ],
        ];

        foreach ($avisSamples as $sample) {
            $candidat = $this->candidatByEmail($sample['email']);
            if (! $candidat) {
                continue;
            }

            $offre = OffreEmploi::where('titre', 'like', '%'.$sample['offre_titre'].'%')->first();
            if (! $offre?->id_recruteur) {
                continue;
            }

            $this->ensureCandidature($candidat, $offre, 'en_attente');

            AvisRecruteur::firstOrCreate(
                [
                    'id_candidat' => $candidat->id_candidat,
                    'id_recruteur' => $offre->id_recruteur,
                    'id_offre' => $offre->id_offre,
                ],
                [
                    'note' => $sample['note'],
                    'commentaire' => $sample['commentaire'],
                    'created_at' => now()->subDays(4),
                ]
            );
        }

        if (! Schema::hasTable('avis_recruteur_candidat')) {
            return;
        }

        $evalSamples = [
            [
                'candidat_email' => 'omar.alami@injob.ma',
                'offre_titre' => 'Peintre',
                'note' => 5,
                'commentaire' => 'Profil sérieux, bonne expérience chantier. Communication excellente pendant le processus.',
            ],
            [
                'candidat_email' => 'sara.bennani@injob.ma',
                'offre_titre' => 'Coiffeur',
                'note' => 4,
                'commentaire' => 'Candidat motivé, compétences techniques solides. Entretien constructif et professionnel.',
            ],
        ];

        foreach ($evalSamples as $sample) {
            $candidat = $this->candidatByEmail($sample['candidat_email']);
            $offre = OffreEmploi::where('titre', 'like', '%'.$sample['offre_titre'].'%')->first();
            if (! $candidat || ! $offre?->id_recruteur) {
                continue;
            }

            AvisRecruteurCandidat::firstOrCreate(
                [
                    'id_recruteur' => $offre->id_recruteur,
                    'id_candidat' => $candidat->id_candidat,
                    'id_offre' => $offre->id_offre,
                ],
                [
                    'note' => $sample['note'],
                    'commentaire' => $sample['commentaire'],
                    'created_at' => now()->subDays(3),
                ]
            );
        }
    }

    public function down(): void
    {
        // Données de démo — pas de retour arrière.
    }

    private function candidatByEmail(string $email): ?Candidat
    {
        $user = Utilisateur::where('email', $email)->first();

        return $user ? Candidat::where('id_user', $user->id_user)->first() : null;
    }

    private function ensureCandidature(Candidat $candidat, OffreEmploi $offre, string $statut): void
    {
        $attrs = [
            'statut' => $statut,
            'date_candidature' => now()->subDays(5),
        ];

        if (Schema::hasColumn('candidatures', 'date_entretien') && $statut === 'entretien_programme') {
            $attrs['date_entretien'] = now()->addDays(3);
        }

        Candidature::firstOrCreate(
            [
                'id_offre' => $offre->id_offre,
                'id_candidat' => $candidat->id_candidat,
            ],
            $attrs
        );
    }
};
