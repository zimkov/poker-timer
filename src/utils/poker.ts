export interface PokerHand {
  name: string;
  nameRu: string;
  description: string;
  emoji: string;
  rank: number;
}

export const pokerHands: PokerHand[] = [
  { name: 'Royal Flush', nameRu: 'Роял-флеш', description: 'A, K, Q, J, 10 одной масти', emoji: '👑', rank: 1 },
  { name: 'Straight Flush', nameRu: 'Стрит-флеш', description: '5 карт одной масти подряд', emoji: '🔥', rank: 2 },
  { name: 'Four of a Kind', nameRu: 'Каре', description: '4 карты одного достоинства', emoji: '💎', rank: 3 },
  { name: 'Full House', nameRu: 'Фулл-хаус', description: 'Тройка + пара', emoji: '🏠', rank: 4 },
  { name: 'Flush', nameRu: 'Флеш', description: '5 карт одной масти', emoji: '♠️', rank: 5 },
  { name: 'Straight', nameRu: 'Стрит', description: '5 карт подряд', emoji: '📏', rank: 6 },
  { name: 'Three of a Kind', nameRu: 'Тройка', description: '3 карты одного достоинства', emoji: '🎯', rank: 7 },
  { name: 'Two Pair', nameRu: 'Две пары', description: 'Две разные пары', emoji: '✌️', rank: 8 },
  { name: 'One Pair', nameRu: 'Пара', description: '2 карты одного достоинства', emoji: '🃏', rank: 9 },
  { name: 'High Card', nameRu: 'Старшая карта', description: 'Нет комбинации', emoji: '🂡', rank: 10 },
];

export const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

export const formatMoney = (amount: number): string => {
  return new Intl.NumberFormat('ru-RU').format(amount);
};

export const playBeep = (frequency: number = 800, duration: number = 200) => {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = frequency;
    oscillator.type = 'sine';
    gainNode.gain.value = 0.1;
    
    oscillator.start();
    oscillator.stop(audioContext.currentTime + duration / 1000);
  } catch (e) {
    // Audio not supported
  }
};

export const playWarningSound = () => {
  playBeep(600, 300);
  setTimeout(() => playBeep(800, 300), 350);
  setTimeout(() => playBeep(1000, 500), 700);
};

export const playLevelUpSound = () => {
  playBeep(523, 200);
  setTimeout(() => playBeep(659, 200), 250);
  setTimeout(() => playBeep(784, 200), 500);
  setTimeout(() => playBeep(1047, 400), 750);
};
