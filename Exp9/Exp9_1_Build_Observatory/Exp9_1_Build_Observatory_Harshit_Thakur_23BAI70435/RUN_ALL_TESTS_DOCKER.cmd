@echo off
setlocal
cd /d "%~dp0"
echo Docker Desktop must be running in Linux containers mode.
call mvnw.cmd clean verify -Pfull
pause
