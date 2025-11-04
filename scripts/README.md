Run helper scripts

run_stack_and_smoke.ps1
- Purpose: start the backend, wait for health, run the smoke API test (create → list → delete), then stop the backend.
- Usage (PowerShell):

```powershell
# from repo root
.\scripts\run_stack_and_smoke.ps1
```

Notes:
- The script uses node and PowerShell Start-Process; run it in a normal PowerShell prompt.
- If you see intermittent connection refused errors from PowerShell built-ins, prefer the node-based probes (we use node in the smoke test) or test in the browser.
