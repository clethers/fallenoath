# Fallen Oath — Asset Inventory

Every image the game uses was unpacked from the archives in the `Prologue` folder into `Game/assets/`, with each pack's original folder name kept. The original zip/rar files were left untouched. The game does not generate, download or draw any artwork. All paths below are relative to `Game/`.

## What is in the folder

| Pack (source archive) | Content | Format / dimensions | Used for |
|---|---|---|---|
| `FREE_Adventurer 2D Pixel Art.zip` | 4-direction hero: IDLE, RUN, ATTACK 1, ATTACK 2 (down/left/right/up) | 8-frame strips, 96×80 frames | **Player character** |
| `FREE_Knight 2D Pixel Art v1.2.zip` | Side-view knight: IDLE(14), WALK(8), RUN(8), ATTACK 1(8), ATTACK 2(9), ATTACK 3(11), BLOCK(6), HURT(8), DEATH(15), JUMP×3 | strips, 112×96 frames | **Boss: Sir Varric, the Fallen** (jump frames not used) |
| `Tiny RPG Character Asset Pack -Demo Soldier&Orc.zip` | Orc: Idle, Walk, Attack01/02, Hit, Death. Soldier: Idle, Walk, Attack01/02/03 (bow), Hit, Death | strips, 100×100 frames | **Orc Grunt, Orc Brute, Grukk the Warlord** (Orc at 3 scales); **Deserter Archer** (Soldier) |
| `Pixel Art Top Down - Basic v1.2.3.zip` | TX Tileset Grass / Stone Ground / Wall, TX Struct, TX Props, TX Plant (+ "with Shadow" variants), TX Shadow, TX Player, Scene Overview, Unity package | 256² / 512² atlases, 16 px grid | **All maps**: ground tiles, stone paths, walls, trees, bushes, props, breakables, chest |
| `Super Pixel Effects Gigapack (Free Version) v3.1.0.zip` | Around 100 effects (explosions, spells, impacts, lightning, bursts, smoke, splatters, symbols) as PNG frames and spritesheets + `spritesheet.txt` metadata | row-major grids, 15 fps native | **Skill, combat, status and UI-feedback effects**; skill icons are single frames of these effects |
| `Thunder Effect 02.rar` | Thunder Strike (13 frames, 64×64), Thunder Splash (14 frames, 48×48), with and without blur | strips | **Thunder Strike skill** |
| `Pixel fire asset pack v1.2.zip` | 7 colours × 20 animated fire groups (8 frames each) + .aseprite sources | strips 16–32 × 32–48 | **Burn status**, torches (red / blue / purple) |

**Not present in the folder:** audio of any kind, item/equipment icons, fonts, UI frame art. Gear is therefore shown as text cards with rarity colours. The game has no sound, and Settings says so instead of showing a volume control. Fonts are system fonts.

**Present but not used:** `TX Player.png` (placeholder blocks), `Scene Overview.png` (a preview render, not a game asset), the Unity package, the `.aseprite` files, the Knight's JUMP frames, and the Gigapack effects not listed below.

## Character animation mapping

| In-game | Sheet(s) | Notes |
|---|---|---|
| Player idle / run / attack | `assets/FREE_Adventurer 2D Pixel Art/Sprites/{IDLE,RUN,ATTACK 1,ATTACK 2}/*_{dir}.png` | ATTACK 1 and 2 alternate as a combo; damage lands on frame 3 |
| Orc Grunt / Brute / Warlord | `assets/Tiny RPG…/Orc/Orc_*.png` | Scaled ×1.5 / ×2.0 / ×2.7; Brute and Warlord use Attack02 as a heavy swing |
| Deserter Archer | `assets/Tiny RPG…/Soldier/Soldier_*.png` | Attack03 (bow) fires on frame 7; Attack01 at melee range |
| Arrow projectile | Arrow streak cut from `Soldier_Attack03.png` (x 759–777, y 48–53) | The arrow the sheet already contains, drawn as a moving sprite |
| Sir Varric (boss) | `assets/FREE_Knight 2D Pixel Art v1.2/Sprites/*.png` | ATTACK 1→2 combo, ATTACK 3 lunge, BLOCK stance, HURT, DEATH |

## Skill tree → effect mapping (black & yellow flash swordsman)

The hero is a flash swordsman whose lightning comes in two colours:
- **Yellow:** Thunder Effect 02 "wo blur" strikes and splashes, plus the yellow spark, charge-up, impact and light-burst effects.
- **Black:** existing lightning sheets darkened at load time. Each sheet is redrawn with a near-black overlay on its own pixels (`dark: true` entries in `js/assets.js`). No new art is drawn. The darkened sheets are Thunderstrike/Thunder splash *w blur*, `Lightning/lightning_strike_001_large_violet`, `lightning_burst_002_large_violet` and `lightning_aura_002_large_blue`.

There are 8 skills: 6 actives and 2 passives. You choose which 4 actives sit on the action bar, and the ultimate has its own 5th button. Skill names are original. Every dash plays the Adventurer's own ATTACK 2 frames, drawn faint for the "flash" look.

