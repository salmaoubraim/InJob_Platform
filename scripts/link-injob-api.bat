@echo off
chcp 65001 >nul
set BACKEND=E:\inJob\backend\public
set HTDOCS=C:\Users\Admin\Desktop\projets2\htdocs
set LINK=%HTDOCS%\injob-api

echo Liaison API Laravel vers htdocs...
echo   %LINK%
echo   -^> %BACKEND%
echo.

if not exist "%BACKEND%\index.php" (
    echo ERREUR: backend public introuvable
    pause
    exit /b 1
)

if exist "%LINK%" (
    rmdir "%LINK%" 2>nul
    if exist "%LINK%" (
        echo Supprimez manuellement %LINK% puis relancez ce script.
        pause
        exit /b 1
    )
)

mklink /J "%LINK%" "%BACKEND%"
if errorlevel 1 (
    echo ERREUR: mklink a echoue. Lancez ce script en Administrateur.
    pause
    exit /b 1
)

echo OK. Testez: http://localhost/injob-api/api/login
if not "%~1"=="silent" pause
