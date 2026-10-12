@echo off
setlocal
cd /d "%~dp0"
echo ========================================
echo   KRITR V1 WINDOWS RELEASE BUILD
echo ========================================
where npm >nul 2>nul || (echo Node.js/npm was not found.& pause & exit /b 1)
if not exist node_modules (
  echo Installing dependencies...
  call npm install || goto :fail
)
echo Building NSIS installer...
call npm run dist || goto :fail
echo.
echo DONE. Check the dist folder for Kritr-Setup-1.0.0.exe
start "" "%cd%\dist"
exit /b 0
:fail
echo.
echo Build failed. Review the error above.
pause
exit /b 1
