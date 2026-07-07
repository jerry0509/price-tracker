@echo off
chcp 65001 >nul 2>nul
title PriceTracker
cd /d "%~dp0"

where python >nul 2>&1
if %errorlevel% equ 0 (
    start http://localhost:8080
    python -m http.server 8080
) else (
    where python3 >nul 2>&1
    if %errorlevel% equ 0 (
        start http://localhost:8080
        python3 -m http.server 8080
    ) else (
        echo Python not found
        pause
    )
)
