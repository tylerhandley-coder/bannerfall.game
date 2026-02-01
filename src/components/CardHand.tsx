import { Card as CardType } from '../types/cards';
import { Card } from './Card';

interface CardHandProps {
  cards: CardType[];
  selectedCardIndex: number | null;
  onCardSelect: (index: number) => void;
  disabled?: boolean;
}

export function CardHand({ cards, selectedCardIndex, onCardSelect, disabled }: CardHandProps) {
  return (
    <div className="flex flex-col items-center gap-3 p-4 bg-slate-900/80 rounded-lg backdrop-blur-sm border border-slate-700">
      <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wide">
        Your Cards
      </h3>
      <div className="flex gap-2 flex-wrap justify-center max-w-4xl">
        {cards.map((card, index) => (
          <div
            key={`${card.title}-${index}`}
            onClick={() => !disabled && onCardSelect(index)}
            className={`cursor-pointer transition-all transform ${
              selectedCardIndex === index
                ? 'scale-105 ring-2 ring-blue-400 shadow-lg shadow-blue-500/50'
                : disabled
                ? 'opacity-50 cursor-not-allowed'
                : 'hover:scale-105 hover:shadow-lg'
            }`}
          >
            <Card card={card} />
          </div>
        ))}
      </div>
      {selectedCardIndex !== null && (
        <div className="text-xs text-blue-300 bg-blue-900/30 px-3 py-1 rounded-full border border-blue-500/30">
          Card selected - Choose a Mage, then select target
        </div>
      )}
    </div>
  );
}
