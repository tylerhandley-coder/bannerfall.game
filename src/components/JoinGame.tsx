import { useState } from 'react';
import { joinGame } from '../services/multiplayerGame';

interface JoinGameProps {
  onGameJoined: (gameId: string, playerId: string) => void;
  onBack: () => void;
}

export function JoinGame({ onGameJoined, onBack }: JoinGameProps) {
  const [gameCode, setGameCode] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleJoinGame = async () => {
    if (!gameCode || gameCode.length !== 6) {
      setError('Please enter a valid 6-character game code.');
      return;
    }

    setIsJoining(true);
    setError(null);

    const playerId = localStorage.getItem('playerId') || `player_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('playerId', playerId);

    const gameId = await joinGame(gameCode.toUpperCase(), playerId);

    if (gameId) {
      onGameJoined(gameId, playerId);
    } else {
      setError('Game not found or already full. Please check the code and try again.');
      setIsJoining(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);
    setGameCode(value);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="bg-slate-800/50 backdrop-blur-sm border-2 border-slate-600 rounded-lg p-8 max-w-md w-full">
        <h2 className="text-3xl font-bold text-slate-100 mb-6 text-center">Join Game</h2>

        <div className="space-y-4">
          <p className="text-slate-300 text-center">
            Enter the 6-character game code to join:
          </p>

          <input
            type="text"
            value={gameCode}
            onChange={handleInputChange}
            placeholder="ABC123"
            maxLength={6}
            className="w-full bg-slate-900/50 border-2 border-slate-600 focus:border-emerald-500 text-white text-center text-2xl font-bold tracking-wider py-3 px-4 rounded-lg outline-none transition-colors uppercase"
            autoFocus
            disabled={isJoining}
          />

          {error && (
            <div className="bg-red-900/30 border border-red-500 text-red-200 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <button
            onClick={handleJoinGame}
            disabled={isJoining || gameCode.length !== 6}
            className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-lg transition-colors"
          >
            {isJoining ? 'Joining...' : 'Join Game'}
          </button>

          <button
            onClick={onBack}
            disabled={isJoining}
            className="w-full bg-slate-600 hover:bg-slate-700 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-lg transition-colors"
          >
            Back
          </button>
        </div>
      </div>
    </div>
  );
}
