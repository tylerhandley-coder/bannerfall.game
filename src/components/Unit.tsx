import { Unit, UnitType, PlayerTeam } from '../types/units';
import {
  Crown,
  Axe,
  Wand2,
  Sparkles,
} from 'lucide-react';
import { BowIcon } from './icons/BowIcon';
import { NinjaIcon } from './icons/NinjaIcon';
import { MountainIcon } from './icons/MountainIcon';
import { FlagIcon } from './icons/FlagIcon';
import { EffectTooltip } from './EffectTooltip';

interface UnitProps {
  unit: Unit;
  isSelected?: boolean;
  isAttackable?: boolean;
  isCardTarget?: boolean;
  onClick?: () => void;
}

const hasActiveEffects = (unit: Unit): boolean => {
  return unit.effects.length > 0;
};

const UNIT_ICONS: Record<string, React.ReactNode> = {
  warlord: <Crown size={42} />,
  brute: <Axe size={42} />,
  archer: <BowIcon size={42} />,
  mage: <Wand2 size={42} />,
  assassin: <NinjaIcon size={42} />,
  plateau: <MountainIcon size={42} />,
  flag: <FlagIcon size={42} />,
};

const UNIT_COLORS: Record<string, string> = {
  brute: '#7b3f3f',
  archer: '#718063',
  assassin: '#3d3d5c',
  mage: '#6b5b95',
  warlord: '#a08752',
  plateau: '#8b7355',
  flag: '#00D4FF',
};

