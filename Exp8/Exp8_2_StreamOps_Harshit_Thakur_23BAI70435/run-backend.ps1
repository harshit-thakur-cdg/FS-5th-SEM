# StreamOps Spring Boot Runner with Auto-JDK Detection
$jdkCandidate = "C:\Program Files\Eclipse Adoptium\jdk-17.0.20.101-hotspot"
if (Test-Path $jdkCandidate) {
    $env:JAVA_HOME = $jdkCandidate
    $env:Path = "$jdkCandidate\bin;$env:Path"
}
cd "$PSScriptRoot\backend"
Write-Host "Starting StreamOps Backend on port 8301 using $env:JAVA_HOME..." -ForegroundColor Cyan
.\mvnw.cmd spring-boot:run
