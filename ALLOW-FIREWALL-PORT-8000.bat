@echo off
title Capetown Heights - Enable Mobile / Wi-Fi Device Access
color 0A
echo ========================================================
echo   CAPETOWN HEIGHTS - ENABLE DEVICE ACCESS (PORT 8000)
echo ========================================================
echo.
echo Adding Windows Firewall Inbound Rule for Port 8000...
echo.

netsh advfirewall firewall delete rule name="Capetown Node Server 8000" >nul 2>&1
netsh advfirewall firewall add rule name="Capetown Node Server 8000" dir=in action=allow protocol=TCP localport=8000

if %errorlevel% equ 0 (
    echo [SUCCESS] Port 8000 is now accessible across your Wi-Fi network!
    echo.
    echo Mobile Device URL:
    echo   http://192.168.1.8:8000/admin
    echo.
) else (
    echo [NOTE] Please right-click this file and select "Run as administrator"
    echo        to allow incoming connections on port 8000.
    echo.
)

pause
