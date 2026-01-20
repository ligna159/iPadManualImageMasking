@echo off
echo ================================
echo   Bubble Mask Web Server
echo ================================
echo.
echo Starting server on port 8080...
echo.
echo Access from PC: http://localhost:8080
echo.

REM Get PC IP address
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4"') do (
    set IP=%%a
)
set IP=%IP:~1%

echo Access from iPad: http://%IP%:8080
echo.
echo To stop the server, close this window or press Ctrl+C.
echo.
echo ================================
echo.

REM Try different server methods
where python >nul 2>&1
if %errorlevel% equ 0 (
    echo Using Python server...
    python -m http.server 8080
    goto :end
)

where py >nul 2>&1
if %errorlevel% equ 0 (
    echo Using Python server...
    py -m http.server 8080
    goto :end
)

where node >nul 2>&1
if %errorlevel% equ 0 (
    echo Using Node.js server...
    npx -y http-server -p 8080 -c-1
    goto :end
)

echo.
echo ERROR: Neither Python nor Node.js is installed!
echo.
echo Install Python: https://www.python.org/downloads/
echo or
echo Install Node.js: https://nodejs.org/
echo.
pause
goto :end

:end
