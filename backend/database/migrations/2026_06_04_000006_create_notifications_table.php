<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('notifications', function (Blueprint $table) {
            $table->id('id_notification');
            $table->foreignId('id_user')->constrained('utilisateurs', 'id_user')->cascadeOnDelete();
            $table->string('type', 50);
            $table->string('titre');
            $table->text('message');
            $table->string('lien', 500)->nullable();
            $table->boolean('lu')->default(false);
            $table->timestamp('created_at')->useCurrent();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('notifications');
    }
};
