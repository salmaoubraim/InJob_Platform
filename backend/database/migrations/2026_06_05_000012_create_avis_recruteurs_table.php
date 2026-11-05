<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('avis_recruteurs')) {
            return;
        }

        Schema::create('avis_recruteurs', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('id_candidat');
            $table->unsignedBigInteger('id_recruteur');
            $table->unsignedBigInteger('id_offre');
            $table->unsignedTinyInteger('note');
            $table->text('commentaire');
            $table->timestamp('created_at')->useCurrent();

            $table->unique(['id_candidat', 'id_recruteur', 'id_offre']);
            $table->index('id_recruteur');
            $table->index('id_offre');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('avis_recruteurs');
    }
};
