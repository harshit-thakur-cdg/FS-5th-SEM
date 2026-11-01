# Build Observatory Runner with Auto-JDK Detection
$jdkCandidate = "C:\Program Files\Eclipse Adoptium\jdk-17.0.20.101-hotspot"
if (Test-Path $jdkCandidate) {
    $env:JAVA_HOME = $jdkCandidate
    $env:Path = "$jdkCandidate\bin;$env:Path"
}
cd $PSScriptRoot
Write-Host "Starting Build Observatory on port 8400 (Harshit Thakur - 23BAI70435)..." -ForegroundColor Cyan
.\mvnw.cmd spring-boot:run
