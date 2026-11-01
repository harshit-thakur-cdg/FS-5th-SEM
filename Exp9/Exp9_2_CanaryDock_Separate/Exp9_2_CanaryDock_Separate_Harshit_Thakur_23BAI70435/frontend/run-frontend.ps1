# CanaryDock Node Frontend Server Launcher - Harshit Thakur (23BAI70435)
$host.UI.RawUI.WindowTitle = "CanaryDock Frontend (:3000) - Harshit Thakur"

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "  CANARYDOCK FRONTEND SERVER & API PROXY" -ForegroundColor White
Write-Host "  Student: Harshit Thakur  |  UID: 23BAI70435" -ForegroundColor Yellow
Write-Host "  URL:     http://localhost:3000" -ForegroundColor Green
Write-Host "  Proxy:   http://127.0.0.1:8080" -ForegroundColor Gray
Write-Host "==========================================================" -ForegroundColor Cyan

node server.cjs
