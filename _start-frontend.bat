@echo off
cd /d "%~dp0"
title Safe Digital - Frontend (3000)
echo App: http://localhost:3000
echo Keep the Backend window open on port 3001.
echo.
npm.cmd run dev:client
pause
