@echo off
cd /d "%~dp0frontend"
if not exist node_modules (
 call npm ci
 if errorlevel 1 goto failed
)
echo Open http://localhost:3002 after Vite starts.
call npm run dev
:failed
pause
