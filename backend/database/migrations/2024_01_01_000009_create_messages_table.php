<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('messages', function (Blueprint $table) {
            $table->id('id_message');
            $table->foreignId('expediteur')->constrained('utilisateurs', 'id_user')->cascadeOnDelete();
            $table->foreignId('destinataire')->constrained('utilisateurs', 'id_user')->cascadeOnDelete();
            $table->text('contenu');
            $table->timestamp('date_envoi')->useCurrent();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('messages');
    }
};