| Skill (unlock) | Gameplay | Effect assets |
|---|---|---|
| Flash Draw (1) | 0.12 s stance, then a 0.1 s straight dash-slash. Enemies on the line are cut 0.2 s later. | `Sci-fi/scifi_charge_up_001_large_yellow` (stance), Thunder splash yellow + black, black lightning_burst_002 (trail), `Impacts/directional_impact_004_large_yellow` + Thunder strike yellow/black (cuts) |
| Iai Focus (2, passive) | Stand still for 0.8 s to focus. The next Flash skill always crits and deals +15% damage per rank. | charge-up + `Fantasy Spells/status_sparkling_001_small_yellow` (focus marker), `Sci-fi/scifi_spark_burst_001_large_yellow` (release) |
| Sixfold Flash (3) | 6 chained 0.07 s flashes between nearby enemies, each a cut; a delayed thunder burst on everyone cut | black lightning_aura (start), directional_impact_004, black Thunder splash, yellow/black splash |
| Blink Step (4) | Short evasive flash away from the nearest enemy (or the way you steer); untouchable while moving; black burst damages enemies where you stood | black lightning_burst_002 + black Thunder splash (vanish), Thunder splash (arrive) |
| Thunder Step (5, passive) | Each flash-dash: −0.15 s cooldowns and +1 MP per rank | — |
| Godspeed Rush (6) | 8 chained 0.05 s flashes, then a huge yellow-and-black thunder finisher with a stun | as Sixfold + black lightning_strike_001, Thunder strike, spark burst |
| Thunder Sheath (7) | 0.6 s+ parry stance. A blow that lands deals no damage and triggers a flash counter on the attacker with a guaranteed crit. Missing cuts the cooldown to 3 s. | black lightning_aura + charge-up (stance), spark burst, directional_impact_004 + Thunder strike yellow/black (counter) |
| Thunder Sovereign (10, ultimate) | 0.4 s charge, then a 230 px flash across the field. A column of black and yellow lightning erupts along the whole path, hitting and stunning everything near it. | charge-up, black aura, black lightning_strike_001 + Thunder strike columns, `Magic Bursts/round_light_burst_001_large_yellow` |

**Feel and readability:**
- Hit-stop is subtle: about 0.03–0.06 s on cuts and 0.12 s on the ultimate.
- Skill hits knock enemies back, and screen shake scales with the hit.
- Struck enemies flash bright (their own sprite drawn additively).
- Skill numbers are electric blue, crits are larger and gold, and numbers landing in the same spot stack upward.
- Stunned enemies show a STUN label.

The basic sword attack uses `Impacts/symmetrical_impact_001_small_yellow`, and crits use `symmetrical_impact_006_small_yellow`.

## Enemy, boss and feedback effects

| Event | Asset |
|---|---|
| Enemy spawn | `Smoke Bursts/symmetrical_smoke_burst_001_large_brown` |
| Enemy death (after death anim) | `Smoke Bursts/stylized_skull_smoke_burst_001_small_white` |
| Player hit by melee | `Impacts/symmetrical_impact_002_small_blue` |
| Player hit by arrow / lightning | `Impacts/directional_impact_001_small_blue` |
| Boss telegraph (slam, lunge, bolts) | `Symbols/symbol_alert_001_small_red` |
| Warlord ground slam | `Smoke Bursts/symmetrical_smoke_burst_001_large_brown` + `Explosions/symmetrical_explosion_002_large_orange` |
| Knight lunge impact | `Impacts/directional_impact_002_large_white` |
| Knight lightning (phase 2) | `Lightning/lightning_strike_001_large_violet` |
| Knight block stance | `Symbols/symbol_defense_up_001_small_blue` |
| Heavy hit / boss kill | `Impacts/symmetrical_impact_004_large_yellow` |
| Gold gained | `Magic Bursts/directional_coin_burst_001_small_yellow` |
| Loot / pickup on the ground | `Fantasy Spells/status_sparkling_001_small_yellow` (loop) |
| Pickup collected / mana potion | `Magic Bursts/round_sparkle_burst_001_large_blue` |
| Health potion | `Magic Bursts/round_heart_burst_001_small_red` |
| Level up | `Symbols/symbol_level_up_text_001_small_blue` + `Magic Bursts/round_light_burst_001_large_yellow` |
| Area cleared / victory / defeat | `Symbols/symbol_complete_text_001_small_blue`, `symbol_you_won_text_001_small_green`, `symbol_game_over_text_001_small_red` |
| Area entry | `Sci-fi/scifi_warp_003_large_blue` |
| Breaking crates/pots | `Smoke Bursts/symmetrical_smoke_burst_001_small_brown` |
| Torches | `Pixel fire asset pack…/fire asset {red,blue}/Group 5 - 2`, `fire asset purple/Group 4 - 1` |

## Map tiles (TX Tileset Grass, 16 px grid)

* Grass: rows 0–7 (cols 0–7 plain, cols 8–15 with flowers and pebbles).
* Stone path tiles: rows 8–15 (full and grass-broken variants).
* Stone floor (TX Tileset Stone Ground): plain tiles at rows 10–11 and 14–15 (cols 0–5) and (8–9, 6–7); riveted tiles for variety; 96×96 slabs as floor decals.
* Walls: `TX Tileset Wall` long wall front (31,191,130×66) for the top and bottom edges, thin edge strips for the sides; `TX Struct` wall blocks and arches in the Ruins.
* Props and plants are drawn from the "with Shadow" atlases. Coordinates are in `js/assets.js` (`PROPS`).
