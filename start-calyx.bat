@echo off
setlocal
cd /d "%~dp0"
set PORT=8787
echo Starting Project Calyx on http://127.0.0.1:%PORT%
node scripts\start-calyx.mjs
