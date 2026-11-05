<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('recruteurs', function (Blueprint $table) {
            $table->id('id_recruteur');
            $table->foreignId('id_user')->constrained('utilisateurs', 'id_user')->cascadeOnDelete();
            $table->string('nom_entreprise');
            $table->text('description_entreprise')->nullable();
            $table->string('ville')->nullable();
            $table->string('site_web')->nullable();
            $table->string('logo')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('recruteurs');
    }
};
