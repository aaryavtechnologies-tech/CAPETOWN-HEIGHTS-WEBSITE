@echo off
title Capetown Heights - Backend & Admin Portal
cd /d "%~dp0"

echo ========================================================
echo   CAPETOWN HEIGHTS - LOCAL SERVER STARTUP
echo ========================================================
echo.
echo Checking MySQL and starting Node.js server on Port 8000...
echo.
echo Website URL:      http://localhost:8000/
echo Admin Dashboard:  http://localhost:8000/admin
echo.
echo Press Ctrl + C to stop the server anytime.
echo ========================================================
echo.

node server.js

if errorlevel 1 (
    echo.
    echo [ERROR] Server encountered an error.
    echo Please make sure Node.js and XAMPP MySQL are running.
    echo.
    pause
)
