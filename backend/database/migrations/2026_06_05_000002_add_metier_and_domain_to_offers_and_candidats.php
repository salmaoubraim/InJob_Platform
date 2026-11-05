<?php



use Illuminate\Database\Migrations\Migration;

use Illuminate\Support\Facades\DB;

use Illuminate\Support\Facades\Schema;



return new class extends Migration

{

    public function up(): void

    {

        if (Schema::hasTable('offres_emploi') && ! Schema::hasColumn('offres_emploi', 'id_metier')) {

            DB::statement('ALTER TABLE `offres_emploi` ADD COLUMN `id_metier` int(11) DEFAULT NULL AFTER `id_categorie`');

            DB::statement('ALTER TABLE `offres_emploi` ADD KEY `offres_emploi_id_metier_index` (`id_metier`)');

        }



        if (Schema::hasTable('candidats') && ! Schema::hasColumn('candidats', 'id_categorie')) {

            DB::statement('ALTER TABLE `candidats` ADD COLUMN `id_categorie` int(11) DEFAULT NULL AFTER `id_user`');

            DB::statement('ALTER TABLE `candidats` ADD KEY `candidats_id_categorie_index` (`id_categorie`)');

        }

    }



    public function down(): void

    {

        if (Schema::hasColumn('offres_emploi', 'id_metier')) {

            DB::statement('ALTER TABLE `offres_emploi` DROP COLUMN `id_metier`');

        }



        if (Schema::hasColumn('candidats', 'id_categorie')) {

            DB::statement('ALTER TABLE `candidats` DROP COLUMN `id_categorie`');

        }

    }

};

