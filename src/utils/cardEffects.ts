import { Card } from '../types/cards';
import { Unit, UnitType, PlayerTeam } from '../types/units';
import { Effect, EffectType, EffectDuration } from '../types/effects';
import { getAdjacentHexes, getHexesInRange, hexDistance } from './hexMath';

export function canCastCard(
  card: Card,
  caster: Unit | null,
  target: Unit | null,
  units: Unit[],
  plateaus: Set<string>
): { valid: boolean; reason?: string } {
  if (!caster) {
    return { valid: false, reason: 'No caster selected' };
  }

  if (caster.type !== UnitType.MAGE) {
    return { valid: false, reason: 'Only Mages can cast cards' };
  }

  if (caster.hasCast) {
    return { valid: false, reason: 'This unit has already cast a card this turn' };
  }

  const cardTitle = card.title.toLowerCase();

  // Check team compatibility for Buff and Nerf cards
  // Note: "Gravity's Lash" is an exception - it's labeled as Buff but targets enemies
  if (target && target.type !== UnitType.FLAG && target.type !== UnitType.PLATEAU) {
    if (card.type === 'Buff' && target.team !== caster.team && cardTitle !== "gravity's lash") {
      return { valid: false, reason: 'Can only buff friendly units' };
    }
    if (card.type === 'Nerf' && target.team === caster.team) {
      return { valid: false, reason: 'Can only nerf enemy units' };
    }
  }

  // Check if this is a Warlord-specific buff card (formerly called Finisher cards)
  const warlordBuffCards = ['spinal ripcord', 'soul siphon', 'super smash'];
  if (warlordBuffCards.includes(cardTitle)) {
    if (!target) {
      return { valid: false, reason: 'This card requires a target' };
    }
    const warlord = units.find(u => u.type === UnitType.WARLORD && u.team === caster.team);
    if (!warlord) {
      return { valid: false, reason: 'Warlord must be on the board' };
    }
  }

  // Check Rampage card (Warlord gains extra attack)
  if (cardTitle === 'rampage') {
    const warlord = units.find(u => u.type === UnitType.WARLORD && u.team === caster.team);
    if (!warlord) {
      return { valid: false, reason: 'Warlord must be on the board' };
    }
  }

  if ((cardTitle.includes('archer') || cardTitle === 'poison arrow') && target?.type !== UnitType.ARCHER) {
    return { valid: false, reason: 'This card requires an Archer target' };
  }

  if ((cardTitle.includes('brute') || cardTitle === 'raging pulse' || cardTitle === 'echo strike') && target?.type !== UnitType.BRUTE) {
    return { valid: false, reason: 'This card requires a Brute target' };
  }

  if (cardTitle === 'axehound') {
    if (!target || target.type !== UnitType.BRUTE) {
      return { valid: false, reason: 'This card requires a Brute target' };
    }
  }

  if (cardTitle.includes('warlord') && target?.type !== UnitType.WARLORD) {
    return { valid: false, reason: 'This card requires a Warlord target' };
  }

  if ((cardTitle.includes('mage') || cardTitle === 'spectral shift') && target?.type !== UnitType.MAGE) {
    return { valid: false, reason: 'This card requires a Mage target' };
  }

  if ((cardTitle.includes('assassin') || cardTitle === "shadow's edge" || cardTitle === 'shroud of turino' || cardTitle === 'in & out murder') && target?.type !== UnitType.ASSASSIN) {
    return { valid: false, reason: 'This card requires an Assassin target' };
  }

  if (cardTitle === 'king of the hill') {
    if (!target || target.type !== UnitType.ARCHER) {
      return { valid: false, reason: 'Requires an Archer on a Plateau' };
    }
    const hexKey = `${String(target.q)},${String(target.r)}`;
    const isOnPlateau = plateaus.has(hexKey);
    if (!isOnPlateau) {
      return { valid: false, reason: 'Archer must be on a Plateau' };
    }
  }

  if (cardTitle === 'blinding dust') {
    if (!target) {
      return { valid: false, reason: 'Requires a target' };
    }
    const validTypes = [UnitType.ARCHER, UnitType.MAGE, UnitType.ASSASSIN];
    if (!validTypes.includes(target.type)) {
      return { valid: false, reason: 'Can only target Archer, Mage, or Assassin' };
    }
  }

  if (cardTitle === 'farsight') {
    if (!target) {
      return { valid: false, reason: 'Requires an Archer target' };
    }
    if (target.type !== UnitType.ARCHER) {
      return { valid: false, reason: 'Can only target Archers' };
    }
  }

  if (cardTitle === 'overwound strings') {
    if (!target) {
      return { valid: false, reason: 'Requires an Archer target' };
    }
    if (target.type !== UnitType.ARCHER) {
      return { valid: false, reason: 'Can only target Archers' };
    }
  }

  if (cardTitle === "gravity's lash") {
    if (!target) {
      return { valid: false, reason: 'Requires a target' };
    }
    const hexKey = `${String(target.q)},${String(target.r)}`;
    const isOnPlateau = plateaus.has(hexKey);
    if (!isOnPlateau) {
      return { valid: false, reason: 'Target must be on a Plateau' };
    }
  }

  if (cardTitle === 'claws of crabs') {
    if (!target) {
      return { valid: false, reason: 'Requires a target' };
    }
    if (target.team === caster.team) {
      return { valid: false, reason: 'Can only target enemy units' };
    }
    const adjacentHexes = getAdjacentHexes({ q: target.q, r: target.r });
    const adjacentFriendlyUnits = units.filter(u =>
      u.team === caster.team &&
      adjacentHexes.some(hex => hex.q === u.q && hex.r === u.r)
    );
    if (adjacentFriendlyUnits.length < 2) {
      return { valid: false, reason: 'Target must have at least 2 friendly units adjacent' };
    }
  }

  if (cardTitle === 'vertigo') {
    if (!target) {
      return { valid: false, reason: 'Requires a target' };
    }
    const hexKey = `${String(target.q)},${String(target.r)}`;
    const isOnPlateau = plateaus.has(hexKey);
    if (!isOnPlateau) {
      return { valid: false, reason: 'Target must be on a Plateau' };
    }
  }

  if (cardTitle === "traitor's toll") {
    if (!target) {
      return { valid: false, reason: 'Requires a target' };
    }
    if (target.team === caster.team) {
      return { valid: false, reason: 'Can only target enemy units' };
    }
    const adjacentHexes = getAdjacentHexes({ q: target.q, r: target.r });
    const adjacentWarlord = units.find(u =>
      u.type === UnitType.WARLORD &&
      u.team === target.team &&
      adjacentHexes.some(hex => hex.q === u.q && hex.r === u.r)
    );
    if (!adjacentWarlord) {
      return { valid: false, reason: 'Target must be adjacent to their own Warlord' };
    }
  }

  if (cardTitle === 'shatter terra') {
    if (!target) {
      return { valid: false, reason: 'Requires a target hex with a plateau' };
    }
    const hexKey = `${String(target.q)},${String(target.r)}`;
    const isOnPlateau = plateaus.has(hexKey);
    if (!isOnPlateau) {
      return { valid: false, reason: 'Target must be on a plateau' };
    }
  }

  return { valid: true };
}