export function UnitComponent({ unit, isSelected, isAttackable, isCardTarget, onClick }: UnitProps) {
  const unitColor = UNIT_COLORS[unit.type];
  const hpPercent = (unit.stats.hp / unit.stats.maxHp) * 100;
  const isPlateau = unit.type === UnitType.PLATEAU;
  const isFlag = unit.type === UnitType.FLAG;

  if (isFlag) {
    const size = 48;
    const width = Math.sqrt(3) * size;
    const points = [
      [0, -size],
      [width / 2, -size / 2],
      [width / 2, size / 2],
      [0, size],
      [-width / 2, size / 2],
      [-width / 2, -size / 2],
    ]
      .map(([px, py]) => `${px},${py}`)
      .join(' ');

    const teamColor = unit.team === PlayerTeam.PLAYER1 ? '#ef4444' : '#3b82f6';
    const unitHasEffects = hasActiveEffects(unit);
    const outerSize = 52;
    const outerWidth = Math.sqrt(3) * outerSize;
    const outerPoints = [
      [0, -outerSize],
      [outerWidth / 2, -outerSize / 2],
      [outerWidth / 2, outerSize / 2],
      [0, outerSize],
      [-outerWidth / 2, outerSize / 2],
      [-outerWidth / 2, -outerSize / 2],
    ]
      .map(([px, py]) => `${px},${py}`)
      .join(' ');

    const effectSize = 56;
    const effectWidth = Math.sqrt(3) * effectSize;
    const effectPoints = [
      [0, -effectSize],
      [effectWidth / 2, -effectSize / 2],
      [effectWidth / 2, effectSize / 2],
      [0, effectSize],
      [-effectWidth / 2, effectSize / 2],
      [-effectWidth / 2, -effectSize / 2],
    ]
      .map(([px, py]) => `${px},${py}`)
      .join(' ');

    return (
      <g onClick={onClick} className="cursor-pointer" style={{ pointerEvents: 'auto' }}>
        {unitHasEffects && (
          <polygon
            points={effectPoints}
            fill="none"
            className="stroke-[4] animate-pulse"
            style={{ stroke: '#fbbf24' }}
            opacity="0.9"
          />
        )}

        {isAttackable && (
          <>
            <polygon
              points={effectPoints}
              fill="none"
              className="stroke-[6] animate-pulse"
              style={{
                stroke: '#ef4444',
                filter: 'drop-shadow(0 0 8px #ef4444) drop-shadow(0 0 12px #ef4444)'
              }}
              opacity="1"
            />
            <polygon
              points={effectPoints}
              fill="none"
              className="stroke-[3] animate-pulse"
              style={{ stroke: '#ef4444' }}
              opacity="0.6"
            />
          </>
        )}

        <polygon
          points={outerPoints}
          fill="none"
          className="stroke-[3] transition-all"
          style={{ stroke: teamColor }}
          opacity="0.9"
        />

        <polygon
          points={points}
          fill={unitColor}
          className={`stroke-2 transition-all ${
            isSelected ? 'stroke-yellow-300 drop-shadow-lg' : 'stroke-cyan-300/60'
          }`}
          opacity="0.95"
        />

        <g
          className="text-white"
          transform="translate(-21, -21)"
          style={{
            pointerEvents: 'none',
            filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.8))',
          }}
        >
          {UNIT_ICONS[unit.type]}
        </g>

        {unitHasEffects && (
          <EffectTooltip effects={unit.effects} offsetX={30} offsetY={-50}>
            <g
              transform="translate(28, -28)"
            >
              <circle cx="0" cy="0" r="10" fill="#fbbf24" opacity="0.95" />
              <circle cx="0" cy="0" r="10" fill="none" stroke="#fff" strokeWidth="1.5" opacity="0.6" />
              <g
                className="text-white animate-pulse"
                transform="translate(-8, -8)"
                style={{
                  filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.8))',
                }}
              >
                <Sparkles size={16} />
              </g>
            </g>
          </EffectTooltip>
        )}
      </g>
    );
  }

  if (isPlateau) {
    const size = 48;
    const width = Math.sqrt(3) * size;
    const points = [
      [0, -size],
      [width / 2, -size / 2],
      [width / 2, size / 2],
      [0, size],
      [-width / 2, size / 2],
      [-width / 2, -size / 2],
    ]
      .map(([px, py]) => `${px},${py}`)
      .join(' ');

    const teamColor = unit.team === PlayerTeam.PLAYER1 ? '#ef4444' : '#3b82f6';
    const unitHasEffects = hasActiveEffects(unit);
    const outerSize = 52;
    const outerWidth = Math.sqrt(3) * outerSize;
    const outerPoints = [
      [0, -outerSize],
      [outerWidth / 2, -outerSize / 2],
      [outerWidth / 2, outerSize / 2],
      [0, outerSize],
      [-outerWidth / 2, outerSize / 2],
      [-outerWidth / 2, -outerSize / 2],
    ]
      .map(([px, py]) => `${px},${py}`)
      .join(' ');

    const effectSize = 56;
    const effectWidth = Math.sqrt(3) * effectSize;
    const effectPoints = [
      [0, -effectSize],
      [effectWidth / 2, -effectSize / 2],
      [effectWidth / 2, effectSize / 2],
      [0, effectSize],
      [-effectWidth / 2, effectSize / 2],
      [-effectWidth / 2, -effectSize / 2],
    ]
      .map(([px, py]) => `${px},${py}`)
      .join(' ');

    return (
      <g onClick={onClick} className="cursor-pointer" style={{ pointerEvents: 'auto' }}>
        {unitHasEffects && (
          <polygon
            points={effectPoints}
            fill="none"
            className="stroke-[4] animate-pulse"
            style={{ stroke: '#fbbf24' }}
            opacity="0.9"
          />
        )}

        <polygon
          points={outerPoints}
          fill="none"
          className="stroke-[3] transition-all"
          style={{ stroke: teamColor }}
          opacity="0.9"
        />

        <polygon
          points={points}
          fill={unitColor}
          className={`stroke-2 transition-all ${
            isSelected ? 'stroke-yellow-300 drop-shadow-lg' : 'stroke-amber-400/60'
          }`}
          opacity="0.9"
        />

        <polygon
          points={points}
          className="fill-none stroke-1 stroke-amber-200/40"
          strokeDasharray="4,4"
        />

        <g
          className="text-amber-200"
          transform="translate(-21, -21)"
          style={{
            pointerEvents: 'none',
            filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.8))',
          }}
        >
          {UNIT_ICONS[unit.type]}
        </g>

        {unitHasEffects && (
          <EffectTooltip effects={unit.effects} offsetX={30} offsetY={-50}>
            <g
              transform="translate(28, -28)"
            >
              <circle cx="0" cy="0" r="10" fill="#fbbf24" opacity="0.95" />
              <circle cx="0" cy="0" r="10" fill="none" stroke="#fff" strokeWidth="1.5" opacity="0.6" />
              <g
                className="text-white animate-pulse"
                transform="translate(-8, -8)"
                style={{
                  filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.8))',
                }}
              >
                <Sparkles size={16} />
              </g>
            </g>
          </EffectTooltip>
        )}
      </g>
    );
  }

  const teamColor = unit.team === PlayerTeam.PLAYER1 ? '#ef4444' : '#3b82f6';
  const unitHasEffects = hasActiveEffects(unit);

  return (
    <g onClick={onClick} className="cursor-pointer" style={{ pointerEvents: 'auto' }}>
      <circle
        cx="0"
        cy="0"
        r="36"
        fill="none"
        className="stroke-[3] transition-all"
        style={{ stroke: teamColor }}
        opacity="0.9"
      />

      {unitHasEffects && (
        <circle
          cx="0"
          cy="0"
          r="42"
          fill="none"
          className="stroke-[4] animate-pulse"
          style={{ stroke: '#fbbf24' }}
          opacity="0.9"
        />
      )}

      {isAttackable && (
        <>
          <circle
            cx="0"
            cy="0"
            r="40"
            fill="none"
            className="stroke-[6] animate-pulse"
            style={{
              stroke: '#ef4444',
              filter: 'drop-shadow(0 0 8px #ef4444) drop-shadow(0 0 12px #ef4444)'
            }}
            opacity="1"
          />
          <circle
            cx="0"
            cy="0"
            r="44"
            fill="none"
            className="stroke-[3] animate-pulse"
            style={{ stroke: '#ef4444' }}
            opacity="0.6"
          />
        </>
      )}

      {isCardTarget && (
        <circle
          cx="0"
          cy="0"
          r="40"
          fill="none"
          className="stroke-[4] animate-pulse"
          style={{ stroke: '#8b5cf6' }}
          opacity="0.8"
        />
      )}

      <circle
        cx="0"
        cy="0"
        r="32"
        fill={unitColor}
        className={`stroke-2 transition-all ${
          isSelected ? 'stroke-yellow-300 drop-shadow-lg' : isAttackable ? 'stroke-red-400' : isCardTarget ? 'stroke-purple-400' : 'stroke-white/40'
        }`}
      />

      <circle
        cx="0"
        cy="0"
        r="30"
        className="fill-none stroke-1"
        style={{
          stroke: unitColor,
          opacity: 0.3,
        }}
      />

      <g
        className="text-white"
        transform="translate(-21, -21)"
        style={{
          pointerEvents: 'none',
          filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.8))',
        }}
      >
        {UNIT_ICONS[unit.type]}
      </g>

      <rect
        x="-20"
        y="28"
        width="40"
        height="6"
        className="fill-slate-900/60 stroke-1 stroke-yellow-400/40"
        rx="1"
      />

      <rect
        x="-20"
        y="28"
        width={(40 * hpPercent) / 100}
        height="6"
        className={`${
          hpPercent > 50
            ? 'fill-green-400'
            : hpPercent > 25
              ? 'fill-yellow-400'
              : 'fill-red-400'
        }`}
        rx="1"
      />

      <text
        x="0"
        y="42"
        textAnchor="middle"
        className="text-[10px] font-bold fill-white"
        style={{
          filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.9))',
          pointerEvents: 'none',
        }}
      >
        {unit.stats.hp}/{unit.stats.maxHp}
      </text>

      {unitHasEffects && (
        <EffectTooltip effects={unit.effects} offsetX={25} offsetY={-45}>
          <g
            transform="translate(20, -20)"
          >
            <circle cx="0" cy="0" r="10" fill="#fbbf24" opacity="0.95" />
            <circle cx="0" cy="0" r="10" fill="none" stroke="#fff" strokeWidth="1.5" opacity="0.6" />
            <g
              className="text-white animate-pulse"
              transform="translate(-8, -8)"
              style={{
                filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.8))',
              }}
            >
              <Sparkles size={16} />
            </g>
          </g>
        </EffectTooltip>
      )}
    </g>
  );
}
