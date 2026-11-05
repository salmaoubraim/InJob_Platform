<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('avis_recruteur_candidat')) {
            return;
        }

        DB::statement(<<<'SQL'
CREATE TABLE `avis_recruteur_candidat` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `id_recruteur` int(11) NOT NULL,
  `id_candidat` int(11) NOT NULL,
  `id_offre` int(11) NOT NULL,
  `note` tinyint(4) NOT NULL,
  `commentaire` text NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `avis_recruteur_candidat_unique` (`id_recruteur`, `id_candidat`, `id_offre`),
  KEY `avis_recruteur_candidat_id_recruteur_index` (`id_recruteur`),
  KEY `avis_recruteur_candidat_id_candidat_index` (`id_candidat`),
  KEY `avis_recruteur_candidat_id_offre_index` (`id_offre`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci
SQL);
    }

    public function down(): void
    {
        DB::statement('SET FOREIGN_KEY_CHECKS=0');
        Schema::dropIfExists('avis_recruteur_candidat');
        DB::statement('SET FOREIGN_KEY_CHECKS=1');
    }
};
