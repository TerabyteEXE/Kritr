@echo off
setlocal
cd /d "%~dp0"
if not exist node_modules (
  echo [KRITR] First run - installing dependencies...
  call npm install
  if errorlevel 1 goto :error
)
call npm start
exit /b %errorlevel%

:error
echo [KRITR] Setup failed.
pause
exit /b 1
