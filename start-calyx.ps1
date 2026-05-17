$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $root
$port = if ($env:PORT) { $env:PORT } else { "8787" }
Write-Host "Starting Project Calyx on http://127.0.0.1:$port"
node scripts/start-calyx.mjs
