@echo off
setlocal
cd /d "%~dp0"
echo [KRITR] Installing dependencies...
call npm install
if errorlevel 1 goto :error

echo.
echo [KRITR] Building Windows installer...
call npm run dist
if errorlevel 1 goto :error

echo.
echo [KRITR] Done! Open the dist folder for Kritr-Setup-*.exe
start "" "%~dp0dist"
pause
exit /b 0

:error
echo.
echo [KRITR] Build failed. Read the error above.
pause
exit /b 1
