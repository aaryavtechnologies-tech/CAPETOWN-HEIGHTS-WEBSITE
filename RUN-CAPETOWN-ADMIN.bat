@echo off
title Capetown Heights - Admin Dashboard Launcher
cd /d "%~dp0"

echo ========================================================
echo   CAPETOWN HEIGHTS - ADMIN DASHBOARD LAUNCHER
echo ========================================================
echo.

:: 1. Check & Ensure MySQL is running
echo [1/3] Checking MySQL database on port 3306...
netstat -ano | findstr ":3306" | findstr "LISTENING" >nul
if errorlevel 1 (
    echo Starting MySQL from XAMPP...
    if exist "C:\xampp\mysql\bin\mysqld.exe" (
        start /b "" "C:\xampp\mysql\bin\mysqld.exe" --defaults-file="C:\xampp\mysql\bin\my.ini" --console
        timeout /t 3 /nobreak >nul
    )
) else (
    echo MySQL is already running.
)

:: 2. Check & Ensure Node server is running on port 8000
echo [2/3] Checking Node backend server on port 8000...
netstat -ano | findstr ":8000" | findstr "LISTENING" >nul
if errorlevel 1 (
    echo Starting Node server...
    start /b "" node server.js
    timeout /t 3 /nobreak >nul
) else (
    echo Node server is already running.
)

:: 3. Open Admin Dashboard in default browser
echo [3/3] Opening Admin Dashboard in browser...
start http://localhost:8000/admin

echo.
echo ========================================================
echo Dashboard opened at: http://localhost:8000/admin
echo Credentials: ID: admin  Password: admin123
echo ========================================================
timeout /t 3 /nobreak >nul
exit
