import { useEffect, useRef, useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { formatTime, pokerHands, playWarningSound, playLevelUpSound } from '../utils/poker';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export function TVDisplay() {
  const store = useGameStore();
  const { settings, blinds, players, tables, currentLevel, timeRemaining, isRunning, isPaused, gameStarted, theme } = store;

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [warningPlayed, setWarningPlayed] = useState(false);
  const [showBlindsTable, setShowBlindsTable] = useState(false);
  const [showHands, setShowHands] = useState(false);
  const [activeTable, setActiveTable] = useState<string>('all');

  const currentBlind = blinds[currentLevel] || blinds[blinds.length - 1];
  const nextBlind = blinds[currentLevel + 1];
  const isLastMinute = timeRemaining <= 60;
  const isWarning = timeRemaining <= 30 && timeRemaining > 0;

  // Timer logic
  useEffect(() => {
    if (isRunning && !isPaused) {
      intervalRef.current = setInterval(() => {
        const state = useGameStore.getState();
        const newTime = state.timeRemaining - 1;

        if (newTime <= 0) {
          // Level up
          playLevelUpSound();
          const nextLevel = state.currentLevel + 1;
          if (nextLevel < state.blinds.length) {
            state.setCurrentLevel(nextLevel);
            state.setTimeRemaining(state.settings.blindDuration * 60);
          } else {
            state.pauseTimer();
          }
          setWarningPlayed(false);
        } else {
          state.setTimeRemaining(newTime);

          // Warning sound at 30 seconds
          if (newTime === 30 && !warningPlayed) {
            playWarningSound();
            setWarningPlayed(true);
          }
          // Beep every 5 seconds in last 10 seconds
          if (newTime <= 10 && newTime > 0 && newTime % 5 === 0) {
            playWarningSound();
          }
        }
      }, 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isRunning, isPaused, warningPlayed]);

  const isDark = theme === 'dark';
  const activePlayers = players.filter(p => !p.eliminated);
  const totalChips = activePlayers.reduce((sum, p) => sum + p.chips, 0);
  const displayPlayers = activeTable === 'all' 
    ? activePlayers 
    : activePlayers.filter(p => p.tableId === activeTable);

  return (
    <div className={`min-h-screen ${isDark ? 'bg-slate-950 text-white' : 'bg-gray-100 text-gray-900'} overflow-hidden`}>
      {/* Header */}
      <div className={`flex items-center justify-between px-4 py-2 ${isDark ? 'bg-slate-900' : 'bg-white'} shadow-lg`}>
        <Link to="/" className={`flex items-center gap-2 ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'}`}>
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm">Назад</span>
        </Link>
        <div className="flex items-center gap-4">
          {/* Table filter */}
          <select
            value={activeTable}
            onChange={(e) => setActiveTable(e.target.value)}
            className={`px-3 py-1 rounded-lg text-sm ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-gray-100 border-gray-300 text-gray-900'} border`}
          >
            <option value="all">Все столы</option>
            {tables.map((t, i) => (
              <option key={t.id} value={t.id}>Стол {i + 1}</option>
            ))}
          </select>
          <button
            onClick={() => setShowBlindsTable(!showBlindsTable)}
            className={`px-3 py-1 rounded-lg text-sm ${isDark ? 'bg-slate-800 hover:bg-slate-700' : 'bg-gray-200 hover:bg-gray-300'}`}
          >
            📊 Блайнды
          </button>
          <button
            onClick={() => setShowHands(!showHands)}
            className={`px-3 py-1 rounded-lg text-sm ${isDark ? 'bg-slate-800 hover:bg-slate-700' : 'bg-gray-200 hover:bg-gray-300'}`}
          >
            🃏 Комбинации
          </button>
        </div>
      </div>

      <div className="p-4 grid grid-cols-1 lg:grid-cols-12 gap-4 h-[calc(100vh-56px)]">
        {/* Main Timer Section */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          {/* Timer */}
          <div className={`rounded-2xl p-6 text-center ${isDark ? 'bg-slate-900 border-2' : 'bg-white border-2 shadow-xl'} ${
            isLastMinute ? 'border-red-500' : isWarning ? 'border-amber-500' : isDark ? 'border-slate-700' : 'border-gray-200'
          }`}>
            <div className={`text-sm font-medium mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              Уровень {currentLevel + 1} • {settings.blindDuration} мин
            </div>
            <div className={`text-8xl lg:text-9xl font-mono font-bold tracking-tight transition-colors duration-300 ${
              isLastMinute ? 'text-red-500 animate-pulse' : isWarning ? 'text-amber-500' : isDark ? 'text-white' : 'text-gray-900'
            }`}>
              {formatTime(timeRemaining)}
            </div>
            
            {/* Controls */}
            <div className="flex items-center justify-center gap-3 mt-4">
              {!gameStarted ? (
                <button onClick={() => store.startGame()} className="px-6 py-2 bg-green-500 text-white rounded-lg font-bold hover:bg-green-600">
                  ▶ Старт
                </button>
              ) : isRunning ? (
                <button onClick={() => store.pauseTimer()} className="px-6 py-2 bg-amber-500 text-white rounded-lg font-bold hover:bg-amber-600">
                  ⏸ Пауза
                </button>
              ) : (
                <button onClick={() => store.resumeTimer()} className="px-6 py-2 bg-green-500 text-white rounded-lg font-bold hover:bg-green-600">
                  ▶ Продолжить
                </button>
              )}
            </div>
          </div>

          {/* Blinds */}
          <div className={`rounded-2xl p-4 ${isDark ? 'bg-slate-900 border border-slate-700' : 'bg-white border border-gray-200 shadow-lg'}`}>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Текущие</div>
                <div className="text-2xl font-bold text-amber-500">
                  {currentBlind.smallBlind}/{currentBlind.bigBlind}
                </div>
                {currentBlind.ante ? (
                  <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                    Анте: {currentBlind.ante}
                  </div>
                ) : null}
              </div>
              <div className="text-center">
                <div className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Следующие</div>
                <div className={`text-2xl font-bold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {nextBlind ? `${nextBlind.smallBlind}/${nextBlind.bigBlind}` : '—'}
                </div>
                {nextBlind?.ante ? (
                  <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                    Анте: {nextBlind.ante}
                  </div>
                ) : null}
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className={`rounded-2xl p-4 ${isDark ? 'bg-slate-900 border border-slate-700' : 'bg-white border border-gray-200 shadow-lg'}`}>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div>
                <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Игроков</div>
                <div className="text-xl font-bold text-green-400">{activePlayers.length}/{players.length}</div>
              </div>
              <div>
                <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Всего фишек</div>
                <div className="text-xl font-bold text-blue-400">{totalChips.toLocaleString()}</div>
              </div>
              <div>
                <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  {currentLevel < settings.levelsBeforeAddon ? 'Аддон через' : currentLevel === settings.levelsBeforeAddon ? '⚡ АДДОН!' : 'Аддон прошёл'}
                </div>
                <div className={`text-xl font-bold ${
                  currentLevel === settings.levelsBeforeAddon ? 'text-purple-400 animate-pulse' : 
                  currentLevel < settings.levelsBeforeAddon ? 'text-purple-400' : 
                  isDark ? 'text-gray-500' : 'text-gray-400'
                }`}>
                  {currentLevel < settings.levelsBeforeAddon 
                    ? `${settings.levelsBeforeAddon - currentLevel} ур.` 
                    : currentLevel === settings.levelsBeforeAddon ? 'СЕЙЧАС' : '✓'}
                </div>
              </div>
            </div>
          </div>

          {/* Progress bar */}
          <div className={`rounded-xl p-3 ${isDark ? 'bg-slate-900 border border-slate-700' : 'bg-white border border-gray-200 shadow-lg'}`}>
            <div className="flex items-center justify-between mb-1">
              <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Прогресс турнира</span>
              <span className={`text-xs font-mono ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                {currentLevel + 1}/{blinds.length}
              </span>
            </div>
            <div className={`h-2 rounded-full overflow-hidden ${isDark ? 'bg-slate-700' : 'bg-gray-200'}`}>
              <div 
                className="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-full transition-all duration-1000"
                style={{ width: `${((currentLevel + 1) / blinds.length) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Players / Tables Section */}
        <div className="lg:col-span-4 flex flex-col gap-4 overflow-hidden">
          <div className={`rounded-2xl p-4 flex-1 overflow-auto ${isDark ? 'bg-slate-900 border border-slate-700' : 'bg-white border border-gray-200 shadow-lg'}`}>
            <h3 className="font-bold text-lg mb-3">
              {activeTable === 'all' ? '👥 Все игроки' : `🎰 ${tables.find(t => t.id === activeTable)?.name || 'Стол'}`}
            </h3>
            
            {/* Table chips summary */}
            {activeTable === 'all' && tables.length > 1 && (
              <div className="grid grid-cols-2 gap-2 mb-3">
                {tables.map((table, i) => {
                  const tableChips = activePlayers.filter(p => p.tableId === table.id).reduce((s, p) => s + p.chips, 0);
                  return (
                    <div key={table.id} className={`p-2 rounded-lg text-center text-sm ${isDark ? 'bg-slate-800' : 'bg-gray-100'}`}>
                      <div className={`font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Стол {i + 1}</div>
                      <div className="text-blue-400 font-bold">{tableChips.toLocaleString()}</div>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="space-y-1.5">
              {displayPlayers.map((player) => (
                <div
                  key={player.id}
                  className={`flex items-center justify-between p-2 rounded-lg text-sm ${
                    isDark ? 'bg-slate-800/50' : 'bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    {player.seatNumber && (
                      <span className={`text-xs px-1.5 py-0.5 rounded ${isDark ? 'bg-slate-700 text-gray-300' : 'bg-gray-200 text-gray-600'}`}>
                        #{player.seatNumber}
                      </span>
                    )}
                    <span className="font-medium truncate">{player.name}</span>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-blue-400 font-mono">{player.chips.toLocaleString()}</span>
                    <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                      {player.totalSpent}₽
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Eliminated players */}
            {players.filter(p => p.eliminated).length > 0 && (
              <div className="mt-4">
                <h4 className={`text-sm font-medium mb-2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                  Выбыли ({players.filter(p => p.eliminated).length})
                </h4>
                <div className="flex flex-wrap gap-1">
                  {players.filter(p => p.eliminated).map(p => (
                    <span key={p.id} className={`text-xs px-2 py-1 rounded ${isDark ? 'bg-red-900/30 text-red-400' : 'bg-red-50 text-red-600'} line-through`}>
                      {p.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Seating / Info Section */}
        <div className="lg:col-span-3 flex flex-col gap-4 overflow-hidden">
          {/* Poker Hands Quick Reference */}
          <div className={`rounded-2xl p-3 ${isDark ? 'bg-slate-900 border border-slate-700' : 'bg-white border border-gray-200 shadow-lg'}`}>
            <h3 className="font-bold text-sm mb-2">🃏 Комбинации</h3>
            <div className="grid grid-cols-2 gap-1">
              {pokerHands.slice(0, 6).map((hand) => (
                <div key={hand.rank} className={`flex items-center gap-1 text-xs p-1 rounded ${isDark ? 'bg-slate-800' : 'bg-gray-50'}`}>
                  <span>{hand.emoji}</span>
                  <span className="truncate">{hand.nameRu}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Seating visualization */}
          <div className={`rounded-2xl p-4 flex-1 overflow-auto ${isDark ? 'bg-slate-900 border border-slate-700' : 'bg-white border border-gray-200 shadow-lg'}`}>
            <h3 className="font-bold text-lg mb-3">🎰 Рассадка</h3>
            <div className="space-y-4">
              {tables.map((table, tableIdx) => {
                const tablePlayers = activePlayers.filter(p => p.tableId === table.id);
                return (
                  <div key={table.id}>
                    <div className={`text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      Стол {tableIdx + 1} ({tablePlayers.length}/{settings.seatsPerTable})
                    </div>
                    <div className="grid grid-cols-3 gap-1.5">
                      {Array.from({ length: settings.seatsPerTable }, (_, seat) => {
                        const player = tablePlayers.find(p => p.seatNumber === seat + 1);
                        return (
                          <div
                            key={seat}
                            className={`p-1.5 rounded text-center text-xs ${
                              player
                                ? 'bg-amber-500/20 border border-amber-500/50 text-amber-300'
                                : isDark ? 'bg-slate-800 border border-slate-700 text-gray-600' : 'bg-gray-100 border border-gray-200 text-gray-400'
                            }`}
                          >
                            <div className="font-bold">{seat + 1}</div>
                            <div className="truncate">{player?.name || '—'}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Blinds Table Modal */}
      {showBlindsTable && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={() => setShowBlindsTable(false)}>
          <div className={`max-w-md w-full rounded-2xl p-6 ${isDark ? 'bg-slate-900' : 'bg-white'} max-h-[80vh] overflow-auto`} onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-bold mb-4">📊 Структура блайндов</h3>
            <div className="space-y-1">
              {blinds.map((blind, idx) => (
                <div
                  key={idx}
                  className={`flex items-center justify-between p-2 rounded ${
                    idx === currentLevel ? 'bg-amber-500/20 border border-amber-500' : isDark ? 'bg-slate-800' : 'bg-gray-50'
                  }`}
                >
                  <span className={`text-sm ${idx === currentLevel ? 'text-amber-400 font-bold' : ''}`}>
                    Уровень {idx + 1}
                  </span>
                  <span className={`font-mono ${idx === currentLevel ? 'text-amber-400 font-bold' : ''}`}>
                    {blind.smallBlind}/{blind.bigBlind}
                    {blind.ante ? ` (A:${blind.ante})` : ''}
                  </span>
                </div>
              ))}
            </div>
            <button onClick={() => setShowBlindsTable(false)} className="w-full mt-4 py-2 bg-amber-500 text-white rounded-lg font-medium">
              Закрыть
            </button>
          </div>
        </div>
      )}

      {/* Poker Hands Modal */}
      {showHands && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={() => setShowHands(false)}>
          <div className={`max-w-md w-full rounded-2xl p-6 ${isDark ? 'bg-slate-900' : 'bg-white'} max-h-[80vh] overflow-auto`} onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-bold mb-4">🃏 Покерные комбинации</h3>
            <div className="space-y-2">
              {pokerHands.map((hand) => (
                <div key={hand.rank} className={`flex items-center gap-3 p-2 rounded ${isDark ? 'bg-slate-800' : 'bg-gray-50'}`}>
                  <span className="text-2xl">{hand.emoji}</span>
                  <div className="flex-1">
                    <div className="font-medium text-sm">{hand.nameRu}</div>
                    <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{hand.description}</div>
                  </div>
                  <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>#{hand.rank}</span>
                </div>
              ))}
            </div>
            <button onClick={() => setShowHands(false)} className="w-full mt-4 py-2 bg-amber-500 text-white rounded-lg font-medium">
              Закрыть
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
