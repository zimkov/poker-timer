import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../store/gameStore';
import { ArrowLeft, Play, Pause, SkipForward, RotateCcw, UserMinus, Plus, DollarSign, ArrowRightLeft } from 'lucide-react';

type Tab = 'timer' | 'players' | 'actions';

export function GameControl() {
  const navigate = useNavigate();
  const store = useGameStore();
  const { settings, blinds, players, tables, currentLevel, timeRemaining, isRunning, isPaused, gameStarted, theme } = store;

  const [activeTab, setActiveTab] = useState<Tab>('timer');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddPlayer, setShowAddPlayer] = useState(false);
  const [newName, setNewName] = useState('');
  const [newBuyIn, setNewBuyIn] = useState(settings.startingBuyIn.toString());

  const currentBlind = blinds[currentLevel] || blinds[blinds.length - 1];
  const nextBlind = blinds[currentLevel + 1];
  const mins = Math.floor(timeRemaining / 60);
  const secs = timeRemaining % 60;
  const timeStr = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

  const isDark = theme === 'dark';
  const cardBg = isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200';
  const mutedText = isDark ? 'text-gray-400' : 'text-gray-500';

  const filteredPlayers = players.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSkipLevel = () => {
    if (currentLevel < blinds.length - 1) {
      store.setCurrentLevel(currentLevel + 1);
      store.setTimeRemaining(settings.blindDuration * 60);
    }
  };

  const handleAddPlayer = () => {
    if (!newName.trim()) return;
    const buyIn = parseInt(newBuyIn) || settings.startingBuyIn;
    store.addPlayer(newName.trim(), buyIn);
    setNewName('');
    setNewBuyIn(settings.startingBuyIn.toString());
    setShowAddPlayer(false);
  };

  const tabs: { key: Tab; label: string; icon: string }[] = [
    { key: 'timer', label: 'Таймер', icon: '⏱' },
    { key: 'players', label: 'Игроки', icon: '👥' },
    { key: 'actions', label: 'Действия', icon: '🎮' },
  ];

  return (
    <div className={`min-h-screen ${isDark ? 'bg-slate-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      {/* Header */}
      <div className={`sticky top-0 z-10 ${isDark ? 'bg-slate-900/95' : 'bg-gray-50/95'} backdrop-blur-sm border-b ${isDark ? 'border-slate-700' : 'border-gray-200'}`}>
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <button onClick={() => navigate('/')} className="flex items-center gap-2 text-amber-500">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-bold">🎮 Управление</h1>
          <button onClick={store.toggleTheme} className="text-amber-500">
            {isDark ? '☀️' : '🌙'}
          </button>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-4">
        {/* Tabs */}
        <div className="flex gap-1 mb-4">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.key
                  ? 'bg-amber-500 text-white'
                  : isDark ? 'bg-slate-800 text-gray-300' : 'bg-white text-gray-600'
              }`}
            >
              <span className="mr-1">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Timer Tab */}
        {activeTab === 'timer' && (
          <div className="space-y-4">
            {/* Timer Display */}
            <div className={`rounded-2xl p-6 text-center ${cardBg} border`}>
              <div className={`text-sm ${mutedText} mb-1`}>Уровень {currentLevel + 1}</div>
              <div className={`text-6xl font-mono font-bold ${
                timeRemaining <= 60 ? 'text-red-500' : timeRemaining <= 30 ? 'text-amber-500' : ''
              }`}>
                {timeStr}
              </div>
              <div className="mt-3 flex items-center justify-center gap-4">
                <div className="text-center">
                  <div className={`text-xs ${mutedText}`}>Блайнды</div>
                  <div className="font-bold text-amber-500">{currentBlind.smallBlind}/{currentBlind.bigBlind}</div>
                </div>
                {nextBlind && (
                  <div className="text-center">
                    <div className={`text-xs ${mutedText}`}>Далее</div>
                    <div className={`font-bold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{nextBlind.smallBlind}/{nextBlind.bigBlind}</div>
                  </div>
                )}
              </div>
            </div>

            {/* Timer Controls */}
            <div className="grid grid-cols-2 gap-3">
              {!gameStarted ? (
                <button
                  onClick={() => store.startGame()}
                  className="col-span-2 py-3 bg-green-500 text-white rounded-xl font-bold text-lg flex items-center justify-center gap-2 hover:bg-green-600"
                >
                  <Play className="w-5 h-5" /> Начать игру
                </button>
              ) : (
                <>
                  {isRunning ? (
                    <button onClick={() => store.pauseTimer()} className="py-3 bg-amber-500 text-white rounded-xl font-bold flex items-center justify-center gap-2">
                      <Pause className="w-5 h-5" /> Пауза
                    </button>
                  ) : (
                    <button onClick={() => store.resumeTimer()} className="py-3 bg-green-500 text-white rounded-xl font-bold flex items-center justify-center gap-2">
                      <Play className="w-5 h-5" /> Старт
                    </button>
                  )}
                  <button onClick={handleSkipLevel} className="py-3 bg-blue-500 text-white rounded-xl font-bold flex items-center justify-center gap-2">
                    <SkipForward className="w-5 h-5" /> След. уровень
                  </button>
                </>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => store.resetTimer()} className={`py-2 rounded-xl font-medium flex items-center justify-center gap-2 ${isDark ? 'bg-slate-700 text-gray-300' : 'bg-gray-200 text-gray-700'}`}>
                <RotateCcw className="w-4 h-4" /> Сброс
              </button>
              <button onClick={() => store.resetGame()} className={`py-2 rounded-xl font-medium flex items-center justify-center gap-2 ${isDark ? 'bg-slate-700 text-gray-300' : 'bg-gray-200 text-gray-700'}`}>
                <RotateCcw className="w-4 h-4" /> Новая игра
              </button>
            </div>

            {/* Quick info */}
            <div className={`rounded-xl p-4 ${cardBg} border`}>
              <div className="grid grid-cols-2 gap-3 text-center">
                <div>
                  <div className={`text-xs ${mutedText}`}>Игроков в игре</div>
                  <div className="text-xl font-bold text-green-400">{players.filter(p => !p.eliminated).length}</div>
                </div>
                <div>
                  <div className={`text-xs ${mutedText}`}>Общий банк</div>
                  <div className="text-xl font-bold text-blue-400">
                    {players.filter(p => !p.eliminated).reduce((s, p) => s + p.chips, 0).toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Players Tab */}
        {activeTab === 'players' && (
          <div className="space-y-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="🔍 Поиск игрока..."
                className={`flex-1 px-4 py-2 rounded-xl border ${isDark ? 'bg-slate-800 border-slate-700 text-white placeholder-gray-500' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'}`}
              />
              <button
                onClick={() => setShowAddPlayer(!showAddPlayer)}
                className="px-3 py-2 bg-amber-500 text-white rounded-xl font-bold"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>

            {showAddPlayer && (
              <div className={`rounded-xl p-3 ${cardBg} border`}>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddPlayer()}
                    placeholder="Имя"
                    className={`flex-1 px-3 py-2 rounded-lg border ${isDark ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-gray-300'}`}
                    autoFocus
                  />
                  <input
                    type="number"
                    value={newBuyIn}
                    onChange={(e) => setNewBuyIn(e.target.value)}
                    placeholder="Бай-ин"
                    className={`w-24 px-3 py-2 rounded-lg border ${isDark ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-gray-300'}`}
                  />
                </div>
                <button
                  onClick={handleAddPlayer}
                  className="w-full py-2 bg-green-500 text-white rounded-lg font-medium"
                >
                  ✓ Добавить
                </button>
              </div>
            )}

            <div className="space-y-2">
              {filteredPlayers.map((player) => (
                <div key={player.id} className={`rounded-xl p-3 ${cardBg} border ${player.eliminated ? 'opacity-50' : ''}`}>
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <div className="font-bold">{player.name}</div>
                      <div className={`text-xs ${mutedText}`}>
                        Фишки: {player.chips.toLocaleString()} | Потрачено: {player.totalSpent}₽
                        {player.reEntries > 0 && ` | Ре-энтри: ${player.reEntries}`}
                      </div>
                    </div>
                    <div className={`text-right ${player.eliminated ? 'text-red-400' : 'text-green-400'} font-bold text-sm`}>
                      {player.eliminated ? 'ВЫБЫЛ' : 'В ИГРЕ'}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {!player.eliminated ? (
                      <>
                        <button
                          onClick={() => store.eliminatePlayer(player.id)}
                          className="px-2.5 py-1 bg-red-500/20 text-red-400 rounded-lg text-xs font-medium flex items-center gap-1"
                        >
                          <UserMinus className="w-3 h-3" /> Выбыл
                        </button>
                        <button
                          onClick={() => store.addStack(player.id)}
                          className="px-2.5 py-1 bg-blue-500/20 text-blue-400 rounded-lg text-xs font-medium flex items-center gap-1"
                        >
                          <Plus className="w-3 h-3" /> Стек ({settings.stackChips})
                        </button>
                        <button
                          onClick={() => store.addAddon(player.id)}
                          className="px-2.5 py-1 bg-purple-500/20 text-purple-400 rounded-lg text-xs font-medium flex items-center gap-1"
                        >
                          <DollarSign className="w-3 h-3" /> Аддон ({settings.addonChips})
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => store.reEnterPlayer(player.id)}
                        className="px-2.5 py-1 bg-green-500/20 text-green-400 rounded-lg text-xs font-medium flex items-center gap-1"
                      >
                        <ArrowRightLeft className="w-3 h-3" /> Ре-энтри
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions Tab */}
        {activeTab === 'actions' && (
          <div className="space-y-4">
            <div className={`rounded-xl p-4 ${cardBg} border`}>
              <h3 className="font-bold mb-3">🎲 Рассадка</h3>
              <button
                onClick={() => store.randomizeSeating()}
                className="w-full py-3 bg-purple-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-purple-600"
              >
                🎲 Рандомная рассадка
              </button>
              <p className={`text-xs mt-2 ${mutedText}`}>
                Случайным образом распределит активных игроков по столам и местам
              </p>
            </div>

            <div className={`rounded-xl p-4 ${cardBg} border`}>
              <h3 className="font-bold mb-3">📊 Статистика</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className={mutedText}>Всего игроков</span>
                  <span className="font-bold">{players.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className={mutedText}>В игре</span>
                  <span className="font-bold text-green-400">{players.filter(p => !p.eliminated).length}</span>
                </div>
                <div className="flex justify-between">
                  <span className={mutedText}>Выбыли</span>
                  <span className="font-bold text-red-400">{players.filter(p => p.eliminated).length}</span>
                </div>
                <div className="flex justify-between">
                  <span className={mutedText}>Общий банк</span>
                  <span className="font-bold text-blue-400">{players.filter(p => !p.eliminated).reduce((s, p) => s + p.chips, 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className={mutedText}>Всего потрачено</span>
                  <span className="font-bold text-amber-400">{players.reduce((s, p) => s + p.totalSpent, 0).toLocaleString()}₽</span>
                </div>
                <div className="flex justify-between">
                  <span className={mutedText}>Текущий уровень</span>
                  <span className="font-bold">{currentLevel + 1} / {blinds.length}</span>
                </div>
              </div>
            </div>

            <div className={`rounded-xl p-4 ${cardBg} border`}>
              <h3 className="font-bold mb-3">💰 Стоимость</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className={mutedText}>Стек</span>
                  <span>{settings.stackChips} фишек / {settings.stackPrice}₽</span>
                </div>
                <div className="flex justify-between">
                  <span className={mutedText}>Аддон</span>
                  <span>{settings.addonChips} фишек / {settings.addonPrice}₽</span>
                </div>
                <div className="flex justify-between">
                  <span className={mutedText}>Бай-ин</span>
                  <span>{settings.startingChips} фишек / {settings.startingBuyIn}₽</span>
                </div>
              </div>
            </div>

            <div className={`rounded-xl p-4 ${cardBg} border`}>
              <h3 className="font-bold mb-3">🔗 Ссылки</h3>
              <div className="space-y-2">
                <a href="/tv" target="_blank" className="block w-full py-2 bg-green-500/20 text-green-400 rounded-lg text-center text-sm font-medium">
                  📺 Открыть экран ТВ
                </a>
                <a href="/setup" className={`block w-full py-2 rounded-lg text-center text-sm font-medium ${isDark ? 'bg-slate-700 text-gray-300' : 'bg-gray-200 text-gray-700'}`}>
                  ⚙️ Настройки игры
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
