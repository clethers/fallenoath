# Fallen Oath: world expansion + Emberhold (spec, draft for review)

**Status:** approved 2026-10-26 (open questions answered with the defaults: names and levels as written, the two new enemies, current journal quests move to Maren). Phase 1 built 2026-10-26. Replaces `RIFT_MODE_SPEC.md` (shelved).

**Decided so far:** village + dungeons direction; areas stay one arena with waves (no rooms); World Map as a list grouped by region; 4 regions and about 20 areas; the walkable village comes in the same build; level cap 100 with max skill rank 10 (from the earlier spec, section 7a, kept).

## 1. Premise (no rifts)

The knights of the old keep vanished when their captain, Sir Varric, broke his oath. The broken oath cursed the valley: orcs, the dead and worse now roam it. The player is a wanderer who arrives at **Emberhold**, the last village standing, and pushes outward region by region until they reach the Shrine of the Fallen. The hero is whichever class was picked; the story calls them "the Wanderer".

## 2. The world: 4 regions, 20 areas

Each area is one arena with 3 to 4 waves, like today. Areas unlock in order inside a region. The last area of each region has the region boss and unlocks the next region. Enemy levels follow the area level.

### Emberhold Vale (Lv 1 to 15, Cainos grass)

| # | Area | Lv | Enemies | Ends with |
|---|---|---|---|---|
| 1 | Mossy Courtyard | 1 | Orc grunts, one brute | |
| 2 | Old Mill Road | 3 | Orcs, kobolds | |
| 3 | Thornwood Edge | 6 | Kobolds, archers | Elite: Swift Kobold |
| 4 | Bandit Camp | 9 | Archers, orcs, brutes | |
| 5 | Keep Gate | 12 | Mixed orcs and archers | **Boss: Brute Captain** |

### The Deadlands (Lv 15 to 40, undead tileset)

| # | Area | Lv | Enemies | Ends with |
|---|---|---|---|---|
| 6 | Whispering Graveyard | 15 | Kobolds, archers, demons | |
| 7 | Bone Fields | 20 | Demons, kobolds | Elite: Hulking Demon |
| 8 | Toxic Mire | 25 | Demons, archers | |
| 9 | Hollow of the Bone King | 30 | Demons, cursed samurai (new) | Elite: Swift Cursed Samurai |
| 10 | Morvath's Crypt | 35 | Demons, kobolds | **Boss: Morvath the Necromancer** |

### Sunken Ruins (Lv 40 to 65, Cainos stone + undead rocks)

| # | Area | Lv | Enemies | Ends with |
|---|---|---|---|---|
| 11 | Ruined Causeway | 40 | Orcs, kobolds, archers | |
| 12 | Sunken Halls | 45 | Brutes, archers | Elite: Hulking Brute |
| 13 | Warcamp | 50 | Orcs, brutes, archers | |
| 14 | Collapsed Vault | 55 | Brutes, cursed samurai | Elite: Hulking Brute |
| 15 | Grukk's Throne | 60 | Orc horde | **Boss: Grukk the Warlord** |

### Shrine of the Fallen (Lv 65 to 100, undead tileset, darker)

| # | Area | Lv | Enemies | Ends with |
|---|---|---|---|---|
| 16 | Fallen Approach | 65 | Cursed samurai, demons | |
| 17 | Oathbreaker's Path | 72 | Oathbound knights (new), archers | Elite: Hulking Oathbound Knight |
| 18 | Hall of Broken Vows | 80 | Oathbound knights, cursed samurai | |
| 19 | Shrine of the Fallen | 90 | Mix of all | **Boss: Sir Varric, the Fallen** |
| 20 | Endless Trial | 90+ | Endless waves, boss every 5th | (post-game, as today) |

The **Brute Captain** already exists in the code (made for the shelved rooms). **Elites** reuse the elite system already in the code (Swift / Hulking, with a health bar).

### New enemies (free sprites already in the folder)

| Enemy | Sprite | Notes |
|---|---|---|
| **Cursed Samurai** | FREE Samurai 2D (the same frames as the shadow soldiers, normal colours with a sickly tint) | Fast melee with a dash attack |
| **Oathbound Knight** | FREE Knight 2D (the Igris frames, dark steel tint) | Slow, heavy hits, blocks from the front |

With these, the enemy list goes from 7 to 9, plus the elite versions.

## 3. World Map screen (list by region)

