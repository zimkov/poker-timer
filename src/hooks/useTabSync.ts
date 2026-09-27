import { useEffect } from 'react';
import { useGameStore } from '../store/gameStore';

/**
 * Синхронизация состояния между вкладками браузера через BroadcastChannel.
 * Это работает когда несколько вкладок открыты на одном устройстве.
 * Для синхронизации между разными устройствами используется WebSocket (api.ts).
 */
export function useTabSync() {
  useEffect(() => {
    let channel: BroadcastChannel | null = null;
    let isReceiving = false;

    try {
      channel = new BroadcastChannel('poker-timer-sync');

      // Слушаем изменения от других вкладок
      channel.onmessage = (event) => {
        if (event.data.type === 'STATE_UPDATE') {
          isReceiving = true;
          const newState = event.data.state;
          const currentState = useGameStore.getState();
          
          // Обновляем только если состояние реально отличается
          const currentSerialized = JSON.stringify({
            settings: currentState.settings,
            blinds: currentState.blinds,
            players: currentState.players,
            tables: currentState.tables,
            currentLevel: currentState.currentLevel,
            timeRemaining: currentState.timeRemaining,
            isRunning: currentState.isRunning,
            isPaused: currentState.isPaused,
            gameStarted: currentState.gameStarted,
          });
          
          const newSerialized = JSON.stringify({
            settings: newState.settings,
            blinds: newState.blinds,
            players: newState.players,
            tables: newState.tables,
            currentLevel: newState.currentLevel,
            timeRemaining: newState.timeRemaining,
            isRunning: newState.isRunning,
            isPaused: newState.isPaused,
            gameStarted: newState.gameStarted,
          });
          
          if (currentSerialized !== newSerialized) {
            useGameStore.setState(newState);
          }
          
          setTimeout(() => { isReceiving = false; }, 50);
        }
      };

      // Подписываемся на изменения store и рассылаем другим вкладкам
      const unsubscribe = useGameStore.subscribe((state) => {
        // Не отправляем если мы сами получили это обновление
        if (isReceiving) return;
        
        channel?.postMessage({
          type: 'STATE_UPDATE',
          state: {
            settings: state.settings,
            blinds: state.blinds,
            players: state.players,
            tables: state.tables,
            currentLevel: state.currentLevel,
            timeRemaining: state.timeRemaining,
            isRunning: state.isRunning,
            isPaused: state.isPaused,
            gameStarted: state.gameStarted,
            theme: state.theme,
          }
        });
      });

      return () => {
        unsubscribe();
        channel?.close();
      };
    } catch (e) {
      // BroadcastChannel не поддерживается
      return () => {};
    }
  }, []);
}
