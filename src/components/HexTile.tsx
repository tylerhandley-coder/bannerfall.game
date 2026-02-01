import { MountainIcon } from './icons/MountainIcon';

interface HexTileProps {
  q: number;
  r: number;
  size: number;
  hasPlateau?: boolean;
  isValidMove?: boolean;
  isValidPlacementZone?: boolean;
  isInvalidPlacementZone?: boolean;
  placementZoneColor?: 'red' | 'blue';
  onClick?: () => void;
  onRightClick?: (e: React.MouseEvent) => void;
}

export function HexTile({ q, r, size, hasPlateau, isValidMove, isValidPlacementZone, isInvalidPlacementZone, placementZoneColor, onClick, onRightClick }: HexTileProps) {
  const height = size * 2;
  const width = Math.sqrt(3) * size;
  const vertDist = height * 0.75;
  const horizDist = width;

  const x = q * horizDist + (r % 2) * (horizDist / 2);
  const y = r * vertDist;

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

  const elevation = 8;
  const shadowPoints = [
    [0, -size + elevation],
    [width / 2, -size / 2 + elevation],
    [width / 2, size / 2 + elevation],
    [0, size + elevation],
    [-width / 2, size / 2 + elevation],
    [-width / 2, -size / 2 + elevation],
  ]
    .map(([px, py]) => `${px},${py}`)
    .join(' ');

  const rightFace = [
    [width / 2, -size / 2],
    [width / 2, -size / 2 + elevation],
    [width / 2, size / 2 + elevation],
    [width / 2, size / 2],
  ]
    .map(([px, py]) => `${px},${py}`)
    .join(' ');

  const leftFace = [
    [-width / 2, -size / 2],
    [-width / 2, -size / 2 + elevation],
    [-width / 2, size / 2 + elevation],
    [-width / 2, size / 2],
  ]
    .map(([px, py]) => `${px},${py}`)
    .join(' ');

  return (
    <g
      transform={`translate(${x}, ${y})`}
      onClick={onClick}
      onContextMenu={onRightClick}
      className="cursor-pointer transition-all duration-200 hover:opacity-80"
    >
      {hasPlateau ? (
        <>
          <defs>
            <linearGradient id={`topGrad-${q}-${r}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#e5c29f" />
              <stop offset="100%" stopColor="#c9a87a" />
            </linearGradient>
            <linearGradient id={`rightGrad-${q}-${r}`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#a68b6a" />
              <stop offset="100%" stopColor="#8b7355" />
            </linearGradient>
            <linearGradient id={`leftGrad-${q}-${r}`} x1="100%" y1="0%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#8b7355" />
              <stop offset="100%" stopColor="#6d5c47" />
            </linearGradient>
          </defs>

          <polygon
            points={shadowPoints}
            fill="#3a2f24"
            opacity="0.3"
            className="blur-sm"
          />

          <polygon
            points={rightFace}
            fill={`url(#rightGrad-${q}-${r})`}
            stroke="#6d5c47"
            strokeWidth="1"
          />

          <polygon
            points={leftFace}
            fill={`url(#leftGrad-${q}-${r})`}
            stroke="#5a4a38"
            strokeWidth="1"
          />

          <polygon
            points={points}
            fill={`url(#topGrad-${q}-${r})`}
            stroke="#a68b6a"
            strokeWidth="2"
            className="hover:opacity-90"
          />

          <polygon
            points={points}
            className="fill-none stroke-yellow-400/10"
            strokeWidth="1"
            strokeDasharray="4,4"
          />

          <g transform="translate(0, 0)">
            <MountainIcon size={size * 1.2} color="#8b7355" />
          </g>
        </>
      ) : (
        <>
          <polygon
            points={points}
            className={`stroke-amber-600/80 ${
              isValidMove
                ? 'fill-green-500/40 hover:fill-green-400/60'
                : isValidPlacementZone && placementZoneColor === 'red'
                ? 'fill-red-700/30 hover:fill-red-600/40'
                : isValidPlacementZone && placementZoneColor === 'blue'
                ? 'fill-blue-700/30 hover:fill-blue-600/40'
                : isInvalidPlacementZone
                ? 'fill-slate-900/30 hover:fill-slate-800/30'
                : 'fill-amber-800/40 hover:fill-amber-700/50'
            }`}
            strokeWidth="2"
          />
          <polygon
            points={points}
            className={`fill-none ${
              isValidMove
                ? 'stroke-green-400/60'
                : isValidPlacementZone && placementZoneColor === 'red'
                ? 'stroke-red-400/40'
                : isValidPlacementZone && placementZoneColor === 'blue'
                ? 'stroke-blue-400/40'
                : isInvalidPlacementZone
                ? 'stroke-slate-600/40'
                : 'stroke-yellow-400/20'
            }`}
            strokeWidth="1"
            strokeDasharray="4,4"
          />
          {isValidMove && (
            <polygon
              points={points}
              className="fill-green-400/20 animate-pulse"
              strokeWidth="0"
            />
          )}
          {isValidPlacementZone && placementZoneColor === 'red' && (
            <polygon
              points={points}
              className="fill-red-400/15"
              strokeWidth="0"
            />
          )}
          {isValidPlacementZone && placementZoneColor === 'blue' && (
            <polygon
              points={points}
              className="fill-blue-400/15"
              strokeWidth="0"
            />
          )}
        </>
      )}
    </g>
  );
}
