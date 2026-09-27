import { create } from 'zustand';

export interface Player {
  id: string;
  name: string;
  buyIn: number;
  chips: number;
  stackCount: number;
  tableId: string | null;
  seatNumber: number | null;
  eliminated: boolean;
  reEntries: number;
  addons: number;
  totalSpent: number;
}

export interface Table {
  id: string;
  name: string;
  maxSeats: number;
}

export interface BlindLevel {
  smallBlind: number;
  bigBlind: number;
  ante?: number;
}

export interface GameSettings {
  blindDuration: number;
  levelsBeforeAddon: number;
  stackPrice: number;
  stackChips: number;
  addonPrice: number;
  addonChips: number;
  startingChips: number;
  startingBuyIn: number;
  tablesCount: number;
  seatsPerTable: number;
}

const defaultBlinds: BlindLevel[] = [
  { smallBlind: 25, bigBlind: 50 },
  { smallBlind: 50, bigBlind: 100 },
  { smallBlind: 75, bigBlind: 150 },
  { smallBlind: 100, bigBlind: 200 },
  { smallBlind: 150, bigBlind: 300 },
  { smallBlind: 200, bigBlind: 400 },
  { smallBlind: 300, bigBlind: 600 },
  { smallBlind: 400, bigBlind: 800 },
  { smallBlind: 500, bigBlind: 1000 },
  { smallBlind: 600, bigBlind: 1200 },
  { smallBlind: 800, bigBlind: 1600 },
  { smallBlind: 1000, bigBlind: 2000 },
  { smallBlind: 1200, bigBlind: 2400 },
  { smallBlind: 1500, bigBlind: 3000 },
  { smallBlind: 2000, bigBlind: 4000 },
  { smallBlind: 2500, bigBlind: 5000 },
  { smallBlind: 3000, bigBlind: 6000 },
  { smallBlind: 4000, bigBlind: 8000 },
  { smallBlind: 5000, bigBlind: 10000 },
  { smallBlind: 6000, bigBlind: 12000 },
];

const defaultSettings: GameSettings = {
  blindDuration: 12,
  levelsBeforeAddon: 5,
  stackPrice: 1000,
  stackChips: 2000,
  addonPrice: 500,
  addonChips: 1000,
  startingChips: 10000,
  startingBuyIn: 5000,
  tablesCount: 1,
  seatsPerTable: 9,
};

const generateId = () => Math.random().toString(36).substr(2, 9);

interface GameState {
  settings: GameSettings;
  blinds: BlindLevel[];
  players: Player[];
  tables: Table[];
  currentLevel: number;
  timeRemaining: number;
  isRunning: boolean;
  isPaused: boolean;
  gameStarted: boolean;
  theme: 'dark' | 'light';
  
  // Actions
  setSettings: (settings: Partial<GameSettings>) => void;
  setBlinds: (blinds: BlindLevel[]) => void;
  addPlayer: (name: string, buyIn?: number) => void;
  removePlayer: (id: string) => void;
  eliminatePlayer: (id: string) => void;
  reEnterPlayer: (id: string) => void;
  addAddon: (id: string) => void;
  addStack: (id: string) => void;
  assignPlayerToTable: (playerId: string, tableId: string, seatNumber: number) => void;
  randomizeSeating: () => void;
  setCurrentLevel: (level: number) => void;
  setTimeRemaining: (time: number) => void;
  startTimer: () => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
  resetTimer: () => void;
  startGame: () => void;
  resetGame: () => void;
  toggleTheme: () => void;
  setTheme: (theme: 'dark' | 'light') => void;
  updateTables: () => void;
}

