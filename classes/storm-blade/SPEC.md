# Storm Blade: locked class spec (v1)

**Status:** locked on 2026-10-24. This is the reference class. Build the next class next to it without changing it.

**Lock check:** `node tools/check-class-lock.js` should print `OK  Storm Blade`. It compares the class data, the skill code between the `LOCKED` markers in `js/game.js`, and the hash of every asset file the class uses against `classes/storm-blade/lock.json`. If a change to this class is ever intended, make it on purpose, update this spec, then re-lock with `node tools/check-class-lock.js --update`.

## Identity

| | |
|---|---|
| Fantasy | Lightning samurai. A flash swordsman (Zenitsu-style iai): draw, vanish in a streak of yellow and black lightning, and enemies fall a beat later. |
| Path id / name | `storm` / Storm Blade |
| Element | Black & Yellow Lightning (path colour `#f2cf4a`) |
| Hero sprite | Adventurer. Dashes play its own attack frames, drawn faint for the flash look. |
| Combat style | Auto-attack sword swings, plus 4 bar skills and an ultimate (5th button) |
| Colour rule | Only yellow and black lightning. Yellow is Thunder Effect 02 plus yellow Gigapack sheets, gold-tinted at load (`warm`). Black is the same sheets darkened at load (`dark`), with a 1 px yellow outline. Icons use CSS tones `gold` and `dark`. No new art. |

## Skills (8: 6 actives, 2 passives, max rank 5)

| Skill | Unlock | Kind | Requires | MP | CD | Core numbers |
|---|---|---|---|---|---|---|
| Flash Draw | 1 | active | none | 12 | 3.5 s | stance 0.12 s, dash 110 px in 0.1 s, cut 0.2 s later, ×2.0 (+0.3/rank), width 18 |
| Iai Focus | 2 | passive | Flash Draw | none | none | stand still 0.8 s, then the next Flash skill always crits, +15% damage per rank |
| Sixfold Flash | 3 | active | Flash Draw | 22 | 9 s | 6 flashes, 0.07 s each, radius 130, ×0.9 (+0.12), delayed burst on everyone cut |
| Blink Step | 4 | active | Iai Focus | 8 | 4 s (−0.4/rank, min 1.5) | 75 px evasive flash in 0.08 s, untouchable, ×0.6 (+0.15) burst in radius 30 where you stood |
| Thunder Step | 5 | passive | Sixfold Flash | none | none | each flash-dash: −0.15 s on all cooldowns and +1 MP, per rank |
| Godspeed Rush | 6 | active | Thunder Step | 32 | 13 s | 8 flashes, 0.05 s each, radius 150, ×1.0 (+0.15), finisher ×2.4 in radius 40, stun 1.2 s |
| Thunder Sheath | 7 | active | Blink Step | 15 | 10 s (3 s on a miss) | parry window 0.6 s (+0.1/rank). A blow that lands deals no damage and triggers a flash counter, guaranteed crit, ×2.6 (+0.35), range 150 |
| Thunder Sovereign (ultimate) | 10 | active, ult | Godspeed Rush | 60 | 40 s | windup 0.4 s, 230 px flash in 0.18 s, lightning column along the path ×4.2 (+0.5), width 40, stun 1.5 s |

**Tree layout (positions in %):**

| Node | Skill | Position |
|---|---|---|
| a0 | Flash Draw | 50,7 |
| p0 | Iai Focus | 18,29 |
| a1 | Sixfold Flash | 82,29 |
| b0 | Blink Step | 18,51 |
| p1 | Thunder Step | 82,51 |
| b1 | Thunder Sheath | 18,73 |
| a2 | Godspeed Rush | 82,73 |
| a3 | Sovereign | 50,93 |

- Passives are diamonds.
- The ultimate always sits on slot 5 (`ULT_SLOT = 4`).
- A new profile starts with Flash Draw on slot 1.
- The GM account has everything maxed.

## Feel

