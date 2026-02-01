import { useState } from 'react';
import { MainMenu } from './components/MainMenu';
import { CreateGame } from './components/CreateGame';
import { JoinGame } from './components/JoinGame';
import { GameLobby } from './components/GameLobby';
import { HexBoard } from './components/HexBoard';

type Screen = 'menu' | 'create-game' | 'join-game' | 'lobby' | 'game';
type GameMode = 'local' | 'online';

function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('menu');
  const [gameMode, setGameMode] = useState<GameMode>('local');
  const [gameId, setGameId] = useState<string>('');
  const [gameCode, setGameCode] = useState<string>('');
  const [playerId, setPlayerId] = useState<string>('');

  const handleBackToMenu = () => {
    setCurrentScreen('menu');
    setGameMode('local');
    setGameId('');
    setGameCode('');
    setPlayerId('');
  };

  const handlePlayLocal = () => {
    setGameMode('local');
    setCurrentScreen('game');
  };

  const handleCreateOnline = () => {
    setGameMode('online');
    setCurrentScreen('create-game');
  };

  const handleJoinOnline = () => {
    setGameMode('online');
    setCurrentScreen('join-game');
  };

  const handleGameCreated = (newGameId: string, newGameCode: string, newPlayerId: string) => {
    setGameId(newGameId);
    setGameCode(newGameCode);
    setPlayerId(newPlayerId);
    setCurrentScreen('lobby');
  };

  const handleGameJoined = (newGameId: string, newPlayerId: string) => {
    setGameId(newGameId);
    setPlayerId(newPlayerId);
    setCurrentScreen('lobby');
  };

  const handleStartGame = () => {
    setCurrentScreen('game');
  };

  if (currentScreen === 'menu') {
    return (
      <MainMenu
        onPlayLocal={handlePlayLocal}
        onCreateOnline={handleCreateOnline}
        onJoinOnline={handleJoinOnline}
      />
    );
  }

  if (currentScreen === 'create-game') {
    return (
      <CreateGame
        onGameCreated={handleGameCreated}
        onBack={handleBackToMenu}
      />
    );
  }

  if (currentScreen === 'join-game') {
    return (
      <JoinGame
        onGameJoined={handleGameJoined}
        onBack={handleBackToMenu}
      />
    );
  }

  if (currentScreen === 'lobby') {
    return (
      <GameLobby
        gameId={gameId}
        gameCode={gameCode}
        playerId={playerId}
        onStartGame={handleStartGame}
      />
    );
  }

  if (currentScreen === 'game') {
    return (
      <HexBoard
        onBack={handleBackToMenu}
        gameMode={gameMode}
        gameId={gameMode === 'online' ? gameId : undefined}
        playerId={gameMode === 'online' ? playerId : undefined}
      />
    );
  }

  return (
    <MainMenu
      onPlayLocal={handlePlayLocal}
      onCreateOnline={handleCreateOnline}
      onJoinOnline={handleJoinOnline}
    />
  );
}

export default App;
