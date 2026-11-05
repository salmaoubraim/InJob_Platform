<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('offres_emploi', function (Blueprint $table) {
            $table->id('id_offre');
            $table->foreignId('id_recruteur')->constrained('recruteurs', 'id_recruteur')->cascadeOnDelete();
            $table->foreignId('id_categorie')->constrained('categories', 'id_categorie')->cascadeOnDelete();
            $table->string('titre');
            $table->text('description');
            $table->string('ville')->nullable();
            $table->string('type_contrat')->nullable();
            $table->decimal('salaire', 12, 2)->nullable();
            $table->date('date_publication')->nullable();
            $table->date('date_expiration')->nullable();
            $table->enum('statut', ['active', 'inactive', 'expiree'])->default('active');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('offres_emploi');
    }
};
