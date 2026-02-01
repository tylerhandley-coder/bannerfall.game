import { useState } from 'react';
import { HexTile } from './HexTile';
import { UnitComponent } from './Unit';
import { UnitSelector } from './UnitSelector';
import { HamburgerMenu } from './HamburgerMenu';
import { HowToPlayModal } from './HowToPlayModal';
import { CardCycleModal } from './CardCycleModal';
import { Card } from './Card';
import { GameLog } from './GameLog';
import { Unit, UnitType, PlayerTeam, createUnit, UNIT_DEFINITIONS } from '../types/units';
import { hexDistance, getHexesInRange, HexCoord, hasPathWithinRange, getAdjacentHexes } from '../utils/hexMath';
import { Card as CardType } from '../types/cards';
import { parseDeck, drawUniqueCardsForBothPlayers } from '../utils/cardDeck';
import { applyCardEffect, canCastCard, calculateEffectiveStats, cleanupExpiredEffects, markEffectsAsUsed, processDyingUnits } from '../utils/cardEffects';
import { GameLogEntry, GameLogType } from '../types/gameLog';
import { EffectType, EffectDuration } from '../types/effects';

type GamePhase = 'setup-p1' | 'setup-p2' | 'play';

interface HexBoardProps {
  onBack?: () => void;
  gameMode?: 'local' | 'online';
  gameId?: string;
  playerId?: string;
}

