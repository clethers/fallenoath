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

**Not present in the original packs:** audio (two free sound packs were added later, see *Sound effects* below), item/equipment icons, fonts, UI frame art. Gear is therefore shown as text cards with rarity colours. The game has no sound, and Settings says so instead of showing a volume control. Fonts are system fonts.

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
- **Yellow:** Thunder Effect 02 "wo blur" strikes and splashes, plus the yellow spark, charge-up, impact and light-burst effects. The Thunder Effect 02 sheets are pale cream and some Gigapack sheets have white or blue streaks, so these are gold-tinted at load time (`warm` entries: multiply with gold for pale sheets, a luminosity blend for blue ones). Skill icons get the same treatment through CSS filters: gold, or black with a gold rim.
- **Black:** existing lightning sheets darkened at load time. Each sheet is redrawn with a near-black overlay on its own pixels (`dark: true` entries in `js/assets.js`). Each darkened sheet also gets a 1 px yellow outline (a yellow copy stamped one pixel around before the black core is drawn), so black bolts read crisply instead of as flat blobs. No new art is drawn. The darkened sheets are Thunderstrike/Thunder splash *w blur*, `Lightning/lightning_strike_001_large_violet`, `lightning_burst_002_large_violet` and `lightning_aura_002_large_blue`.

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

The basic sword attack uses `Impacts/symmetrical_impact_001_small_yellow` plus a gold-tinted `Impacts/directional_impact_002_small_white` slash fan along the swing; crits use `symmetrical_impact_006_small_yellow` (gold-tinted). Every flash-dash starts with a gold-tinted `Sci-fi/scifi_muzzle_flash_003_large_yellow` burst pointing along the dash, and the dash trail is lighter (a yellow splash every step, a black burst every third). Stunned enemies show the stun aura gold-tinted. To keep big combos readable, only a few copies of each effect play at once (for example 3 spark bursts, 6 black splashes); big moments bypass the cap.

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

## Sound effects

