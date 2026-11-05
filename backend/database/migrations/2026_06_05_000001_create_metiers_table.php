<?php



use Illuminate\Database\Migrations\Migration;

use Illuminate\Support\Facades\DB;

use Illuminate\Support\Facades\Schema;



return new class extends Migration

{

    public function up(): void

    {

        if (Schema::hasTable('metiers')) {

            return;

        }



        if (Schema::hasTable('offres_emploi') && Schema::hasColumn('offres_emploi', 'id_metier')) {

            $foreignKeys = DB::select(

                "SELECT CONSTRAINT_NAME FROM information_schema.KEY_COLUMN_USAGE

                 WHERE TABLE_SCHEMA = DATABASE()

                 AND TABLE_NAME = 'offres_emploi'

                 AND COLUMN_NAME = 'id_metier'

                 AND REFERENCED_TABLE_NAME IS NOT NULL"

            );



            foreach ($foreignKeys as $fk) {

                DB::statement('ALTER TABLE `offres_emploi` DROP FOREIGN KEY `'.$fk->CONSTRAINT_NAME.'`');

            }

        }



        DB::statement(<<<'SQL'

CREATE TABLE `metiers` (

  `id_metier` int(11) NOT NULL AUTO_INCREMENT,

  `id_categorie` int(11) NOT NULL,

  `nom_metier` varchar(255) NOT NULL,

  `description` text DEFAULT NULL,

  `created_at` timestamp NULL DEFAULT NULL,

  `updated_at` timestamp NULL DEFAULT NULL,

  PRIMARY KEY (`id_metier`),

  KEY `metiers_id_categorie_index` (`id_categorie`)

) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci

SQL);

    }



    public function down(): void

    {

        DB::statement('SET FOREIGN_KEY_CHECKS=0');

        Schema::dropIfExists('metiers');

        DB::statement('SET FOREIGN_KEY_CHECKS=1');

    }

};

