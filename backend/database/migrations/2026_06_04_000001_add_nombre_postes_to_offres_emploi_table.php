<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('offres_emploi', function (Blueprint $table) {
            if (! Schema::hasColumn('offres_emploi', 'nombre_postes')) {
                $table->unsignedSmallInteger('nombre_postes')->default(1)->after('salaire');
            }
        });
    }

    public function down(): void
    {
        Schema::table('offres_emploi', function (Blueprint $table) {
            if (Schema::hasColumn('offres_emploi', 'nombre_postes')) {
                $table->dropColumn('nombre_postes');
            }
        });
    }
};
