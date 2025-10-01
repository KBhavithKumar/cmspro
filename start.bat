@echo off
echo.
echo ========================================
echo   Customer Management System
echo ========================================
echo.

REM Check if .env exists
if not exist ".env" (
    echo [ERROR] .env file not found!
    echo.
    echo Please create .env file with your Firebase config.
    echo See SETUP_GUIDE.md for instructions.
    echo.
    pause
    exit /b 1
)

echo [1/2] Checking Firebase configuration...
node check-setup.js
if errorlevel 1 (
    pause
    exit /b 1
)

echo.
echo [2/2] Starting development server...
echo.
echo Open your browser at: http://localhost:5173
echo Press Ctrl+C to stop the server
echo.

npm run dev
