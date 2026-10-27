@echo off
cd /d "%~dp0"
title Safe Digital - Backend (3001)
echo API: http://localhost:3001
echo Learn and Legal Aid need this window to stay open.
echo.
npm.cmd run dev:server
pause
