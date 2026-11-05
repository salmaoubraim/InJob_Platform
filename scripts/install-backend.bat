@echo off
chcp 65001 >nul
echo ==========================================
echo   Installation backend InJob (3 etapes)
echo ==========================================
echo.
echo IMPORTANT : lancez UNE commande a la fois,
echo ou utilisez ce script (tout automatique).
echo.

set PHP=C:\Users\Admin\Desktop\file reste dans s4 et pfe\projets2\php\php.exe
set COMPOSER_PHAR=C:\Users\composer.phar
set BACKEND=E:\inJob\backend

cd /d "%BACKEND%"

if not exist ".env" (
    echo Creation du fichier .env...
    copy /Y .env.example .env
)

echo.
echo [1/3] composer install ...
"%PHP%" "%COMPOSER_PHAR%" install --no-interaction
if errorlevel 1 goto :erreur

echo.
echo [2/3] php artisan key:generate ...
"%PHP%" artisan key:generate --force
if errorlevel 1 goto :erreur

echo.
echo [3/3] php artisan migrate ...
"%PHP%" artisan migrate --force
if errorlevel 1 goto :erreur

echo.
echo ==========================================
echo   Installation terminee avec succes !
echo ==========================================
echo   API : http://localhost/injob-api
echo   App : http://localhost/injob
echo.
pause
exit /b 0

:erreur
echo.
echo ERREUR - verifiez MySQL demarre et la base injob_platform existe.
pause
exit /b 1