- **Hit-stop:** 0.03–0.06 s on cuts, 0.08–0.1 s on counter and finisher, 0.12 s on the ultimate.
- **Impact:** knockback and screen shake scale with the hit. Struck enemies flash (their own sprite drawn additively). Skill numbers are electric blue; crits are gold and larger.
- **Flash-dash:**
  - It starts with a gold muzzle-flash burst pointing along the dash.
  - The trail is a yellow splash every 18 px, with a black burst every third step.
- **Effect caps:** at most this many copies play at once: sparkBurst 3, black splash 6, yellow splash 7, black burst 4, slashGold 4, flashKick 2, hit 3, slashArc 2. Big moments are exempt.
- **Basic attack:**
  - Auto-attack only, with no ATK button. It swings at enemies within 36 px, or at crates and pots within 24 px when standing still, and stops while steering away.
  - Each hit shows a hit spark plus a gold slash fan along the swing.

## Sound (mix: lightning on top, blades under, cues and spawns underneath)

| Moment | Sound |
|---|---|
| Every swing | sword `slash_07/26` |
| Swing connects | sword `slashhit_01/11/17` |
| Flash Draw stance / Iai Focus ready | LDD `EM_LIGHT_CAST_02_S` |
| Dash start | LDD `EM_LIGHT_LAUNCH_01` (+ sword slash on Flash Draw and the ultimate) |
| Each flash cut | Hove `strike_*` + sword `slashhit` |
| Big cuts (Flash Draw, counter, end of ultimate) | Hove `strike_full_28` + LDD `EM_LIGHT_IMPACT_01` + sword `slashhit` |
| Sixfold burst | LDD `EM_LIGHT_IMPACT_01` |
| Godspeed finisher | Hove `combo_28` + impact |
| Ultimate charge / blast | Hove `charge_short` + LDD `EM_LIGHT_CAST_01_L` / Hove `combo_08` |
| Blink Step | Hove `cast_01` |
| Sheath stance (loop) | LDD `EM_LIGHT_HOLD_5s` |
| Hero enters an area | `spawn_crack` (strike_full_28 cut to 0.55 s), peaking on the warp's brightest frame (0.4 s) |
| Enemy spawns | `spawn_poof` (reversed sword whoosh), peaking on the smoke peak (0.33 s) |
| Boss spawns | `combo_28` (from 0.4 s) + impact on the smoke peak |

## Voices

- You pick one actor in Settings (Warrior or Protagonist), and the two are never mixed. Voices play at 60% of the effects volume.
- All lines are levelled to the same loudness, and the same line never plays twice in a row.

| Moment | When |
|---|---|
| light | Flash Draw and Sixfold start; 10% of connecting swings, at most once every 2.6 s |
| heavy | Godspeed start and finisher |
| ult | Sovereign charge |
| stance | Thunder Sheath |
| crit | counter; 35% of sword crits |
| dodge | Blink Step |
| hurt | 45% of hits taken, at most once every 1.2 s |
| death | on death |

## Where the class lives

| Part | File |
|---|---|
| Path, skills, tree layout | `js/data.js` (`G.PATHS.storm`, `G.SKILLS`, `G.TREE_LAYOUT`) |
| Skill code | `js/game.js`, between `// ==== LOCKED: Storm Blade class v1` and `// ==== END LOCKED` |
| Effects (incl. `dark`/`warm` tinting) | `js/assets.js` (`FX`) |
| Sounds and voices | `js/audio.js` (`G.SFX`, `G.VOICES`); files in `assets/audio/` |

## Building the next class without touching this one

- Add a new entry to `G.PATHS` and new skill ids in `G.SKILLS`. Don't reuse or edit the Storm Blade ids.
- Put new skill code in its own section with its own `LOCKED` markers once it is finished, rather than inside the Storm Blade block.
- New effects and sounds get new keys. The keys this class uses (listed in `lock.json`) must keep their files and settings.
- Run `node tools/check-class-lock.js` before every push.
