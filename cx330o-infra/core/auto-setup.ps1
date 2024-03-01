# cx330o Sales Platform — Auto-initialization Script
# Start containers + auto-create admin accounts for FlowEngine and Analytics

$ErrorActionPreference = "Continue"

Write-Host "`n===== cx330o Sales Platform — Infrastructure Setup =====" -ForegroundColor Cyan

# 1. Start containers
Write-Host "`n[1/3] Starting Docker containers..." -ForegroundColor Yellow
docker compose up -d 2>&1 | Out-Null
Start-Sleep 5

# 2. Wait for FlowEngine and create owner
Write-Host "[2/3] Configuring FlowEngine admin..." -ForegroundColor Yellow
for ($i = 1; $i -le 30; $i++) {
    try {
        $r = Invoke-WebRequest -Uri "http://localhost:5678/rest/settings" -UseBasicParsing -TimeoutSec 3 -ErrorAction Stop
        break
    } catch {
        Start-Sleep 3
    }
}

try {
    $flowBody = @{
        email = "admin@cx330o.com"
        firstName = "cx330o"
        lastName = "Admin"
        password = "cx330o2026"
    } | ConvertTo-Json

    $r = Invoke-RestMethod -Uri "http://localhost:5678/rest/owner/setup" -Method POST -ContentType "application/json" -Body $flowBody -ErrorAction Stop
    Write-Host "  FlowEngine admin created: admin@cx330o.com / cx330o2026" -ForegroundColor Green
} catch {
    $msg = $_.Exception.Message
    if ($msg -match "already") {
        Write-Host "  FlowEngine admin already exists, skipping" -ForegroundColor DarkGray
    } else {
        Write-Host "  FlowEngine setup: $msg" -ForegroundColor DarkGray
    }
}

# 3. Wait for Analytics and complete setup
Write-Host "[3/3] Configuring Analytics admin..." -ForegroundColor Yellow
$setupToken = $null
for ($i = 1; $i -le 40; $i++) {
    try {
        $props = Invoke-RestMethod -Uri "http://localhost:3030/api/session/properties" -TimeoutSec 5 -ErrorAction Stop
        $setupToken = $props.'setup-token'
        if ($setupToken) { break }
        if ($null -eq $setupToken) {
            Write-Host "  Analytics already initialized, skipping" -ForegroundColor DarkGray
            break
        }
    } catch {
        Start-Sleep 5
    }
}

if ($setupToken) {
    try {
        $analyticsBody = @{
            token = $setupToken
            prefs = @{
                site_name = "cx330o Sales Analytics"
                site_locale = "zh"
                allow_tracking = $false
            }
            user = @{
                email = "admin@cx330o.com"
                first_name = "cx330o"
                last_name = "Admin"
                password = "cx330o2026"
                site_name = "cx330o Sales Analytics"
            }
            database = $null
        } | ConvertTo-Json -Depth 5

        $r = Invoke-RestMethod -Uri "http://localhost:3030/api/setup" -Method POST -ContentType "application/json" -Body $analyticsBody -ErrorAction Stop
        Write-Host "  Analytics admin created: admin@cx330o.com / cx330o2026" -ForegroundColor Green
    } catch {
        Write-Host "  Analytics setup: $($_.Exception.Message)" -ForegroundColor DarkGray
    }
}

Write-Host "`n===== Setup Complete =====" -ForegroundColor Cyan
Write-Host "  FlowEngine: http://localhost:5678   (admin@cx330o.com / cx330o2026)" -ForegroundColor White
Write-Host "  Analytics:  http://localhost:3030   (admin@cx330o.com / cx330o2026)" -ForegroundColor White
Write-Host ""
