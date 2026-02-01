import { Unit, UNIT_DEFINITIONS } from '../types/units';
import { Heart, Sword, Footprints, Eye } from 'lucide-react';
import { EffectType } from '../types/effects';

interface UnitInfoPanelProps {
  unit: Unit | null;
}

export function UnitInfoPanel({ unit }: UnitInfoPanelProps) {
  if (!unit) {
    return (
      <div className="w-80 bg-gradient-to-br from-amber-950/50 to-purple-950/50 p-6 rounded-lg border-2 border-amber-600/40">
        <p className="text-amber-300/60 text-sm">Select a unit to view details</p>
      </div>
    );
  }

  const def = UNIT_DEFINITIONS[unit.type];
  const teamLabel = unit.team === 'player1' ? 'PLAYER 1' : 'PLAYER 2';
  const teamColor = unit.team === 'player1' ? 'text-red-400' : 'text-blue-400';
  const hasAttackBlocked = unit.effects.some(e => e.type === EffectType.ATTACK_BLOCKED);
  const hasMovementBlocked = unit.effects.some(e => e.type === EffectType.MOVEMENT_BLOCKED);

  return (
    <div className="w-80 bg-gradient-to-br from-amber-950/50 to-purple-950/50 p-6 rounded-lg border-2 border-amber-600/40 space-y-4">
      <div className="border-b border-amber-600/30 pb-4">
        <p className={`text-xs font-bold tracking-widest ${teamColor} mb-2`}>
          {teamLabel}
        </p>
        <h2 className="text-2xl font-bold text-amber-300">{def.name}</h2>
        <p className="text-sm text-amber-300/60 mt-1">{def.description}</p>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-3 text-amber-200">
          <Heart className="text-red-400" size={18} />
          <div className="flex-1">
            <span className="text-xs text-amber-300/60">HP</span>
            <div className="text-sm font-semibold">
              {unit.stats.hp}/{unit.stats.maxHp}
            </div>
          </div>
          <div className="w-24 h-2 bg-slate-800/50 rounded border border-amber-600/30">
            <div
              className="h-full bg-gradient-to-r from-green-500 to-green-400 rounded transition-all"
              style={{
                width: `${(unit.stats.hp / unit.stats.maxHp) * 100}%`,
              }}
            />
          </div>
        </div>

        <div className="flex items-center gap-3 text-amber-200">
          <Sword className="text-orange-400" size={18} />
          <div>
            <span className="text-xs text-amber-300/60">ATK</span>
            <div className="text-sm font-semibold">{unit.stats.attack}</div>
          </div>
        </div>

        <div className="flex items-center gap-3 text-amber-200">
          <Footprints className="text-yellow-400" size={18} />
          <div>
            <span className="text-xs text-amber-300/60">MOVEMENT</span>
            <div className="text-sm font-semibold">{unit.stats.movement}</div>
          </div>
        </div>

        {unit.stats.range && (
          <div className="flex items-center gap-3 text-amber-200">
            <Eye className="text-blue-400" size={18} />
            <div>
              <span className="text-xs text-amber-300/60">RANGE</span>
              <div className="text-sm font-semibold">{unit.stats.range}</div>
            </div>
          </div>
        )}
      </div>

      <div className="border-t border-amber-600/30 pt-4 mt-4">
        <p className="text-xs font-bold text-amber-400 tracking-wide mb-2">ABILITY</p>
        <p className="text-sm text-amber-300/80 leading-relaxed">
          {def.ability}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2 pt-2">
        {unit.actionsUsed > 0 && (
          <div className="text-xs text-amber-400 font-semibold px-2 py-1 bg-amber-500/10 rounded border border-amber-400/30">
            ACTIONS: {unit.actionsUsed}/2
          </div>
        )}
        {unit.hasAttacked && (
          <div className="text-xs text-red-400 font-semibold px-2 py-1 bg-red-500/10 rounded border border-red-400/30">
            ATTACKED
          </div>
        )}
        {hasAttackBlocked && (
          <div className="text-xs text-red-400 font-semibold px-2 py-1 bg-red-500/10 rounded border border-red-400/30">
            CANNOT ATTACK
          </div>
        )}
        {hasMovementBlocked && (
          <div className="text-xs text-orange-400 font-semibold px-2 py-1 bg-orange-500/10 rounded border border-orange-400/30">
            CANNOT MOVE
          </div>
        )}
      </div>
    </div>
  );
}
