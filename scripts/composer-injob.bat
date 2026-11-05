@echo off
REM Usage : composer-injob.bat install
REM NE PAS utiliser la variable COMPOSER (reservee par Composer)
setlocal
set PHP=C:\Users\Admin\Desktop\file reste dans s4 et pfe\projets2\php\php.exe
set COMPOSER_PHAR=C:\Users\composer.phar

if "%~1"=="" (
    echo Usage: %~nx0 install
    echo Ou: E:\inJob\scripts\install-backend.bat
    exit /b 1
)

if not exist "%COMPOSER_PHAR%" (
    echo ERREUR: Fichier introuvable: %COMPOSER_PHAR%
    pause
    exit /b 1
)

cd /d E:\inJob\backend
"%PHP%" "%COMPOSER_PHAR%" %*
endlocal
