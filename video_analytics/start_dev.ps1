Write-Host "Starting Video Analytics System..." -ForegroundColor Green

$root = Get-Location

# Start Backend
Write-Host "Starting Backend..."
$backendPath = Join-Path $root "video_analytics\backend"
Start-Process -FilePath "cmd.exe" -ArgumentList "/k cd /d `"$backendPath`" && python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000"

# Start Frontend
Write-Host "Starting Frontend..."
$frontendPath = Join-Path $root "video_analytics\frontend"
Start-Process -FilePath "cmd.exe" -ArgumentList "/k cd /d `"$frontendPath`" && npm run dev"

Write-Host "Services started!" -ForegroundColor Green