- The hero plate and gold stay at the top.
- First card: **Emberhold** (always open) with a "Go to village" button.
- Then one section per region: region name, level range, progress (e.g. "3 / 5 cleared") and a collapse arrow. Locked regions show as a single greyed bar: "Defeat the Brute Captain to unlock".
- Inside a section, the area cards work as now (thumbnail, description, recommended level, waves, cleared count), plus a "Boss" or "Elite" chip where it applies.
- The section of the newest unlocked region opens by default; the others start collapsed.

## 4. Emberhold (the walkable village)

A small map built from the Cainos tileset (grass, stone paths, houses from the Struct sheet, wells, lanterns, crates). No enemies. Same joystick; the skill buttons are hidden.

| NPC / place | Sprite | What it does |
|---|---|---|
| **Elder Maren** | Adventurer recoloured as a grey-robed elder | Story scenes and the main quest line (the current journal quests move to her) |
| **Bram the Smith** | Knight, no helmet tint | Gear upgrades (+1 to +5, see 6) and selling |
| **Tilly the Merchant** | Tiny RPG Soldier, recoloured | The current shop |
| **Notice Board** | Cainos sign | Repeatable bounties (later phase) |
| **Road out** | The village gate | Opens the World Map |

Walk near an NPC and a "Talk" button appears. The World Map's nav bar (Hero, Bag, Skills, Quests, Settings) stays available in the village.

## 5. Story (light, 4 chapters)

Short dialogue scenes (3 to 8 lines, skippable), with a portrait box at the bottom of the screen.

| When | Scene |
|---|---|
| First visit to Emberhold | Maren explains the vanished knights and the curse |
| Before / after the Brute Captain | The orcs serve someone further in |
| Before / after Morvath | Morvath serves "the one who broke his oath" |
| Before / after Grukk | Grukk holds a shard of Varric's broken oath-seal |
| Before / after Sir Varric | The truth of the oath; the choice: free him or take the oath (2 endings, as decided) |

The Wanderer stays neutral for now (as decided); class lines can come later.

## 6. Progression

- **Level cap 100**, the current XP curve (from the earlier spec 7a, kept).
- **Max skill rank 10**, ranks 6 to 10 unlock at levels 40 / 55 / 70 / 85 / 100 (decided). Storm Blade needs a deliberate re-lock for this.
- **Damage reduction cap** of 50% (Infinity, Anti-Magic Body, Rubber Body).
- **Gear** item level follows the area level, up to 100.
- **Smith upgrades:** +1 to +5 per item, each level adds about 8% of the item's base stats. Costs gold plus materials: Orc Tusks, and a new **Oath Shard** dropped by region bosses and elites.

## 7. Save data

- `areas` keeps working (new areas are added; old saves keep their cleared areas). The 5 existing area ids stay the same, so nothing is lost.
- New: `story.seen`, `story.ending`, `village.visited`, `item.plus` on gear, `materials.oathShard`.
- Old saves: anyone who already cleared an area keeps it, and the regions before it unlock.

## 8. Code plan

| File | Change |
|---|---|
| `js/data.js` | `G.REGIONS`, 15 new areas, the 2 new enemies, `G.NPCS`, `G.SCENES`, `MAX_LEVEL 100`, `SKILL_MAX_RANK 10` with rank unlock levels |
| `js/world.js` | Area variety for the new areas (seeds and theme variants: forest, camp, mire, vault); `G.buildVillage()` |
| `js/game.js` (outside the lock) | Elites inside normal waves; village mode (walk, talk, no combat) |
| `js/story.js` (new) | Dialogue box and scene triggers |
| `js/ui.js` | Region-grouped World Map, village HUD (Talk button), Smith panel |
| `js/state.js` | New save fields, migration, the damage reduction cap, upgrade stats |
| `js/assets.js` | Sprite sheets for the 2 new enemies and the NPCs |

## 9. Build phases

1. **World expansion.** Done (2026-10-26). Regions, the 15 new areas, the 2 new enemies, elites in waves, the region-grouped World Map, level cap 100, skill rank 10 (with the Storm Blade re-lock).
2. **Emberhold.** The walkable village, the NPCs, the shop moved to Tilly, smith upgrades and Oath Shards.
3. **Story.** The dialogue system and the scenes in section 5, plus the ending choice.
4. **UI and HUD rework** (requested), restyling everything above.

## 10. Open questions

1. Area names and level spacing in section 2: OK, or changes?
2. The two new enemies (Cursed Samurai, Oathbound Knight) from the free Samurai and Knight packs: OK? The Hero Knight pack (Sven Thole) in your folder could be a third one.
3. Keep the current journal quests (moved to Maren), or rewrite them around the 4 regions?