Three free packs are in `Prologue\Audio` (Dev added the two lightning packs; the Hove sword pack was downloaded from its itch.io page with Dev's go-ahead). The game uses MP3 copies stored in `assets/audio/`, keeping each pack's folder name.

| Pack | License | What was done to the files |
|---|---|---|
| Lightning Magic SFX Pack, free version (Hove Audio) | Royalty-free (itch.io listing) | Selected files converted to MP3 and processed for punch: leading silence trimmed, tails shortened to 0.7–1.7 s, a low-end (70 Hz) and presence (3.5 kHz) EQ boost, compression and limiting, and peaks set around −1.5 dB. Strikes also play at a slightly random pitch. The 37 s charge was cut to a 1.3 s clip. |
| Elemental Magic: Lightning Attacks, free pack © 2024 Last Day Dreaming | CC BY-ND 4.0 (credit shown in Settings; the pack PDF is included) | Format conversion to MP3 only. The audio is not edited; it is balanced against the other packs with in-game volume only. |
| Sword Combat Sound Effects Pack, free version (Hove Audio) | Royalty-free (itch.io listing; the author says no credit is needed, credited in Settings anyway) | Two whooshes (`slash_07/26`) and three blade stabs with whoosh (`slashhit_01/11/17`), plus `spawn_poof` (whoosh 26 reversed, pitched down 22%, low-passed at 2.6 kHz): 0.2 s of leading silence trimmed, tails cut to 0.4–0.55 s, light compression, peaks set around −2 dB. Folders named `w:...` were renamed `with ...` for Windows. |

| Game event | Sound |
|---|---|
| Flash Draw stance / Iai Focus ready | LDD `EM_LIGHT_CAST_02_S` |
| Flash-dash start (Flash Draw, Sixfold, Godspeed, ultimate) | LDD `EM_LIGHT_LAUNCH_01` |
| Each cut and chained flash | Hove `strike_08/13/16/21/26` (random), layered with a sword `slashhit` |
| Every sword swing (auto-attack) | Sword `slash_07/26` (random pitch) |
| Sword swing that connects | Sword `slashhit_01/11/17` |
| Flash Draw / ultimate dash, Sheath counter, ultimate blast | Sword `slash` / `slashhit` under the lightning |
| Flash Draw delayed cut, counter, end of ultimate | Hove `strike_full_28`, layered with LDD `EM_LIGHT_IMPACT_01` on the big hits |
| Sixfold burst, Thunder Sheath counter | LDD `EM_LIGHT_IMPACT_01` |
| Godspeed finisher | Hove `combo_28` |
| Thunder Sovereign charge / blast | Hove `charge_short` + LDD `EM_LIGHT_CAST_01_L` / Hove `combo_08` |
| Blink Step | Hove `cast_01` |
| Thunder Sheath stance (loops until hit or timeout) | LDD `EM_LIGHT_HOLD_5s` |
| Knight boss lightning | Hove strikes |
| Enemy spawns | Sword pack whoosh 26 reversed, pitched down and low-passed into a dusty "poof" (`spawn_poof`), started 0.1 s in so its peak lands on the fullest smoke frame (0.33 s); throttled across a wave |
| Boss spawns | Hove `combo_28` (started 0.4 s in) + LDD `EM_LIGHT_IMPACT_01` timed to the smoke peak |
| Hero enters an area | Hove `strike_full_28` cut to 0.55 s (`spawn_crack`, the crack without the rumble tail), timed so it peaks on the warp's brightest frame (0.4 s) |

The mix puts lightning hits on top, blade sounds just under them, and swings, cues and spawns underneath. There are no enemy, UI or music sounds yet. Settings has a sound on/off switch and a volume slider.

## Hero voices

Dev added two free voice packs. You pick one hero voice in **Settings → Hero voice** (Warrior, Protagonist or Off), so two actors are never mixed in one hero. Clips are trimmed of silence and long breath tails, lightly compressed, levelled to the same loudness (about −17 dB RMS, peaks under −2 dB) and converted to mono MP3 in `assets/audio/Warrior Voice Pack/` and `assets/audio/Male protagonist/`.

| Pack | License |
|---|---|
| Warrior Voice Pack (John Carroll) | CC0, per the itch.io listing (reselling the raw clips is not allowed) |
| RPG Male Vocal, "Male protagonist" (Konakuma) | Free to use and edit; credit requested (shown in Settings) |

| Moment | Warrior | Protagonist |
|---|---|---|
| Flash Draw, Sixfold Flash start, about 10% of sword swings that have a target (at most once every 2.6 s) | lightattack1–4, attack1–4 | hiyah 1–3, grunt ra 1–3, kick, punch |
| Godspeed Rush start and finisher | heavyattack1–4 | grunt uoe 1–3, grunt wa, hiyah 4 |
| Thunder Sovereign charge | heavyattack2/4, angry1–2 | hiyah 4, grunt ra 4–5 |
| Thunder Sheath stance | defend1–2 | JP "N" |
| Counter, about 35% of sword crits | crit1–3 | grunt kwa, grunt ra 4, hiyah 2 |
| Blink Step | hup1–3, hut1–2 | jump 1–3 |
| Taking damage (45% chance, at most once every 1.2 s) | hit1–5 | ouch, ow, JP itai 1–2, grunt oof 1–2 |

The same voice line never plays twice in a row.
| Death | death1–2 | pained death 1–2, JP shimatta |

Only one voice line plays at a time, so lines never pile up.

## Shadow Monarch class (kit v2: black & purple shadow, blue telekinesis)

All art except the shadow samurai comes from packs already in the game, recoloured at load time:

| Use | Asset (tint) |
|---|---|
| Hero | Adventurer sheets, multiplied to cold purple-black (`~monarch`) |
| Shadow samurai (ultimate, Shadow Extraction) | **FREE Samurai 2D Pixel Art v1.2** (same artist as the Knight; any game project, commercial or not, no resale as an asset, credit optional; License.txt kept next to the sprites): black core with a 1 px purple rim (`~shadow`) |
| Igris | the Knight sheets, drawn 1.65x (`~shadow`) |
| Shadow Fang beam | one thin tendril cut from `Lightning/lightning_strike_001_large_violet` frames 3 to 5 (`beamPurple`, purple), glowing head `lightning_burst_001`, sparkles `status_sparkling_001` |
| Shadow Fang landing | `Smoke Bursts/symmetrical_smoke_burst_001_large_brown` (dark, purple rim: `shadeBurst`), final cut `directional_impact_002_large_white` (purple) |
| Ruler's Authority | hand glow drawn in code, `status_sparkling_001` (blue: `sparkleBlue`), lift `Impacts/symmetrical_impact_002_large_blue` (`impBlue2`), slam under each mob `symmetrical_impact_004_large_yellow` (dark, blue rim: `impDark4`) |
| Shadow Step | the hero's own frames as afterimages, `looping_smoke_burst_002` (dark, purple rim) |
| Bloodlust | wave `symmetrical_impact_004` (dark, purple rim: `impDarkP`), `shadeBurst`, fear sign `Fantasy Spells/spell_death_001_small_red` (purple: `fearPurple`) |
| Army of Shadows | the Monarch's Domain is drawn in code (dark field, purple rim), `impDarkP`, mist, smoke and sparkles as the samurai rise |

Downloaded or added for previews but **not used in the game**: Hero Knight (Sven Thole) and Tiny Swords (Pixel Frog). Both stay in the Prologue folder.

Sound: Willosuna's **Magic Spells SFX Lite** (royalty-free, no attribution required, use in games allowed, no redistribution as a pack). Ten clips are trimmed, faded and peak-levelled to about −2 dB in `assets/audio/Magic Spells SFX Lite/`: `shadow`, `summon`, `teleport`, `portal`, `debuff`, `timewarp`, `slam`, `blast`, `charge` and `rune`. The pack's LICENSE.txt is kept next to them, and the full pack is in `Prologue\Audio`.

## Enemies: top-down orcs (CraftPix)

The Orc Grunt, the Orc Brute and Grukk the Warlord now use **Free Top-Down Orc Game Character Pixel Art** by CraftPix.net. The license is CraftPix's free-asset license: personal and commercial use are allowed, redistributing the files as assets is not. The pack's combined `_full` sheets are copied to `assets/Top-Down Orcs (CraftPix)/` and renamed. Frames are 64x64, with one row per direction (down, up, left, right). The animations are idle, walk, run, attack, run-attack (heavy and slam), walk-attack, hurt and death.

| Enemy | Orc | Scale |
|---|---|---|
| Orc Grunt | orc1 (green) | 0.95 |
| Orc Brute | orc3 (armoured, dark green) | 1.25 |
| Grukk the Warlord (boss) | orc2 (blue chieftain) | 1.75 |

They face the hero, or away from him while feared. Raised shadow orcs use the same sheets with the shadow tint. The Deserter Archer is still the Tiny RPG Soldier, and Sir Varric is still the Knight. The older Tiny RPG orc sheets are no longer used.

## New enemies and the Graveyard boss

| Enemy | Sprite | Notes |
|---|---|---|
| Lesser Demon | Tiny RPG Character Asset Pack 02: Demon_A (100x100, scale 1.6) | Idle, walk, two attacks, hurt, death. Morvath summons them; they also appear in the Graveyard, the Shrine and the Endless Trial. |
| Kobold Skirmisher | FREE Kobold Warrior 2D Pixel Art (148x96 frames, scale 0.5) | Fast and fragile. Idle, run and attack only, so hurt and death reuse the idle pose and fade out. Appears in the Graveyard, the Ruins and the Endless Trial. |
| **Morvath the Necromancer** (Graveyard boss) | Necromancer by creativekind (160x128, scale 0.85) | Keeps his distance, casts curses (spell_death marks that erupt in skull smoke under the hero) and summons demons (more in phase 2, when kobolds also join). Also part of the Endless Trial boss rotation: knight, warlord, necromancer. |

Licenses: the Kobold Warrior's License.txt allows any game project, commercial included, but not resale as an asset. The Tiny RPG 02 pack is by the same author as the Tiny RPG Soldier/Orc already in use, under the same free terms. The Necromancer's terms are noted above. Raised shadows of demons and kobolds use the shadow tint.

## Shadow Monarch rework: red and blue, blue lightning

All effects are the same packs, recoloured at load with `tint` (multiply for white sheets, luminosity for coloured ones):
- **Red and blue cuts:** `directional_impact_002` small and large white, multiplied red or blue.
- **Blue lightning:** `lightning_strike_001`, `lightning_burst_001/002/003` (luminosity blue), the native `lightning_aura_002_large_blue`, and the Thunder Effect 02 strike in blue.
- **Red explosions:** `symmetrical_explosion_004` multiplied red.
- **Shadow purple to blue:** the portal, souls, skull smoke, mist and the shadow-soldier rim are all blue now.

Afterimage clones use the Adventurer's own frames as `~shadow` silhouettes.
