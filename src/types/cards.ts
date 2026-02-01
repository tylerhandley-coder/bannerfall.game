export type CardType = 'Buff' | 'Nerf';
export type CardRarity = 'Common' | 'Rare' | 'Super Rare' | 'Super rare';

export interface Card {
  title: string;
  type: CardType;
  rarity: CardRarity;
  description: string;
}