export function applyCardEffect(
  card: Card,
  caster: Unit,
  target: Unit | null,
  units: Unit[],
  plateaus: Set<string>,
  currentTurn: number
): { units: Unit[], plateausToRemove?: string[] } {
  let updatedUnits = [...units];
  const cardTitle = card.title.toLowerCase();

  if (cardTitle.includes('shadow')) {
    console.log('Processing card with shadow in title:', cardTitle, 'Original:', card.title);
  }

  const cardDamageEffect = caster.effects.find(e => e.type === EffectType.CARD_DAMAGE && e.duration === EffectDuration.UNTIL_TRIGGERED);
  if (cardDamageEffect) {
    updatedUnits = updatedUnits.map(u =>
      u.id === caster.id
        ? {
            ...u,
            stats: { ...u.stats, hp: Math.max(0, u.stats.hp - cardDamageEffect.value) },
            effects: u.effects.filter(e => e.id !== cardDamageEffect.id)
          }
        : u
    );
  }

  switch (cardTitle) {
    case 'phantasmic shield':
      if (target) {
        updatedUnits = addEffectToUnit(updatedUnits, target.id, {
          id: `effect-${Date.now()}`,
          type: EffectType.DAMAGE_REDUCTION,
          duration: EffectDuration.NEXT_TURN,
          value: 2,
          sourceCardTitle: card.title,
          appliedOnTurn: currentTurn,
        });
      }
      break;

    case 'axehound':
      if (target && target.type === UnitType.BRUTE) {
        updatedUnits = addEffectToUnit(updatedUnits, target.id, {
          id: `effect-${Date.now()}`,
          type: EffectType.ATTACK_BUFF,
          duration: EffectDuration.NEXT_TURN,
          value: 1,
          sourceCardTitle: card.title,
          appliedOnTurn: currentTurn,
        });
      }
      break;

    case 'raging pulse':
      if (target && target.type === UnitType.BRUTE) {
        updatedUnits = addEffectToUnit(updatedUnits, target.id, {
          id: `effect-${Date.now()}`,
          type: EffectType.ATTACK_BUFF,
          duration: EffectDuration.NEXT_TURN,
          value: 3,
          sourceCardTitle: card.title,
          appliedOnTurn: currentTurn,
        });
      }
      break;

    case 'echo strike':
      if (target && target.type === UnitType.BRUTE) {
        updatedUnits = addEffectToUnit(updatedUnits, target.id, {
          id: `effect-${Date.now()}`,
          type: EffectType.EXTRA_ATTACK,
          duration: EffectDuration.THIS_TURN,
          value: 1,
          sourceCardTitle: card.title,
          appliedOnTurn: currentTurn,
        });
      }
      break;

    case 'poison arrow':
      if (target && target.type === UnitType.ARCHER) {
        updatedUnits = addEffectToUnit(updatedUnits, target.id, {
          id: `effect-${Date.now()}`,
          type: EffectType.ATTACK_BUFF,
          duration: EffectDuration.NEXT_TURN,
          value: 1,
          sourceCardTitle: card.title,
          appliedOnTurn: currentTurn,
        });
      }
      break;

    case "shadow's edge":
      if (target && target.type === UnitType.ASSASSIN) {
        console.log('Shadow\'s Edge: Adding effect to assassin', target.id, 'on turn', currentTurn);
        updatedUnits = addEffectToUnit(updatedUnits, target.id, {
          id: `effect-${Date.now()}`,
          type: EffectType.ATTACK_BUFF,
          duration: EffectDuration.NEXT_TURN,
          value: 1,
          sourceCardTitle: card.title,
          appliedOnTurn: currentTurn,
        });
        console.log('Updated units after Shadow\'s Edge:', updatedUnits.find(u => u.id === target.id)?.effects);
      } else {
        console.log('Shadow\'s Edge: Target invalid', target);
      }
      break;

    case 'king of the hill':
      if (target && target.type === UnitType.ARCHER && plateaus.has(`${String(target.q)},${String(target.r)}`)) {
        updatedUnits = addEffectToUnit(updatedUnits, target.id, {
          id: `effect-${Date.now()}`,
          type: EffectType.ATTACK_BUFF,
          duration: EffectDuration.NEXT_TURN,
          value: 2,
          sourceCardTitle: card.title,
          appliedOnTurn: currentTurn,
        });
      }
      break;

    case 'farsight':
      if (target && target.type === UnitType.ARCHER) {
        updatedUnits = addEffectToUnit(updatedUnits, target.id, {
          id: `effect-${Date.now()}`,
          type: EffectType.RANGE_BUFF,
          duration: EffectDuration.THIS_TURN,
          value: 1,
          sourceCardTitle: card.title,
          appliedOnTurn: currentTurn,
        });
      }
      break;

    case 'swift foot':
      if (target) {
        updatedUnits = addEffectToUnit(updatedUnits, target.id, {
          id: `effect-${Date.now()}`,
          type: EffectType.MOVEMENT_BUFF,
          duration: EffectDuration.THIS_TURN,
          value: 1,
          sourceCardTitle: card.title,
          appliedOnTurn: currentTurn,
        });
      }
      break;

    case 'spectral shift':
      if (target && target.type === UnitType.MAGE) {
        updatedUnits = addEffectToUnit(updatedUnits, target.id, {
          id: `effect-${Date.now()}`,
          type: EffectType.MOVEMENT_BUFF,
          duration: EffectDuration.NEXT_TURN,
          value: 4,
          sourceCardTitle: card.title,
          appliedOnTurn: currentTurn,
        });
      }
      break;

    case 'in & out murder':
      if (target && target.type === UnitType.ASSASSIN) {
        updatedUnits = addEffectToUnit(updatedUnits, target.id, {
          id: `effect-${Date.now()}`,
          type: EffectType.MOVEMENT_ON_KILL,
          duration: EffectDuration.THIS_TURN,
          value: 1,
          sourceCardTitle: card.title,
          appliedOnTurn: currentTurn,
        });
      }
      break;

    case 'transfusion':
      if (target) {
        updatedUnits = updatedUnits.map(u =>
          u.id === target.id
            ? { ...u, stats: { ...u.stats, hp: Math.min(u.stats.hp + 2, u.stats.maxHp) } }
            : u
        );
      }
      break;

    case 'shroud of turino':
      if (target && target.type === UnitType.ASSASSIN) {
        updatedUnits = addEffectToUnit(updatedUnits, target.id, {
          id: `effect-${Date.now()}`,
          type: EffectType.INVISIBLE,
          duration: EffectDuration.NEXT_TURN,
          value: 1,
          sourceCardTitle: card.title,
          appliedOnTurn: currentTurn,
        });
      }
      break;

    case 'toe rot':
      if (target) {
        updatedUnits = addEffectToUnit(updatedUnits, target.id, {
          id: `effect-${Date.now()}`,
          type: EffectType.MOVEMENT_BLOCKED,
          duration: EffectDuration.NEXT_TURN,
          value: 1,
          sourceCardTitle: card.title,
          appliedOnTurn: currentTurn,
        });
      }
      break;

    case 'blinding dust':
      if (target) {
        updatedUnits = addEffectToUnit(updatedUnits, target.id, {
          id: `effect-${Date.now()}`,
          type: EffectType.RANGE_NERF,
          duration: EffectDuration.NEXT_TURN,
          value: 1,
          sourceCardTitle: card.title,
          appliedOnTurn: currentTurn,
        });
      }
      break;

    case 'brittle blade':
      if (target && target.type === UnitType.BRUTE) {
        updatedUnits = addEffectToUnit(updatedUnits, target.id, {
          id: `effect-${Date.now()}`,
          type: EffectType.ATTACK_NERF,
          duration: EffectDuration.NEXT_TURN,
          value: 2,
          sourceCardTitle: card.title,
          appliedOnTurn: currentTurn,
        });
      }
      break;

    case 'overwound strings':
      if (target && target.type === UnitType.ARCHER) {
        updatedUnits = addEffectToUnit(updatedUnits, target.id, {
          id: `effect-${Date.now()}`,
          type: EffectType.ATTACK_NERF,
          duration: EffectDuration.NEXT_TURN,
          value: 1,
          sourceCardTitle: card.title,
          appliedOnTurn: currentTurn,
        });
      }
      break;

    case "coward's mark":
      if (target) {
        updatedUnits = addEffectToUnit(updatedUnits, target.id, {
          id: `effect-${Date.now()}`,
          type: EffectType.ATTACK_BLOCKED,
          duration: EffectDuration.NEXT_TURN,
          value: 1,
          sourceCardTitle: card.title,
          appliedOnTurn: currentTurn,
        });
      }
      break;

    case 'tarnished crown':
      if (target && target.type === UnitType.WARLORD) {
        updatedUnits = addEffectToUnit(updatedUnits, target.id, {
          id: `effect-${Date.now()}`,
          type: EffectType.BUFF_BLOCKED,
          duration: EffectDuration.NEXT_TURN,
          value: 1,
          sourceCardTitle: card.title,
          appliedOnTurn: currentTurn,
        });
      }
      break;

    case 'weight of command':
      if (target && target.type === UnitType.WARLORD) {
        const adjacentHexes = getAdjacentHexes({ q: target.q, r: target.r });
        const adjacentAllies = adjacentHexes.filter(hex => {
          return updatedUnits.some(u =>
            u.q === hex.q &&
            u.r === hex.r &&
            u.team === target.team &&
            u.type !== UnitType.FLAG &&
            u.type !== UnitType.PLATEAU
          );
        }).length;

        updatedUnits = addEffectToUnit(updatedUnits, target.id, {
          id: `effect-${Date.now()}`,
          type: EffectType.ATTACK_NERF,
          duration: EffectDuration.NEXT_TURN,
          value: adjacentAllies,
          sourceCardTitle: card.title,
          appliedOnTurn: currentTurn,
        });
      }
      break;

    case 'vertigo':
      if (target && plateaus.has(`${String(target.q)},${String(target.r)}`)) {
        updatedUnits = addEffectToUnit(updatedUnits, target.id, {
          id: `effect-${Date.now()}`,
          type: EffectType.PLATEAU_DEBUFF,
          duration: EffectDuration.NEXT_TURN,
          value: 1,
          sourceCardTitle: card.title,
          appliedOnTurn: currentTurn,
        });
      }
      break;

    case 'shield bash':
      if (target) {
        updatedUnits = addEffectToUnit(updatedUnits, target.id, {
          id: `effect-${Date.now()}`,
          type: EffectType.PUSH,
          duration: EffectDuration.UNTIL_TRIGGERED,
          value: 1,
          sourceCardTitle: card.title,
          appliedOnTurn: currentTurn,
        });
      }
      break;

    case 'grave debt':
      if (target) {
        updatedUnits = addEffectToUnit(updatedUnits, target.id, {
          id: `effect-${Date.now()}`,
          type: EffectType.ON_DEATH_MAGE_DAMAGE,
          duration: EffectDuration.UNTIL_TRIGGERED,
          value: 2,
          sourceCardTitle: card.title,
          appliedOnTurn: currentTurn,
          casterTeam: caster.team,
        });
      }
      break;

    case "gravity's lash":
      if (target && plateaus.has(`${String(target.q)},${String(target.r)}`)) {
        // Find all empty hexes within range 8 of the target
        const possibleHexes = getHexesInRange({ q: target.q, r: target.r }, 8);
        const emptyHexes = possibleHexes.filter(hex => {
          // Don't consider the target's current position
          if (hex.q === target.q && hex.r === target.r) return false;
          // Check if this hex is empty (no units on it)
          const unitsOnHex = updatedUnits.filter(u => u.q === hex.q && u.r === hex.r && u.id !== target.id);
          return unitsOnHex.length === 0;
        });

        if (emptyHexes.length > 0) {
          // Find the nearest empty hex
          let nearestHex = emptyHexes[0];
          let minDistance = hexDistance({ q: target.q, r: target.r }, nearestHex);

          for (const hex of emptyHexes) {
            const dist = hexDistance({ q: target.q, r: target.r }, hex);
            if (dist < minDistance) {
              minDistance = dist;
              nearestHex = hex;
            }
          }

          // Move target to nearest empty hex and deal 1 fall damage
          updatedUnits = updatedUnits.map(u =>
            u.id === target.id
              ? {
                  ...u,
                  q: nearestHex.q,
                  r: nearestHex.r,
                  stats: { ...u.stats, hp: Math.max(0, u.stats.hp - 1) }
                }
              : u
          );
        }
      }
      break;

    case 'claws of crabs':
      if (target) {
        const adjacentHexes = getAdjacentHexes({ q: target.q, r: target.r });
        const adjacentFriendlyUnits = updatedUnits.filter(u =>
          u.team === caster.team &&
          adjacentHexes.some(hex => hex.q === u.q && hex.r === u.r)
        );

        adjacentFriendlyUnits.forEach(friendlyUnit => {
          updatedUnits = addEffectToUnit(updatedUnits, friendlyUnit.id, {
            id: `effect-${Date.now()}-${friendlyUnit.id}`,
            type: EffectType.ATTACK_BUFF,
            duration: EffectDuration.NEXT_TURN,
            value: 1,
            sourceCardTitle: card.title,
            appliedOnTurn: currentTurn,
          });
        });
      }
      break;

    case "traitor's toll":
      if (target) {
        const adjacentHexes = getAdjacentHexes({ q: target.q, r: target.r });
        const adjacentWarlord = updatedUnits.find(u =>
          u.type === UnitType.WARLORD &&
          u.team === target.team &&
          adjacentHexes.some(hex => hex.q === u.q && hex.r === u.r)
        );

        if (adjacentWarlord) {
          updatedUnits = updatedUnits.map(u =>
            u.id === adjacentWarlord.id
              ? { ...u, stats: { ...u.stats, hp: Math.max(0, u.stats.hp - 2) } }
              : u
          );
        }
      }
      break;

    case 'rampage':
      const warlordUnit = units.find(u => u.type === UnitType.WARLORD && u.team === caster.team);
      if (warlordUnit) {
        updatedUnits = addEffectToUnit(updatedUnits, warlordUnit.id, {
          id: `effect-${Date.now()}`,
          type: EffectType.EXTRA_ATTACK,
          duration: EffectDuration.THIS_TURN,
          value: 1,
          sourceCardTitle: card.title,
          appliedOnTurn: currentTurn,
        });
      }
      break;

    case 'soul siphon':
      {
        const warlordUnit = units.find(u => u.type === UnitType.WARLORD && u.team === caster.team);
        if (warlordUnit && target) {
          updatedUnits = addEffectToUnit(updatedUnits, warlordUnit.id, {
            id: `effect-${Date.now()}`,
            type: EffectType.ATTACK_BUFF,
            duration: EffectDuration.THIS_TURN,
            value: 2,
            sourceCardTitle: card.title,
            appliedOnTurn: currentTurn,
          });
          updatedUnits = addEffectToUnit(updatedUnits, warlordUnit.id, {
            id: `effect-${Date.now()}-heal`,
            type: EffectType.HEAL_ON_KILL,
            duration: EffectDuration.UNTIL_TRIGGERED,
            value: 1,
            sourceCardTitle: card.title,
            appliedOnTurn: currentTurn,
          });
        }
      }
      break;

    case 'spinal ripcord':
      {
        const warlordUnit = units.find(u => u.type === UnitType.WARLORD && u.team === caster.team);
        if (warlordUnit && target) {
          updatedUnits = addEffectToUnit(updatedUnits, warlordUnit.id, {
            id: `effect-${Date.now()}`,
            type: EffectType.ATTACK_BUFF,
            duration: EffectDuration.THIS_TURN,
            value: 2,
            sourceCardTitle: card.title,
            appliedOnTurn: currentTurn,
          });
          updatedUnits = addEffectToUnit(updatedUnits, warlordUnit.id, {
            id: `effect-${Date.now()}-ignore-dr`,
            type: EffectType.IGNORE_DAMAGE_REDUCTION,
            duration: EffectDuration.THIS_TURN,
            value: 1,
            sourceCardTitle: card.title,
            appliedOnTurn: currentTurn,
          });
        }
      }
      break;

    case 'super smash':
      {
        const warlordUnit = units.find(u => u.type === UnitType.WARLORD && u.team === caster.team);
        if (warlordUnit && target) {
          updatedUnits = addEffectToUnit(updatedUnits, warlordUnit.id, {
            id: `effect-${Date.now()}`,
            type: EffectType.AREA_DAMAGE,
            duration: EffectDuration.THIS_TURN,
            value: 1,
            sourceCardTitle: card.title,
            appliedOnTurn: currentTurn,
          });
        }
      }
      break;

    case 'shatter terra':
      if (target) {
        const hexKey = `${String(target.q)},${String(target.r)}`;
        if (plateaus.has(hexKey)) {
          updatedUnits = updatedUnits.map(u =>
            u.q === target.q && u.r === target.r && u.type !== UnitType.FLAG && u.type !== UnitType.PLATEAU
              ? { ...u, stats: { ...u.stats, hp: 0 } }
              : u
          );

          updatedUnits = updatedUnits.map(u =>
            u.id === caster.id ? { ...u, hasCast: true } : u
          );

          return { units: updatedUnits, plateausToRemove: [hexKey] };
        }
      }
      break;

    default:
      break;
  }

  updatedUnits = updatedUnits.map(u =>
    u.id === caster.id ? { ...u, hasCast: true } : u
  );

  return { units: updatedUnits };
}

