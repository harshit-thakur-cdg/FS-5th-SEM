if (-not $env:JAVA_HOME -or -not (Test-Path $env:JAVA_HOME)) {
    if (Test-Path "C:\Program Files\Eclipse Adoptium\jdk-17.0.20.101-hotspot") {
        $env:JAVA_HOME = "C:\Program Files\Eclipse Adoptium\jdk-17.0.20.101-hotspot"
    }
}
.\mvnw.cmd spring-boot:run
