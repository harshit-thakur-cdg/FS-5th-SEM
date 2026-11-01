@echo off
setlocal
cd /d "%~dp0backend"

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

echo Starting KafkaPulse Spring Boot Backend (Port 8300)...
call mvnw.cmd spring-boot:run
pause
