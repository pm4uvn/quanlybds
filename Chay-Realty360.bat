@echo off
chcp 65001 >nul
title Realty360 - Dang khoi dong...
cd /d "%~dp0"

if not exist "node_modules" (
    echo Lan dau chay - dang cai dat thu vien, vui long doi...
    call npm install
)

echo Dang khoi dong Realty360...
start "" cmd /k "npm run dev"

echo Dang mo trinh duyet, vui long doi vai giay...
timeout /t 5 /nobreak >nul
start "" http://localhost:3000

exit
