import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { SetupPage } from './pages/SetupPage';
import { TVDisplay } from './pages/TVDisplay';
import { GameControl } from './pages/GameControl';
import { HomePage } from './pages/HomePage';
import { useGameStore } from './store/gameStore';
import { useTabSync } from './hooks/useTabSync';
import { pokerAPI } from './utils/api';
import { useEffect } from 'react';

function App() {
  const theme = useGameStore((s) => s.theme);
  useTabSync();

  // Connect to backend server for multi-device sync
  useEffect(() => {
    pokerAPI.connect();
    return () => pokerAPI.disconnect();
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    document.documentElement.classList.toggle('light', theme === 'light');
    document.body.style.backgroundColor = theme === 'dark' ? '#0f172a' : '#f8fafc';
    document.body.style.color = theme === 'dark' ? '#f1f5f9' : '#1e293b';
  }, [theme]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/setup" element={<SetupPage />} />
        <Route path="/tv" element={<TVDisplay />} />
        <Route path="/control" element={<GameControl />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
