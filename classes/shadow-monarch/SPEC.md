# Shadow Monarch: class spec (kit v2, not locked yet)

**Status:** kit v2 built on 2026-10-25, after a preview of every skill. It is not locked. Once it is approved, lock it the same way as Storm Blade: add `classes/shadow-monarch/lock.json` and wrap `js/class-shadow.js` in `LOCKED` markers.

## Identity

| | |
|---|---|
| Fantasy | Shadow Monarch, inspired by Sung Jinwoo (Solo Leveling): a shadow assassin who rules the dead. |
| Path id / name | `shadow` / Shadow Monarch |
| Element | Black & Purple Shadow (path colour `#a77bff`). Ruler's Authority is blue. |
| Hero sprite | Adventurer, darkened to a cold purple-black at load (`heroTint: 'monarch'`). |
| Shadow soldiers | FREE Samurai 2D (shadow samurai) and the Knight (Igris), redrawn at load as black silhouettes with a purple rim (`~shadow` sheets). |
| Colour rule | Black shadows with a purple rim, purple lightning. Ruler's Authority uses blue. Effects are Gigapack and Thunder Effect sheets recoloured at load; the domain and the hand glow are drawn in code. |

## Where the code lives

- **Class code:** `js/class-shadow.js`, registered as `G.game.classSkills.shadow`. It never edits the locked Storm Blade block.
- **Hooks in `js/game.js`:** two small changes, both outside the lock.
  - A `slow` enemy status, used by the domain.
  - The hero fades while `pl.shSink` is set, used by Shadow Fang.

## Skills (8: 5 actives, 3 passives, max rank 5)

| Slot | Skill | Unlock | Kind | Requires | MP | CD |
|---|---|---|---|---|---|---|
| a0 | Shadow Fang | 1 | active | none | 12 | 4 s |
| p0 | Stealth | 2 | passive | Shadow Fang | none | none |
| a1 | Ruler's Authority | 3 | active | Shadow Fang | 18 | 7 s |
| b0 | Shadow Step | 4 | active | Stealth | 8 | 4 s (−0.4/rank, min 1.5) |
| p1 | Quicksilver | 5 | passive | Ruler's Authority | none | none |
| a2 | Shadow Extraction | 6 | passive | Quicksilver | none | none |
| b1 | Bloodlust | 7 | active | Shadow Step | 15 | 14 s |
| a3 | Army of Shadows (ultimate) | 10 | active, ult | Shadow Extraction | 60 | 45 s |

**Shadow Fang**
- A purple lightning beam leaps from the hero through up to 4 enemies. Each next enemy must be within 95 px. Each hop deals ×0.5.
- The hero then sinks into a shadow pool. A black smoke ring is already opening behind the last target.
- He flashes along a beam to just behind the last target and finishes with a cut: ×1.4, +0.2/rank.

**Stealth**
- Go 2 s without attacking or casting and the hero fades out.
- His next hit always crits and deals +20% per rank.

**Ruler's Authority**
- The hero's hand glows blue.
- Up to 5 enemies within 140 px are seized, with a blue ring around each. Rank adds 1 target every 2 ranks.
- They are lifted 34 px, then slammed down: a black shockwave with a blue edge appears on the ground under each one.
- The slam deals ×1.6 (+0.2/rank) and stuns for 1 s (+0.15/rank).
- Bosses are not lifted; they only take the slam.

**Shadow Step**
- A 75 px flash away from the nearest enemy in 0.08 s. The joystick steers it.
- The hero is untouchable during the flash, with afterimages along the path.
- The shadow he leaves behind bursts for ×0.6 (+0.15/rank) within 30 px. The burst is damage only, with no visual effect.

**Quicksilver**
- Per rank: +5% move speed, +8% basic attack damage and +4% swing speed.

**Shadow Extraction**
- A defeated non-boss enemy has a 10% chance (+5%/rank) to rise as a shadow samurai.
- The samurai fights for 10 s and deals ×0.4 (+0.06/rank).
- Up to 3 can be out at once.

**Bloodlust**
- Dark mist gathers at the hero's feet.
- A black wave with a purple edge then bursts out to 180 px, and the screen darkens around the hero.
- Each enemy the wave reaches shivers and takes +30% damage for 5 s.
- Non-bosses are also feared for 2 s (+0.25/rank), with a purple death sign overhead.

**Army of Shadows (ultimate)**
- The Monarch's Domain opens for 8 s: a dark field 125 px across with a pulsing purple rim.
  - Enemies inside are slowed 30% and take +20% damage.
  - Shadows inside deal +30%.
- Four shadow samurai rise around the hero.
- Igris (the Knight) arrives last with a shockwave. He cleaves everything in front of him for ×1.6.
- The shadows last 15 s (+2/rank), and any shadows already out are restored to full time.

**Old saves:** saves from the first kit get back every point spent on the removed skills (Multistrike, Arise, Dagger Rush, Death's Dance).

## Shadow soldiers

- **Fighting:** they chase the nearest enemy near the hero and attack with their own attack frames. With no enemy nearby, they circle the hero.
- **Lifetime:** they have a lifetime instead of HP. They flicker in their last 1.5 s, then vanish in dark smoke.
- **Igris:** he cleaves everything in front of him.

## Sound

| Moment | Sound |
|---|---|
| Shadow Fang | `whoosh`, `strike` per hop, `teleport` (sink), `launch` (dash), `strikeBig` + `slashHit` (cut) |
| Ruler's Authority | `timewarp` (lift), `whoosh`, `slam` + `blast` |
| Shadow Step | `whoosh` + `teleport`, then `blast` when the shadow bursts |
| Bloodlust | `charge`, then `debuff` + `shadow` |
| Army of Shadows | `charge`, `portal` + `shadow` (domain), `summon` per samurai, `slam` + `finisher` (Igris) |
| Hero enters an area | `portal` |

The spell sounds are from Willosuna's Magic Spells SFX Lite. They are royalty-free, need no attribution, and may be used in games but not redistributed as a pack.

## Voices

| Skill | Voice |
|---|---|
| Shadow Fang | light; heavy on the finishing cut (50% chance) |
| Ruler's Authority | heavy |
| Shadow Step | dodge |
| Bloodlust | stance |
| Army of Shadows | ult |
