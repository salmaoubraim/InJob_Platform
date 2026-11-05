@echo off
REM Corrige la base InJob (notifications + contact_messages)
REM Utilise le PHP/MySQL de projets2 — PAS PowerShell pour du SQL.

set MYSQL=C:\Users\Admin\Desktop\projets2\mysql\bin\mysql.exe
set PHP=C:\Users\Admin\Desktop\projets2\php\php.exe

echo === Fix notifications (type_notification VARCHAR) ===
"%MYSQL%" -u root injob_platform -e "ALTER TABLE notifications MODIFY type_notification VARCHAR(50) NOT NULL DEFAULT 'systeme'; ALTER TABLE notifications MODIFY type VARCHAR(50) NOT NULL DEFAULT 'systeme';"

echo === Fix contact_messages (date_lecture) ===
"%MYSQL%" -u root injob_platform -e "ALTER TABLE contact_messages ADD COLUMN IF NOT EXISTS date_lecture TIMESTAMP NULL AFTER date_reponse;"

echo === Migrations Laravel ===
cd /d E:\inJob\backend
"%PHP%" artisan migrate --force

echo.
echo Termine. Rechargez http://localhost/injob/admin/messages
pause
