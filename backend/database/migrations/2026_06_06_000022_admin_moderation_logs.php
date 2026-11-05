<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('admin_moderation_logs')) {
            return;
        }

        Schema::create('admin_moderation_logs', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('id_user');
            $table->unsignedBigInteger('id_admin')->nullable();
            $table->string('action', 32);
            $table->text('message')->nullable();
            $table->timestamp('created_at')->useCurrent();

            $table->index('id_user');
            $table->index('action');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('admin_moderation_logs');
    }
};
