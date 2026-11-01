@echo off
cd /d "%~dp0"
title CanaryDock Backend (:8080) - Harshit Thakur

if exist "C:\Program Files\Eclipse Adoptium\jdk-17.0.20.101-hotspot\bin\java.exe" (
    set "JAVA_HOME=C:\Program Files\Eclipse Adoptium\jdk-17.0.20.101-hotspot"
    set "PATH=C:\Program Files\Eclipse Adoptium\jdk-17.0.20.101-hotspot\bin;%PATH%"
)

echo ==============================================================
echo   CANARYDOCK BACKEND - RELEASE ENGINEERING TELEMETRY
echo   Harshit Thakur  ^|  23BAI70435  ^|  Full Stack II
echo   Listening on: http://localhost:8080
echo ==============================================================

if exist "dist\canarydock.jar" (
    java -jar dist\canarydock.jar
) else (
    call .\mvnw.cmd spring-boot:run
)
pause
