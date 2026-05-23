@echo off
echo Starting Backend Server...
cd /d "%~dp0backend"
start cmd /k "npm run dev"

echo Starting Frontend Server...
cd /d "%~dp0frontend"
start cmd /k "npm run dev"

echo Both servers are starting...
echo Backend: http://localhost:5000
echo Frontend: http://localhost:3000
pause
