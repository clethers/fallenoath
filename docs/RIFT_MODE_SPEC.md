# The Rift: game mode spec (draft for review)

**Status:** shelved 2026-10-26. Dev dropped the Rift concept and the room-based areas (areas are back to one arena with waves). Direction now: village + dungeons with an expanded world map; a new spec replaces this one. The room engine code (rooms, doors, elites, shrine blessings) stays in game.js unused, so dungeons can reuse it.

## 1. The idea in one paragraph

Heroes from other worlds are being pulled through rifts into the world of the Fallen Oath. The player is one of them (whichever class they picked: Storm Blade, Shadow Monarch, Limitless, Anti-Magic, Rubber Brawler). They wake up in **Emberhold**, the last village standing below a ruined keep. Rifts keep tearing open around the valley, and something on the other side is feeding them. The village is the player's base. Each rift is a short dungeon of connected rooms with a boss at the end. Story rifts move the plot forward. Every cleared rift can be replayed at higher ranks (E, D, C, B, A, S) for better loot.

## 2. What stays and what changes

| Part | Today | After |
|---|---|---|
| Classes, skills, skill trees | 5 classes | Unchanged |
| Levels, stats, gear, bag, shop | As now | Unchanged (shop moves into a village NPC) |
| Combat | One arena, 2 to 4 waves | Same combat, spread over 3 to 5 rooms per rift |
| Area list ("World Map" screen) | Pick an area from a list | Replaced by the village and its **Rift Gate** |
| Story | One-line area descriptions | Dialogue scenes, NPCs, 4 chapters |
| Quests | Generic journal quests | Story quests from NPCs plus a repeatable bounty board |
| Endless Trial | Arena mode | Kept as the **Endless Rift** (S rank, waves, as now) |

## 3. Emberhold (the village base)

A small walkable map built from the Cainos tileset (grass, stone paths, houses from the Struct sheet, props). Portrait size like the current maps (about 18 x 30 tiles). No enemies.

| Place / NPC | Sprite (free, already in the folder) | What it does |
|---|---|---|
| **Elder Maren**, the old keeper | Adventurer, recoloured grey-robed | Story NPC. Gives chapter quests, plays the chapter scenes |
| **Bram the Smith** | Knight (FREE Knight 2D), no helmet tint | Gear upgrades (new, see 7) and selling |
| **Tilly the Merchant** | Tiny RPG Soldier, recoloured | The current shop (potions, gear) |
| **Bounty Board** | Cainos sign prop | Repeatable daily-style quests (kill X in a rift, clear a rift at rank C, and so on) |
| **Rift Gate** | Cainos rune pillars + a code-drawn swirling portal | Opens the rift select panel |
| **Training Dummy** (optional) | Cainos prop | Try skills, see damage numbers |

Movement in the village uses the same joystick. Tapping or walking near an NPC shows a "Talk" button. The HUD skill buttons are hidden in the village.

## 4. Rifts

### 4.1 Rift list

| Rift | Look | Story / rank | Rooms | Enemies | Boss |
|---|---|---|---|---|---|
| **Courtyard Rift** (tutorial) | Cainos grass | Chapter 1 | 3 | Orc grunts, one brute | Brute captain (elite brute) |
| **Graveyard Rift** | Undead tileset | Chapter 2 | 4 | Kobolds, archers, lesser demons | Morvath the Necromancer |
| **Ruins Rift** | Cainos stone + undead rocks | Chapter 3 | 4 | Orcs, brutes, archers, kobolds | Grukk the Warlord |
| **Shrine Rift** | Undead tileset, darker | Chapter 4 | 5 | Mix of all, demons and archers | Sir Varric, the Fallen |
| **Endless Rift** | Cainos stone arena | Unlocked after chapter 4 | 1 (waves) | As the Endless Trial today | Every 5th wave |

### 4.2 Rooms

Each rift is a straight chain of rooms (no branching in the first build). Each room is its own small map, about 18 x 22 tiles, built by `G.buildArea` with a room template. A door at the top leads to the next room. The door stays sealed until the room's goal is done.

| Room type | Goal to open the door | Notes |
|---|---|---|
| **Fight** | Defeat all enemies (1 or 2 waves) | The common room |
| **Elite** | Defeat the elite | One stronger enemy with a modifier (fast, shielded, or splits) plus a few minions. Drops the **boss key** |
| **Treasure** | None | A chest and breakables; a short breather. Sometimes guarded |
| **Shrine** | None | Pick 1 of 3 small buffs for the rest of this rift (e.g. +15% damage, heal 30%, +1 potion) |
| **Boss** | Defeat the boss | Dialogue before and after. The reward chest appears after |

