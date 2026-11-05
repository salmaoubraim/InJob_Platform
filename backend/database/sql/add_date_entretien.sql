-- Exécuter dans phpMyAdmin si la migration Laravel n'est pas disponible
-- Base : injob_platform (ou le nom configuré dans .env)

UPDATE candidatures SET statut = 'en_attente' WHERE statut IN ('En attente', 'en attente');
UPDATE candidatures SET statut = 'acceptee' WHERE statut IN ('Acceptee', 'Acceptée', 'acceptée');
UPDATE candidatures SET statut = 'refusee' WHERE statut IN ('Refusee', 'Refusée', 'refusée');

ALTER TABLE candidatures
  MODIFY statut ENUM('en_attente','acceptee','refusee','entretien_programme') NOT NULL DEFAULT 'en_attente';

ALTER TABLE candidatures
  ADD COLUMN date_entretien DATETIME NULL AFTER date_candidature;
