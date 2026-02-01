import { Card as CardType } from '../types/cards';

interface CardProps {
  card: CardType;
}

export function Card({ card }: CardProps) {
  const getRarityColor = () => {
    const rarity = card.rarity.toLowerCase();
    if (rarity.includes('common')) return 'from-green-600 to-green-800 border-green-400';
    if (rarity.includes('rare') && !rarity.includes('super')) return 'from-orange-600 to-orange-800 border-orange-400';
    if (rarity.includes('super')) return 'from-red-600 to-red-800 border-red-400';
    return 'from-gray-600 to-gray-800 border-gray-400';
  };

  const getTypeColor = () => {
    if (card.type === 'Buff') return 'text-green-300';
    if (card.type === 'Nerf') return 'text-red-300';
    return 'text-gray-300';
  };

  return (
    <div
      className="relative bg-gradient-to-b overflow-hidden rounded-lg border-2 shadow-xl transition-transform hover:scale-105 hover:shadow-2xl cursor-pointer"
      style={{ aspectRatio: '5 / 7' }}
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${getRarityColor()} opacity-90`} />

      <div className="relative h-full flex flex-col p-4 text-white">
        <span className={`text-xs font-semibold uppercase ${getTypeColor()} mb-1 block`}>
          {card.type}
        </span>

        <h3 className="font-bold text-sm leading-tight mb-2">{card.title}</h3>

        <div className="flex-1 overflow-y-auto">
          <p className="text-xs leading-snug text-white/90">{card.description}</p>
        </div>
      </div>

      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
    </div>
  );
}
