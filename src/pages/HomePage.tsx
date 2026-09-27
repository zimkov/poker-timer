import { Link } from 'react-router-dom';
import { useGameStore } from '../store/gameStore';
import { Monitor, Settings, Gamepad2, Moon, Sun, Trophy } from 'lucide-react';

export function HomePage() {
  const { theme, toggleTheme, gameStarted } = useGameStore();

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-4 ${
      theme === 'dark' ? 'bg-slate-900 text-white' : 'bg-gray-50 text-gray-900'
    }`}>
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="text-6xl mb-4">🃏</div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent">
            Poker Timer
          </h1>
          <p className={`mt-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            Управляйте покерной игрой
          </p>
        </div>

        <div className="space-y-4">
          <Link
            to="/setup"
            className={`w-full flex items-center gap-3 p-4 rounded-xl transition-all transform hover:scale-[1.02] ${
              theme === 'dark'
                ? 'bg-slate-800 hover:bg-slate-700 border border-slate-700'
                : 'bg-white hover:bg-gray-50 border border-gray-200 shadow-sm'
            }`}
          >
            <Settings className="w-8 h-8 text-amber-500" />
            <div>
              <div className="font-semibold text-lg">Настройка игры</div>
              <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                Игроки, блайнды, столы
              </div>
            </div>
          </Link>

          <Link
            to="/tv"
            className={`w-full flex items-center gap-3 p-4 rounded-xl transition-all transform hover:scale-[1.02] ${
              theme === 'dark'
                ? 'bg-slate-800 hover:bg-slate-700 border border-slate-700'
                : 'bg-white hover:bg-gray-50 border border-gray-200 shadow-sm'
            }`}
          >
            <Monitor className="w-8 h-8 text-green-500" />
            <div>
              <div className="font-semibold text-lg">Экран для ТВ</div>
              <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                Таймер, блайнды, рассадка
              </div>
            </div>
          </Link>

          <Link
            to="/control"
            className={`w-full flex items-center gap-3 p-4 rounded-xl transition-all transform hover:scale-[1.02] ${
              theme === 'dark'
                ? 'bg-slate-800 hover:bg-slate-700 border border-slate-700'
                : 'bg-white hover:bg-gray-50 border border-gray-200 shadow-sm'
            }`}
          >
            <Gamepad2 className="w-8 h-8 text-blue-500" />
            <div>
              <div className="font-semibold text-lg">Управление игрой</div>
              <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                Таймер, игроки, действия
              </div>
            </div>
          </Link>
        </div>

        <div className="flex justify-center pt-4">
          <button
            onClick={toggleTheme}
            className={`p-3 rounded-full transition-all ${
              theme === 'dark'
                ? 'bg-slate-800 hover:bg-slate-700 text-amber-400'
                : 'bg-white hover:bg-gray-100 text-gray-700 shadow-sm'
            }`}
          >
            {theme === 'dark' ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
          </button>
        </div>

        {gameStarted && (
          <div className={`text-center p-3 rounded-lg ${
            theme === 'dark' ? 'bg-green-900/30 text-green-400' : 'bg-green-50 text-green-700'
          }`}>
            <Trophy className="w-5 h-5 inline mr-2" />
            Игра идёт! Перейдите к управлению или экрану ТВ.
          </div>
        )}
      </div>
    </div>
  );
}
