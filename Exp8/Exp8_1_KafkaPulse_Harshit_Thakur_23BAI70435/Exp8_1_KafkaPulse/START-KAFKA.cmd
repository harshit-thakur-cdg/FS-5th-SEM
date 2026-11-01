@echo off
cd /d "%~dp0backend"
docker compose up -d --wait
if errorlevel 1 (echo Start Docker Desktop, then retry. Check that port 9092 is free.)
pause
