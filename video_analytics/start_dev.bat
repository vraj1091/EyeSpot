@echo off
echo Starting Video Analytics System Dev Environment...

echo [1/2] Installing Python Dependencies (if needed)...
pip install -r video_analytics\backend\requirements.txt

echo [2/2] Starting Services...

echo Starting Backend API (Port 8000)...
start "Video Analytics Backend" cmd /k "cd video_analytics\backend && echo Running Backend... && python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000 || (echo FAILED. Press any key to exit. && pause)"

echo Starting Frontend App (Port 5173)...
start "Video Analytics Frontend" cmd /k "cd video_analytics\frontend && echo Running Frontend... && npm install && npm run dev || (echo FAILED. Press any key to exit. && pause)"

echo ===================================================
echo Services create separate windows. check them for errors.
echo Backend API: http://localhost:8000/docs
echo Frontend App: http://localhost:5173
echo ===================================================
pause
