# Shadow Monarch: class spec (v1, not locked yet)

**Status:** first build, 2026-10-24. This class is not locked. When it is approved, lock it the same way as Storm Blade: add `classes/shadow-monarch/lock.json` and wrap `js/class-shadow.js` in `LOCKED` markers.

## Identity

| | |
|---|---|
| Fantasy | Shadow Monarch, inspired by Sung Jinwoo (Solo Leveling). He kills with twin daggers, raises the fallen as a shadow army, and rules the field with telekinesis and killing intent. Skill names follow his best-known abilities. |
| Path id / name | `shadow` / Shadow Monarch |
| Element | Purple & Black Shadow (path colour `#a77bff`) |
| Hero sprite | Adventurer, darkened to cold purple-black at load (`heroTint: 'monarch'`) |
| Shadow soldiers | The Orc, Orc Brute, Soldier and Knight sheets, redrawn at load as black silhouettes with a purple rim (`~shadow` sheets). Igris is the Knight. |
| Colour rule | Purple and black only. Gigapack sheets are purple-tinted at load (`warm: 'void'`), and dark sheets get a purple rim (`dark: true, rim`). No new art. |
| Code | `js/class-shadow.js`, registered as `G.game.classSkills.shadow`. It never edits the locked Storm Blade block. |

## Skills (8: 6 actives, 2 passives, max rank 5)

| Skill | Unlock | Kind | Requires | MP | CD | Core numbers |
|---|---|---|---|---|---|---|
| Dagger Rush | 1 | active | none | 10 | 3 s | 22 px lunge, then 4 cuts 0.07 s apart in front (reach 34), ×0.7 each (+0.12/rank) |
| Monarch's Domain | 2 | passive | Dagger Rush | none | none | shadows within 140 px of you deal +12% damage per rank; summons last +3 s per rank |
| Arise | 3 | active | Dagger Rush | 20 | 8 s | raises fallen enemies within 150 px. Each soul lasts 8 s (purple marker). Raises 2/2/3/3/4 by rank, army cap 6. Soldiers last 18 s and hit for ×0.45 (+0.07) of skill power. No souls means no cost. |
| Shadow Exchange | 4 | active | Monarch's Domain | 8 | 5 s (−0.5/rank, min 2) | swap places with the shadow closest to the enemy, or blink 90 px. ×0.8 (+0.15) burst at the landing spot, radius 34. 0.35 s untouchable. |
| Advanced Dagger Arts | 5 | passive | Arise | none | none | basic attacks: +8% damage and +5% attack speed per rank |
| Ruler's Authority | 6 | active | Advanced Dagger Arts | 24 | 11 s | grabs non-boss enemies within 75 px of the target, lifts and pulls them in for 0.7 s, then slams: ×2.2 (+0.3) in radius 48, stun 1 s |
| Bloodlust | 7 | active | Shadow Exchange | 15 | 14 s | radius 120: non-bosses are feared (flee, no attacks) for 2 s (+0.25/rank), and everyone takes +30% damage for 5 s |
| Army of Shadows (ultimate) | 10 | active, ult | Ruler's Authority | 60 | 45 s | Igris (Knight, cleaves ×1.6) plus 4 elite shadows (orc, brute, orc, archer) for 15 s (+2/rank). Every existing shadow is restored. They don't count toward the army cap; the total cap is 12. |

The tree uses the same slot layout as Storm Blade (a0, p0, a1, b0, p1, b1, a2, a3).

## Shadow soldiers

- **Behaviour:**
  - They chase the nearest enemy near the hero and attack with their own attack frames.
  - With no enemy nearby, they circle the hero.
  - They have a lifetime instead of HP; enemies keep targeting the hero.
  - They flicker in their last 1.5 s, then vanish in dark smoke.
- **Igris:** cleaves everything in front of him.

## Sound

The spell sounds are from Willosuna's Magic Spells SFX Lite: royalty-free, no attribution required, and allowed for use in games but not for redistribution as a pack. The game ships only 10 trimmed clips; the full pack stays in `Prologue\Audio`.

| Moment | Sound |
|---|---|
| Dagger Rush | `blast` + sword `slash` ×4 + `slashhit` |
| Arise | `summon` + `shadow` |
| Shadow Exchange | `teleport` |
| Ruler's Authority | `timewarp` (lift), then `slam` + `blast` + LDD impact |
| Bloodlust | `debuff` + `shadow` |
| Army of Shadows | `charge`, then `portal` + `summon` + Hove `combo_28` |
| Shadow soldier hits | sword `slashhit` (quiet) |
| Hero enters an area | `portal`, timed to the purple portal (the Storm Blade crack is not used) |

Voices use the same actor setting. Dagger Rush uses light, Arise and Ruler's Authority use heavy, Shadow Exchange uses dodge, Bloodlust uses stance and the ultimate uses ult.
