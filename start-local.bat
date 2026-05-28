@echo off
REM Start local dev server (opens browser; stops when browser or window closes)
chcp 65001 >nul
cd /d "%~dp0"
npm run start-local
exit /b %ERRORLEVEL%
