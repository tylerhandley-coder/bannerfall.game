import { useState } from 'react';
import { createGame } from '../services/multiplayerGame';
import { Copy, CheckCircle } from 'lucide-react';

interface CreateGameProps {
  onGameCreated: (gameId: string, gameCode: string, playerId: string) => void;
  onBack: () => void;
}

export function CreateGame({ onGameCreated, onBack }: CreateGameProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [gameCode, setGameCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreateGame = async () => {
    setIsCreating(true);
    setError(null);

    const playerId = localStorage.getItem('playerId') || `player_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('playerId', playerId);

    const result = await createGame(playerId);

    if (result) {
      setGameCode(result.gameCode);
      onGameCreated(result.gameId, result.gameCode, playerId);
    } else {
      setError('Failed to create game. Please try again.');
      setIsCreating(false);
    }
  };

  const copyGameCode = () => {
    if (gameCode) {
      navigator.clipboard.writeText(gameCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="bg-slate-800/50 backdrop-blur-sm border-2 border-slate-600 rounded-lg p-8 max-w-md w-full">
        <h2 className="text-3xl font-bold text-slate-100 mb-6 text-center">Create Game</h2>

        {!gameCode ? (
          <div className="space-y-4">
            <p className="text-slate-300 text-center">
              Create a new multiplayer game and share the code with your opponent.
            </p>

            {error && (
              <div className="bg-red-900/30 border border-red-500 text-red-200 px-4 py-3 rounded">
                {error}
              </div>
            )}

            <button
              onClick={handleCreateGame}
              disabled={isCreating}
              className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-lg transition-colors"
            >
              {isCreating ? 'Creating...' : 'Create Game'}
            </button>

            <button
              onClick={onBack}
              disabled={isCreating}
              className="w-full bg-slate-600 hover:bg-slate-700 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-lg transition-colors"
            >
              Back
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-slate-300 text-center">
              Game created! Share this code with your opponent:
            </p>

            <div className="bg-slate-900/50 border-2 border-emerald-500 rounded-lg p-6 text-center">
              <div className="text-5xl font-bold text-emerald-400 tracking-wider mb-4">
                {gameCode}
              </div>

              <button
                onClick={copyGameCode}
                className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
              >
                {copied ? (
                  <>
                    <CheckCircle size={18} />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy size={18} />
                    Copy Code
                  </>
                )}
              </button>
            </div>

            <p className="text-slate-400 text-sm text-center">
              Waiting for opponent to join...
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
