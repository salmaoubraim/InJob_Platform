-- À exécuter si la migration ne passe pas (php artisan migrate)
ALTER TABLE messages
  ADD COLUMN IF NOT EXISTS lu TINYINT(1) NOT NULL DEFAULT 0 AFTER contenu;
