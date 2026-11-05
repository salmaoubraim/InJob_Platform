<?php

namespace App\Support;

/**
 * Profils métier / compétences pour tous les candidats de démo.
 *
 * @return array<string, array{metier: string, competences: string, competence_metiers: list<string>}>
 */
class CandidatCompetenceProfiles
{
    public static function byEmail(): array
    {
        return [
            'omar.amrani@injob.ma' => [
                'metier' => 'Développeur Full Stack',
                'competences' => 'React, Laravel, JavaScript, PHP, MySQL, Node.js',
                'competence_metiers' => [
                    'Développeur PHP Laravel',
                    'Développeur Frontend React',
                    'Peintre en bâtiment',
                ],
            ],
            'sara.amrani@injob.ma' => [
                'metier' => 'Coiffeur / Coiffeuse',
                'competences' => 'Coupe, coloration, soins capillaires, conseil clientèle',
                'competence_metiers' => [
                    'Chargé de communication',
                ],
            ],
            'yassine.ouardi@injob.ma' => [
                'metier' => 'Développeur Full Stack',
                'competences' => 'PHP, Laravel, React, MySQL, JavaScript, API REST',
                'competence_metiers' => [
                    'Développeur PHP Laravel',
                    'Designer UI/UX',
                ],
            ],
            'leila.mansouri@injob.ma' => [
                'metier' => 'Commercial Terrain',
                'competences' => 'Prospection, négociation, relation client, vente B2B',
                'competence_metiers' => [
                    'Assistant de boutique',
                    'Chargé Marketing Digital',
                ],
            ],
            'yassine@gmail.com' => [
                'metier' => 'Développeur PHP Laravel',
                'competences' => 'PHP, Laravel, API REST, MySQL, Symfony',
                'competence_metiers' => [
                    'Développeur Full Stack',
                    'Développeur Frontend React',
                ],
            ],
        ];
    }

    /** @return array<string, array{metier: string, competences: string, competence_metiers: list<string>}> */
    public static function fallbackByCategory(): array
    {
        return [
            'Informatique & tech' => [
                'metier' => 'Développeur Full Stack',
                'competences' => 'Développement web, bases de données, travail en équipe',
                'competence_metiers' => ['Designer UI/UX'],
            ],
            'Coiffure & esthétique' => [
                'metier' => 'Coiffeur / Coiffeuse',
                'competences' => 'Coupe, coloration, accueil client',
                'competence_metiers' => [],
            ],
            'Commerce & vente' => [
                'metier' => 'Commercial Terrain',
                'competences' => 'Vente, prospection, relation client',
                'competence_metiers' => ['Assistant de boutique'],
            ],
            'Peinture & décoration' => [
                'metier' => 'Peintre en bâtiment',
                'competences' => 'Peinture intérieure, finitions, préparation des supports',
                'competence_metiers' => [],
            ],
            'Santé' => [
                'metier' => 'Infirmier Polyvalent',
                'competences' => 'Soins infirmiers, hygiène, relation patient',
                'competence_metiers' => [],
            ],
            'Finance' => [
                'metier' => 'Comptable',
                'competences' => 'Comptabilité générale, fiscalité, Excel',
                'competence_metiers' => [],
            ],
            'Juridique' => [
                'metier' => 'Assistant(e) avocat',
                'competences' => 'Rédaction juridique, recherche, organisation',
                'competence_metiers' => [],
            ],
            'Marketing' => [
                'metier' => 'Chargé de communication',
                'competences' => 'Communication, réseaux sociaux, rédaction',
                'competence_metiers' => ['Chargé Marketing Digital'],
            ],
            'Ménage & services' => [
                'metier' => 'Agent de ménage',
                'competences' => 'Entretien des locaux, hygiène, organisation',
                'competence_metiers' => [],
            ],
        ];
    }
}
