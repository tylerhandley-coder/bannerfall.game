import { Card, CardType, CardRarity } from '../types/cards';
import cardsCSV from '../data/bannerfall_cards_-_sheet1_(1).csv?raw';

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }

  result.push(current);
  return result;
}

export function parseDeck(): Card[] {
  const lines = cardsCSV.trim().split('\n');
  const deck: Card[] = [];

  for (let i = 1; i < lines.length; i++) {
    const fields = parseCSVLine(lines[i]);

    if (fields.length === 5) {
      const [title, type, rarity, description, quantity] = fields;
      const card: Card = {
        title: title.trim(),
        type: type.trim() as CardType,
        rarity: rarity.trim() as CardRarity,
        description: description.trim()
      };

      const qty = parseInt(quantity.trim());
      for (let j = 0; j < qty; j++) {
        deck.push(card);
      }
    }
  }

  return deck;
}

export function drawRandomCards(deck: Card[], count: number): Card[] {
  const shuffled = [...deck].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

export function drawUniqueCardsForBothPlayers(deck: Card[]): { player1: Card[], player2: Card[] } {
  const shuffled = [...deck].sort(() => Math.random() - 0.5);
  const uniqueCards: Card[] = [];
  const seen = new Set<string>();

  for (const card of shuffled) {
    const cardKey = `${card.title}-${card.type}-${card.rarity}`;
    if (!seen.has(cardKey)) {
      seen.add(cardKey);
      uniqueCards.push(card);
      if (uniqueCards.length === 12) break;
    }
  }

  return {
    player1: uniqueCards.slice(0, 6),
    player2: uniqueCards.slice(6, 12)
  };
}
