<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('utilisateurs') && ! Schema::hasColumn('utilisateurs', 'est_actif')) {
            DB::statement('ALTER TABLE `utilisateurs` ADD COLUMN `est_actif` tinyint(1) NOT NULL DEFAULT 1 AFTER `role`');
        }

        if (Schema::hasTable('offres_emploi') && ! Schema::hasColumn('offres_emploi', 'est_masquee')) {
            DB::statement('ALTER TABLE `offres_emploi` ADD COLUMN `est_masquee` tinyint(1) NOT NULL DEFAULT 0 AFTER `est_publie`');
        }

        foreach (['avis', 'avis_recruteurs', 'avis_recruteur_candidat'] as $table) {
            if (Schema::hasTable($table) && ! Schema::hasColumn($table, 'est_masque')) {
                DB::statement("ALTER TABLE `{$table}` ADD COLUMN `est_masque` tinyint(1) NOT NULL DEFAULT 0");
            }
            if (Schema::hasTable($table) && ! Schema::hasColumn($table, 'est_signale')) {
                DB::statement("ALTER TABLE `{$table}` ADD COLUMN `est_signale` tinyint(1) NOT NULL DEFAULT 0");
            }
        }

        if (! Schema::hasTable('support_tickets')) {
            DB::statement(<<<'SQL'
CREATE TABLE `support_tickets` (
  `id_ticket` bigint unsigned NOT NULL AUTO_INCREMENT,
  `id_user` bigint unsigned NOT NULL,
  `sujet` varchar(255) NOT NULL,
  `categorie` enum('technique','signalement','compte','bug','plateforme','autre') NOT NULL DEFAULT 'autre',
  `statut` enum('ouvert','en_cours','resolu') NOT NULL DEFAULT 'ouvert',
  `priorite` enum('basse','normale','haute') NOT NULL DEFAULT 'normale',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id_ticket`),
  KEY `support_tickets_id_user_index` (`id_user`),
  KEY `support_tickets_statut_index` (`statut`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
SQL);
        }

        if (! Schema::hasTable('support_messages')) {
            DB::statement(<<<'SQL'
CREATE TABLE `support_messages` (
  `id_message` bigint unsigned NOT NULL AUTO_INCREMENT,
  `id_ticket` bigint unsigned NOT NULL,
  `id_user` bigint unsigned NOT NULL,
  `contenu` text NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id_message`),
  KEY `support_messages_id_ticket_index` (`id_ticket`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
SQL);
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('support_messages')) {
            DB::statement('DROP TABLE `support_messages`');
        }
        if (Schema::hasTable('support_tickets')) {
            DB::statement('DROP TABLE `support_tickets`');
        }
        foreach (['avis_recruteur_candidat', 'avis_recruteurs', 'avis'] as $table) {
            if (Schema::hasColumn($table, 'est_signale')) {
                DB::statement("ALTER TABLE `{$table}` DROP COLUMN `est_signale`");
            }
            if (Schema::hasColumn($table, 'est_masque')) {
                DB::statement("ALTER TABLE `{$table}` DROP COLUMN `est_masque`");
            }
        }
        if (Schema::hasColumn('offres_emploi', 'est_masquee')) {
            DB::statement('ALTER TABLE `offres_emploi` DROP COLUMN `est_masquee`');
        }
        if (Schema::hasColumn('utilisateurs', 'est_actif')) {
            DB::statement('ALTER TABLE `utilisateurs` DROP COLUMN `est_actif`');
        }
    }
};
