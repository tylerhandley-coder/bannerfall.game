# Offline Mode

**Bannerfall** is a fully offline, local pass-and-play tactical hex battle game.

## How It Works

The game runs entirely in your browser with **no internet connection required**:

- All game logic runs locally in React state
- No server calls or database queries during gameplay
- Two players share the same device and take turns
- All units, cards, combat, and victory conditions work offline

## Playing Offline

1. **Download the game** - Save the built files to your device
2. **Open index.html** - Launch the game in any modern browser
3. **No internet needed** - Play anywhere, anytime

## Pass-and-Play Mode

- Player 1 sets up their units (red zone, rows 0-3)
- Player 2 sets up their units (blue zone, rows 5-8)
- Players alternate turns with 2 actions each
- Simply hand the device between players when turns end
- Click "Show/Hide Cards" to keep your strategy secret

## Technical Details

### Local Storage
All game state is stored in React component state:
- Unit positions and stats
- Card hands and effects
- Turn tracking and action counts
- Combat and movement history

### Optional Database
The Supabase integration exists for future online multiplayer features but is **completely optional**:
- Game works without environment variables
- No network requests during local gameplay
- Database migrations are unused in local mode

### Offline Distribution
To distribute the game for offline use:

```bash
npm run build
```

Then share the `dist/` folder. Users can open `dist/index.html` in any browser.

## Future Online Features

The database schema supports future online multiplayer:
- Real-time synchronized games
- Matchmaking between players
- Persistent game state across sessions
- Turn notifications

But these features are **not implemented yet** and the game is fully playable offline.
