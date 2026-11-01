$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

if (-not $env:JAVA_HOME -or -not (Test-Path $env:JAVA_HOME)) {
    if (Test-Path "C:\Program Files\Eclipse Adoptium\jdk-17.0.20.101-hotspot") {
        $env:JAVA_HOME = "C:\Program Files\Eclipse Adoptium\jdk-17.0.20.101-hotspot"
    }
}

$listener = Get-NetTCPConnection -State Listen -LocalPort 8081 -ErrorAction SilentlyContinue |
    Select-Object -First 1

if ($listener) {
    Write-Warning "Port 8081 is currently in use (PID $($listener.OwningProcess)). Attempting to run anyway or terminate PID $($listener.OwningProcess)."
}

$dataDirectory = Join-Path $PSScriptRoot "data"
$keyPath = Join-Path $dataDirectory "aes-secret.key"
New-Item -ItemType Directory -Path $dataDirectory -Force | Out-Null

if (-not (Test-Path $keyPath)) {
    $keyBytes = New-Object byte[] 32
    $random = [System.Security.Cryptography.RandomNumberGenerator]::Create()

    try {
        $random.GetBytes($keyBytes)
        [System.IO.File]::WriteAllText(
            $keyPath,
            [Convert]::ToBase64String($keyBytes)
        )
    }
    finally {
        $random.Dispose()
    }
}

$env:AES_SECRET_KEY = [System.IO.File]::ReadAllText($keyPath).Trim()
& .\mvnw.cmd spring-boot:run
exit $LASTEXITCODE
