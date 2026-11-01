@echo off
setlocal
cd /d "%~dp0frontend"
call npm ci
if errorlevel 1 goto end
call npm run build
:end
pause
