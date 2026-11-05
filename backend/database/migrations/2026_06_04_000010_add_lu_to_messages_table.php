<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasColumn('messages', 'lu')) {
            Schema::table('messages', function (Blueprint $table) {
                $table->boolean('lu')->default(false)->after('contenu');
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasColumn('messages', 'lu')) {
            Schema::table('messages', function (Blueprint $table) {
                $table->dropColumn('lu');
            });
        }
    }
};
