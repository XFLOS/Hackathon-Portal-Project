# Collect network and firewall diagnostics for troubleshooting loopback/connectivity issues
# Run from repo root: .\scripts\collect_network_diagnostics.ps1

$timestamp = (Get-Date).ToString('yyyyMMdd-HHmmss')
$out = Join-Path $PSScriptRoot "network-diagnostics-$timestamp.txt"
Write-Host "Collecting network diagnostics to $out"

Add-Content -Path $out -Value "Network diagnostics collected at: $(Get-Date)"
Add-Content -Path $out -Value "\n--- ipconfig /all ---\n"
ipconfig /all | Out-String | Add-Content -Path $out

Add-Content -Path $out -Value "\n--- Get-NetAdapter ---\n"
try { Get-NetAdapter | Format-List * | Out-String | Add-Content -Path $out } catch { Add-Content -Path $out -Value "Get-NetAdapter failed: $_" }

Add-Content -Path $out -Value "\n--- Get-NetIPConfiguration ---\n"
try { Get-NetIPConfiguration | Out-String | Add-Content -Path $out } catch { Add-Content -Path $out -Value "Get-NetIPConfiguration failed: $_" }

Add-Content -Path $out -Value "\n--- Netstat (TCP listeners) ---\n"
netstat -ano | Select-String ":LISTENING" | Out-String | Add-Content -Path $out

Add-Content -Path $out -Value "\n--- Get-NetTCPConnection for common ports ---\n"
try { Get-NetTCPConnection -LocalPort 3000,3001,5000 -ErrorAction SilentlyContinue | Format-List * | Out-String | Add-Content -Path $out } catch { Add-Content -Path $out -Value "Get-NetTCPConnection failed: $_" }

Add-Content -Path $out -Value "\n--- Get-Process (node processes) ---\n"
Get-Process node -ErrorAction SilentlyContinue | Format-List * | Out-String | Add-Content -Path $out

Add-Content -Path $out -Value "\n--- Get-NetFirewallProfile ---\n"
try { Get-NetFirewallProfile | Format-List * | Out-String | Add-Content -Path $out } catch { Add-Content -Path $out -Value "Get-NetFirewallProfile failed: $_" }

Add-Content -Path $out -Value "\n--- Get-NetFirewallRule (top 200) ---\n"
try { Get-NetFirewallRule -ErrorAction SilentlyContinue | Select-Object -First 200 | Format-List * | Out-String | Add-Content -Path $out } catch { Add-Content -Path $out -Value "Get-NetFirewallRule failed: $_" }

Add-Content -Path $out -Value "\n--- End of diagnostics ---\n"
Write-Host "Diagnostics written to $out"