Room order per rift is fixed for story runs (written in data), for example Graveyard: Fight, Fight, Elite, Boss. Ranked replays shuffle the middle rooms and can add a Treasure or Shrine room.

### 4.3 Room transitions

Walking into the open door fades the screen to black (0.3 s), builds the next room, places the hero at the bottom, and fades back in. HP, MP, cooldowns and buffs carry over. Potions are shared across the whole rift.

### 4.4 Ranks (replay)

Clearing a story rift unlocks it at rank E. Clearing rank N unlocks the next rank.

| Rank | Enemy level | Enemy HP / damage | Loot |
|---|---|---|---|
| E | Area level | x1.0 | Common to rare |
| D | +2 | x1.3 | Better rare chance |
| C | +4 | x1.7 | Epic possible |
| B | +6 | x2.2 | More epic |
| A | +8 | x2.8 | Legendary possible |
| S | +10 | x3.5 | Best legendary chance |

Each rift remembers its best rank and best clear time. Stars stay out of the first build.

## 5. Story (4 chapters)

Tone: short lines, a little humour, no long text walls. Each scene is 3 to 8 lines and can be skipped. The player hero is called "the Wanderer"; class-specific lines are a later extra.

**Prologue (first launch, after class select).** The Wanderer falls out of a rift into Emberhold's square. Elder Maren: the rifts started when the knights of the keep vanished. Things come through them. "You came through one too, so you can go back in."

**Chapter 1: The Courtyard Rift.** A rift opens in the old keep's courtyard and orc raiders pour out. Clear it. After the brute captain falls, Maren notices the rift closed when its "anchor" died. Every rift has an anchor.

**Chapter 2: The Graveyard Rift.** The graveyard rift is full of the dead. Its anchor is **Morvath**, a necromancer who is raising them on purpose. Defeated, he laughs: he only serves "the one who broke his oath", and the rifts are the oath's wound bleeding open.

**Chapter 3: The Ruins Rift.** **Grukk the Warlord** has a shard of the broken oath-seal and uses it to hold the biggest rift open. Taking the shard gives the Wanderer a way into the sealed shrine. Bram the Smith recognises the seal: it belonged to Sir Varric, captain of the keep.

**Chapter 4: The Shrine Rift.** Sir Varric swore to guard the keep; to save his own life he broke the oath, and the broken oath tore the world open. He is the anchor of every rift. After the fight, the player chooses:
- **Free him:** he fades in peace and the rifts begin to close. Ending A.
- **Take the oath:** the Wanderer swears it in his place and becomes the new guardian. Ending B (unlocks a cosmetic title).

Both endings unlock the Endless Rift and ranked replays for all rifts.

## 6. Dialogue system

- A box at the bottom of the screen with the speaker's name and a portrait (the speaker's idle sprite frame drawn at 2x, cropped to the head and shoulders).
- Tap to show the next line; a Skip button ends the scene.
- Scenes are data: `G.SCENES = { ch2_intro: [ { who: 'maren', text: '...' }, ... ] }`.
- Triggers: entering the village after a chapter, talking to an NPC, entering a boss room, a boss dying, the ending choice (a two-button line).
- Seen scenes are stored in the save, so replays skip them automatically.

## 7. Progression additions

- **Smith upgrades:** spend gold and materials (Orc Tusks, new **Rift Shards** from bosses) to raise an item's level by +1 (max +5). Each level adds about 8% of its base stats. Simple and uses the existing gear.
- **Rift Shards:** a new material dropped by rift bosses and elites; more at higher ranks.
- **Bounty Board:** 3 bounties at a time, refreshed after each completed one (no real-time daily timer in the first build).

## 7a. Level cap 100

The cap goes from 30 to **100**. Levels 1 to 30 work exactly as now, so existing saves are unaffected.

**XP curve.** Keep the current formula (`40 x L^1.6 + 20`). Enemy XP already grows 22% per enemy level, so as long as the player fights enemies near their own level, a level takes roughly:

| Level | XP to next | About how many kills |
|---|---|---|
| 10 | 1,600 | 25 |
| 30 | 9,300 | 57 |
| 50 | 20,900 | 81 |
| 70 | 35,800 | 101 |
| 90 | 53,600 | 118 |
| 99 | 62,400 | 126 |

Pacing target: about level 25 to 30 by the end of the story, then 30 to 100 through ranked rifts and the Endless Rift.

**Enemy levels must reach 100.** Ranks change from "area level + N" to fixed level bands, and every rift scales into the band:

