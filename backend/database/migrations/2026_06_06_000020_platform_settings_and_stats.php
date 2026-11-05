<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('platform_settings')) {
            Schema::create('platform_settings', function (Blueprint $table) {
                $table->id();
                $table->string('site_name')->default('InJob');
                $table->string('default_language', 5)->default('fr');
                $table->boolean('dark_mode')->default(false);
                $table->boolean('notify_inscriptions')->default(true);
                $table->boolean('notify_offres')->default(true);
                $table->boolean('notify_candidatures')->default(true);
                $table->boolean('notify_support')->default(true);
                $table->boolean('notify_avis')->default(true);
                $table->boolean('notify_security')->default(true);
                $table->boolean('maintenance_mode')->default(false);
                $table->unsignedSmallInteger('session_timeout_minutes')->nullable();
                $table->timestamps();
            });

            DB::table('platform_settings')->insert([
                'site_name' => 'InJob',
                'default_language' => 'fr',
                'dark_mode' => false,
                'notify_inscriptions' => true,
                'notify_offres' => true,
                'notify_candidatures' => true,
                'notify_support' => true,
                'notify_avis' => true,
                'notify_security' => true,
                'maintenance_mode' => false,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('platform_settings');
    }
};
