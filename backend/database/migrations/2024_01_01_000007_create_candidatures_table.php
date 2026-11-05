<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('candidatures', function (Blueprint $table) {
            $table->id('id_candidature');
            $table->foreignId('id_offre')->constrained('offres_emploi', 'id_offre')->cascadeOnDelete();
            $table->foreignId('id_candidat')->constrained('candidats', 'id_candidat')->cascadeOnDelete();
            $table->enum('statut', ['en_attente', 'acceptee', 'refusee'])->default('en_attente');
            $table->timestamp('date_candidature')->useCurrent();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('candidatures');
    }
};
