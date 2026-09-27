@echo off
chcp 65001 >nul
echo.
echo  ╔══════════════════════════════════════╗
echo  ║       🃏 POKER TIMER                ║
echo  ║   Запуск покерного таймера...       ║
echo  ╚══════════════════════════════════════╝
echo.

:: Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ОШИБКА] Node.js не найден!
    echo.
    echo Скачайте и установите Node.js:
    echo https://nodejs.org/
    echo.
    pause
    exit /b 1
)
echo [OK] Node.js найден

:: Check if Python is installed
where python >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ОШИБКА] Python не найден!
    echo.
    echo Скачайте и установите Python:
    echo https://www.python.org/downloads/
    echo.
    pause
    exit /b 1
)
echo [OK] Python найден
echo.

:: Install frontend dependencies if needed
if not exist "node_modules" (
    echo [INFO] Установка зависимостей фронтенда...
    call npm install
    echo.
)

:: Build frontend
echo [INFO] Сборка фронтенда...
call npm run build
if %ERRORLEVEL% NEQ 0 (
    echo [ОШИБКА] Не удалось собрать фронтенд!
    pause
    exit /b 1
)
echo [OK] Фронтенд собран
echo.

:: Install backend dependencies
echo [INFO] Установка зависимостей бэкенда...
cd backend
pip install -r requirements.txt --quiet
cd ..
echo [OK] Зависимости бэкенда установлены
echo.

:: Get local IP
echo [INFO] Определение IP адреса...
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4"') do (
    set IP=%%a
)
set IP=%IP: =%

echo.
echo  ╔══════════════════════════════════════════════════╗
echo  ║  Приложение запущено!                           ║
echo  ╠══════════════════════════════════════════════════╣
echo  ║                                                  ║
echo  ║  На этом компьютере:                             ║
echo  ║  http://localhost:3000                           ║
echo  ║                                                  ║
echo  ║  Экран для ТВ:                                   ║
echo  ║  http://localhost:3000/tv                        ║
echo  ║                                                  ║
echo  ║  Управление (с телефона):                        ║
echo  ║  http://%IP%:3000/control                        ║
echo  ║                                                  ║
echo  ║  Для остановки: Ctrl+C                           ║
echo  ║                                                  ║
echo  ╚══════════════════════════════════════════════════╝
echo.
echo Откройте браузер...
timeout /t 2 >nul
start http://localhost:3000

:: Start backend server (serves both API and frontend)
cd backend
python main.py

pause
