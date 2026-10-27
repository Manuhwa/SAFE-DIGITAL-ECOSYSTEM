@echo off
setlocal EnableExtensions
set "ROOT=%~dp0"
if "%ROOT:~-1%"=="\" set "ROOT=%ROOT:~0,-1%"
cd /d "%ROOT%"

title Safe Digital Ecosystem - Starting...

echo ============================================
echo  Safe Digital Ecosystem - Dev Startup
echo ============================================
echo.
echo Backend  (API):  http://localhost:3001
echo Frontend (app): http://localhost:3000
echo Learn and Legal Aid load from the API on port 3001.
echo.

where node >nul 2>&1
if errorlevel 1 (
  echo ERROR: Node.js is not installed or not on PATH.
  echo Install from https://nodejs.org/ then run this file again.
  echo.
  pause
  exit /b 1
)

where npm.cmd >nul 2>&1
if errorlevel 1 (
  echo ERROR: npm.cmd not found. Reinstall Node.js from https://nodejs.org/
  echo.
  pause
  exit /b 1
)

if not exist "%ROOT%\node_modules" (
  echo Installing server dependencies...
  call npm.cmd install
  if errorlevel 1 goto :failed
)

if not exist "%ROOT%\client\node_modules" (
  echo Installing client dependencies...
  pushd "%ROOT%\client"
  call npm.cmd install
  if errorlevel 1 (
    popd
    goto :failed
  )
  popd
)

echo Checking database module...
node -e "require('better-sqlite3')" >nul 2>&1
if errorlevel 1 (
  echo Rebuilding better-sqlite3 for your Node.js version...
  call npm.cmd run rebuild:sqlite
  if errorlevel 1 goto :failed
)

echo Initializing database if needed...
node server\scripts\initDb.js >nul 2>&1

echo.
echo Starting backend and frontend in separate windows...
echo Keep BOTH windows open while you use the app.
echo.

start "Safe Digital Backend" cmd /k call "%ROOT%\_start-backend.bat"
timeout /t 3 /nobreak >nul
start "Safe Digital Frontend" cmd /k call "%ROOT%\_start-frontend.bat"
timeout /t 2 /nobreak >nul
start "" "http://localhost:3000"

echo.
echo Done. Browser opened to http://localhost:3000
echo If Learn or Legal Aid show errors, check the Backend window for messages.
echo.
pause
exit /b 0

:failed
echo.
echo Startup failed. See errors above.
echo.
pause
exit /b 1
