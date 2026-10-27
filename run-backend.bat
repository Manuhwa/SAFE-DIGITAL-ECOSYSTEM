@echo off
setlocal EnableExtensions
set "ROOT=%~dp0"
if "%ROOT:~-1%"=="\" set "ROOT=%ROOT:~0,-1%"
cd /d "%ROOT%"

title Safe Digital Ecosystem - Backend (3001)

echo API: http://localhost:3001
echo Learn, Legal Aid, and reports need this server running.
echo.

if not exist "%ROOT%\node_modules" (
  echo Installing dependencies...
  call npm.cmd install
)

node -e "require('better-sqlite3')" >nul 2>&1
if errorlevel 1 call npm.cmd run rebuild:sqlite

node server\scripts\initDb.js >nul 2>&1

call npm.cmd run dev:server
echo.
pause
