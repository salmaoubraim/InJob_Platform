@echo off
REM Usage : artisan-injob.bat migrate
if "%~1"=="" (
    echo Usage: %~nx0 migrate
    echo        %~nx0 key:generate
    exit /b 1
)
set PHP=C:\Users\Admin\Desktop\file reste dans s4 et pfe\projets2\php\php.exe
cd /d E:\inJob\backend
"%PHP%" artisan %*