function addEffectToUnit(units: Unit[], unitId: string, effect: Effect): Unit[] {
  return units.map(u =>
    u.id === unitId
      ? { ...u, effects: [...u.effects, effect] }
      : u
  );
}

export function calculateEffectiveStats(unit: Unit, plateaus: Set<string>) {
  let attack = unit.stats.attack;
  let range = unit.stats.range || 1;
  let movement = unit.stats.movement;
  let damageReduction = 0;

  if (unit.type === UnitType.ASSASSIN && unit.effects.length > 0) {
    console.log('Calculating stats for assassin with effects:', unit.effects);
  }

  unit.effects.forEach(effect => {
    switch (effect.type) {
      case EffectType.ATTACK_BUFF:
        console.log('Applying ATTACK_BUFF:', effect.value, 'from', effect.sourceCardTitle);
        attack += effect.value;
        break;
      case EffectType.ATTACK_NERF:
        attack = Math.max(0, attack - effect.value);
        break;
      case EffectType.RANGE_BUFF:
        range += effect.value;
        break;
      case EffectType.RANGE_NERF:
        range = Math.max(1, range - effect.value);
        break;
      case EffectType.MOVEMENT_BUFF:
        movement += effect.value;
        break;
      case EffectType.MOVEMENT_BLOCKED:
        movement = 0;
        break;
      case EffectType.DAMAGE_REDUCTION:
        damageReduction += effect.value;
        break;
    }
  });

  const isOnPlateau = plateaus.has(`${String(unit.q)},${String(unit.r)}`);
  const hasPlateauDebuff = unit.effects.some(e => e.type === EffectType.PLATEAU_DEBUFF);

  if (isOnPlateau && !hasPlateauDebuff) {
    if (unit.type === UnitType.MAGE) {
      range += 1;
    }
    if (unit.type === UnitType.ARCHER) {
      attack += 1;
      damageReduction += 1;
    }
  }

  return { attack, range, movement, damageReduction };
}

