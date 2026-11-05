<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('candidats', function (Blueprint $table) {
            $table->id('id_candidat');
            $table->foreignId('id_user')->constrained('utilisateurs', 'id_user')->cascadeOnDelete();
            $table->date('date_naissance')->nullable();
            $table->string('ville')->nullable();
            $table->text('adresse')->nullable();
            $table->text('competences')->nullable();
            $table->text('experience')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('candidats');
    }
};
