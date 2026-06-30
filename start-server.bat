@echo off
chcp 65001 >nul 2>nul
title PriceTracker
echo.
echo  Starting PriceTracker...
echo.

cd /d "%~dp0"

where python >nul 2>&1
if %errorlevel% equ 0 (
    echo  [OK] Python found
    echo  [OK] Server: http://localhost:8080
    echo.
    echo  Press Ctrl+C to stop
    echo.
    start http://localhost:8080
    python -m http.server 8080
) else (
    where python3 >nul 2>&1
    if %errorlevel% equ 0 (
        echo  [OK] Python3 found
        echo  [OK] Server: http://localhost:8080
        echo.
        echo  Press Ctrl+C to stop
        echo.
        start http://localhost:8080
        python3 -m http.server 8080
    ) else (
        echo  [X] Python not found
        echo.
        echo  Please open index.html in your browser directly.
        echo.
        pause
    )
)
