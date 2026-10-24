# Fallen Oath — Prologue

A portrait mobile action RPG in plain HTML, CSS and vanilla JavaScript. All art comes from the asset packs in the `Prologue` folder (see `ASSET_INVENTORY.md`).

## How to play it

* **Quickest:** double-click `Game/index.html`. It runs straight from disk in Chrome, Edge or Firefox, with no server and no internet connection. Progress saves in the browser's local storage.
* **On a phone on the same Wi-Fi:** serve the `Game` folder (for example `python -m http.server 8000` inside `Game`), then open `http://<your-PC-IP>:8000` on the phone. Use portrait orientation.

### Controls

| | Touch | Keyboard |
|---|---|---|
| Move | Drag anywhere on the lower-left side (floating joystick) | WASD / arrow keys |
| Attack | ATK button (hold to keep swinging) | Space or J |
| Skills 1–4 + ultimate | Skill buttons around ATK, ultimate on the gold-rimmed button | 1, 2, 3, 4 · 5 or R |
| Potions | HP / MP buttons | Q / E |
| Menus | Top buttons: Hero, Bag, Skills, Quests, Map, Settings; II pauses | C, I, K, L; Esc pauses |

## Game structure

* **Loop:** World Map → choose an area → fight the waves (and the boss) → open the reward chest → results → upgrade the hero → harder areas.
* **Areas:** Mossy Courtyard (Lv 1), Whispering Graveyard (Lv 3), Sunken Ruins (Lv 6, boss Grukk the Warlord), Shrine of the Fallen (Lv 9, boss Sir Varric), and the Endless Trial (scaling waves, with a boss every 5th wave). Each cleared area unlocks the next, and cleared areas can be replayed for loot.
* **GM account:** a title-screen button loads a maxed level-30 test character in its own save slot.
* **Character:** levels 1–30 with an XP curve. Each level gives automatic stat growth, 3 attribute points (Strength, Vitality, Intellect, Agility) and 1 skill point.
* **Skill tree (black & yellow flash swordsman, 8 skills):** Flash Draw (Lv 1), Sixfold Flash (Lv 3), Blink Step (Lv 4), Godspeed Rush (Lv 6), Thunder Sheath (Lv 7) and the ultimate Thunder Sovereign (Lv 10), plus the passives Iai Focus and Thunder Step. Ranks go from 1 to 5. You choose 4 actives for the action bar, and the ultimate has its own button (key 5 or R). The black lightning is the existing lightning sheets darkened at load; no new art.
* **Gear:** weapon, armor and accessory slots. Items come in 5 rarities with random affixes, and equipping or unequipping changes stats immediately. Loot drops from enemies, bosses, chests and quest rewards.
* **Economy:** gold from kills, breakables and chests. The Merchant (on the World Map) sells potions and rotating gear, and buys your items.
* **Quests:** 10 quests (kill, collect Orc Tusks, break props, clear areas, defeat bosses, reach a level, reach Endless wave 10). Rewards are claimed in the Journal.
* **Save:** automatic (after every area, menu change and every 15 s). Saves are checked on load, and a damaged save is backed up rather than crashing the game. Settings → Reset deletes the save after you confirm.

## Code layout

| File | Purpose |
|---|---|
| `index.html` | Screens, HUD, panels |
| `css/style.css` | Portrait-first responsive styling, safe areas, touch controls |
| `js/assets.js` | Verified asset paths, sprite atlas coordinates, loader |
| `js/data.js` | **All balance and content:** player stats, skills, enemies, areas, items, quests |
| `js/state.js` | Profile, derived stats, inventory/equipment, XP, quests, save/load and validation |
| `js/world.js` | Builds each area from the tilesets (ground, paths, props, colliders) |
| `js/game.js` | Real-time combat, AI (melee, ranged, Warlord, Knight), skills, statuses, effects, waves, rewards |
| `js/ui.js` | HUD, World Map, Hero/Bag/Skills/Quests/Merchant/Settings panels, dialogs, results |
| `js/main.js` | Boot, touch, mouse and keyboard input, main loop, autosave |

## Known limitations

* The folder contains no audio, so the game is silent.
* The folder contains no item icons, so gear is shown as text cards with rarity colours.
* The Adventurer pack has no hurt or death animation. The player flashes when hit and fades out with a skull-smoke effect on death.
* There are only two regular enemy sprites (Orc and Soldier). Variety comes from scale, stats and behaviour (Grunt, Brute, Warlord; ranged Archer).
* The Orc and Soldier sheets are side-view, so in top-down play they face left or right only.

## Repository contents

This repository holds the game code plus only the asset files the game actually loads (108 images), kept at their original pack paths under `assets/`. The licenses that came with the art packs are included. The full original packs (zip/rar), and the downloaded audio packs that the game doesn't use yet, stay in the local Prologue folder.
