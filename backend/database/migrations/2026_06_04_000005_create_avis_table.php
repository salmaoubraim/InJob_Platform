<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::dropIfExists('avis');

        Schema::create('avis', function (Blueprint $table) {
            $table->id('id_avis');
            $table->unsignedBigInteger('id_user');
            $table->unsignedBigInteger('id_offre')->nullable();
            $table->unsignedTinyInteger('note');
            $table->text('commentaire');
            $table->timestamp('created_at')->useCurrent();

            $table->index('id_user');
            $table->index('id_offre');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('avis');
    }
};

