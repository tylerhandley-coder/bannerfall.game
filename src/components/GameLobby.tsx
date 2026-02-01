import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { getGame, GameState } from '../services/multiplayerGame';
import { Copy, CheckCircle, Users, Play } from 'lucide-react';

interface GameLobbyProps {
  gameId: string;
  gameCode?: string;
  playerId: string;
  onStartGame: () => void;
}

export function GameLobby({ gameId, gameCode, playerId, onStartGame }: GameLobbyProps) {
  const [game, setGame] = useState<GameState | null>(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    loadGame();

    const channel = supabase
      .channel(`game_${gameId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'games',
          filter: `id=eq.${gameId}`
        },
        (payload) => {
          if (payload.new) {
            setGame(payload.new as GameState);

            if ((payload.new as GameState).status === 'active') {
              onStartGame();
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [gameId, onStartGame]);

  const loadGame = async () => {
    const gameData = await getGame(gameId);
    if (gameData) {
      setGame(gameData);

      if (gameData.status === 'active') {
        onStartGame();
      }
    }
    setLoading(false);
  };

  const copyGameCode = () => {
    if (gameCode) {
      navigator.clipboard.writeText(gameCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleStartGame = async () => {
    setStarting(true);

    const { error } = await supabase
      .from('games')
      .update({
        status: 'active',
        game_phase: 'play'
      })
      .eq('id', gameId);

    if (error) {
      console.error('Error starting game:', error);
      setStarting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!game) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-red-400 text-xl">Game not found</div>
      </div>
    );
  }

  const isPlayer1 = game.player1_id === playerId;
  const bothPlayersJoined = game.player1_id && game.player2_id;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="bg-slate-800/50 backdrop-blur-sm border-2 border-slate-600 rounded-lg p-8 max-w-md w-full">
        <h2 className="text-3xl font-bold text-slate-100 mb-6 text-center">Game Lobby</h2>

        {gameCode && (
          <div className="mb-6">
            <p className="text-slate-300 text-center mb-3">Game Code:</p>
            <div className="bg-slate-900/50 border-2 border-emerald-500 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-emerald-400 tracking-wider mb-3">
                {gameCode}
              </div>
              <button
                onClick={copyGameCode}
                className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors text-sm"
              >
                {copied ? (
                  <>
                    <CheckCircle size={16} />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy size={16} />
                    Copy Code
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        <div className="bg-slate-900/50 border border-slate-600 rounded-lg p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Users className="text-slate-400" size={20} />
            <h3 className="text-xl font-semibold text-slate-100">Players</h3>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between bg-slate-800/50 p-3 rounded">
              <span className="text-slate-200">Player 1</span>
              <span className={`text-sm font-semibold ${game.player1_id ? 'text-emerald-400' : 'text-slate-500'}`}>
                {game.player1_id ? 'Connected' : 'Waiting...'}
                {isPlayer1 && ' (You)'}
              </span>
            </div>

            <div className="flex items-center justify-between bg-slate-800/50 p-3 rounded">
              <span className="text-slate-200">Player 2</span>
              <span className={`text-sm font-semibold ${game.player2_id ? 'text-emerald-400' : 'text-slate-500'}`}>
                {game.player2_id ? 'Connected' : 'Waiting...'}
                {!isPlayer1 && game.player2_id && ' (You)'}
              </span>
            </div>
          </div>
        </div>

        {bothPlayersJoined ? (
          <div className="text-center">
            <p className="text-emerald-400 font-semibold mb-4">
              Both players connected!
            </p>
            {isPlayer1 ? (
              <button
                onClick={handleStartGame}
                disabled={starting}
                className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-lg transition-colors"
              >
                <Play size={20} />
                {starting ? 'Starting Game...' : 'Start Game'}
              </button>
            ) : (
              <p className="text-slate-400 text-sm">
                Waiting for host to start the game...
              </p>
            )}
          </div>
        ) : (
          <p className="text-slate-400 text-center">
            Waiting for opponent to join...
          </p>
        )}
      </div>
    </div>
  );
}
