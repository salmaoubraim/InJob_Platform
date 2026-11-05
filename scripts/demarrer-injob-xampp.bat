@echo off
chcp 65001 >nul
echo ============================================
echo   InJob - Configuration XAMPP (projets2)
echo ============================================
echo.

REM XAMPP actif (voir logs Apache) :
set XAMPP=C:\Users\Admin\Desktop\file reste dans s4 et pfe\projets2
set HTDOCS=C:\Users\Admin\Desktop\projets2\htdocs
set PHP=%XAMPP%\php\php.exe
set PROJECT=E:\inJob

if not exist "%PHP%" (
    echo ERREUR: PHP introuvable dans %XAMPP%\php
    pause
    exit /b 1
)

echo [1/4] Build du frontend pour http://localhost/injob
cd /d "%PROJECT%\frontend"
call npm run build:xampp
if errorlevel 1 (
    echo ERREUR: build frontend echoue
    pause
    exit /b 1
)

echo Copie vers htdocs...
if not exist "%HTDOCS%\injob" mkdir "%HTDOCS%\injob"
xcopy /E /Y "%PROJECT%\frontend\dist\*" "%HTDOCS%\injob\"

echo Liaison API injob-api...
call "%PROJECT%\scripts\link-injob-api.bat" silent

echo.
echo [2/4] Backend - composer et migrations
cd /d "%PROJECT%\backend"
if not exist ".env" copy .env.example .env

"%PHP%" -r "file_exists('.env') && !str_contains(file_get_contents('.env'), 'APP_KEY=base64') && exit(0);" 2>nul
if errorlevel 1 (
    echo Generation de la cle APP_KEY...
    "%PHP%" artisan key:generate
)

echo.
echo Executez si ce n'est pas deja fait:
echo   "%PHP%" %PROJECT%\backend\artisan migrate
echo.

echo [3/4] Verifiez XAMPP Control Panel:
echo   - Apache : Demarrer
echo   - MySQL  : Demarrer
echo   - Base   : injob_platform (phpMyAdmin)
echo.

echo [4/4] Ouvrez dans le navigateur:
echo   Application : http://localhost/injob
echo   API Laravel : http://localhost/injob-api
echo   phpMyAdmin  : http://localhost/phpmyadmin
echo.
echo Redemarrez Apache apres la premiere configuration.
echo.
pause
