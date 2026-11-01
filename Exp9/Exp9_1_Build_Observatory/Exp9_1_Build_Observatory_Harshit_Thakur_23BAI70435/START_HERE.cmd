@echo off
setlocal
cd /d "%~dp0"

if not defined JAVA_HOME (
    if exist "C:\Program Files\Eclipse Adoptium\jdk-17.0.20.101-hotspot" (
        set "JAVA_HOME=C:\Program Files\Eclipse Adoptium\jdk-17.0.20.101-hotspot"
    ) else if exist "C:\Program Files\Java\jdk-17" (
        set "JAVA_HOME=C:\Program Files\Java\jdk-17"
    )
)
if defined JAVA_HOME (
    set "PATH=%JAVA_HOME%\bin;%PATH%"
    echo Using JAVA_HOME: %JAVA_HOME%
)

echo ========================================================
echo Build Observatory - Harshit Thakur (UID: 23BAI70435)
echo Experiment 9.1: Continuous Integration Pipeline Setup
echo ========================================================
echo Open http://localhost:8400 after Spring Boot starts.
call mvnw.cmd spring-boot:run
pause
