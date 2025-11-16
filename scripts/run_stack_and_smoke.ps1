# Helper script to start backend, wait for health, run smoke test, then stop backend
# Usage: Open PowerShell (as your normal user) in the repo root and run:
#   .\scripts\run_stack_and_smoke.ps1

$ErrorActionPreference = 'Stop'

# Paths
$root = Resolve-Path (Join-Path $PSScriptRoot '..')
$backendPath = Join-Path $root 'backend'
$frontendPath = Join-Path $root 'frontend'
$serverScript = Join-Path $backendPath 'server.js'
$smokeScript = Join-Path $backendPath 'scripts\smoke_api_test.js'

Write-Host "Starting backend (node $serverScript) in background..."
$backendProc = Start-Process -FilePath node -ArgumentList "`"$serverScript`"" -WorkingDirectory $backendPath -PassThru
Write-Host "Backend started, PID=$($backendProc.Id)"

# Wait for backend health endpoint
$healthUrl = 'http://127.0.0.1:5000/api/health'
$maxWait = 30 # seconds
$start = Get-Date
while ((Get-Date) - $start).TotalSeconds -lt $maxWait {
    try {
        $r = Invoke-RestMethod -Uri $healthUrl -Method Get -TimeoutSec 3 -ErrorAction Stop
        Write-Host "Backend health OK:" (ConvertTo-Json $r -Compress)
        break
    } catch {
        Write-Host -NoNewline "."
        Start-Sleep -Seconds 1
    }
}

if (-not $r) {
    Write-Host "Backend did not become healthy within $maxWait seconds. Stopping backend and exiting with error."
    if ($backendProc -and $backendProc.HasExited -ne $true) { Stop-Process -Id $backendProc.Id -Force }
    exit 1
}

# Start frontend dev server (CRA)
Write-Host "Starting frontend (npm start) in background..."
$frontendProc = Start-Process -FilePath npm -ArgumentList 'start' -WorkingDirectory $frontendPath -PassThru
Write-Host "Frontend started, PID=$($frontendProc.Id)"

# Wait briefly for frontend to compile and listen on 3000 (best-effort)
$frontUrl = 'http://127.0.0.1:3000'
$maxFrontWait = 60
$startF = Get-Date
$frontUp = $false
while ((Get-Date) - $startF).TotalSeconds -lt $maxFrontWait {
    try {
        $resp = Invoke-RestMethod -Uri $frontUrl -Method Get -TimeoutSec 3 -ErrorAction Stop
        Write-Host "Frontend responding at $frontUrl"
        $frontUp = $true
        break
    } catch {
        Write-Host -NoNewline "."
        Start-Sleep -Seconds 1
    }
}
if (-not $frontUp) { Write-Host "Frontend did not respond at $frontUrl within $maxFrontWait seconds. You can open the browser manually using the URLs printed by CRA." }

# Run the smoke test (uses node)
Write-Host "Running smoke test script: $smokeScript"
$smoke = Start-Process -FilePath node -ArgumentList "`"$smokeScript`"" -NoNewWindow -Wait -PassThru
$exitCode = $smoke.ExitCode
Write-Host "Smoke script exit code: $exitCode"

# Stop frontend and backend processes we started
if ($frontendProc -and $frontendProc.HasExited -ne $true) {
    Write-Host "Stopping frontend PID $($frontendProc.Id)"
    Stop-Process -Id $frontendProc.Id -Force -ErrorAction SilentlyContinue
}

if ($backendProc -and $backendProc.HasExited -ne $true) {
    Write-Host "Stopping backend PID $($backendProc.Id)"
    Stop-Process -Id $backendProc.Id -Force -ErrorAction SilentlyContinue
}

exit $exitCode
