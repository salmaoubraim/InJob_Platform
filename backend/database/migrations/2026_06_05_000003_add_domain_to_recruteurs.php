<?php



use Illuminate\Database\Migrations\Migration;

use Illuminate\Support\Facades\DB;

use Illuminate\Support\Facades\Schema;



return new class extends Migration

{

    public function up(): void

    {

        if (Schema::hasTable('recruteurs') && ! Schema::hasColumn('recruteurs', 'id_categorie')) {

            DB::statement('ALTER TABLE `recruteurs` ADD COLUMN `id_categorie` int(11) DEFAULT NULL AFTER `id_user`');

            DB::statement('ALTER TABLE `recruteurs` ADD KEY `recruteurs_id_categorie_index` (`id_categorie`)');

        }

    }



    public function down(): void

    {

        if (Schema::hasColumn('recruteurs', 'id_categorie')) {

            DB::statement('ALTER TABLE `recruteurs` DROP COLUMN `id_categorie`');

        }

    }

};

