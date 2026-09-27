#!/bin/bash

echo ""
echo "╔══════════════════════════════════════╗"
echo "║       🃏 POKER TIMER                ║"
echo "║   Запуск покерного таймера...       ║"
echo "╚══════════════════════════════════════╝"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "[ОШИБКА] Node.js не найден!"
    echo ""
    echo "Установите Node.js:"
    echo "  macOS: brew install node"
    echo "  Linux: sudo apt install nodejs npm"
    echo "  Или скачайте: https://nodejs.org/"
    echo ""
    exit 1
fi
echo "[OK] Node.js найден: $(node --version)"

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "[ОШИБКА] Python не найден!"
    echo ""
    echo "Установите Python:"
    echo "  macOS: brew install python"
    echo "  Linux: sudo apt install python3 python3-pip"
    echo ""
    exit 1
fi
echo "[OK] Python найден: $(python3 --version)"
echo ""

# Install frontend dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "[INFO] Установка зависимостей фронтенда..."
    npm install
    echo ""
fi

# Build frontend
echo "[INFO] Сборка фронтенда..."
npm run build
if [ $? -ne 0 ]; then
    echo "[ОШИБКА] Не удалось собрать фронтенд!"
    exit 1
fi
echo "[OK] Фронтенд собран"
echo ""

# Install backend dependencies
echo "[INFO] Установка зависимостей бэкенда..."
cd backend
python3 -m pip install -r requirements.txt --quiet
cd ..
echo "[OK] Зависимости бэкенда установлены"
echo ""

# Get local IP
if command -v ipconfig &> /dev/null; then
    IP=$(ipconfig getifaddr en0 2>/dev/null || ipconfig getifaddr en1 2>/dev/null || echo "localhost")
elif command -v hostname &> /dev/null; then
    IP=$(hostname -I 2>/dev/null | awk '{print $1}' || echo "localhost")
else
    IP="localhost"
fi

echo ""
echo "╔══════════════════════════════════════════════════╗"
echo "║  Приложение запущено!                           ║"
echo "╠══════════════════════════════════════════════════╣"
echo "║                                                  ║"
echo "║  На этом компьютере:                             ║"
echo "║  http://localhost:3000                           ║"
echo "║                                                  ║"
echo "║  Экран для ТВ:                                   ║"
echo "║  http://localhost:3000/tv                        ║"
echo "║                                                  ║"
echo "║  Управление (с телефона):                        ║"
echo "║  http://${IP}:3000/control                       ║"
echo "║                                                  ║"
echo "║  Для остановки: Ctrl+C                           ║"
echo "║                                                  ║"
echo "╚══════════════════════════════════════════════════╝"
echo ""

# Open browser
sleep 2
if command -v open &> /dev/null; then
    open http://localhost:3000
elif command -v xdg-open &> /dev/null; then
    xdg-open http://localhost:3000
fi

# Start backend server (serves both API and frontend)
cd backend
python3 main.py