| Rank | Enemy level | Unlocks at player level |
|---|---|---|
| E | 10 to 20 | Story clear |
| D | 20 to 35 | 20 |
| C | 35 to 50 | 35 |
| B | 50 to 65 | 50 |
| A | 65 to 80 | 65 |
| S | 80 to 100 | 80 |

The Endless Rift starts at the player's level and keeps climbing past 100.

**Gear.** Item level follows enemy level (up to 100), so stats keep growing. Smith upgrades (+1 to +5) stay on top.

**Attribute points.** 3 per level as now (297 at level 100). Crit stays capped at 75% and attack speed at 3x, so very high AGI stops paying off; that is fine.

**Skill points: decided, option A (2026-10-26).** Max skill rank goes from 5 to **10**.
- Ranks 6 to 10 unlock at player levels 40, 55, 70, 85 and 100 (rank 6 at 40, rank 7 at 55, and so on). Each rank still costs 1 skill point.
- 8 skills x rank 10 = 80 points. A level 100 hero earns 99, so there is slack to cover every skill fully.
- Each rank above 5 keeps adding the skill's existing per-rank bonus (`perRank`, and the per-rank values of passives).
- Storm Blade's skill numbers are locked, so this change is a deliberate re-lock: update `classes/storm-blade/SPEC.md`, then run `node tools/check-class-lock.js --update`.
- Values that would break past rank 5 get their own caps (for example damage reduction from Infinity, Anti-Magic Body and Rubber Body stays at or below 50%).

## 8. Save data changes

Added to the profile (old saves migrate cleanly: chapter progress is derived from which areas were already cleared):

```
story: { chapter: 1, seen: { sceneId: true }, ending: null },
rifts: { graveyard: { unlocked: true, bestRank: 'E', bestTime: 0 } },
upgrades: handled on the item itself (item.plus = 0..5),
bounties: [ { id, progress, done } ],
```

`areas` and `bestWave` stay for compatibility.

## 9. Code plan

| File | Change |
|---|---|
| `js/data.js` | `G.RIFTS` (rooms per rift, enemies per room), `G.NPCS`, `G.SCENES`, `G.BOUNTIES`, rank table |
| `js/world.js` | `G.buildRoom(rift, roomIndex, roomType)` with room templates and a top door; `G.buildVillage()` for Emberhold |
| `js/game.js` (outside the lock) | Run flow becomes room-based: room goal, door unlock, room transition, rift finish. Village mode (no combat, NPC talk). The wave code is reused inside Fight rooms |
| `js/story.js` (new) | Dialogue box, scene triggers, ending choice |
| `js/ui.js` | Rift Gate panel (rift list, rank picker), Smith panel, Bounty board, village HUD, dialogue box styles |
| `js/state.js` | New save fields and migration |

Storm Blade's locked block is not touched. Class files are not touched.

## 10. Build phases

1. **Rooms and doors.** Done (2026-10-26). Rifts made of rooms with door transitions, using the current areas as rifts. Playable with the current menu (the area list starts a rift instead of an arena). The courtyard boss is the new Brute Captain; elites are Swift (fast) or Hulking (tough).
2. **Emberhold.** The walkable village with NPCs, the Rift Gate panel and the shop moved to the merchant. The area list goes away.
3. **Story.** Dialogue system, the prologue and the 4 chapters, the ending choice.
4. **Replay and progression.** Level cap 100, ranks E to S with level bands, Rift Shards, smith upgrades, the bounty board, the Endless Rift.
5. **UI and HUD rework.** Requested for after the mode is in. Scope to be agreed separately (in-run HUD, menus, village HUD, the Rift Gate and dialogue styling). Phases 1 to 4 keep their UI simple so this pass can restyle it without rework.

Each phase ends with a playable build, tests, and a sync to Game and ideal-tribble.

## 11. Decisions (2026-10-26)

1. **Names:** Emberhold, Elder Maren, Bram the Smith, Tilly the Merchant. Kept.
2. **Rooms per rift:** 3 / 4 / 4 / 5 for the story rifts (about 3 to 6 minutes each). Ranked replays can add one extra Treasure or Shrine room.
3. **Shrine rooms:** one Shrine room in every story rift from chapter 2 on, placed just before the boss. Ranked replays can have 1 or 2.
4. **Endings:** two endings (free Varric / take the oath); both unlock the same post-game.
5. **Class story lines:** the Wanderer stays neutral for now. Later, one personal line per class at the prologue, the first boss and the ending.
6. **Skill points after level 40:** option A, max skill rank 10 (see 7a).
