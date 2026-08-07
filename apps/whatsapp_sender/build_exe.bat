@echo off
title WhatsApp PDF Pass Sender - Builder
echo ========================================================
echo   WhatsApp PDF Pass Sender - Executable Builder
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

:: Create virtual environment if missing
if not exist "venv" (
    echo Creating virtual environment (venv)...
    python -m venv venv
)

:: Activate virtual environment
echo Activating virtual environment...
call venv\Scripts\activate

:: Install requirements
echo.
echo Installing compilation requirements...
pip install -r requirements.txt
if %errorlevel% neq 0 (
    echo ERROR: Failed to install dependencies.
    pause
    exit /b 1
)

:: Build executable
echo.
echo Building single-file EXE using PyInstaller...
pyinstaller --clean whatsapp_sender.spec
if %errorlevel% neq 0 (
    echo ERROR: PyInstaller compilation failed.
    pause
    exit /b 1
)

echo.
echo ========================================================
echo   BUILD COMPLETED SUCCESSFULLY!                         
echo   The executable is in the 'dist' directory:            
echo   dist\WhatsApp_PDF_Sender.exe                          
echo ========================================================
echo.
pause