export function HexBoard({ onBack, gameMode = 'local', gameId, playerId }: HexBoardProps = {}) {
  const hexSize = 50;
  const tiles: HexCoord[] = [];

  const rowSizes = [5, 6, 7, 8, 9, 8, 7, 6, 5];
  const maxCols = 9;

  for (let r = 0; r < rowSizes.length; r++) {
    const rowWidth = rowSizes[r];
    const offset = Math.floor((maxCols - rowWidth) / 2);
    for (let q = 0; q < rowWidth; q++) {
      tiles.push({ q: q + offset, r });
    }
  }

  const [gamePhase, setGamePhase] = useState<GamePhase>('setup-p1');
  const [units, setUnits] = useState<Unit[]>([]);
  const [plateaus, setPlateaus] = useState<Set<string>>(new Set());
  const [player1Plateaus, setPlayer1Plateaus] = useState<number>(0);
  const [player2Plateaus, setPlayer2Plateaus] = useState<number>(0);
  const [selectedUnitId, setSelectedUnitId] = useState<string | null>(null);
  const [selectedUnitType, setSelectedUnitType] = useState<UnitType | null>(null);
  const [currentPlayer, setCurrentPlayer] = useState<PlayerTeam>(PlayerTeam.PLAYER1);
  const [isHowToPlayOpen, setIsHowToPlayOpen] = useState(false);
  const [player1Cards, setPlayer1Cards] = useState<CardType[]>([]);
  const [player2Cards, setPlayer2Cards] = useState<CardType[]>([]);
  const [selectedCardIndex, setSelectedCardIndex] = useState<number | null>(null);
  const [cardCasterId, setCardCasterId] = useState<string | null>(null);
  const [turnNumber, setTurnNumber] = useState(0);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [actionsRemaining, setActionsRemaining] = useState<number>(2);
  const [gameLog, setGameLog] = useState<GameLogEntry[]>([]);
  const [winner, setWinner] = useState<PlayerTeam | null>(null);
  const [cardsHidden, setCardsHidden] = useState<boolean>(false);
  const [isCycleModalOpen, setIsCycleModalOpen] = useState<boolean>(false);

  const selectedUnit = units.find((u) => u.id === selectedUnitId) || null;
  const currentCards = currentPlayer === PlayerTeam.PLAYER1 ? player1Cards : player2Cards;
  const selectedCard = selectedCardIndex !== null ? currentCards[selectedCardIndex] : null;
  const casterUnit = cardCasterId ? units.find(u => u.id === cardCasterId) || null : null;

  const getUnitCounts = (team: PlayerTeam): Record<UnitType, number> => {
    const counts: Record<UnitType, number> = {
      [UnitType.BRUTE]: 0,
      [UnitType.ARCHER]: 0,
      [UnitType.MAGE]: 0,
      [UnitType.ASSASSIN]: 0,
      [UnitType.WARLORD]: 0,
      [UnitType.PLATEAU]: team === PlayerTeam.PLAYER1 ? player1Plateaus : player2Plateaus,
      [UnitType.FLAG]: 0,
    };

    units.filter(u => u.team === team).forEach(u => {
      counts[u.type]++;
    });

    return counts;
  };

  const currentUnitCounts = getUnitCounts(currentPlayer);

  const addLogEntry = (type: GameLogType, message: string, unitType?: UnitType, targetUnitType?: UnitType, damage?: number) => {
    const entry: GameLogEntry = {
      id: `${Date.now()}-${Math.random()}`,
      type,
      player: currentPlayer,
      turn: Math.floor(turnNumber / 2) + 1,
      message,
      timestamp: Date.now(),
      unitType,
      targetUnitType,
      damage,
    };
    setGameLog(prev => [...prev, entry]);
  };

  const consumeAction = (count: number = 1) => {
    const newActionsRemaining = actionsRemaining - count;
    setActionsRemaining(newActionsRemaining);
    if (newActionsRemaining <= 0) {
      setTimeout(() => {
        handleEndTurn();
      }, 500);
    }
  };

  const validMovementTiles = new Set<string>();
  const validAttackTargets = new Set<string>();
  const validCardTargets = new Set<string>();

  if (gamePhase === 'play' && selectedUnit && selectedUnit.actionsUsed < 2 && !selectedUnitType && !selectedCardIndex && selectedUnit.team === currentPlayer) {
    const effectiveStats = calculateEffectiveStats(selectedUnit, plateaus);

    // Only show movement range if the unit hasn't moved yet this turn
    if (!selectedUnit.hasMoved) {
      const hexesInRange = getHexesInRange(
        { q: selectedUnit.q, r: selectedUnit.r },
        effectiveStats.movement
      );

      hexesInRange.forEach((hex) => {
        const unitsOnHex = units.filter((u) => u.q === hex.q && u.r === hex.r);

        // Check if there's an enemy combat unit (not plateau, not flag) blocking movement
        const enemyCombatUnit = unitsOnHex.find((u) =>
          u.team !== currentPlayer &&
          u.type !== UnitType.FLAG &&
          u.type !== UnitType.PLATEAU
        );

        // Check if there's a clear path to this hex (must move around other units)
        const hasPath = hasPathWithinRange(
          { q: selectedUnit.q, r: selectedUnit.r },
          { q: hex.q, r: hex.r },
          effectiveStats.movement,
          (checkHex) => {
            // A hex is blocked if any unit (friend or foe) occupies it
            return units.some((u) =>
              u.q === checkHex.q &&
              u.r === checkHex.r &&
              u.type !== UnitType.FLAG &&
              u.type !== UnitType.PLATEAU
            );
          }
        );

        // Can move if on the board, no enemy combat unit is at destination, and has a clear path
        if (tiles.some((t) => t.q === hex.q && t.r === hex.r) && !enemyCombatUnit && hasPath) {
          validMovementTiles.add(`${hex.q},${hex.r}`);
        }
      });
    }

    // Only show attack targets if unit can attack (hasn't attacked and doesn't have ATTACK_BLOCKED effect)
    const hasAttackBlockedEffect = selectedUnit.effects.some(e => e.type === EffectType.ATTACK_BLOCKED);
    const hasExtraAttackEffect = selectedUnit.effects.some(e => e.type === EffectType.EXTRA_ATTACK);
    const canAttack = !selectedUnit.hasAttacked || (selectedUnit.hasAttacked && hasExtraAttackEffect);
    if (canAttack && !hasAttackBlockedEffect) {
      const attackHexesInRange = getHexesInRange(
        { q: selectedUnit.q, r: selectedUnit.r },
        effectiveStats.range
      );

      attackHexesInRange.forEach((hex) => {
        const enemyUnitsOnHex = units.filter(
          (u) => u.q === hex.q && u.r === hex.r && u.team !== currentPlayer && u.type !== UnitType.FLAG
        );
        enemyUnitsOnHex.forEach((enemy) => {
          // Skip units with invisible effect
          const isInvisible = enemy.effects.some(e => e.type === EffectType.INVISIBLE);
          if (isInvisible) {
            return;
          }

          // For Assassins, check if there's any clear path within range (not just straight line)
          if (selectedUnit.type === UnitType.ASSASSIN) {
            const hasPath = hasPathWithinRange(
              { q: selectedUnit.q, r: selectedUnit.r },
              { q: enemy.q, r: enemy.r },
              effectiveStats.range || 1,
              (hex) => units.some((u) => u.q === hex.q && u.r === hex.r && u.type !== UnitType.FLAG)
            );
            if (hasPath) {
              validAttackTargets.add(enemy.id);
            }
          } else {
            validAttackTargets.add(enemy.id);
          }
        });
      });
    }
  }

  if (gamePhase === 'play' && selectedCard && casterUnit) {
    const casterStats = calculateEffectiveStats(casterUnit, plateaus);
    const castingRange = casterStats.range || 3;

    units.forEach((unit) => {
      const distance = hexDistance({ q: casterUnit.q, r: casterUnit.r }, { q: unit.q, r: unit.r });
      const validation = canCastCard(selectedCard, casterUnit, unit, units, plateaus);
      if ((validation.valid || unit.id === casterUnit.id) && distance <= castingRange) {
        validCardTargets.add(unit.id);
      }
    });
  }

  const handleHexClick = (q: number, r: number) => {
    if ((gamePhase === 'setup-p1' || gamePhase === 'setup-p2') && selectedUnitType) {
      // Check placement zone restrictions
      const isPlayer1Turn = gamePhase === 'setup-p1';
      const isValidPlacementZone = isPlayer1Turn ? r <= 3 : r >= 5;

      if (!isValidPlacementZone) {
        setStatusMessage('Cannot place units in this zone!');
        setTimeout(() => setStatusMessage(''), 2000);
        return;
      }

      if (selectedUnitType === UnitType.PLATEAU) {
        const hexKey = `${String(q)},${String(r)}`;
        const currentPlateauCount = currentPlayer === PlayerTeam.PLAYER1 ? player1Plateaus : player2Plateaus;
        if (!plateaus.has(hexKey) && currentPlateauCount < 2) {
          setPlateaus(new Set([...plateaus, hexKey]));
          if (currentPlayer === PlayerTeam.PLAYER1) {
            setPlayer1Plateaus(player1Plateaus + 1);
          } else {
            setPlayer2Plateaus(player2Plateaus + 1);
          }
          setSelectedUnitType(null);
        }
      } else {
        const unitsOnHex = units.filter((u) => u.q === q && u.r === r);
        const hexKey = `${String(q)},${String(r)}`;
        const isPlateauHex = plateaus.has(hexKey);

        // Prevent archers from being placed on plateaus during setup
        if (selectedUnitType === UnitType.ARCHER && isPlateauHex) {
          setStatusMessage('Archers cannot be placed on plateaus during setup!');
          setTimeout(() => setStatusMessage(''), 2000);
          return;
        }

        if (unitsOnHex.length === 0) {
          const newUnit = createUnit(selectedUnitType, currentPlayer, q, r);
          setUnits([...units, newUnit]);
          setSelectedUnitType(null);
        }
      }
    } else if (gamePhase === 'play' && selectedUnitId && actionsRemaining > 0) {
      const unit = units.find((u) => u.id === selectedUnitId);
      if (unit && unit.actionsUsed < 2 && unit.team === currentPlayer) {
        const effectiveStats = calculateEffectiveStats(unit, plateaus);
        const distance = hexDistance({ q: unit.q, r: unit.r }, { q, r });
        const unitsOnHex = units.filter((u) => u.q === q && u.r === r);
        const friendlyUnitOnHex = unitsOnHex.find((u) => u.team === currentPlayer && u.type !== UnitType.FLAG && u.type !== UnitType.PLATEAU);
        const enemyFlag = unitsOnHex.find((u) => u.type === UnitType.FLAG && u.team !== currentPlayer);

        // Combat units only - exclude plateaus and flags
        const combatUnits = unitsOnHex.filter((u) => u.type !== UnitType.FLAG && u.type !== UnitType.PLATEAU);

        // Check if unit is blocked from moving
        const hasMovementBlocked = unit.effects.some(
          (effect) => effect.type === 'movement_blocked'
        );

        if (hasMovementBlocked) {
          setStatusMessage('Unit cannot move - affected by Toe Rot!');
          setTimeout(() => setStatusMessage(''), 2000);
          return;
        }

        if (distance <= effectiveStats.movement && !unit.hasMoved) {
          if (combatUnits.length === 0) {
            // Normal movement to empty hex
            // Check if climbing onto a plateau (costs 2 actions)
            const destHexKey = `${q},${r}`;
            const currentHexKey = `${unit.q},${unit.r}`;
            const isClimbingPlateau = plateaus.has(destHexKey) && !plateaus.has(currentHexKey);
            const actionCost = isClimbingPlateau ? 2 : 1;

            // Check if unit and player have enough actions
            if (unit.actionsUsed + actionCost > 2) {
              setStatusMessage('Not enough actions to climb plateau!');
              setTimeout(() => setStatusMessage(''), 2000);
              return;
            }
            if (actionsRemaining < actionCost) {
              setStatusMessage('Not enough actions remaining to climb plateau!');
              setTimeout(() => setStatusMessage(''), 2000);
              return;
            }

            setUnits(
              units.map((u) =>
                u.id === selectedUnitId
                  ? markEffectsAsUsed({ ...u, q, r, actionsUsed: u.actionsUsed + actionCost, hasMoved: true }, 'movement', turnNumber)
                  : u
              )
            );

            // Check for victory condition - landing on opponent's flag
            if (enemyFlag) {
              setWinner(currentPlayer);
              addLogEntry(GameLogType.VICTORY, `${currentPlayer === PlayerTeam.PLAYER1 ? 'PLAYER 1' : 'PLAYER 2'} captured the flag and won!`);
              return;
            }

            const unitName = UNIT_DEFINITIONS[unit.type].name;
            const moveMessage = isClimbingPlateau
              ? `${unitName} climbed plateau at (${q}, ${r})`
              : `${unitName} moved to (${q}, ${r})`;
            addLogEntry(GameLogType.MOVE, moveMessage, unit.type);
            consumeAction(actionCost);
            setSelectedUnitId(null);
          } else if (friendlyUnitOnHex) {
            // Swap positions with friendly unit
            const destHexKey = `${q},${r}`;
            const currentHexKey = `${unit.q},${unit.r}`;
            const isClimbingPlateau = plateaus.has(destHexKey) && !plateaus.has(currentHexKey);
            const actionCost = isClimbingPlateau ? 2 : 1;

            // Check if unit and player have enough actions
            if (unit.actionsUsed + actionCost > 2) {
              setStatusMessage('Not enough actions to swap onto plateau!');
              setTimeout(() => setStatusMessage(''), 2000);
              return;
            }
            if (actionsRemaining < actionCost) {
              setStatusMessage('Not enough actions remaining to swap onto plateau!');
              setTimeout(() => setStatusMessage(''), 2000);
              return;
            }

            const oldQ = unit.q;
            const oldR = unit.r;
            setUnits(
              units.map((u) => {
                if (u.id === selectedUnitId) {
                  return markEffectsAsUsed({ ...u, q, r, actionsUsed: u.actionsUsed + actionCost, hasMoved: true }, 'movement', turnNumber);
                }
                if (u.id === friendlyUnitOnHex.id) {
                  return { ...u, q: oldQ, r: oldR };
                }
                return u;
              })
            );
            const unitName = UNIT_DEFINITIONS[unit.type].name;
            const swapUnitName = UNIT_DEFINITIONS[friendlyUnitOnHex.type].name;
            const swapMessage = isClimbingPlateau
              ? `${unitName} swapped with ${swapUnitName} (climbed plateau)`
              : `${unitName} swapped positions with ${swapUnitName}`;
            addLogEntry(GameLogType.MOVE, swapMessage, unit.type);
            consumeAction(actionCost);
            setSelectedUnitId(null);
          }
        }
      }
    } else {
      setSelectedUnitId(null);
    }
  };

  const handleUnitClick = (unitId: string, e: React.MouseEvent) => {
    const clickedUnit = units.find((u) => u.id === unitId);

    // Allow clicking enemy flags to move onto them - trigger hex click
    if (clickedUnit?.type === UnitType.FLAG && clickedUnit.team !== currentPlayer && selectedUnitId) {
      e.stopPropagation();
      handleHexClick(clickedUnit.q, clickedUnit.r);
      return;
    }

    e.stopPropagation();

    // During setup phase, clicking a unit removes it from the board
    if (gamePhase === 'setup-p1' || gamePhase === 'setup-p2') {
      setUnits(units.filter((u) => u.id !== unitId));
      if (selectedUnitId === unitId) {
        setSelectedUnitId(null);
      }
      return;
    }

    if (gamePhase === 'play' && !selectedUnitType) {

      if (selectedCard && cardCasterId && clickedUnit && casterUnit) {
        if (validCardTargets.has(unitId)) {
          const validation = canCastCard(selectedCard, casterUnit, clickedUnit, units, plateaus);

          if (validation.valid) {
            const result = applyCardEffect(
              selectedCard,
              casterUnit!,
              clickedUnit,
              units,
              plateaus,
              turnNumber
            );

            let updatedUnits = result.units;
            updatedUnits = processDyingUnits(updatedUnits);
            updatedUnits = updatedUnits.filter((u) => u.type === UnitType.FLAG || u.type === UnitType.PLATEAU || u.stats.hp > 0);

            setUnits(updatedUnits);

            if (result.plateausToRemove && result.plateausToRemove.length > 0) {
              const newPlateaus = new Set(plateaus);
              result.plateausToRemove.forEach(hexKey => newPlateaus.delete(hexKey));
              setPlateaus(newPlateaus);
            }

            if (currentPlayer === PlayerTeam.PLAYER1) {
              setPlayer1Cards(player1Cards.filter((_, i) => i !== selectedCardIndex));
            } else {
              setPlayer2Cards(player2Cards.filter((_, i) => i !== selectedCardIndex));
            }

            const targetName = clickedUnit ? UNIT_DEFINITIONS[clickedUnit.type].name : 'area';
            addLogEntry(
              GameLogType.CARD_CAST,
              `Cast "${selectedCard.title}" on ${targetName}`,
              casterUnit!.type,
              clickedUnit?.type
            );

            setSelectedCardIndex(null);
            setCardCasterId(null);
            setStatusMessage(`${selectedCard.title} cast successfully!`);
            setTimeout(() => setStatusMessage(''), 3000);
          } else {
            setStatusMessage(validation.reason || 'Cannot cast card');
            setTimeout(() => setStatusMessage(''), 3000);
          }
        }
        return;
      }

      if (selectedCardIndex !== null && clickedUnit?.type === UnitType.MAGE && clickedUnit.team === currentPlayer && !clickedUnit.hasCast) {
        setCardCasterId(unitId);
        setStatusMessage('Select a target for the card');
        setTimeout(() => setStatusMessage(''), 3000);
        return;
      }

      if (selectedUnitId && clickedUnit && clickedUnit.team !== currentPlayer && actionsRemaining > 0) {
        const attacker = units.find((u) => u.id === selectedUnitId);
        const hasAttackBlockedEffect = attacker?.effects.some(e => e.type === EffectType.ATTACK_BLOCKED);
        const hasExtraAttackEffect = attacker?.effects.some(e => e.type === EffectType.EXTRA_ATTACK);
        const canAttack = !attacker?.hasAttacked || (attacker?.hasAttacked && hasExtraAttackEffect);

        if (attacker && attacker.actionsUsed < 2 && canAttack && !hasAttackBlockedEffect && validAttackTargets.has(unitId) && clickedUnit.type !== UnitType.FLAG) {
          const effectiveStats = calculateEffectiveStats(attacker, plateaus);
          const defenderStats = calculateEffectiveStats(clickedUnit, plateaus);

          // Check for assassin adjacent attack bonus
          let assassinBonus = 0;
          if (attacker.type === UnitType.ASSASSIN) {
            const distanceToTarget = hexDistance({ q: attacker.q, r: attacker.r }, { q: clickedUnit.q, r: clickedUnit.r });
            if (distanceToTarget === 1) {
              assassinBonus = 3;
            }
          }

          // Check if attacker ignores damage reduction (Spinal Ripcord)
          const ignoresDamageReduction = attacker.effects.some(e => e.type === EffectType.IGNORE_DAMAGE_REDUCTION);
          const effectiveDamageReduction = ignoresDamageReduction ? 0 : defenderStats.damageReduction;

          const damage = Math.max(0, effectiveStats.attack + assassinBonus - effectiveDamageReduction);

          const wasDefeated = clickedUnit.stats.hp - damage <= 0;
          const shouldMoveIntoHex = wasDefeated && (attacker.type === UnitType.BRUTE || attacker.type === UnitType.WARLORD || attacker.type === UnitType.ASSASSIN);

          let updatedUnits = units.map((u) => {
            if (u.id === unitId) {
              return { ...u, stats: { ...u.stats, hp: u.stats.hp - damage } };
            }
            if (u.id === selectedUnitId) {
              const newPos = shouldMoveIntoHex ? { q: clickedUnit.q, r: clickedUnit.r } : { q: u.q, r: u.r };
              const updatedEffects = hasExtraAttackEffect
                ? u.effects.filter(e => e.type !== EffectType.EXTRA_ATTACK)
                : u.effects;
              return { ...u, ...newPos, actionsUsed: u.actionsUsed + 1, hasAttacked: true, effects: updatedEffects };
            }
            return u;
          });

          // Check for AREA_DAMAGE effect (Super Smash)
          const areaDamageEffect = attacker.effects.find(e => e.type === EffectType.AREA_DAMAGE);
          if (areaDamageEffect) {
            const hexesInRange = getHexesInRange({ q: clickedUnit.q, r: clickedUnit.r }, 2);
            const nearbyEnemies = updatedUnits.filter(u =>
              u.team === clickedUnit.team &&
              u.id !== unitId &&
              u.type !== UnitType.FLAG &&
              u.type !== UnitType.PLATEAU &&
              hexesInRange.some(hex => hex.q === u.q && hex.r === u.r)
            );

            nearbyEnemies.forEach(enemy => {
              updatedUnits = updatedUnits.map(u =>
                u.id === enemy.id
                  ? { ...u, stats: { ...u.stats, hp: u.stats.hp - areaDamageEffect.value } }
                  : u
              );
              addLogEntry(
                GameLogType.EFFECT,
                `${UNIT_DEFINITIONS[enemy.type].name} took ${areaDamageEffect.value} area damage from Super Smash`,
                enemy.type
              );
            });
          }

          // Check if target has PUSH effect (Shield Bash)
          const pushEffect = clickedUnit.effects.find(e => e.type === EffectType.PUSH && e.duration === EffectDuration.UNTIL_TRIGGERED);
          if (pushEffect && !wasDefeated) {
            const adjacentHexes = getAdjacentHexes({ q: clickedUnit.q, r: clickedUnit.r });
            const emptyTiles = adjacentHexes.filter(hex => {
              const unitsOnHex = updatedUnits.filter(u => u.q === hex.q && u.r === hex.r);
              return unitsOnHex.length === 0;
            });

            if (emptyTiles.length > 0) {
              const pushPosition = emptyTiles[0];
              updatedUnits = updatedUnits.map(u => {
                if (u.id === unitId) {
                  return {
                    ...u,
                    q: pushPosition.q,
                    r: pushPosition.r,
                    effects: u.effects.filter(e => e.id !== pushEffect.id)
                  };
                }
                return u;
              });
              addLogEntry(
                GameLogType.EFFECT,
                `${UNIT_DEFINITIONS[clickedUnit.type].name} was pushed back`,
                clickedUnit.type
              );
            }
          }

          updatedUnits = updatedUnits.map(u =>
            u.id === selectedUnitId ? markEffectsAsUsed(u, 'attack', turnNumber) : u
          );

          // Check for HEAL_ON_KILL effect (Soul Siphon)
          if (wasDefeated && attacker) {
            const healOnKillEffect = attacker.effects.find(e =>
              e.type === EffectType.HEAL_ON_KILL &&
              e.duration === EffectDuration.UNTIL_TRIGGERED
            );
            if (healOnKillEffect) {
              updatedUnits = updatedUnits.map(u => {
                if (u.id === attacker.id) {
                  const newHp = Math.min(u.stats.maxHp, u.stats.hp + healOnKillEffect.value);
                  return {
                    ...u,
                    stats: { ...u.stats, hp: newHp },
                    effects: u.effects.filter(e => e.id !== healOnKillEffect.id)
                  };
                }
                return u;
              });
              addLogEntry(
                GameLogType.EFFECT,
                `${UNIT_DEFINITIONS[attacker.type].name} healed ${healOnKillEffect.value} HP from Soul Siphon`,
                attacker.type
              );
            }
          }

          // Check for MOVEMENT_ON_KILL effect (In & Out Murder)
          if (wasDefeated && attacker && attacker.type === UnitType.ASSASSIN) {
            const movementOnKillEffect = attacker.effects.find(e =>
              e.type === EffectType.MOVEMENT_ON_KILL &&
              e.duration === EffectDuration.THIS_TURN
            );
            if (movementOnKillEffect) {
              updatedUnits = updatedUnits.map(u => {
                if (u.id === attacker.id) {
                  const movementBuffEffect = {
                    id: `effect-${Date.now()}-movement-kill`,
                    type: EffectType.MOVEMENT_BUFF,
                    duration: EffectDuration.THIS_TURN,
                    value: movementOnKillEffect.value,
                    sourceCardTitle: movementOnKillEffect.sourceCardTitle,
                    appliedOnTurn: turnNumber,
                  };
                  return {
                    ...u,
                    effects: [...u.effects.filter(e => e.id !== movementOnKillEffect.id), movementBuffEffect]
                  };
                }
                return u;
              });
              addLogEntry(
                GameLogType.EFFECT,
                `${UNIT_DEFINITIONS[attacker.type].name} gained +${movementOnKillEffect.value} movement from In & Out Murder`,
                attacker.type
              );
            }
          }

          updatedUnits = processDyingUnits(updatedUnits);
          updatedUnits = updatedUnits.filter((u) => u.type === UnitType.FLAG || u.type === UnitType.PLATEAU || u.stats.hp > 0);

          const attackerName = UNIT_DEFINITIONS[attacker.type].name;
          const defenderName = UNIT_DEFINITIONS[clickedUnit.type].name;

          addLogEntry(
            GameLogType.ATTACK,
            `${attackerName} attacked ${defenderName} for ${damage} damage${assassinBonus > 0 ? ' (Adjacent +2)' : ''}`,
            attacker.type,
            clickedUnit.type,
            damage
          );

          if (wasDefeated) {
            addLogEntry(
              GameLogType.UNIT_DEFEATED,
              `${defenderName} was defeated!`,
              clickedUnit.type
            );
          }

          consumeAction();
          setUnits(updatedUnits);
          setSelectedUnitId(null);
        }
      } else if (clickedUnit && clickedUnit.team === currentPlayer) {
        setSelectedUnitId(unitId);
      }
    }
  };

  const handleUnitRightClick = (unitId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (gamePhase === 'setup-p1' || gamePhase === 'setup-p2') {
      setUnits(units.filter((u) => u.id !== unitId));
      if (selectedUnitId === unitId) {
        setSelectedUnitId(null);
      }
    }
  };

  const handleHexRightClick = (q: number, r: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (gamePhase === 'setup-p1' || gamePhase === 'setup-p2') {
      const hexKey = `${String(q)},${String(r)}`;
      if (plateaus.has(hexKey)) {
        const newPlateaus = new Set(plateaus);
        newPlateaus.delete(hexKey);
        setPlateaus(newPlateaus);
        // Decrement the plateau count for the current player
        if (gamePhase === 'setup-p1') {
          setPlayer1Plateaus(Math.max(0, player1Plateaus - 1));
        } else {
          setPlayer2Plateaus(Math.max(0, player2Plateaus - 1));
        }
      }
    }
  };

  const getHexPosition = (q: number, r: number) => {
    const height = hexSize * 2;
    const width = Math.sqrt(3) * hexSize;
    const vertDist = height * 0.75;
    const horizDist = width;

    const x = q * horizDist + (r % 2) * (horizDist / 2);
    const y = r * vertDist;
    return { x, y };
  };

  const handleNewGame = () => {
    setGamePhase('setup-p1');
    setUnits([]);
    setPlateaus(new Set());
    setPlayer1Plateaus(0);
    setPlayer2Plateaus(0);
    setSelectedUnitId(null);
    setSelectedUnitType(null);
    setCurrentPlayer(PlayerTeam.PLAYER1);
    setWinner(null);
    setPlayer1Cards([]);
    setPlayer2Cards([]);
    setSelectedCardIndex(null);
    setCardCasterId(null);
    setTurnNumber(0);
    setStatusMessage('');
    setActionsRemaining(2);
    setGameLog([]);
  };

  const handleReady = () => {
    if (gamePhase === 'setup-p1') {
      setCurrentPlayer(PlayerTeam.PLAYER2);
      setGamePhase('setup-p2');
      setSelectedUnitType(null);
    } else if (gamePhase === 'setup-p2') {
      setGamePhase('play');
      setSelectedUnitType(null);
      setSelectedUnitId(null);
      setCurrentPlayer(PlayerTeam.PLAYER1);
      const deck = parseDeck();
      const { player1, player2 } = drawUniqueCardsForBothPlayers(deck);
      setPlayer1Cards(player1);
      setPlayer2Cards(player2);
    }
  };

  const handleCardSelect = (index: number) => {
    if (selectedCardIndex === index) {
      setSelectedCardIndex(null);
      setCardCasterId(null);
      setStatusMessage('');
    } else {
      setSelectedCardIndex(index);
      setCardCasterId(null);
      setSelectedUnitId(null);
      setStatusMessage('Select a Mage to cast this card');
      setTimeout(() => setStatusMessage(''), 3000);
    }
  };

  const handleCycleCards = () => {
    if (actionsRemaining === 0) return;
    setIsCycleModalOpen(true);
  };

  const handleCycleConfirm = (indicesToKeep: number[]) => {
    const currentHand = currentPlayer === PlayerTeam.PLAYER1 ? player1Cards : player2Cards;
    const keptCards = indicesToKeep.map(i => currentHand[i]);
    const cardsToDrawCount = 6 - keptCards.length;

    const deck = parseDeck();
    const drawnCards = deck
      .sort(() => Math.random() - 0.5)
      .slice(0, cardsToDrawCount);

    const updatedHand = [...keptCards, ...drawnCards];

    if (currentPlayer === PlayerTeam.PLAYER1) {
      setPlayer1Cards(updatedHand);
    } else {
      setPlayer2Cards(updatedHand);
    }

    setSelectedCardIndex(null);
    setCardCasterId(null);
    setIsCycleModalOpen(false);
    consumeAction();

    const discardedCount = currentHand.length - keptCards.length;
    addLogEntry(GameLogType.CARD, `Cycled ${discardedCount} cards for ${cardsToDrawCount} new ones`);
  };

  const handleCycleCancel = () => {
    setIsCycleModalOpen(false);
  };

  const handleEndTurn = () => {
    setUnits((currentUnits) => {
      const clearedUnits = currentUnits.map((u) => ({
        ...u,
        actionsUsed: 0,
        hasAttacked: false,
        hasMoved: false,
        hasCast: false,
        effects: u.effects.map(effect => ({
          ...effect,
          usedThisTurn: false,
        })),
      }));

      return cleanupExpiredEffects(clearedUnits, turnNumber + 1, currentPlayer);
    });
    setTurnNumber(turnNumber + 1);

    const nextPlayer = currentPlayer === PlayerTeam.PLAYER1 ? PlayerTeam.PLAYER2 : PlayerTeam.PLAYER1;
    setCurrentPlayer(nextPlayer);
    setActionsRemaining(2);
    setCardsHidden(true);

    const playerName = nextPlayer === PlayerTeam.PLAYER1 ? 'Player 1' : 'Player 2';
    const entry: GameLogEntry = {
      id: `${Date.now()}-${Math.random()}`,
      type: GameLogType.TURN_START,
      player: nextPlayer,
      turn: Math.floor((turnNumber + 1) / 2) + 1,
      message: `${playerName}'s turn begins`,
      timestamp: Date.now(),
    };
    setGameLog(prev => [...prev, entry]);

    setSelectedUnitId(null);
    setSelectedCardIndex(null);
    setCardCasterId(null);
    setStatusMessage('');
  };

  const width = Math.sqrt(3) * hexSize;
  const height = hexSize * 2;
  const vertDist = height * 0.75;
  const horizDist = width;

  const minQ = Math.floor((maxCols - maxCols) / 2);
  const maxQ = maxCols - 1 + minQ;

  const leftMostX = minQ * horizDist;
  const rightMostX = maxQ * horizDist + width;
  const topMostY = 0;
  const bottomMostY = (rowSizes.length - 1) * vertDist + height;

  const boardWidth = rightMostX - leftMostX;
  const boardHeight = bottomMostY - topMostY;
  const padding = hexSize * 1.5;

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-orange-950 via-purple-950 to-slate-950">
      {/* Victory Banner */}
      {winner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="bg-gradient-to-br from-yellow-500 via-amber-600 to-orange-700 p-12 rounded-3xl border-8 border-yellow-400 shadow-2xl shadow-yellow-500/50 animate-pulse">
            <div className="text-center space-y-6">
              <div className="text-7xl font-black text-white drop-shadow-2xl tracking-widest">
                {winner === PlayerTeam.PLAYER1 ? 'PLAYER 1' : 'PLAYER 2'}
              </div>
              <div className="text-5xl font-bold text-yellow-100 drop-shadow-xl">
                VICTORY!
              </div>
              <div className="text-2xl text-white/90">
                Captured the enemy flag
              </div>
              <button
                onClick={handleNewGame}
                className="mt-8 px-8 py-4 bg-white text-amber-900 font-bold text-xl rounded-xl hover:bg-yellow-100 transition-colors shadow-lg"
              >
                New Game
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header with hamburger menu and title */}
      <div className="flex items-center justify-between gap-4 p-4">
        <div className="flex items-center gap-4">
          <div className="w-16">
            <HamburgerMenu
              onHowToPlay={() => setIsHowToPlayOpen(true)}
              onNewGame={handleNewGame}
              onBack={onBack}
            />
          </div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-500 to-red-600 tracking-wider drop-shadow-lg">
              BANNERFALL
            </h1>
            <div className="text-amber-300 text-xs font-semibold tracking-widest uppercase">
              {gamePhase === 'setup-p1' ? 'Setup - Player 1' : gamePhase === 'setup-p2' ? 'Setup - Player 2' : 'Battle Phase'}
            </div>
          </div>
        </div>

        {gamePhase === 'play' && (
          <div className="flex items-center gap-4">
            <div className="text-xs text-slate-300">
              Turn {Math.floor(turnNumber / 2) + 1}
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-amber-900/50 rounded-lg border-2 border-amber-500/50">
              <span className="text-amber-300 font-semibold text-sm">Actions:</span>
              <div className="flex gap-1">
                {[...Array(2)].map((_, i) => (
                  <div
                    key={i}
                    className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold transition-all ${
                      i < actionsRemaining
                        ? 'bg-gradient-to-br from-yellow-400 to-amber-500 border-yellow-300 text-white shadow-lg shadow-yellow-500/50'
                        : 'bg-slate-700 border-slate-600 text-slate-500'
                    }`}
                  >
                    {i + 1}
                  </div>
                ))}
              </div>
            </div>
            <button
              onClick={handleEndTurn}
              className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold rounded-lg shadow-lg hover:from-green-500 hover:to-emerald-500 transition-all transform hover:scale-105"
            >
              End Turn
            </button>
          </div>
        )}
      </div>

      {/* Main content area */}
      <div className="flex-1 flex items-center justify-center p-4 gap-8">
        {/* Left sidebar - shown in setup phase */}
        {(gamePhase === 'setup-p1' || gamePhase === 'setup-p2') && (
          <div className="w-64 flex flex-col gap-4">
            <UnitSelector
              selectedUnitType={selectedUnitType}
              onSelectUnitType={setSelectedUnitType}
              currentPlayer={currentPlayer}
              onReady={handleReady}
              unitCounts={currentUnitCounts}
            />
          </div>
        )}

        {gamePhase === 'play' && (
          <div className="w-[36rem] flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h2 className="text-amber-300 font-bold text-lg tracking-wide">
                {currentPlayer === PlayerTeam.PLAYER1 ? 'PLAYER 1 CARDS' : 'PLAYER 2 CARDS'}
              </h2>
              <button
                onClick={() => setCardsHidden(!cardsHidden)}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg border-2 border-purple-400 transition-colors shadow-lg"
              >
                {cardsHidden ? 'Show Cards' : 'Hide Cards'}
              </button>
            </div>
            {statusMessage && (
              <div className="text-center text-base font-semibold text-yellow-100 bg-yellow-600/50 px-4 py-3 rounded-lg border-2 border-yellow-400 shadow-lg shadow-yellow-500/50 animate-pulse">
                {statusMessage}
              </div>
            )}
            {!cardsHidden && (
              <>
                <div className="grid grid-cols-2 gap-2">
                  {currentCards.map((card, index) => (
                    <div
                      key={`${card.title}-${index}`}
                      onClick={() => handleCardSelect(index)}
                      onContextMenu={(e) => {
                        e.preventDefault();
                        setSelectedCardIndex(null);
                        setCardCasterId(null);
                      }}
                      className={`cursor-pointer transition-all transform ${
                        selectedCardIndex === index
                          ? 'scale-105 ring-2 ring-blue-400 shadow-lg shadow-blue-500/50'
                          : 'hover:scale-105 hover:shadow-lg'
                      }`}
                    >
                      <Card card={card} />
                    </div>
                  ))}
                </div>
                <button
                  onClick={handleCycleCards}
                  disabled={actionsRemaining === 0}
                  className="w-full mt-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold rounded-lg border-2 border-amber-400 disabled:border-gray-400 transition-colors shadow-lg"
                >
                  Cycle Action (3 new cards)
                </button>
                {selectedCardIndex !== null && (
                  <div className="text-sm font-medium text-blue-100 bg-blue-600/50 px-4 py-2 rounded-lg border-2 border-blue-400 text-center shadow-lg">
                    Card selected - Choose a Mage, then select target
                  </div>
                )}
              </>
            )}
            {cardsHidden && (
              <div className="text-center text-sm font-medium text-purple-200 bg-purple-600/30 px-4 py-8 rounded-lg border-2 border-purple-400/50">
                Cards are hidden. Click "Show Cards" to reveal them.
              </div>
            )}
          </div>
        )}

        {/* Board */}
        <div className="relative flex flex-col items-center gap-6">
          {/* Player Toggle - only show during play phase */}
          {gamePhase === 'play' && (
            <div className="flex bg-amber-950/50 rounded-lg p-1 shadow-lg backdrop-blur-sm">
              <button
                onClick={() => {
                  setCurrentPlayer(PlayerTeam.PLAYER1);
                  setSelectedUnitId(null);
                }}
                className={`flex items-center gap-2 px-6 py-2 rounded-md font-semibold tracking-wide transition-all ${
                  currentPlayer === PlayerTeam.PLAYER1
                    ? 'bg-red-600 text-white shadow-lg shadow-red-500/50'
                    : 'text-amber-400/60 hover:text-amber-400'
                }`}
              >
                <div className={`w-3 h-3 rounded-full ${
                  currentPlayer === PlayerTeam.PLAYER1 ? 'bg-white shadow-lg' : 'bg-red-500'
                }`} />
                PLAYER 1
              </button>
              <button
                onClick={() => {
                  setCurrentPlayer(PlayerTeam.PLAYER2);
                  setSelectedUnitId(null);
                }}
                className={`flex items-center gap-2 px-6 py-2 rounded-md font-semibold tracking-wide transition-all ${
                  currentPlayer === PlayerTeam.PLAYER2
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/50'
                    : 'text-amber-400/60 hover:text-amber-400'
                }`}
              >
                <div className={`w-3 h-3 rounded-full ${
                  currentPlayer === PlayerTeam.PLAYER2 ? 'bg-white shadow-lg' : 'bg-blue-500'
                }`} />
                PLAYER 2
              </button>
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-radial from-orange-500/10 via-transparent to-transparent blur-3xl pointer-events-none" />

          <div className="relative bg-gradient-to-br from-amber-950/50 to-purple-950/50 py-8 pl-4 pr-2 rounded-lg shadow-2xl backdrop-blur-sm">

          <svg
            width={boardWidth + padding * 2}
            height={boardHeight + padding * 2}
            viewBox={`${leftMostX - padding} ${topMostY - padding} ${boardWidth + padding * 2} ${boardHeight + padding * 2}`}
            className="drop-shadow-2xl"
          >
            <defs>
              <filter id="glow">
                <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>

              <pattern
                id="sand-texture"
                x="0"
                y="0"
                width="20"
                height="20"
                patternUnits="userSpaceOnUse"
              >
                <circle cx="2" cy="2" r="0.5" fill="rgba(251, 191, 36, 0.1)" />
                <circle cx="12" cy="8" r="0.5" fill="rgba(251, 191, 36, 0.1)" />
                <circle cx="8" cy="15" r="0.5" fill="rgba(251, 191, 36, 0.1)" />
              </pattern>
            </defs>

            <rect
              x={leftMostX - padding}
              y={topMostY - padding}
              width={boardWidth + padding * 2}
              height={boardHeight + padding * 2}
              fill="url(#sand-texture)"
              opacity="0.3"
            />

            {tiles.map((tile) => {
              const hexKey = `${tile.q},${tile.r}`;
              const isSetupPhase = gamePhase === 'setup-p1' || gamePhase === 'setup-p2';
              const isPlayer1Setup = gamePhase === 'setup-p1';
              const isValidPlacementZone = isSetupPhase && (isPlayer1Setup ? tile.r <= 3 : tile.r >= 5);
              const isInvalidPlacementZone = isSetupPhase && !isValidPlacementZone;
              const placementZoneColor = isPlayer1Setup ? 'red' : 'blue';

              return (
                <HexTile
                  key={`${tile.q}-${tile.r}`}
                  q={tile.q}
                  r={tile.r}
                  size={hexSize}
                  hasPlateau={plateaus.has(hexKey)}
                  isValidMove={validMovementTiles.has(hexKey)}
                  isValidPlacementZone={isValidPlacementZone}
                  isInvalidPlacementZone={isInvalidPlacementZone}
                  placementZoneColor={placementZoneColor as 'red' | 'blue'}
                  onClick={() => handleHexClick(tile.q, tile.r)}
                  onRightClick={(e) => handleHexRightClick(tile.q, tile.r, e)}
                />
              );
            })}

            {units
              .filter((unit) => {
                // During setup phases, only show the current player's units
                if (gamePhase === 'setup-p1') {
                  return unit.team === PlayerTeam.PLAYER1;
                } else if (gamePhase === 'setup-p2') {
                  return unit.team === PlayerTeam.PLAYER2;
                }
                // During play phase, show all units
                return true;
              })
              .map((unit) => {
              const pos = getHexPosition(unit.q, unit.r);
              const isCardTarget = validCardTargets.has(unit.id);
              const isCaster = cardCasterId === unit.id;
              return (
                <g
                  key={unit.id}
                  transform={`translate(${pos.x}, ${pos.y})`}
                  onClick={(e: any) => handleUnitClick(unit.id, e)}
                  onContextMenu={(e: any) => handleUnitRightClick(unit.id, e)}
                >
                  <UnitComponent
                    unit={unit}
                    isSelected={selectedUnitId === unit.id || isCaster}
                    isAttackable={validAttackTargets.has(unit.id)}
                    isCardTarget={isCardTarget && !isCaster}
                  />
                </g>
              );
            })}
          </svg>
          </div>
        </div>

        {gamePhase === 'play' && (
          <GameLog entries={gameLog} />
        )}

      </div>

      <HowToPlayModal
        isOpen={isHowToPlayOpen}
        onClose={() => setIsHowToPlayOpen(false)}
      />

      <CardCycleModal
        isOpen={isCycleModalOpen}
        cards={currentCards}
        onConfirm={handleCycleConfirm}
        onCancel={handleCycleCancel}
      />
    </div>
  );
}
