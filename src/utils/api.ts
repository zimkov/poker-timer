import { useGameStore } from '../store/gameStore';

const API_BASE = window.location.origin;

class PokerAPI {
  private ws: WebSocket | null = null;
  private reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
  private isConnected = false;

  async connect() {
    try {
      // Try to connect to WebSocket
      const wsUrl = `ws://${window.location.host}/ws`;
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log('✅ Connected to Poker Timer server');
        this.isConnected = true;
      };

      this.ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          if (message.type === 'STATE') {
            // Mark that we're receiving from server to avoid echo
            isReceivingFromServer = true;
            
            // Update store with server state
            const serverState = message.data;
            useGameStore.setState(serverState);
            
            // Update lastSentState to match server state
            lastSentState = JSON.stringify({
              settings: serverState.settings,
              blinds: serverState.blinds,
              players: serverState.players,
              tables: serverState.tables,
              currentLevel: serverState.currentLevel,
              timeRemaining: serverState.timeRemaining,
              isRunning: serverState.isRunning,
              isPaused: serverState.isPaused,
              gameStarted: serverState.gameStarted,
            });
            
            // Reset flag after a short delay
            setTimeout(() => {
              isReceivingFromServer = false;
            }, 100);
          }
        } catch (e) {
          console.error('Failed to parse WebSocket message:', e);
        }
      };

      this.ws.onclose = () => {
        console.log('❌ Disconnected from server');
        this.isConnected = false;
        // Try to reconnect after 3 seconds
        this.reconnectTimeout = setTimeout(() => this.connect(), 3000);
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.isConnected = false;
      };
    } catch (e) {
      console.error('Failed to connect to server:', e);
      this.isConnected = false;
    }
  }

  disconnect() {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }
    if (this.ws) {
      this.ws.close();
    }
  }

  sendUpdate() {
    if (!this.isConnected || !this.ws) return;
    
    const state = useGameStore.getState();
    this.ws.send(JSON.stringify({
      type: 'UPDATE',
      data: {
        settings: state.settings,
        blinds: state.blinds,
        players: state.players,
        tables: state.tables,
        currentLevel: state.currentLevel,
        timeRemaining: state.timeRemaining,
        isRunning: state.isRunning,
        isPaused: state.isPaused,
        gameStarted: state.gameStarted,
      }
    }));
  }

  sendAction(action: string) {
    if (!this.isConnected || !this.ws) return;
    
    this.ws.send(JSON.stringify({
      type: 'ACTION',
      data: { type: action }
    }));
  }

  isServerConnected() {
    return this.isConnected;
  }
}

export const pokerAPI = new PokerAPI();

// Subscribe to store changes and send to server
let lastSentState = '';
let isReceivingFromServer = false;

useGameStore.subscribe((state) => {
  // Don't send back updates that came from the server
  if (isReceivingFromServer) return;
  
  const currentState = JSON.stringify({
    settings: state.settings,
    blinds: state.blinds,
    players: state.players,
    tables: state.tables,
    currentLevel: state.currentLevel,
    timeRemaining: state.timeRemaining,
    isRunning: state.isRunning,
    isPaused: state.isPaused,
    gameStarted: state.gameStarted,
  });

  // Only send if state actually changed
  if (currentState !== lastSentState) {
    lastSentState = currentState;
    pokerAPI.sendUpdate();
  }
});

// Export function to mark that we're receiving from server
export function setReceivingFromServer(value: boolean) {
  isReceivingFromServer = value;
}
