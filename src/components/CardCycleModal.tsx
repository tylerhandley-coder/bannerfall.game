import * as React from 'react';
import { X, Check } from 'lucide-react';
import { Card as CardType } from '../types/cards';
import { Card } from './Card';

interface CardCycleModalProps {
  isOpen: boolean;
  cards: CardType[];
  onConfirm: (indicesToKeep: number[]) => void;
  onCancel: () => void;
}

export function CardCycleModal({ isOpen, cards, onConfirm, onCancel }: CardCycleModalProps) {
  const [selectedIndices, setSelectedIndices] = React.useState<Set<number>>(new Set());

  React.useEffect(() => {
    if (isOpen) {
      setSelectedIndices(new Set());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCardClick = (index: number) => {
    setSelectedIndices((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  const handleConfirm = () => {
    onConfirm(Array.from(selectedIndices));
  };

  const cardsToKeep = selectedIndices.size;
  const cardsToDiscard = cards.length - cardsToKeep;
  const newCardsToDraw = cardsToDiscard;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="relative w-full max-w-4xl bg-gradient-to-br from-slate-900/95 to-slate-800/95 rounded-lg border-4 border-blue-500/40 shadow-2xl overflow-hidden">
        <div className="sticky top-0 flex items-center justify-between p-6 bg-gradient-to-r from-blue-900/50 to-blue-800/50 border-b-2 border-blue-500/40">
          <div>
            <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
              CYCLE CARDS
            </h2>
            <p className="text-sm text-blue-200 mt-1">
              Select cards to keep (total hand size will be 6)
            </p>
          </div>
          <button
            onClick={onCancel}
            className="p-2 rounded-lg hover:bg-blue-800/40 transition-all"
            aria-label="Close"
          >
            <X className="w-6 h-6 text-blue-400" />
          </button>
        </div>

        <div className="p-6">
          <div className="mb-4 text-center">
            <div className="inline-block px-4 py-2 bg-blue-900/40 rounded-lg border border-blue-500/30">
              <span className="text-blue-200 font-semibold">
                Keeping: {cardsToKeep} cards
              </span>
              <span className="text-blue-300 ml-2">
                | Discarding: {cardsToDiscard}
              </span>
              <span className="text-green-400 ml-2">
                | Drawing: {newCardsToDraw} new
              </span>
            </div>
          </div>

          <div className="flex gap-3 flex-wrap justify-center mb-6">
            {cards.map((card, index) => (
              <div
                key={`${card.title}-${index}`}
                onClick={() => handleCardClick(index)}
                className={`cursor-pointer transition-all transform relative ${
                  selectedIndices.has(index)
                    ? 'hover:scale-105 hover:shadow-lg ring-2 ring-green-400'
                    : 'scale-95 opacity-40 hover:opacity-60'
                }`}
                style={{ width: '140px' }}
              >
                <Card card={card} />
                {selectedIndices.has(index) && (
                  <div className="absolute inset-0 flex items-center justify-center bg-green-900/40 rounded-lg pointer-events-none">
                    <div className="bg-green-600 rounded-full p-2">
                      <Check className="w-8 h-8 text-white" />
                    </div>
                  </div>
                )}
                {!selectedIndices.has(index) && (
                  <div className="absolute inset-0 flex items-center justify-center bg-red-900/50 rounded-lg pointer-events-none">
                    <div className="bg-red-600 rounded-full p-2">
                      <X className="w-8 h-8 text-white" />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="flex gap-3 justify-center">
            <button
              onClick={onCancel}
              className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg transition-colors shadow-lg"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-semibold rounded-lg transition-all shadow-lg flex items-center gap-2"
            >
              <Check className="w-5 h-5" />
              Cycle Cards
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
