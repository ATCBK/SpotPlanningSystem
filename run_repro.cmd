@echo off
cd /d d:\Project_building\SpotPlanningSystem\frontend
start "vite-dev" /b npm run dev -- --host 127.0.0.1 --port 5173
ping 127.0.0.1 -n 10 >nul
node repro.cjs > ..\repro_out.txt
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5173 ^| findstr LISTENING') do taskkill /F /PID %%a
