@echo off
title WhatsApp PDF Pass Sender - Launcher
echo ========================================================
echo   WhatsApp PDF Pass Sender - Vardhman Creative Studio   
echo ========================================================
echo.

:: Check for python
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Python is not installed or not added to PATH.
    echo Please install Python 3.13 from https://www.python.org
    echo and check the "Add Python to PATH" box.
    echo.
    pause
    exit /b 1
)

:: Create virtual environment
if not exist "venv" (
    echo Creating virtual environment (venv)...
    python -m venv venv
    if %errorlevel% neq 0 (
        echo ERROR: Failed to create virtual environment.
        pause
        exit /b 1
    )
)

:: Activate virtual environment
echo Activating virtual environment...
call venv\Scripts\activate

:: Install requirements
echo.
echo Checking and installing dependencies...
python -m pip install --upgrade pip
pip install -r requirements.txt
if %errorlevel% neq 0 (
    echo ERROR: Failed to install dependencies.
    pause
    exit /b 1
)

:: Run application
echo.
echo Starting application...
python app.py
if %errorlevel% neq 0 (
    echo Application exited with an error.
)

pause
