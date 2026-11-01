@echo off
cd /d "%~dp0backend"
echo Use this ONLY if no Kafka broker is already running on port 9092.
echo For your working Exp 8.1 broker, close this window and start the Exp 8.2 backend directly.
pause
docker compose up -d --wait
pause
