-- Corrige l'erreur : Data truncated for column 'type_notification'
-- À exécuter dans phpMyAdmin (base injob_platform) si artisan migrate ne fonctionne pas.

ALTER TABLE `notifications`
  MODIFY `type_notification` VARCHAR(50) NOT NULL DEFAULT 'systeme';

ALTER TABLE `notifications`
  MODIFY `type` VARCHAR(50) NOT NULL DEFAULT 'systeme';
