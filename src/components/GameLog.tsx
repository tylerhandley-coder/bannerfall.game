import { useEffect, useRef } from 'react';
import { GameLogEntry, GameLogType } from '../types/gameLog';
import { PlayerTeam } from '../types/units';
import { Sword, Move, Sparkles, Skull, Play } from 'lucide-react';

interface GameLogProps {
  entries: GameLogEntry[];
}

const getLogIcon = (type: GameLogType) => {
  switch (type) {
    case GameLogType.MOVE:
      return <Move size={14} />;
    case GameLogType.ATTACK:
      return <Sword size={14} />;
    case GameLogType.CARD_CAST:
      return <Sparkles size={14} />;
    case GameLogType.UNIT_DEFEATED:
      return <Skull size={14} />;
    case GameLogType.TURN_START:
      return <Play size={14} />;
  }
};

const getPlayerColor = (player: PlayerTeam) => {
  return player === PlayerTeam.PLAYER1
    ? 'text-red-400'
    : 'text-blue-400';
};

const getBackgroundColor = (type: GameLogType) => {
  switch (type) {
    case GameLogType.ATTACK:
      return 'bg-red-900/30 border-red-500/30';
    case GameLogType.UNIT_DEFEATED:
      return 'bg-orange-900/30 border-orange-500/30';
    case GameLogType.CARD_CAST:
      return 'bg-purple-900/30 border-purple-500/30';
    case GameLogType.TURN_START:
      return 'bg-green-900/30 border-green-500/30';
    default:
      return 'bg-slate-900/30 border-slate-500/30';
  }
};

export function GameLog({ entries }: GameLogProps) {
  const logContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = 0;
    }
  }, [entries]);

  return (
    <div className="w-80 flex flex-col gap-3 h-full">
      <h2 className="text-amber-300 font-bold text-lg tracking-wide text-center">
        BATTLE LOG
      </h2>
      <div ref={logContainerRef} className="flex-1 overflow-y-auto space-y-2 pr-2" style={{ maxHeight: '70vh' }}>
        {entries.slice().reverse().map((entry) => (
          <div
            key={entry.id}
            className={`flex items-start gap-2 px-3 py-2 rounded-lg border ${getBackgroundColor(entry.type)} transition-all animate-in slide-in-from-right duration-300`}
          >
            <div className={`flex-shrink-0 mt-0.5 ${getPlayerColor(entry.player)}`}>
              {getLogIcon(entry.type)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs text-slate-400 font-mono">
                Turn {entry.turn}
              </div>
              <div className={`text-sm font-medium ${getPlayerColor(entry.player)}`}>
                {entry.player === PlayerTeam.PLAYER1 ? 'P1' : 'P2'}
              </div>
              <div className="text-sm text-slate-200 leading-tight">
                {entry.message}
              </div>
            </div>
          </div>
        ))}
        {entries.length === 0 && (
          <div className="text-center text-slate-500 text-sm py-8">
            No actions yet. Start the battle!
          </div>
        )}
      </div>
    </div>
  );
}