export function processDyingUnits(units: Unit[]): Unit[] {
  let processedUnits = [...units];
  const triggeredEffects = new Set<string>();

  const dyingUnits = units.filter(u => u.stats.hp <= 0 && u.type !== UnitType.FLAG && u.type !== UnitType.PLATEAU);

  dyingUnits.forEach(dyingUnit => {
    const onDeathEffects = dyingUnit.effects.filter(e =>
      (e.type === EffectType.ON_DEATH_MAGE_DAMAGE || e.type === EffectType.DAMAGE_ON_DEATH) &&
      e.duration === EffectDuration.UNTIL_TRIGGERED
    );

    onDeathEffects.forEach(effect => {
      if (!triggeredEffects.has(effect.id)) {
        if (effect.type === EffectType.ON_DEATH_MAGE_DAMAGE) {
          // Damage the mage on the opposing team from the caster
          const casterTeam = effect.casterTeam || dyingUnit.team;
          const enemyTeam = casterTeam === PlayerTeam.PLAYER1 ? PlayerTeam.PLAYER2 : PlayerTeam.PLAYER1;
          const enemyMages = processedUnits.filter(u => u.type === UnitType.MAGE && u.team === enemyTeam && u.stats.hp > 0);

          if (enemyMages.length > 0) {
            let nearestMage = enemyMages[0];
            let minDistance = Infinity;

            enemyMages.forEach(mage => {
              const dx = mage.q - dyingUnit.q;
              const dy = mage.r - dyingUnit.r;
              const distance = Math.abs(dx) + Math.abs(dy) + Math.abs(-dx - dy);

              if (distance < minDistance) {
                minDistance = distance;
                nearestMage = mage;
              }
            });

            processedUnits = processedUnits.map(u =>
              u.id === nearestMage.id
                ? { ...u, stats: { ...u.stats, hp: Math.max(0, u.stats.hp - effect.value) } }
                : u
            );
          }
        }

        triggeredEffects.add(effect.id);

        processedUnits = processedUnits.map(u =>
          u.id === dyingUnit.id
            ? { ...u, effects: u.effects.filter(e => e.id !== effect.id) }
            : u
        );
      }
    });
  });

  return processedUnits;
}

