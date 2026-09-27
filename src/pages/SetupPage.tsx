import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore, BlindLevel } from '../store/gameStore';
import { ArrowLeft, Plus, Trash2, Users, Settings as SettingsIcon, Layers, Edit3 } from 'lucide-react';

type Tab = 'settings' | 'players' | 'blinds' | 'tables';

export function SetupPage() {
  const navigate = useNavigate();
  const store = useGameStore();
  const { settings, blinds, players, tables, theme } = store;

  const [activeTab, setActiveTab] = useState<Tab>('settings');
  const [newPlayerName, setNewPlayerName] = useState('');
  const [newPlayerBuyIn, setNewPlayerBuyIn] = useState(settings.startingBuyIn.toString());
  const [editingBlinds, setEditingBlinds] = useState(false);
  const [editBlinds, setEditBlinds] = useState<BlindLevel[]>([...blinds]);

  const handleAddPlayer = () => {
    if (!newPlayerName.trim()) return;
    const buyIn = parseInt(newPlayerBuyIn) || settings.startingBuyIn;
    store.addPlayer(newPlayerName.trim(), buyIn);
    setNewPlayerName('');
    setNewPlayerBuyIn(settings.startingBuyIn.toString());
  };

  const handleSaveBlinds = () => {
    store.setBlinds(editBlinds);
    setEditingBlinds(false);
  };

  const handleAddBlindLevel = () => {
    setEditBlinds([...editBlinds, { smallBlind: 0, bigBlind: 0 }]);
  };

  const handleRemoveBlindLevel = (idx: number) => {
    setEditBlinds(editBlinds.filter((_, i) => i !== idx));
  };

  const handleUpdateBlindLevel = (idx: number, field: keyof BlindLevel, value: number) => {
    const updated = [...editBlinds];
    updated[idx] = { ...updated[idx], [field]: value };
    setEditBlinds(updated);
  };

  const bg = theme === 'dark' ? 'bg-slate-900 text-white' : 'bg-gray-50 text-gray-900';
  const cardBg = theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200';
  const inputBg = theme === 'dark' ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-gray-300 text-gray-900';
  const mutedText = theme === 'dark' ? 'text-gray-400' : 'text-gray-500';

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: 'settings', label: 'Настройки', icon: <SettingsIcon className="w-4 h-4" /> },
    { key: 'players', label: `Игроки (${players.length})`, icon: <Users className="w-4 h-4" /> },
    { key: 'blinds', label: 'Блайнды', icon: <Layers className="w-4 h-4" /> },
    { key: 'tables', label: 'Столы', icon: <Layers className="w-4 h-4" /> },
  ];

  return (
    <div className={`min-h-screen ${bg}`}>
      {/* Header */}
      <div className={`sticky top-0 z-10 ${theme === 'dark' ? 'bg-slate-900/95' : 'bg-gray-50/95'} backdrop-blur-sm border-b ${theme === 'dark' ? 'border-slate-700' : 'border-gray-200'}`}>
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <button onClick={() => navigate('/')} className="flex items-center gap-2 text-amber-500 hover:text-amber-400">
            <ArrowLeft className="w-5 h-5" />
            <span>Назад</span>
          </button>
          <h1 className="text-xl font-bold">🃏 Настройка игры</h1>
          <button onClick={store.toggleTheme} className="text-amber-500 hover:text-amber-400 text-sm">
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-4">
        {/* Tabs */}
        <div className="flex gap-1 mb-6 overflow-x-auto pb-2">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                activeTab === tab.key
                  ? 'bg-amber-500 text-white shadow-lg'
                  : theme === 'dark' ? 'bg-slate-800 text-gray-300 hover:bg-slate-700' : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className={`rounded-xl border p-6 ${cardBg}`}>
            <h2 className="text-lg font-bold mb-4">⚙️ Параметры игры</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <SettingInput label="Время уровня (мин)" value={settings.blindDuration} min={1}
                onChange={(v) => store.setSettings({ blindDuration: v })} inputBg={inputBg} mutedText={mutedText} />
              <SettingInput label="Уровней до аддона" value={settings.levelsBeforeAddon} min={1}
                onChange={(v) => store.setSettings({ levelsBeforeAddon: v })} inputBg={inputBg} mutedText={mutedText} />
              <SettingInput label="Начальные фишки" value={settings.startingChips} min={100}
                onChange={(v) => store.setSettings({ startingChips: v })} inputBg={inputBg} mutedText={mutedText} />
              <SettingInput label="Начальный бай-ин" value={settings.startingBuyIn} min={100}
                onChange={(v) => store.setSettings({ startingBuyIn: v })} inputBg={inputBg} mutedText={mutedText} />
              <SettingInput label="Цена стека" value={settings.stackPrice} min={100}
                onChange={(v) => store.setSettings({ stackPrice: v })} inputBg={inputBg} mutedText={mutedText} />
              <SettingInput label="Фишек в стеке" value={settings.stackChips} min={100}
                onChange={(v) => store.setSettings({ stackChips: v })} inputBg={inputBg} mutedText={mutedText} />
              <SettingInput label="Цена аддона" value={settings.addonPrice} min={100}
                onChange={(v) => store.setSettings({ addonPrice: v })} inputBg={inputBg} mutedText={mutedText} />
              <SettingInput label="Фишек в аддоне" value={settings.addonChips} min={100}
                onChange={(v) => store.setSettings({ addonChips: v })} inputBg={inputBg} mutedText={mutedText} />
              <SettingInput label="Кол-во столов" value={settings.tablesCount} min={1} max={10}
                onChange={(v) => store.setSettings({ tablesCount: v })} inputBg={inputBg} mutedText={mutedText} />
              <SettingInput label="Мест за столом" value={settings.seatsPerTable} min={2} max={12}
                onChange={(v) => store.setSettings({ seatsPerTable: v })} inputBg={inputBg} mutedText={mutedText} />
            </div>
          </div>
        )}

        {/* Players Tab */}
        {activeTab === 'players' && (
          <div className="space-y-4">
            <div className={`rounded-xl border p-6 ${cardBg}`}>
              <h2 className="text-lg font-bold mb-4">➕ Добавить игрока</h2>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  value={newPlayerName}
                  onChange={(e) => setNewPlayerName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddPlayer()}
                  placeholder="Имя игрока"
                  className={`flex-1 px-3 py-2 rounded-lg border ${inputBg} focus:ring-2 focus:ring-amber-500`}
                />
                <input
                  type="number"
                  value={newPlayerBuyIn}
                  onChange={(e) => setNewPlayerBuyIn(e.target.value)}
                  placeholder="Бай-ин"
                  className={`w-32 px-3 py-2 rounded-lg border ${inputBg} focus:ring-2 focus:ring-amber-500`}
                />
                <button
                  onClick={handleAddPlayer}
                  className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 font-medium flex items-center gap-2 justify-center"
                >
                  <Plus className="w-4 h-4" />
                  Добавить
                </button>
              </div>
            </div>

            {players.length > 0 && (
              <div className={`rounded-xl border p-6 ${cardBg}`}>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold">👥 Игроки ({players.length})</h2>
                  <button
                    onClick={() => store.randomizeSeating()}
                    className="px-3 py-1.5 bg-purple-500 text-white rounded-lg hover:bg-purple-600 text-sm font-medium"
                  >
                    🎲 Рандомная рассадка
                  </button>
                </div>
                <div className="space-y-2">
                  {players.map((player) => (
                    <div
                      key={player.id}
                      className={`flex items-center justify-between p-3 rounded-lg ${
                        theme === 'dark' ? 'bg-slate-700/50' : 'bg-gray-50'
                      }`}
                    >
                      <div className="flex-1">
                        <div className="font-medium">{player.name}</div>
                        <div className={`text-sm ${mutedText}`}>
                          Бай-ин: {player.totalSpent}₽ | Фишки: {player.chips.toLocaleString()}
                          {player.tableId && ` | ${tables.find(t => t.id === player.tableId)?.name || '-'} (место ${player.seatNumber})`}
                        </div>
                      </div>
                      <button
                        onClick={() => store.removePlayer(player.id)}
                        className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Blinds Tab */}
        {activeTab === 'blinds' && (
          <div className={`rounded-xl border p-6 ${cardBg}`}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">📊 Структура блайндов</h2>
              {!editingBlinds ? (
                <button
                  onClick={() => { setEditBlinds([...blinds]); setEditingBlinds(true); }}
                  className="px-3 py-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm font-medium flex items-center gap-1"
                >
                  <Edit3 className="w-4 h-4" />
                  Редактировать
                </button>
              ) : (
                <div className="flex gap-2">
                  <button onClick={handleAddBlindLevel} className="px-3 py-1.5 bg-green-500 text-white rounded-lg hover:bg-green-600 text-sm">
                    <Plus className="w-4 h-4" />
                  </button>
                  <button onClick={handleSaveBlinds} className="px-3 py-1.5 bg-amber-500 text-white rounded-lg hover:bg-amber-600 text-sm font-medium">
                    Сохранить
                  </button>
                  <button onClick={() => setEditingBlinds(false)} className="px-3 py-1.5 bg-gray-500 text-white rounded-lg hover:bg-gray-600 text-sm">
                    Отмена
                  </button>
                </div>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className={`text-sm ${mutedText}`}>
                    <th className="text-left py-2 px-2">Уровень</th>
                    <th className="text-left py-2 px-2">Малый</th>
                    <th className="text-left py-2 px-2">Большой</th>
                    <th className="text-left py-2 px-2">Анте</th>
                    {editingBlinds && <th className="py-2 px-2"></th>}
                  </tr>
                </thead>
                <tbody>
                  {(editingBlinds ? editBlinds : blinds).map((blind, idx) => (
                    <tr key={idx} className={`border-t ${theme === 'dark' ? 'border-slate-700' : 'border-gray-200'}`}>
                      <td className="py-2 px-2 font-medium">{idx + 1}</td>
                      <td className="py-2 px-2">
                        {editingBlinds ? (
                          <input
                            type="number"
                            value={editBlinds[idx].smallBlind}
                            onChange={(e) => handleUpdateBlindLevel(idx, 'smallBlind', parseInt(e.target.value) || 0)}
                            className={`w-20 px-2 py-1 rounded border ${inputBg}`}
                          />
                        ) : (
                          blind.smallBlind
                        )}
                      </td>
                      <td className="py-2 px-2">
                        {editingBlinds ? (
                          <input
                            type="number"
                            value={editBlinds[idx].bigBlind}
                            onChange={(e) => handleUpdateBlindLevel(idx, 'bigBlind', parseInt(e.target.value) || 0)}
                            className={`w-20 px-2 py-1 rounded border ${inputBg}`}
                          />
                        ) : (
                          blind.bigBlind
                        )}
                      </td>
                      <td className="py-2 px-2">
                        {editingBlinds ? (
                          <input
                            type="number"
                            value={editBlinds[idx].ante || 0}
                            onChange={(e) => handleUpdateBlindLevel(idx, 'ante', parseInt(e.target.value) || 0)}
                            className={`w-20 px-2 py-1 rounded border ${inputBg}`}
                          />
                        ) : (
                          blind.ante || '-'
                        )}
                      </td>
                      {editingBlinds && (
                        <td className="py-2 px-2">
                          <button onClick={() => handleRemoveBlindLevel(idx)} className="text-red-400 hover:text-red-300">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tables Tab */}
        {activeTab === 'tables' && (
          <div className={`rounded-xl border p-6 ${cardBg}`}>
            <h2 className="text-lg font-bold mb-4">🎰 Столы</h2>
            <div className="space-y-3">
              {tables.map((table, i) => {
                const tablePlayers = players.filter(p => p.tableId === table.id && !p.eliminated);
                return (
                  <div key={table.id} className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-slate-700/50' : 'bg-gray-50'}`}>
                    <div className="font-bold mb-2">Стол {i + 1} ({tablePlayers.length}/{settings.seatsPerTable})</div>
                    {tablePlayers.length > 0 ? (
                      <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                        {Array.from({ length: settings.seatsPerTable }, (_, seat) => {
                          const player = tablePlayers.find(p => p.seatNumber === seat + 1);
                          return (
                            <div
                              key={seat}
                              className={`p-2 rounded text-center text-sm ${
                                player
                                  ? 'bg-amber-500/20 border border-amber-500/50'
                                  : theme === 'dark' ? 'bg-slate-600/50 border border-slate-600' : 'bg-gray-200 border border-gray-300'
                              }`}
                            >
                              <div className={`text-xs ${mutedText}`}>#{seat + 1}</div>
                              <div className="font-medium truncate">
                                {player ? player.name : '—'}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className={`text-sm ${mutedText}`}>Нет игроков за столом</div>
                    )}
                  </div>
                );
              })}
            </div>
            {players.filter(p => !p.tableId && !p.eliminated).length > 0 && (
              <div className={`mt-4 p-3 rounded-lg ${theme === 'dark' ? 'bg-yellow-900/30 text-yellow-400' : 'bg-yellow-50 text-yellow-700'}`}>
                ⚠️ {players.filter(p => !p.tableId && !p.eliminated).length} игрок(ов) не рассажены
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Helper component for settings inputs
function SettingInput({ label, value, min, max, onChange, inputBg, mutedText }: {
  label: string;
  value: number;
  min: number;
  max?: number;
  onChange: (v: number) => void;
  inputBg: string;
  mutedText: string;
}) {
  return (
    <div>
      <label className={`block text-sm font-medium mb-1 ${mutedText}`}>{label}</label>
      <input
        type="number"
        value={value}
        min={min}
        max={max}
        onChange={(e) => {
          const parsed = parseInt(e.target.value);
          if (!isNaN(parsed) && parsed >= min) {
            onChange(parsed);
          }
        }}
        className={`w-full px-3 py-2 rounded-lg border ${inputBg} focus:ring-2 focus:ring-amber-500 focus:border-transparent`}
      />
    </div>
  );
}
