<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('cv', function (Blueprint $table) {
            $table->id('id_cv');
            $table->foreignId('id_candidat')->constrained('candidats', 'id_candidat')->cascadeOnDelete();
            $table->string('nom_fichier');
            $table->string('chemin_fichier');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cv');
    }
};
