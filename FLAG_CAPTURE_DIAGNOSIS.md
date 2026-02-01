# Flag Capture Bug Diagnosis

## Problem Statement
Players cannot win the game by moving a unit onto an opponent's flag, despite code that appears to implement this mechanic.

## Code Flow Analysis

### 1. Flag Placement (Setup Phase)
- **Location**: `HexBoard.tsx:162-192`
- FLAGS can be selected from the UnitSelector (limit: 1 per player)
- When placed, they call `createUnit(UnitType.FLAG, team, q, r)`
- Flags are added to the `units` array like any other unit

### 2. Movement Validation (Highlighting Valid Moves)
- **Location**: `HexBoard.tsx:119-133`
- **Current Logic**:
  ```typescript
  const enemyCombatUnit = unitsOnHex.find((u) =>
    u.team !== currentPlayer &&
    u.type !== UnitType.FLAG &&
    u.type !== UnitType.PLATEAU
  );

  if (tiles.some((t) => t.q === hex.q && t.r === hex.r) && !enemyCombatUnit) {
    validMovementTiles.add(`${hex.q},${hex.r}`);
  }
  ```
- **Analysis**: This correctly allows movement to hexes with enemy flags (since flags are excluded from the combat unit check)
- **Status**: ✅ WORKING

### 3. Movement Execution (Click Handler)
- **Location**: `HexBoard.tsx:193-262`
- **Current Logic**:
  ```typescript
  const enemyFlag = unitsOnHex.find((u) => u.type === UnitType.FLAG && u.team !== currentPlayer);
  const combatUnits = unitsOnHex.filter((u) => u.type !== UnitType.FLAG && u.type !== UnitType.PLATEAU);

  if (distance <= unit.stats.movement) {
    if (combatUnits.length === 0) {
      // Move the unit
      setUnits(units.map((u) =>
        u.id === selectedUnitId
          ? { ...u, q, r, actionsUsed: u.actionsUsed + actionCost, jumpedOverEnemyId }
          : u
      ));

      // Check for victory
      if (enemyFlag) {
        setWinner(currentPlayer);
        addLogEntry(GameLogType.VICTORY, `PLAYER captured the flag and won!`);
        return;
      }

      // Continue with normal move logging
      addLogEntry(GameLogType.MOVE, `${unitName} moved to (${q}, ${r})`);
      consumeAction(actionCost);
      setSelectedUnitId(null);
    }
  }
  ```

### 4. Unit Click Handler
- **Location**: `HexBoard.tsx:311-317`
- **Current Logic**:
  ```typescript
  if (clickedUnit?.type === UnitType.FLAG && clickedUnit.team !== currentPlayer && selectedUnitId) {
    return; // Don't stop propagation
  }
  e.stopPropagation();
  ```
- **Analysis**: When clicking an enemy flag with a unit selected, it returns early WITHOUT stopping propagation, allowing the click to bubble to the hex tile handler
- **Status**: ✅ WORKING

## Root Cause Analysis

### Potential Issues

#### Issue 1: Flag Not Actually on the Board
**Hypothesis**: Flags might not be getting placed during setup
- **Test**: Check if flags appear visually during gameplay
- **Likely**: ❌ FLAGS likely ARE being placed since they're in the unit selector

#### Issue 2: Movement After Flag Removed
**Hypothesis**: When a unit moves onto a flag hex, the units array is updated BEFORE checking for enemyFlag
- **Analysis**:
  ```typescript
  const enemyFlag = unitsOnHex.find(...); // Found at line 197
  // ... 40 lines later ...
  setUnits(units.map(...)); // Update units at line 241
  // ... then ...
  if (enemyFlag) { ... } // Check at line 250
  ```
- **Status**: ✅ This is CORRECT - enemyFlag is captured BEFORE the state update

#### Issue 3: Swap Logic Interference
**Hypothesis**: Friendly swap logic might be interfering
- **Location**: `HexBoard.tsx:263-310`
- **Analysis**:
  ```typescript
  if (combatUnits.length === 0) {
    // movement to empty hex
  } else if (friendlyUnitOnHex) {
    // swap with friendly unit
  }
  ```
- **Issue**: What if there's BOTH a flag and a plateau on the same hex?
  - `friendlyUnitOnHex` looks for: `u.team === currentPlayer && u.type !== UnitType.FLAG && u.type !== UnitType.PLATEAU`
  - This would be null if there's only a flag
- **Status**: ✅ Should work correctly

