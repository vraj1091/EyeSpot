@echo off
REM ===============================================
REM   EyeSpot Video Analytics - ngrok Setup Script
REM   Run this to expose your app globally
REM ===============================================

echo.
echo ============================================
echo   EyeSpot Video Analytics - Global Deployment
echo ============================================
echo.

REM Step 1: Build Frontend
echo [1/3] Building frontend for production...
cd /d "%~dp0frontend"
call npm run build
if errorlevel 1 (
    echo [ERROR] Frontend build failed! Make sure npm packages are installed.
    echo         Run: cd frontend ^& npm install ^& npm run build
    pause
    exit /b 1
)

echo [OK] Frontend built successfully!
echo.

REM Step 2: Start Backend
echo [2/3] Starting backend server...
cd /d "%~dp0backend"
start "EyeSpot-Backend" cmd /k "python run.py"

REM Wait for backend to start
echo     Waiting for backend to initialize (15 seconds)...
timeout /t 15 /nobreak > nul

echo [OK] Backend started on port 8000
echo.

REM Step 3: Start ngrok
echo [3/3] Starting ngrok tunnel...
echo.
echo =============================================
echo   Copy the "Forwarding" URL from ngrok below
echo   Share it with anyone to access your app!
echo =============================================
echo.

ngrok http 8000

pause
