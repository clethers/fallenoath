# Fallen Oath: rewards and retention (spec, draft for review)

**Status:** draft, 2026-10-26. Design only, nothing built.

**Goal:** give the player a reason to come back every day, a reason to play one more run, and long goals to chase across all 5 heroes, without punishing anyone for missing a day.

**Ground rules**
- The game is offline (saves in the browser), so every timer uses the device clock. Nothing here needs a server.
- No penalties: a missed day pauses progress, it never resets it.
- No paid currency, no ads. Everything is earned by playing.
- Every reward is something the game already uses (gold, potions, gear, Oath Shards) or a cosmetic, so nothing new has to be balanced from scratch.

## 1. What the player earns, at every time scale

| Time scale | What keeps them going | Section |
|---|---|---|
| Every run (2 to 5 min) | Loot, XP, a chance of stars, progress on daily quests and achievements | 3, 4, 5 |
| Every session | Daily quest chests, first-clear bonuses, hero mastery levels | 4, 7 |
| Every day | Daily login gift, 3 daily quests, the camp's stored supplies | 2, 4, 8 |
| Every week | Weekly quests and the weekly chest, the Endless Trial weekly best | 4, 9 |
| Long term | Achievements and titles, 3 stars on every area, hero mastery to 20 on all 5 heroes, level 100, rank 10 skills | 5, 6, 7 |

## 2. Daily login gift (7-day calendar)

A 7-day calendar opens the first time the game is started each day. Claiming moves to the next day. **Missing a day does not reset it**; the calendar just waits. After day 7 it starts again from day 1.

