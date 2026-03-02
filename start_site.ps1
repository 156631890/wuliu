$ErrorActionPreference = 'Stop'
Set-Location "$PSScriptRoot"

# Bypass local proxy for local development server
$env:NO_PROXY = 'localhost,127.0.0.1,192.168.110.92'
$env:HTTP_PROXY = ''
$env:HTTPS_PROXY = ''

Write-Host 'Starting site at http://127.0.0.1:8080/index.html' -ForegroundColor Green
Write-Host 'LAN URL: http://192.168.110.92:8080/index.html' -ForegroundColor Green
python -m http.server 8080 --bind 0.0.0.0