export const useGameStore = create<GameState>((set, get) => ({
  settings: { ...defaultSettings },
  blinds: [...defaultBlinds],
  players: [],
  tables: [{ id: 'table-1', name: 'Стол 1', maxSeats: 9 }],
  currentLevel: 0,
  timeRemaining: defaultSettings.blindDuration * 60,
  isRunning: false,
  isPaused: false,
  gameStarted: false,
  theme: 'dark',

  setSettings: (newSettings) => {
    const state = get();
    const updatedSettings = { ...state.settings, ...newSettings };
    
    // Update tables if count changed
    let updatedTables = state.tables;
    if (newSettings.tablesCount && newSettings.tablesCount !== state.settings.tablesCount) {
      updatedTables = Array.from({ length: newSettings.tablesCount }, (_, i) => ({
        id: `table-${i + 1}`,
        name: `Стол ${i + 1}`,
        maxSeats: updatedSettings.seatsPerTable,
      }));
    }
    
    set({ 
      settings: updatedSettings,
      tables: updatedTables,
    });
  },

  setBlinds: (blinds) => set({ blinds }),

  addPlayer: (name, buyIn) => {
    const state = get();
    const playerBuyIn = buyIn ?? state.settings.startingBuyIn;
    const newPlayer: Player = {
      id: generateId(),
      name: name.trim(),
      buyIn: playerBuyIn,
      chips: state.settings.startingChips,
      stackCount: 0,
      tableId: null,
      seatNumber: null,
      eliminated: false,
      reEntries: 0,
      addons: 0,
      totalSpent: playerBuyIn,
    };
    set({ players: [...state.players, newPlayer] });
  },

  removePlayer: (id) => {
    const state = get();
    set({ players: state.players.filter(p => p.id !== id) });
  },

  eliminatePlayer: (id) => {
    const state = get();
    set({
      players: state.players.map(p => 
        p.id === id ? { ...p, eliminated: true } : p
      )
    });
  },

  reEnterPlayer: (id) => {
    const state = get();
    set({
      players: state.players.map(p => 
        p.id === id ? {
          ...p,
          eliminated: false,
          chips: state.settings.startingChips,
          reEntries: p.reEntries + 1,
          totalSpent: p.totalSpent + state.settings.startingBuyIn,
        } : p
      )
    });
  },

  addAddon: (id) => {
    const state = get();
    set({
      players: state.players.map(p => 
        p.id === id ? {
          ...p,
          chips: p.chips + state.settings.addonChips,
          addons: p.addons + 1,
          totalSpent: p.totalSpent + state.settings.addonPrice,
        } : p
      )
    });
  },

  addStack: (id) => {
    const state = get();
    set({
      players: state.players.map(p => 
        p.id === id ? {
          ...p,
          chips: p.chips + state.settings.stackChips,
          stackCount: p.stackCount + 1,
          totalSpent: p.totalSpent + state.settings.stackPrice,
        } : p
      )
    });
  },

  assignPlayerToTable: (playerId, tableId, seatNumber) => {
    const state = get();
    set({
      players: state.players.map(p => 
        p.id === playerId ? { ...p, tableId, seatNumber } : p
      )
    });
  },

  randomizeSeating: () => {
    const state = get();
    const activePlayers = state.players.filter(p => !p.eliminated);
    const shuffled = [...activePlayers].sort(() => Math.random() - 0.5);
    
    const updatedPlayers = state.players.map(p => {
      if (p.eliminated) return p;
      const idx = shuffled.findIndex(sp => sp.id === p.id);
      if (idx === -1) return p;
      const tableIdx = Math.floor(idx / state.settings.seatsPerTable);
      const seatNum = (idx % state.settings.seatsPerTable) + 1;
      const tableId = state.tables[tableIdx]?.id || state.tables[0]?.id;
      return { ...p, tableId, seatNumber: seatNum };
    });
    
    set({ players: updatedPlayers });
  },

  setCurrentLevel: (level) => set({ currentLevel: level }),
  
  setTimeRemaining: (time) => set({ timeRemaining: time }),

  startTimer: () => set({ 
    isRunning: true, 
    isPaused: false, 
    gameStarted: true,
    timeRemaining: get().settings.blindDuration * 60,
    currentLevel: 0,
  }),

  pauseTimer: () => set({ 
    isPaused: true, 
    isRunning: false 
  }),

  resumeTimer: () => set({ 
    isPaused: false, 
    isRunning: true 
  }),

  resetTimer: () => {
    const state = get();
    set({
      timeRemaining: state.settings.blindDuration * 60,
      isRunning: false,
      isPaused: false,
      currentLevel: 0,
      gameStarted: false,
    });
  },

  startGame: () => {
    const state = get();
    set({
      isRunning: true,
      isPaused: false,
      gameStarted: true,
      timeRemaining: state.settings.blindDuration * 60,
      currentLevel: 0,
    });
  },

  resetGame: () => {
    const state = get();
    set({
      currentLevel: 0,
      timeRemaining: state.settings.blindDuration * 60,
      isRunning: false,
      isPaused: false,
      gameStarted: false,
      players: state.players.map(p => ({
        ...p,
        eliminated: false,
        chips: state.settings.startingChips,
        stackCount: 0,
        addons: 0,
        reEntries: 0,
        tableId: null,
        seatNumber: null,
      })),
    });
  },

  toggleTheme: () => {
    const state = get();
    set({ theme: state.theme === 'dark' ? 'light' : 'dark' });
  },

  setTheme: (theme) => set({ theme }),

  updateTables: () => {
    const state = get();
    const newTables = Array.from({ length: state.settings.tablesCount }, (_, i) => ({
      id: `table-${i + 1}`,
      name: `Стол ${i + 1}`,
      maxSeats: state.settings.seatsPerTable,
    }));
    set({ tables: newTables });
  },
}));
