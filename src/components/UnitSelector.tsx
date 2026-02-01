import { UnitType, UNIT_DEFINITIONS, PlayerTeam } from '../types/units';
import { Crown, Axe, Wand2 } from 'lucide-react';
import { BowIcon } from './icons/BowIcon';
import { KnifeIcon } from './icons/KnifeIcon';
import { MountainIcon } from './icons/MountainIcon';
import { FlagIcon } from './icons/FlagIcon';

interface UnitSelectorProps {
  selectedUnitType: UnitType | null;
  onSelectUnitType: (type: UnitType) => void;
  currentPlayer: PlayerTeam;
  onReady: () => void;
  unitCounts: Record<UnitType, number>;
  isReady?: boolean;
  readyButtonText?: string;
}

const UNIT_ICONS: Record<UnitType, React.ReactNode> = {
  [UnitType.WARLORD]: <Crown size={24} />,
  [UnitType.BRUTE]: <Axe size={24} />,
  [UnitType.ARCHER]: <BowIcon size={24} />,
  [UnitType.MAGE]: <Wand2 size={24} />,
  [UnitType.ASSASSIN]: <KnifeIcon size={24} />,
  [UnitType.PLATEAU]: <MountainIcon size={24} />,
  [UnitType.FLAG]: <FlagIcon size={24} />,
};

const UNIT_COLORS: Record<UnitType, string> = {
  [UnitType.BRUTE]: '#7b3f3f',
  [UnitType.ARCHER]: '#718063',
  [UnitType.ASSASSIN]: '#3d3d5c',
  [UnitType.MAGE]: '#6b5b95',
  [UnitType.WARLORD]: '#a08752',
  [UnitType.PLATEAU]: '#8b7355',
  [UnitType.FLAG]: '#00D4FF',
};

const UNIT_LIMITS: Record<UnitType, number> = {
  [UnitType.BRUTE]: 5,
  [UnitType.ARCHER]: 4,
  [UnitType.MAGE]: 2,
  [UnitType.ASSASSIN]: 2,
  [UnitType.WARLORD]: 1,
  [UnitType.PLATEAU]: 2,
  [UnitType.FLAG]: 1,
};

export function UnitSelector({
  selectedUnitType,
  onSelectUnitType,
  currentPlayer,
  onReady,
  unitCounts,
  isReady = false,
  readyButtonText = 'Ready',
}: UnitSelectorProps) {
  const unitTypes = Object.values(UnitType).filter(type => type !== UnitType.PLATEAU);
  const playerLabel = currentPlayer === PlayerTeam.PLAYER1 ? 'PLAYER 1' : 'PLAYER 2';

  return (
    <div className="w-64 bg-gradient-to-br from-amber-950/50 to-purple-950/50 p-6 rounded-lg border-2 border-amber-600/40 space-y-4">
      <div className="border-b border-amber-600/30 pb-4">
        <h2 className="text-2xl font-bold text-amber-300 mb-2">PLACE UNITS</h2>
        <p
          className={`text-xs font-bold tracking-widest ${
            currentPlayer === PlayerTeam.PLAYER1 ? 'text-red-400' : 'text-blue-400'
          }`}
        >
          {playerLabel}
        </p>
      </div>

      <div className="space-y-2">
        <p className="text-xs text-amber-300/70 mb-2 font-semibold">TERRAIN</p>
        {[UnitType.PLATEAU].map((type) => {
          const def = UNIT_DEFINITIONS[type];
          const isSelected = selectedUnitType === type;
          const remaining = UNIT_LIMITS[type] - unitCounts[type];
          const isExhausted = remaining <= 0;

          return (
            <button
              key={type}
              onClick={() => !isExhausted && onSelectUnitType(type)}
              disabled={isExhausted}
              className={`w-full p-3 rounded-lg border-2 transition-all ${
                isExhausted
                  ? 'border-slate-700 bg-slate-900/40 opacity-50 cursor-not-allowed'
                  : isSelected
                  ? 'border-yellow-400 bg-amber-700/40 shadow-lg shadow-yellow-400/20'
                  : 'border-amber-600/40 bg-amber-900/20 hover:bg-amber-800/30 hover:border-amber-500/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center border-4 ${
                    isExhausted
                      ? 'border-slate-600'
                      : isSelected
                      ? 'border-yellow-300'
                      : currentPlayer === PlayerTeam.PLAYER1
                      ? 'border-red-500/60'
                      : 'border-blue-500/60'
                  }`}
                  style={{
                    backgroundColor: UNIT_COLORS[type],
                  }}
                >
                  <div className="text-white">{UNIT_ICONS[type]}</div>
                </div>

                <div className="flex-1 text-left">
                  <h3 className="text-base font-bold text-amber-300">{def.name}</h3>
                </div>

                <div className={`text-sm font-bold px-2 py-1 rounded ${
                  isExhausted ? 'bg-slate-700 text-slate-400' : 'bg-amber-800/50 text-amber-200'
                }`}>
                  {remaining}/{UNIT_LIMITS[type]}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="border-t border-amber-600/30 pt-4 space-y-2">
        {unitTypes.map((type) => {
          const def = UNIT_DEFINITIONS[type];
          const isSelected = selectedUnitType === type;
          const remaining = UNIT_LIMITS[type] - unitCounts[type];
          const isExhausted = remaining <= 0;

          return (
            <button
              key={type}
              onClick={() => !isExhausted && onSelectUnitType(type)}
              disabled={isExhausted}
              className={`w-full p-3 rounded-lg border-2 transition-all ${
                isExhausted
                  ? 'border-slate-700 bg-slate-900/40 opacity-50 cursor-not-allowed'
                  : isSelected
                  ? 'border-yellow-400 bg-amber-700/40 shadow-lg shadow-yellow-400/20'
                  : 'border-amber-600/40 bg-amber-900/20 hover:bg-amber-800/30 hover:border-amber-500/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center border-4 ${
                    isExhausted
                      ? 'border-slate-600'
                      : isSelected
                      ? 'border-yellow-300'
                      : currentPlayer === PlayerTeam.PLAYER1
                      ? 'border-red-500/60'
                      : 'border-blue-500/60'
                  }`}
                  style={{
                    backgroundColor: UNIT_COLORS[type],
                  }}
                >
                  <div className="text-white">{UNIT_ICONS[type]}</div>
                </div>

                <div className="flex-1 text-left">
                  <h3 className="text-base font-bold text-amber-300">{def.name}</h3>
                </div>

                <div className={`text-sm font-bold px-2 py-1 rounded ${
                  isExhausted ? 'bg-slate-700 text-slate-400' : 'bg-amber-800/50 text-amber-200'
                }`}>
                  {remaining}/{UNIT_LIMITS[type]}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <button
        onClick={onReady}
        disabled={isReady}
        className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-bold py-3 px-6 rounded-lg shadow-xl border-2 border-green-400/50 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
      >
        {readyButtonText}
      </button>
    </div>
  );
}