| Day | Gift |
|---|---|
| 1 | 200 gold × player level ÷ 10 (at least 200) |
| 2 | 3 Health Potions + 3 Mana Potions |
| 3 | 2 Oath Shards |
| 4 | A rare gear chest (one rare item at the player's level) |
| 5 | 500 gold × level ÷ 10 (at least 500) |
| 6 | 4 Oath Shards |
| 7 | An epic gear chest (one epic item, 10% chance of legendary instead) |

## 3. Area stars

Every area (not the Endless Trial) can earn up to 3 stars. The best result is kept.

| Star | How |
|---|---|
| 1 | Clear the area |
| 2 | Clear it with more than half your HP left at the end |
| 3 | Clear it under the area's par time (about 2 minutes, set per area) |

- Stars show on the area cards and in each region header ("11 / 15 stars").
- **Region star chests** at 5, 10 and 15 stars in each region: gold and potions at 5, Oath Shards at 10, an epic item at 15.
- **First clear** of any area gives double gold from its reward chest.

## 4. Daily and weekly quests

The current journal quests stay as the main story line. These are separate, repeatable quests on a "Daily" tab (and later on the notice board in Emberhold).

**Daily quests:** 3 per day, picked at random from a pool and scaled to the player's progress. Each gives **activity points**.

| Example daily quest | Points |
|---|---|
| Defeat 40 enemies | 20 |
| Clear 3 areas | 20 |
| Defeat an elite | 20 |
| Use your ultimate 5 times | 15 |
| Break 15 crates, barrels or pots | 15 |
| Earn a 3-star clear | 25 |
| Play 2 different heroes | 20 |

**Activity chests** fill as points come in (the bar resets each day): 20 points (gold), 40 (potions), 60 (2 Oath Shards). Doing all 3 dailies always fills the bar.

**Weekly quests:** 3 per week (bigger versions: "Defeat 3 bosses", "Clear 20 areas", "Reach wave 15 in the Endless Trial"). Finishing all 3 opens the **weekly chest**: an epic item with a 25% legendary chance, plus 6 Oath Shards.

Quests reset at local midnight (daily) and Monday midnight (weekly). Unfinished quests simply roll over to new ones; nothing is lost.

## 5. Achievements and titles

Lifetime goals, in tiers (bronze, silver, gold). Each tier gives a one-time reward; the gold tier also unlocks a **title** shown under the hero name on the World Map and the hero screen.

| Achievement | Bronze / Silver / Gold | Gold title |
|---|---|---|
| Monster Hunter: defeat enemies | 500 / 5,000 / 25,000 | "the Relentless" |
| Boss Slayer: defeat bosses | 5 / 25 / 100 | "Oathbreaker's Bane" |
| Elite Hunter: defeat elites | 10 / 50 / 200 | "Elite Hunter" |
| Cartographer: clear every area | Vale / 2 regions / all 20 | "Wanderer of the Valley" |
| Perfectionist: 3-star areas | 5 / 10 / 19 (all) | "Flawless" |
| Endless: best wave in the Trial | 10 / 25 / 50 | "Undying" |
| Collector: find items by rarity | 10 rare / 10 epic / 5 legendary | "Treasure Seeker" |
| Smith's Friend: upgrade gear | 10 upgrades / an item to +3 / an item to +5 | "Master-forged" |
| One of Many: reach mastery 10 with heroes | 1 / 3 / all 5 | "Many Heroes" |
| Seasoned: reach player level | 30 / 60 / 100 | "Legend" |

Bronze rewards are gold, silver are Oath Shards, gold are an epic item plus the title.

## 6. Collection log

A simple list on the hero screen: every enemy type defeated (with a count) and every item base found at each rarity. Filling a row (all rarities of one base, or 100 kills of one enemy) gives a small permanent bonus: +1% gold found per completed row, capped at +15%.

## 7. Hero mastery (per hero)

Each of the 5 heroes has its own **mastery level (1 to 20)**, earned by playing that hero (mastery XP = 10% of the XP the hero earns, plus a bonus for clears). This rewards trying every hero, not just one.

| Mastery level | Reward |
|---|---|
| 2, 4, 6, 8 | Gold and potions |
| 5 | A hero title (e.g. "Thunder Breathing", "Shadow Monarch", "the Honoured One", "Anti-Magic", "Future Pirate King") |
| 10 | **Alternate colour** for the hero (a second tint of the same sprite, picked on the hero screen) |
| 15 | A legendary weapon named for the hero |
| 20 | A second alternate colour and a gold frame on the class card |

Mastery is cosmetic and reward-only: it never changes skill power, so heroes stay balanced against each other.

## 8. Camp supplies (idle reward)

While the player is away, the camp in Emberhold gathers supplies: gold and XP worth about 2 minutes of play per hour away, up to **8 hours**. The player collects it on their next visit (a "Camp" button with a badge). It makes coming back once or twice a day worthwhile, without making play optional.

## 9. Endless Trial records

- The best wave is kept all-time (as now) and also **per week**.
- Weekly milestones: reaching wave 10 / 20 / 30 in a week gives gold, Oath Shards, then an epic item. They reset each Monday.

## 10. Loot safety nets (pity)

So bad luck never lasts too long:
- Every 10 boss kills without an epic drop, the next boss drops one for sure.
- Every 50 epic-or-better drops without a legendary, the next one is legendary.

## 11. Where it shows up in the UI

- A **Rewards** button next to Quests in the bottom bar, with a red badge when anything is claimable. It opens a panel with tabs: **Daily** (login calendar, daily quests, activity bar), **Weekly**, **Achievements**, **Mastery**, **Collection**.
- Stars on area cards and region headers; region star chests at the end of each region section.
- After a run, the result screen lists new stars, quest progress and any achievement tier reached.
- The camp gift appears as a small chest icon on the World Map (later, in Emberhold).

## 12. Save data

Added to the profile (old saves start everything at zero, nothing lost):

```
rewards: {
  login: { day: 1..7, lastClaim: 'YYYY-MM-DD' },
  daily: { date, quests: [{ id, progress, done, claimed }], points, chests: [false, false, false] },
  weekly: { week, quests: [...], chest: false },
  stars: { areaId: 0..3 }, regionChests: { regionId: [false, false, false] },
  achievements: { id: { progress, tier } }, title: 'id or null',
  collection: { enemies: { id: count }, items: { base: { rarity: true } } },
  mastery: { pathId: { level, xp, tint } },
  camp: { since: timestamp },
  trial: { week, best }, pity: { bossNoEpic, epicNoLegendary },
}
```

## 13. Build order

1. **Daily loop:** login calendar, daily and weekly quests, activity and weekly chests, the Rewards panel and badges.
2. **Stars and achievements:** area stars, region star chests, achievements and titles, the result-screen summary.
3. **Hero mastery:** mastery XP, rewards, alternate colours (2 tints per hero), titles.
4. **Extras:** collection log, camp supplies, Endless weekly milestones, pity rules.

It can go before or after Emberhold (phase 2 of the world spec). If Emberhold comes first, the daily quests live on its notice board and the camp lives in the village.

## 14. Open questions

1. Idle camp supplies (section 8): include them, or keep the game fully "play to earn"?
2. Login calendar: keep "missing a day just pauses", or a stricter streak with a bigger day-7 reward?
3. Hero mastery alternate colours: OK as the main cosmetic, or would you also like special skill effect colours (e.g. a red Gojo Blue) at high mastery?
4. Build this before Emberhold, or after?