#### Issue 4: THE ACTUAL BUG - State Update Timing
**CRITICAL FINDING**:
```typescript
setUnits(units.map((u) =>
  u.id === selectedUnitId
    ? { ...u, q, r, actionsUsed: u.actionsUsed + actionCost, jumpedOverEnemyId }
    : u
));

// Check for victory condition - landing on opponent's flag
if (enemyFlag) {
  setWinner(currentPlayer);
  addLogEntry(GameLogType.VICTORY, ...);
  return; // ← Returns here
}

// This code runs if no enemyFlag
addLogEntry(GameLogType.MOVE, ...);
consumeAction(actionCost);
setSelectedUnitId(null);
```

**THE PROBLEM**: When a unit moves onto an enemy flag:
1. The unit's position is updated via `setUnits()` ← State update is ASYNC
2. We check if `enemyFlag` exists (which it does)
3. We set the winner and log victory
4. We return early
5. BUT we never call `consumeAction()` or `setSelectedUnitId(null)`

However, this isn't the bug - the return is correct.

#### Issue 5: THE REAL BUG - Flag Removal on Death
**Location**: `HexBoard.tsx:399`
```typescript
}).filter((u) => u.type === UnitType.FLAG || u.type === UnitType.PLATEAU || u.stats.hp > 0);
```

This filter is applied after combat to remove dead units. Flags and plateaus are kept regardless of HP.

**But wait** - let me check if flags can be attacked and "killed" before you move onto them.

#### Issue 6: Attack Logic Prevents Flag Capture
**Location**: `HexBoard.tsx:375`
```typescript
if (attacker && attacker.actionsUsed < 2 && !attacker.hasAttacked && validAttackTargets.has(unitId) && clickedUnit.type !== UnitType.FLAG) {
```

Flags CANNOT be attacked (explicitly excluded). So they can't be destroyed before capture.

#### Issue 7: THE ACTUAL PROBLEM - Movement onto Flag with Plateau
**CRITICAL**: What if a flag is placed on a plateau tile?
- Plateaus are stored separately in a `Set<string>`
- Flags are stored in the `units` array
- When checking `combatUnits`:
  ```typescript
  const combatUnits = unitsOnHex.filter((u) => u.type !== UnitType.FLAG && u.type !== UnitType.PLATEAU);
  ```
- If a hex has ONLY a flag, `combatUnits.length === 0` ✅
- If a hex has a plateau marker AND a flag, the plateau unit would be in unitsOnHex
- **WAIT**: Are plateaus in the units array or just in the Set?

Let me check the plateau placement code:
```typescript
if (selectedUnitType === UnitType.PLATEAU) {
  setPlateaus(new Set([...plateaus, hexKey])); // Just adds to Set
  // No unit created!
}
```

So plateaus are NOT in the units array - they're only in the Set. This means:
- `unitsOnHex` would only contain actual units, not plateau markers
- This should work correctly

## Hypothesis: The Code Actually Works

After analyzing the entire flow, the logic appears sound:

1. ✅ Flags can be placed during setup
2. ✅ Hexes with enemy flags are highlighted as valid movement targets
3. ✅ Clicking enemy flags doesn't stop propagation
4. ✅ The movement handler checks for enemy flags
5. ✅ Victory is triggered when landing on enemy flag

## Why Can't I Fix It?

### Possible Reasons:

1. **The bug doesn't exist** - The code may actually work correctly, and the user might be experiencing a different issue (e.g., not placing flags during setup)

2. **Edge case not covered** - There might be a specific sequence of actions that breaks the logic that I haven't identified

3. **Async state issues** - React's state updates are asynchronous, and there might be a race condition where the enemyFlag check happens before/after the units state has been properly set

4. **Missing flag placement** - Users might not be placing flags during setup, making capture impossible

5. **Console errors** - There might be runtime errors that prevent the code from executing that aren't visible in the source

## Recommended Tests

1. Verify flags are being placed during setup phase
2. Console log the `enemyFlag` variable when moving onto a flag hex
3. Check if `setWinner()` is actually being called
4. Verify the winner state is propagating to the UI
5. Test with both local (HexBoard) and online (OnlineHexBoard) modes

## Conclusion

The code logic for flag capture appears correct. The issue might be:
- A runtime problem that doesn't show in static analysis
- A state synchronization issue
- Missing flag placement during setup
- A UI rendering issue where the winner is set but not displayed

Without runtime debugging or seeing the actual error, it's difficult to identify the exact failure point.
