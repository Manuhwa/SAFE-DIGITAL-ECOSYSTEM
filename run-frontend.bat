@echo off
setlocal EnableExtensions
set "ROOT=%~dp0"
if "%ROOT:~-1%"=="\" set "ROOT=%ROOT:~0,-1%"
cd /d "%ROOT%"

title Safe Digital Ecosystem - Frontend (3000)

echo App: http://localhost:3000
echo Start run-backend.bat first so Learn and Legal Aid can load.
echo.

if not exist "%ROOT%\client\node_modules" (
  echo Installing client dependencies...
  pushd "%ROOT%\client"
  call npm.cmd install
  popd
)

call npm.cmd run dev:client
echo.
pause
