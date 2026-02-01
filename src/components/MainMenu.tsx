import { Gamepad2, Globe, UserPlus } from 'lucide-react';

interface MainMenuProps {
  onPlayLocal: () => void;
  onCreateOnline: () => void;
  onJoinOnline: () => void;
}

export function MainMenu({ onPlayLocal, onCreateOnline, onJoinOnline }: MainMenuProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-950 via-red-950 to-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-500 to-red-600 tracking-wider drop-shadow-lg mb-3">
            BANNERFALL
          </h1>
          <p className="text-amber-300 text-lg tracking-widest uppercase">
            Tactical Hex Battle
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <button
            onClick={onPlayLocal}
            className="group bg-gradient-to-br from-amber-900/40 to-orange-900/40 backdrop-blur-sm p-8 rounded-xl border-2 border-amber-500/50 shadow-2xl hover:border-amber-400 hover:shadow-amber-500/30 transition-all transform hover:scale-105"
          >
            <div className="flex flex-col items-center gap-4">
              <div className="p-4 bg-amber-600/30 rounded-full group-hover:bg-amber-500/40 transition-colors">
                <Gamepad2 size={40} className="text-amber-300" />
              </div>
              <div className="text-center">
                <h2 className="text-2xl font-bold text-amber-200 mb-2">
                  Local Game
                </h2>
                <p className="text-amber-300 text-sm">
                  Pass-and-Play on one device
                </p>
              </div>
            </div>
          </button>

          <button
            onClick={onCreateOnline}
            className="group bg-gradient-to-br from-emerald-900/40 to-teal-900/40 backdrop-blur-sm p-8 rounded-xl border-2 border-emerald-500/50 shadow-2xl hover:border-emerald-400 hover:shadow-emerald-500/30 transition-all transform hover:scale-105"
          >
            <div className="flex flex-col items-center gap-4">
              <div className="p-4 bg-emerald-600/30 rounded-full group-hover:bg-emerald-500/40 transition-colors">
                <Globe size={40} className="text-emerald-300" />
              </div>
              <div className="text-center">
                <h2 className="text-2xl font-bold text-emerald-200 mb-2">
                  Create Online
                </h2>
                <p className="text-emerald-300 text-sm">
                  Host a multiplayer game
                </p>
              </div>
            </div>
          </button>

          <button
            onClick={onJoinOnline}
            className="group bg-gradient-to-br from-sky-900/40 to-blue-900/40 backdrop-blur-sm p-8 rounded-xl border-2 border-sky-500/50 shadow-2xl hover:border-sky-400 hover:shadow-sky-500/30 transition-all transform hover:scale-105"
          >
            <div className="flex flex-col items-center gap-4">
              <div className="p-4 bg-sky-600/30 rounded-full group-hover:bg-sky-500/40 transition-colors">
                <UserPlus size={40} className="text-sky-300" />
              </div>
              <div className="text-center">
                <h2 className="text-2xl font-bold text-sky-200 mb-2">
                  Join Online
                </h2>
                <p className="text-sky-300 text-sm">
                  Enter a game code
                </p>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
