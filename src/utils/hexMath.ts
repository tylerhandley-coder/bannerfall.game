export interface HexCoord {
  q: number;
  r: number;
}

// Convert offset coordinates to cube coordinates
function offsetToCube(offset: HexCoord): { q: number; r: number; s: number } {
  const q = offset.q - Math.floor(offset.r / 2);
  const r = offset.r;
  const s = -q - r;
  return { q, r, s };
}

export function hexDistance(a: HexCoord, b: HexCoord): number {
  const cubeA = offsetToCube(a);
  const cubeB = offsetToCube(b);
  return (Math.abs(cubeA.q - cubeB.q) + Math.abs(cubeA.r - cubeB.r) + Math.abs(cubeA.s - cubeB.s)) / 2;
}

export function getHexesInRange(center: HexCoord, range: number): HexCoord[] {
  const results: HexCoord[] = [];

  for (let q = center.q - range; q <= center.q + range; q++) {
    for (let r = center.r - range; r <= center.r + range; r++) {
      const coord = { q, r };
      if (hexDistance(center, coord) <= range) {
        results.push(coord);
      }
    }
  }

  return results;
}

// Convert cube coordinates back to offset coordinates
function cubeToOffset(cube: { q: number; r: number; s: number }): HexCoord {
  const r = cube.r;
  const q = cube.q + Math.floor(cube.r / 2);
  return { q, r };
}

// Round cube coordinates to nearest hex
function cubeRound(cube: { q: number; r: number; s: number }): { q: number; r: number; s: number } {
  let rq = Math.round(cube.q);
  let rr = Math.round(cube.r);
  let rs = Math.round(cube.s);

  const qDiff = Math.abs(rq - cube.q);
  const rDiff = Math.abs(rr - cube.r);
  const sDiff = Math.abs(rs - cube.s);

  if (qDiff > rDiff && qDiff > sDiff) {
    rq = -rr - rs;
  } else if (rDiff > sDiff) {
    rr = -rq - rs;
  } else {
    rs = -rq - rr;
  }

  return { q: rq, r: rr, s: rs };
}

// Linear interpolation for cube coordinates
function cubeLerp(a: { q: number; r: number; s: number }, b: { q: number; r: number; s: number }, t: number): { q: number; r: number; s: number } {
  return {
    q: a.q + (b.q - a.q) * t,
    r: a.r + (b.r - a.r) * t,
    s: a.s + (b.s - a.s) * t,
  };
}

// Get all hexes along a line from start to end (excluding start and end)
export function getHexLine(start: HexCoord, end: HexCoord): HexCoord[] {
  const cubeA = offsetToCube(start);
  const cubeB = offsetToCube(end);
  const distance = hexDistance(start, end);
  const results: HexCoord[] = [];

  for (let i = 1; i < distance; i++) {
    const t = i / distance;
    const interpolated = cubeLerp(cubeA, cubeB, t);
    const rounded = cubeRound(interpolated);
    const offset = cubeToOffset(rounded);
    results.push(offset);
  }

  return results;
}

// Get all adjacent hexes to a given hex
export function getAdjacentHexes(center: HexCoord): HexCoord[] {
  // Hex neighbors in offset coordinates (even-r horizontal layout)
  const evenRow = center.r % 2 === 0;
  const offsets = evenRow
    ? [
        { q: 1, r: 0 },  // E
        { q: 0, r: -1 }, // NE
        { q: -1, r: -1 }, // NW
        { q: -1, r: 0 }, // W
        { q: -1, r: 1 }, // SW
        { q: 0, r: 1 },  // SE
      ]
    : [
        { q: 1, r: 0 },  // E
        { q: 1, r: -1 }, // NE
        { q: 0, r: -1 }, // NW
        { q: -1, r: 0 }, // W
        { q: 0, r: 1 },  // SW
        { q: 1, r: 1 },  // SE
      ];

  return offsets.map(offset => ({ q: center.q + offset.q, r: center.r + offset.r }));
}

// Check if there's a clear path from start to end within maxDistance
// Returns true if a path exists that doesn't go through blocked hexes
export function hasPathWithinRange(
  start: HexCoord,
  end: HexCoord,
  maxDistance: number,
  isBlocked: (hex: HexCoord) => boolean
): boolean {
  const distance = hexDistance(start, end);
  if (distance > maxDistance) return false;
  if (distance === 0) return true;

  // BFS to find if there's any path
  const queue: { hex: HexCoord; dist: number }[] = [{ hex: start, dist: 0 }];
  const visited = new Set<string>();
  visited.add(`${start.q},${start.r}`);

  while (queue.length > 0) {
    const current = queue.shift()!;

    // Check all adjacent hexes
    const neighbors = getAdjacentHexes(current.hex);

    for (const neighbor of neighbors) {
      const key = `${neighbor.q},${neighbor.r}`;

      // Skip if already visited
      if (visited.has(key)) continue;

      // Calculate distance from start
      const distFromStart = hexDistance(start, neighbor);

      // Skip if too far
      if (distFromStart > maxDistance) continue;

      // Mark as visited
      visited.add(key);

      // Check if we reached the target
      if (neighbor.q === end.q && neighbor.r === end.r) {
        return true;
      }

      // Skip if blocked (but we can still reach the target even if it's blocked)
      if (isBlocked(neighbor)) continue;

      // Add to queue for further exploration
      queue.push({ hex: neighbor, dist: current.dist + 1 });
    }
  }

  return false;
}