export function cleanupExpiredEffects(units: Unit[], currentTurn: number, _currentPlayer: PlayerTeam): Unit[] {
  return units.map(unit => {
    const filteredEffects = unit.effects.filter(effect => {
      if (effect.duration === EffectDuration.INSTANT || effect.duration === EffectDuration.PERMANENT || effect.duration === EffectDuration.UNTIL_TRIGGERED) {
        return true;
      }

      if (effect.duration === EffectDuration.THIS_TURN) {
        return effect.appliedOnTurn === currentTurn;
      }

      if (effect.duration === EffectDuration.NEXT_TURN) {
        if (effect.appliedOnTurn !== undefined) {
          return currentTurn <= effect.appliedOnTurn + 1;
        }
        return true;
      }

      return true;
    });

    return { ...unit, effects: filteredEffects };
  });
}

export function markEffectsAsUsed(
  unit: Unit,
  actionType: 'attack' | 'movement',
  currentTurn: number
): Unit {
  const updatedEffects = unit.effects.map(effect => {
    if (effect.appliedOnTurn !== undefined && effect.appliedOnTurn < currentTurn && effect.duration === EffectDuration.NEXT_TURN) {
      const shouldMarkUsed =
        (actionType === 'attack' && (
          effect.type === EffectType.ATTACK_BUFF ||
          effect.type === EffectType.ATTACK_NERF ||
          effect.type === EffectType.ATTACK_BLOCKED ||
          effect.type === EffectType.RANGE_BUFF ||
          effect.type === EffectType.RANGE_NERF ||
          effect.type === EffectType.IGNORE_DAMAGE_REDUCTION ||
          effect.type === EffectType.AREA_DAMAGE
        )) ||
        (actionType === 'movement' && (
          effect.type === EffectType.MOVEMENT_BUFF ||
          effect.type === EffectType.MOVEMENT_BLOCKED
        ));

      if (shouldMarkUsed) {
        return { ...effect, usedThisTurn: true };
      }
    }
    return effect;
  });

  return { ...unit, effects: updatedEffects };
}
