@echo off
title Capetown Heights - Public Website Launcher
cd /d "%~dp0"

:: 1. Check & Ensure MySQL is running
netstat -ano | findstr ":3306" | findstr "LISTENING" >nul
if errorlevel 1 (
    if exist "C:\xampp\mysql\bin\mysqld.exe" (
        start /b "" "C:\xampp\mysql\bin\mysqld.exe" --defaults-file="C:\xampp\mysql\bin\my.ini" --console
        timeout /t 3 /nobreak >nul
    )
)

:: 2. Check & Ensure Node server is running on port 8000
netstat -ano | findstr ":8000" | findstr "LISTENING" >nul
if errorlevel 1 (
    start /b "" node server.js
    timeout /t 3 /nobreak >nul
)

:: 3. Open Website in default browser
start http://localhost:8000/
timeout /t 2 /nobreak >nul
exit
