import { useState, useRef, useEffect } from 'react';
import { Menu, BookOpen, RotateCcw, ArrowLeft } from 'lucide-react';

interface HamburgerMenuProps {
  onHowToPlay: () => void;
  onNewGame: () => void;
  onBack?: () => void;
}

export function HamburgerMenu({ onHowToPlay, onNewGame, onBack }: HamburgerMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-gradient-to-br from-amber-950/90 to-purple-950/90 p-2 rounded-lg border-2 border-amber-600/40 hover:border-amber-500/60 transition-all shadow-xl backdrop-blur-sm"
        aria-label="Menu"
      >
        <Menu className="w-5 h-5 text-amber-400" />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-56 bg-gradient-to-br from-amber-950/95 to-purple-950/95 rounded-lg border-2 border-amber-600/40 shadow-2xl backdrop-blur-sm overflow-hidden z-50">
          <button
            onClick={() => {
              onHowToPlay();
              setIsOpen(false);
            }}
            className="w-full flex items-center gap-3 px-4 py-3 text-amber-300 hover:bg-amber-900/40 transition-all border-b border-amber-600/20"
          >
            <BookOpen className="w-5 h-5" />
            <span className="font-semibold">How to Play</span>
          </button>
          <button
            onClick={() => {
              onNewGame();
              setIsOpen(false);
            }}
            className="w-full flex items-center gap-3 px-4 py-3 text-amber-300 hover:bg-amber-900/40 transition-all border-b border-amber-600/20"
          >
            <RotateCcw className="w-5 h-5" />
            <span className="font-semibold">Start New Game</span>
          </button>
          {onBack && (
            <button
              onClick={() => {
                onBack();
                setIsOpen(false);
              }}
              className="w-full flex items-center gap-3 px-4 py-3 text-amber-300 hover:bg-amber-900/40 transition-all"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-semibold">Back to Menu</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
