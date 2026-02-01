import { PlayerTeam } from '../types/units';

interface VictoryModalProps {
  winner: PlayerTeam;
  playerTeam: PlayerTeam;
  onClose: () => void;
}

export function VictoryModal({ winner, playerTeam, onClose }: VictoryModalProps) {
  const isWinner = winner === playerTeam;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg p-8 max-w-md w-full mx-4 border-4 border-amber-500 shadow-2xl">
        <div className="text-center">
          <div className="text-6xl mb-4">
            {isWinner ? '🏆' : '💔'}
          </div>
          <h2 className="text-4xl font-bold mb-4 text-amber-400">
            {isWinner ? 'VICTORY!' : 'DEFEAT'}
          </h2>
          <p className="text-xl text-slate-300 mb-6">
            {isWinner
              ? 'You captured the enemy flag!'
              : `${winner === PlayerTeam.PLAYER1 ? 'Player 1' : 'Player 2'} captured your flag!`
            }
          </p>
          <button
            onClick={onClose}
            className="bg-amber-600 hover:bg-amber-700 text-white font-bold py-3 px-8 rounded-lg transition-colors"
          >
            Return to Lobby
          </button>
        </div>
      </div>
    </div>
  );
}
