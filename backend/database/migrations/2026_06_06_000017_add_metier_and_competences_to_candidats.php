<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('candidats') && ! Schema::hasColumn('candidats', 'id_metier')) {
            DB::statement('ALTER TABLE `candidats` ADD COLUMN `id_metier` int(11) DEFAULT NULL AFTER `id_categorie`');
            DB::statement('ALTER TABLE `candidats` ADD KEY `candidats_id_metier_index` (`id_metier`)');
        }

        if (! Schema::hasTable('candidat_competences')) {
            DB::statement(<<<'SQL'
CREATE TABLE `candidat_competences` (
  `id_candidat` int(11) NOT NULL,
  `id_metier` int(11) NOT NULL,
  PRIMARY KEY (`id_candidat`, `id_metier`),
  KEY `candidat_competences_id_metier_index` (`id_metier`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
SQL);
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('candidat_competences')) {
            DB::statement('DROP TABLE `candidat_competences`');
        }

        if (Schema::hasColumn('candidats', 'id_metier')) {
            DB::statement('ALTER TABLE `candidats` DROP COLUMN `id_metier`');
        }
    }
};
