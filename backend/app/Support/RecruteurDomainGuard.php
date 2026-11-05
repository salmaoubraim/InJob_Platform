<?php



namespace App\Support;



use App\Models\Candidat;

use App\Models\OffreEmploi;

use App\Models\Recruteur;



class RecruteurDomainGuard

{

    public const ERROR_PUBLISH =

        'Vous ne pouvez publier des offres que dans le domaine d\'activité de votre entreprise.';



    public static function resolveDomainId(Recruteur $recruteur): ?int

    {

        if ($recruteur->id_categorie) {

            return (int) $recruteur->id_categorie;

        }



        $fromOffer = $recruteur->offres()->whereNotNull('id_categorie')->value('id_categorie');



        return $fromOffer ? (int) $fromOffer : null;

    }



    public static function canPublishInCategory(Recruteur $recruteur, int $idCategorie): bool

    {

        $domain = self::resolveDomainId($recruteur);



        if (! $domain) {

            return true;

        }



        return $domain === $idCategorie;

    }



    public static function assertCanPublishInCategory(Recruteur $recruteur, int $idCategorie): ?string

    {

        if (! self::canPublishInCategory($recruteur, $idCategorie)) {

            return self::ERROR_PUBLISH;

        }



        return null;

    }



    public static function isConsistentCandidature(Candidat $candidat, OffreEmploi $offre): bool

    {

        return CandidatureDomainGuard::canApply($candidat, $offre);

    }

}

