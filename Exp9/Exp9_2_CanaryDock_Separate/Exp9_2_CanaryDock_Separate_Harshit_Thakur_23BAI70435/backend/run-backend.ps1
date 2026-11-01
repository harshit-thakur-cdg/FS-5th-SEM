# CanaryDock Spring Boot Backend Launcher - Harshit Thakur (23BAI70435)
$host.UI.RawUI.WindowTitle = "CanaryDock Spring Boot Backend (:8080) - Harshit Thakur"

$jdkPaths = @(
    "C:\Program Files\Eclipse Adoptium\jdk-17.0.20.101-hotspot",
    "C:\Program Files\Java\jdk-17",
    "C:\Program Files\Java\jdk-21",
    $env:JAVA_HOME
)

foreach ($path in $jdkPaths) {
    if ($path -and (Test-Path "$path\bin\java.exe")) {
        $env:JAVA_HOME = $path
        $env:Path = "$path\bin;$env:Path"
        break
    }
}

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "  CANARYDOCK BACKEND - RELEASE ENGINEERING TELEMETRY" -ForegroundColor White
Write-Host "  Student: Harshit Thakur  |  UID: 23BAI70435" -ForegroundColor Yellow
Write-Host "  Port:    http://localhost:8080" -ForegroundColor Green
Write-Host "  JAVA_HOME: $env:JAVA_HOME" -ForegroundColor Gray
Write-Host "==========================================================" -ForegroundColor Cyan

if (Test-Path "dist\canarydock.jar") {
    Write-Host "Running prebuilt dist\canarydock.jar..." -ForegroundColor Green
    java -jar dist\canarydock.jar
} else {
    Write-Host "Running with Maven Wrapper..." -ForegroundColor Green
    .\mvnw.cmd spring-boot:run
}
