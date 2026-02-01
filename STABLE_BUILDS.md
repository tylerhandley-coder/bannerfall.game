# Stable Builds

This document tracks stable builds of the Bannerfall game.

## Stable Build 4 (stable-build-4)
**Date:** January 31, 2026

### Features
- Fixed nerf card tooltips to display correct negative values
- Echo Strike card removed from deck
- Brute movement set to 1
- Assassin movement set to 4
- First player determined by "most mages in front row" rule
- Full multiplayer functionality with Supabase
- Card system with buffs and nerfs
- Flag capture victory condition
- Complete unit roster (Warrior, Ranger, Mage, Assassin, Brute)

### Changes from Stable Build 3
- Updated effectDescriptions.ts to correctly display negative values for ATTACK_NERF (line 10)
- Updated effectDescriptions.ts to correctly display negative values for RANGE_NERF (line 22)
- Cards like "Overwound Strings" now show "Attack -1" instead of "Attack +1"
- Cards like "Blinding Dust" now show "Range -1" instead of "Range +1"

---

## Stable Build 3 (stable-build-3)
**Date:** January 30, 2026

### Features
- Echo Strike card removed from deck
- Brute movement set to 1
- Assassin movement set to 4
- First player determined by "most mages in front row" rule
- Full multiplayer functionality with Supabase
- Card system with buffs and nerfs
- Flag capture victory condition
- Complete unit roster (Warrior, Ranger, Mage, Assassin, Brute)

### Changes from Stable Build 2
- Removed Echo Strike card from bannerfall_cards_-_sheet1_(1).csv (line 15)

---

## Stable Build 2 (stable-build-2)
**Date:** January 29, 2026

### Features
- Brute movement set to 1 (changed from 2)
- Assassin movement set to 4
- First player determined by "most mages in front row" rule
- Full multiplayer functionality with Supabase
- Card system with buffs and nerfs
- Flag capture victory condition
- Complete unit roster (Warrior, Ranger, Mage, Assassin, Brute)

### Changes from Stable Build 1
- Updated Brute movement from 2 to 1 in HowToPlayModal.tsx

---

## Stable Build 1 (stable-build-1)
**Date:** January 28, 2026
**Commit:** eb90d34

### Features
- Assassin movement set to 4
- First player determined by "most mages in front row" rule
- Full multiplayer functionality with Supabase
- Card system with buffs and nerfs
- Flag capture victory condition
- Complete unit roster (Warrior, Ranger, Mage, Assassin)

### To Revert to This Build
```bash
git checkout stable-build-1
```

Or to create a new branch from this build:
```bash
git checkout -b my-branch stable-build-1
```
