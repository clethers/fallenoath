/* =========================================================================
   FALLEN OATH — Central game data & balance configuration
   ========================================================================= */
(function () {
  'use strict';
  const G = (window.G = window.G || {});

  G.CONFIG = {
    VERSION: 6,
    SAVE_KEY: 'fallenoath_save_v1',
    VIEW_WIDTH: 216, // world pixels visible across the screen width
    TILE: 16,
    MAX_LEVEL: 30,
    INVENTORY_SIZE: 30,
    ATTR_POINTS_PER_LEVEL: 3,
    SKILL_POINTS_PER_LEVEL: 1,
    PLAYER_BASE: { maxHp: 120, maxMp: 50, atk: 12, def: 4, crit: 0.05, critDmg: 1.5, atkSpeed: 1, moveSpeed: 72, mpRegen: 2 },
    PLAYER_PER_LEVEL: { maxHp: 14, maxMp: 5, atk: 2, def: 1 },
    ATTR: {
      str: { name: 'Strength', desc: '+2 Attack', atk: 2 },
      vit: { name: 'Vitality', desc: '+12 Max HP, +0.5 Defense', maxHp: 12, def: 0.5 },
      int: { name: 'Intellect', desc: '+6 Max MP, +3% skill power, +0.15 MP/s', maxMp: 6, skillPower: 0.03, mpRegen: 0.15 },
      agi: { name: 'Agility', desc: '+0.6% Crit, +2% attack & move speed', crit: 0.006, atkSpeed: 0.02, moveSpeedPct: 0.02 },
    },
    xpForLevel: (L) => Math.floor(40 * Math.pow(L, 1.6) + 20),
    DEF_K: 60, // damage reduction = K / (K + def)
    POTION: { hp: 0.4, mp: 0.5, cooldown: 1.5 },
    SHOP: { hpPotion: 25, mpPotion: 20, refresh: 40 },
  };

  // ------------------------------------------------------------------ SKILL TREE
  // The hero is a lightning swordsman; each skill uses only
  // existing effect sheets of that element (keys refer to G.FX). Damage multipliers are of skill power.
  G.PATHS = {
    storm: {
      name: 'Storm Blade', element: 'Black & Yellow Lightning', color: '#f2cf4a', icon: ['thunderStrike', 6, 'gold'], heroTint: 'zenitsu',
      desc: 'A flash swordsman: draw, vanish in a streak of yellow and black lightning, and enemies fall a beat later.',
      actives: ['flashdraw', 'sixfold', 'blinkstep', 'godspeed', 'sheath', 'sovereign'], passives: ['iaifocus', 'thunderstep'],
    },
    shadow: {
      name: 'Shadow Monarch', element: 'Black & Purple Shadow', color: '#a77bff', icon: ['riseSkull', 5, 'void'], heroTint: 'jinwoo',
      fxRemap: { sparkBurst: 'burstBlue', hit: 'cutBlue', hitCrit: 'cutBlue', slashArc: 'cutBlue' }, // gold sword sparks -> purple
      desc: 'A shadow assassin who rules the dead. Leap between enemies on purple lightning, crush them with telekinesis, freeze them with killing intent, and open a domain of shadow where your army rises.',
      signature: 'Inspired by Sung Jinwoo: Shadow Fang, Ruler\u2019s Authority, Bloodlust, Shadow Step, Army of Shadows.',
      actives: ['shadowfang', 'rulers', 'shadowstep', 'bloodlust', 'shadowarmy'], passives: ['stealth', 'quicksilver', 'presence'],
    },
    limitless: {
      name: 'Limitless Sorcerer', element: 'Blue, Red & Hollow Purple', color: '#5fb4ff', icon: ['chargeBlue', 4, 'blue'], heroTint: 'gojo', draft: true,
      fxRemap: { sparkBurst: 'impBlue3', hit: 'sparkleBlue', hitCrit: 'impBlue3', slashArc: 'tapBlue' }, // energy taps instead of sword sparks
      desc: 'The strongest sorcerer. Pull enemies together with Blue, blast them apart with Red, erase them with Hollow Purple, and trap them in the Infinite Void.',
      signature: 'Inspired by Gojo Satoru: Lapse Blue, Reversal Red, Blink, Hollow Purple, Domain Expansion.',
      actives: ['lapseblue', 'reversalred', 'blink', 'hollowpurple', 'infinitevoid'], passives: ['infinity', 'sixeyes', 'rct'],
    },
  };
  // tree layout: x/y are % positions in the tree view
  G.TREE_LAYOUT = [
    { slot: 'a0', x: 50, y: 7 },
    { slot: 'p0', x: 18, y: 29 }, { slot: 'a1', x: 82, y: 29 },
    { slot: 'b0', x: 18, y: 51 }, { slot: 'p1', x: 82, y: 51 },
    { slot: 'b1', x: 18, y: 73 }, { slot: 'a2', x: 82, y: 73 },
    { slot: 'a3', x: 50, y: 93 },
  ];

  // Flash-swordsman kit (original names). Yellow = Thunder Effect 02 + yellow sparks/impacts;
  // black = the same lightning sheets darkened at load (FX keys ending in "Dark").
  G.SKILLS = {
    flashdraw: { path: 'storm', kind: 'active', slot: 'a0', name: 'Flash Draw', unlock: 1, mp: 12, cd: 3.5, icon: ['slashGold', 2, 'gold'], move: 'flash',
      stance: 0.12, dashLen: 110, dashTime: 0.1, delay: 0.2, mult: 2.0, perRank: 0.3, width: 18,
      fx: 'chargeUp (stance), thunderSplash + black splash (trail), thunderStrike + black strike, slashGold (delayed cuts)',
      desc: 'A brief stance, then a near-instant straight dash-slash. Everything on the line is cut a beat after you pass.' },
    sixfold: { path: 'storm', kind: 'active', slot: 'a1', req: 'flashdraw', name: 'Sixfold Flash', unlock: 3, mp: 22, cd: 9, icon: ['thunderSplash', 5, 'gold'], move: 'flash',
      flashes: 6, segTime: 0.07, radius: 130, mult: 0.9, perRank: 0.12,
      fx: 'slashGold, thunderSplash, black splash/burst', desc: 'Six rapid flashes zig-zagging between nearby enemies, cutting each one you pass through.' },
    godspeed: { path: 'storm', kind: 'active', slot: 'a2', req: 'thunderstep', name: 'Godspeed Rush', unlock: 6, mp: 32, cd: 13, icon: ['thunderStrike', 8, 'dark'], move: 'flash',
      flashes: 8, segTime: 0.05, radius: 150, mult: 1.0, perRank: 0.15, finisher: 2.4, stun: 1.2,
      fx: 'slashGold, black burst, thunderStrike + black bolt (finisher)', desc: 'Eight even faster flashes, finished by a huge yellow-and-black thunder strike that stuns.' },
    sovereign: { path: 'storm', kind: 'active', slot: 'a3', req: 'godspeed', ult: true, name: 'Thunder Sovereign', unlock: 10, mp: 60, cd: 40, icon: ['bossBolt', 3, 'dark'], move: 'flash',
      windup: 0.4, dashLen: 230, dashTime: 0.18, mult: 4.2, perRank: 0.5, width: 40, stun: 1.5,
      fx: 'chargeUp, black aura, black bolts + thunderStrike columns, lightBurst', desc: 'ULTIMATE. Charge, then one enormous flash across the field that leaves a towering column of black and yellow lightning along the whole path.' },
    iaifocus: { path: 'storm', kind: 'passive', slot: 'p0', req: 'flashdraw', name: 'Iai Focus', unlock: 2, icon: ['chargeUp', 6, 'gold'],
      focusTime: 0.8, bonus: 0.15, desc: 'Stand still to build focus. Your next Flash skill always crits and deals +15% damage per rank.' },
    blinkstep: { path: 'storm', kind: 'active', slot: 'b0', req: 'iaifocus', name: 'Blink Step', unlock: 4, mp: 8, cd: 4, icon: ['thunderSplash', 4, 'dark'], move: 'flash',
      dist: 75, dashTime: 0.08, mult: 0.6, perRank: 0.15, cdPerRank: 0.4, radius: 30,
      fx: 'black burst (vanish), thunderSplash (arrive), black splash', desc: 'Vanish in a short evasive flash away from danger, untouchable while moving. Black lightning bursts where you stood.' },
    sheath: { path: 'storm', kind: 'active', slot: 'b1', req: 'blinkstep', name: 'Thunder Sheath', unlock: 7, mp: 15, cd: 10, icon: ['chargeUp', 9, 'dark'], move: 'flash',
      window: 0.6, perRankWindow: 0.1, mult: 2.6, perRank: 0.35, range: 150, missCd: 3,
      fx: 'black aura + chargeUp (stance), slashGold + thunderStrike/black strike (counter)', desc: 'A parry stance. If anything strikes you, you take no damage and flash-counter the attacker with a guaranteed crit. Missing shortens the cooldown.' },
    thunderstep: { path: 'storm', kind: 'passive', slot: 'p1', req: 'sixfold', name: 'Thunder Step', unlock: 5, icon: ['sparkBurst', 4, 'gold'],
      cdr: 0.15, mp: 1, desc: 'Every flash-dash shortens your skill cooldowns by 0.15s and restores 1 MP per rank.' },

    // ---- Shadow Monarch (assassin kit, red & blue + blue lightning). Code: js/class-shadow.js
    shadowfang: { path: 'shadow', kind: 'active', slot: 'a0', name: 'Shadow Fang', unlock: 1, mp: 12, cd: 4, icon: ['zapBlue', 4, 'void'],
      radius: 160, hops: 4, hopRange: 95, hopMult: 0.5, mult: 1.4, perRank: 0.2,
      desc: 'Purple lightning leaps from your blade through up to 4 enemies, then you sink into the shadows and flash behind the last one for a finishing cut.' },
    stealth: { path: 'shadow', kind: 'passive', slot: 'p0', req: 'shadowfang', name: 'Stealth', unlock: 2, icon: ['smokeDark', 8, 'void'],
      delay: 2, bonus: 0.2,
      desc: 'Go 2 s without attacking or casting to fade into the shadows. Your next hit always crits and deals +20% damage per rank.' },
    rulers: { path: 'shadow', kind: 'active', slot: 'a1', req: 'shadowfang', name: "Ruler's Authority", unlock: 3, mp: 18, cd: 7, icon: ['impBlue2', 2, 'blue'],
      radius: 140, targets: 5, perRankTargets: 0.5, lift: 34, mult: 1.6, perRank: 0.2, stun: 1, perRankStun: 0.15,
      desc: 'Seize up to 5 nearby enemies with telekinesis, lift them into the air, then slam them into the ground. They are stunned when they land.' },
    shadowstep: { path: 'shadow', kind: 'active', slot: 'b0', req: 'stealth', name: 'Shadow Step', unlock: 4, mp: 8, cd: 4, cdPerRank: 0.4, icon: ['smokeDark', 6, 'void'],
      dist: 75, dashTime: 0.08, radius: 30, mult: 0.6, perRank: 0.15,
      desc: 'Melt into the shadows and flash away from danger, untouchable. The shadow you leave behind bursts and damages enemies nearby.' },
    quicksilver: { path: 'shadow', kind: 'passive', slot: 'p1', req: 'rulers', name: 'Quicksilver', unlock: 5, icon: ['cutBlue', 3, 'void'],
      speed: 0.05, atk: 0.08, aspd: 0.04,
      desc: 'Per rank: +5% movement speed, and basic attacks deal +8% damage and swing 4% faster.' },
    presence: { path: 'shadow', kind: 'passive', slot: 'a2', req: 'quicksilver', name: "Monarch's Presence", unlock: 6, icon: ['shadowMist', 6, 'void'],
      radius: 80, amt: 0.05,
      desc: 'A faint shadow aura surrounds you. Enemies within 80 px take +5% damage per rank from every source.' },
    bloodlust: { path: 'shadow', kind: 'active', slot: 'b1', req: 'shadowstep', name: 'Bloodlust', unlock: 7, mp: 15, cd: 14, icon: ['fearPurple', 30, 'void'],
      radius: 180, fear: 2, perRankFear: 0.25, vuln: 0.3, vulnTime: 5,
      desc: 'Release the Monarch\u2019s killing intent. A dark wave freezes nearby enemies with fear: they flee and take 30% more damage for 5 s.' },
    shadowarmy: { path: 'shadow', kind: 'active', slot: 'a3', req: 'presence', ult: true, name: 'Army of Shadows', unlock: 10, mp: 60, cd: 45, icon: ['impDarkP', 3, 'void'],
      life: 15, perRankLife: 2, soldiers: 4, igris: 1.6, mult: 0.6, perRank: 0.08, domain: 125, domainTime: 8, slow: 0.3, vuln: 0.2, armyBonus: 0.3,
      desc: 'ULTIMATE. Open the Monarch\u2019s Domain: a field of shadow where enemies are slowed and take 20% more damage. Four shadow samurai rise from it, then Igris, your knight commander. Shadows fight 30% harder inside the domain.' },
    // ---- Limitless Sorcerer (Gojo) - DRAFT for testing
    lapseblue: { path: 'limitless', kind: 'active', slot: 'a0', name: 'Lapse: Blue', unlock: 1, mp: 12, cd: 4, icon: ['chargeBlue', 4, 'blue'],
      radius: 80, pull: 0.85, tick: 0.25, mult: 0.8, perRank: 0.15,
      desc: 'A point of Blue forms in front of you and drags every enemy nearby into it, crushing them together until it implodes.' },
    infinity: { path: 'limitless', kind: 'passive', slot: 'p0', req: 'lapseblue', name: 'Infinity', unlock: 2, icon: ['impBlue2', 3, 'blue'],
      reduce: 0.08,
      desc: 'Attacks slow down before they reach you: take 8% less damage per rank.' },
    reversalred: { path: 'limitless', kind: 'active', slot: 'a1', req: 'lapseblue', name: 'Reversal: Red', unlock: 3, mp: 16, cd: 6, icon: ['chargeRed', 4, 'red'],
      range: 100, cone: 0.75, mult: 1.6, perRank: 0.25, knock: 70,
      desc: 'A red point flashes at your fingertip and explodes forward, blasting every enemy in front of you far away.' },
    blink: { path: 'limitless', kind: 'active', slot: 'b0', req: 'infinity', name: 'Blink', unlock: 4, mp: 8, cd: 4, cdPerRank: 0.4, icon: ['impBlue3', 2, 'blue'],
      dist: 75,
      desc: 'Fold space and teleport a short distance away from danger, untouchable for an instant. The joystick picks the direction.' },
    sixeyes: { path: 'limitless', kind: 'passive', slot: 'p1', req: 'reversalred', name: 'Six Eyes', unlock: 5, icon: ['sparkleBlue', 8, 'blue'],
      mpSave: 0.06, crit: 0.03,
      desc: 'Per rank: skills refund 6% of their MP cost, and +3% critical chance.' },
    rct: { path: 'limitless', kind: 'passive', slot: 'a2', req: 'sixeyes', name: 'Reverse Cursed Technique', unlock: 6, icon: ['lightBurstBlue', 6, 'blue'],
      regen: 0.004, potion: 0.1,
      desc: 'Per rank: in combat, heal 0.4% of max HP every second, and potions heal 10% more.' },
    hollowpurple: { path: 'limitless', kind: 'active', slot: 'b1', req: 'blink', name: 'Hollow Purple', unlock: 7, mp: 30, cd: 12, icon: ['orbPurple', 1, null],
      speed: 300, life: 0.8, width: 26, mult: 4, perRank: 0.5,
      desc: 'Collide Blue and Red into a huge purple sphere that tears through everything in a straight line.' },
    infinitevoid: { path: 'limitless', kind: 'active', slot: 'a3', req: 'rct', ult: true, name: 'Infinite Void', unlock: 10, mp: 60, cd: 45, icon: ['impBlue2', 4, 'blue'],
      radius: 150, freeze: 2.4, mult: 3, perRank: 0.4,
      desc: 'ULTIMATE. Domain Expansion: a starry void swallows the area. Every enemy inside is frozen, overloaded with endless information, then takes heavy damage.' },
  };
  G.SKILL_ORDER = Object.keys(G.SKILLS);
  G.SKILL_MAX_RANK = 5;
  G.RESPEC_COST = (level) => 100 * level;
  G.pathSkill = (path, slot) => (G.PATHS[path] ? Object.keys(G.SKILLS).find((k) => G.SKILLS[k].path === path && G.SKILLS[k].slot === slot) : null);
  // action bar: 4 chosen active skills (p.slots) + the ultimate on its own 5th button
  G.ULT_SLOT = 4;
  G.ultSkill = (path) => (G.PATHS[path] ? G.PATHS[path].actives.find((k) => G.SKILLS[k].ult) : null);
  G.barSkill = (p, i) => {
    if (!p.path || !G.PATHS[p.path]) return null;
    const k = i === G.ULT_SLOT ? G.ultSkill(p.path) : (p.slots || [])[i];
    return k && p.skills[k] > 0 && G.SKILLS[k] && G.SKILLS[k].path === p.path ? k : null;
  };
  // put newly learned actives into the first empty slot; drop anything no longer valid
  G.fixSlots = (p) => {
    const ok = (k) => k && G.SKILLS[k] && G.SKILLS[k].path === p.path && G.SKILLS[k].kind === 'active' && !G.SKILLS[k].ult && p.skills[k] > 0;
    const seen = new Set();
    p.slots = [0, 1, 2, 3].map((i) => { const k = (p.slots || [])[i]; if (ok(k) && !seen.has(k)) { seen.add(k); return k; } return null; });
    (G.PATHS[p.path] ? G.PATHS[p.path].actives : []).forEach((k) => {
      if (ok(k) && !seen.has(k)) { const e = p.slots.indexOf(null); if (e >= 0) { p.slots[e] = k; seen.add(k); } }
    });
    return p.slots;
  };
  G.passiveRank = (p, k) => (p && p.path && G.SKILLS[k] && G.SKILLS[k].path === p.path ? p.skills[k] || 0 : 0);

  // ------------------------------------------------------------------ ENEMIES
  // anims: state -> sheet key; hit: frame index where damage/projectile happens
  const ORC_ANIM = { idle: 'orc_idle', walk: 'orc_walk', attack: 'orc_attack01', heavy: 'orc_attack02', hurt: 'orc_hit', death: 'orc_death' };
  const SOL_ANIM = { idle: 'soldier_idle', walk: 'soldier_walk', attack: 'soldier_attack01', heavy: 'soldier_attack02', shoot: 'soldier_attack03', hurt: 'soldier_hit', death: 'soldier_death' };
  const TD = (n) => ({ idle: 'td' + n + '_idle', walk: 'td' + n + '_walk', run: 'td' + n + '_run', attack: 'td' + n + '_attack', heavy: 'td' + n + '_runatk', hurt: 'td' + n + '_hurt', death: 'td' + n + '_death' });
  const KN_ANIM = { idle: 'knight_idle', walk: 'knight_walk', run: 'knight_run', attack: 'knight_attack1', heavy: 'knight_attack2', lunge: 'knight_attack3', block: 'knight_block', hurt: 'knight_hurt', death: 'knight_death' };

  G.ENEMIES = {
    orc: { name: 'Orc Grunt', anim: TD(1), dir4: true, hgt: 32, ax: 32, ay: 46, scale: 0.95, radius: 7, hp: 42, atk: 8, def: 2, speed: 34, range: 16, cd: 1.5, hit: 4, xp: 12, gold: [2, 6], ai: 'melee', drops: { tusk: 0.45 } },
    brute: { name: 'Orc Brute', anim: TD(3), dir4: true, hgt: 32, ax: 32, ay: 46, scale: 1.25, radius: 10, hp: 130, atk: 15, def: 6, speed: 27, range: 20, cd: 2.0, hit: 4, heavy: true, xp: 34, gold: [6, 14], ai: 'melee', drops: { tusk: 0.8 } },
    archer: { name: 'Deserter Archer', anim: SOL_ANIM, ax: 48, ay: 56, scale: 1.55, radius: 7, hp: 34, atk: 10, def: 2, speed: 36, range: 120, cd: 2.4, hit: 7, xp: 16, gold: [3, 8], ai: 'ranged', arrowSpeed: 150 },
    warlord: { name: 'Grukk the Warlord', anim: TD(2), dir4: true, hgt: 32, ax: 32, ay: 46, scale: 1.75, radius: 14, hp: 650, atk: 22, def: 10, speed: 30, range: 26, cd: 1.8, hit: 4, xp: 260, gold: [120, 160], ai: 'warlord', boss: true, drops: { tusk: 1 } },
    demon: { name: 'Lesser Demon', anim: { idle: 'demon_idle', walk: 'demon_walk', attack: 'demon_attack01', heavy: 'demon_attack02', hurt: 'demon_hurt', death: 'demon_death' }, ax: 52, ay: 58, scale: 1.6, hgt: 20, radius: 7, hp: 55, atk: 11, def: 3, speed: 40, range: 18, cd: 1.4, hit: 4, heavy: true, xp: 18, gold: [3, 8], ai: 'melee' },
    kobold: { name: 'Kobold Skirmisher', anim: { idle: 'kobold_idle', walk: 'kobold_run', run: 'kobold_run', attack: 'kobold_attack', heavy: 'kobold_attack', hurt: 'kobold_idle', death: 'kobold_idle' }, ax: 52, ay: 90, scale: 0.5, hgt: 61, radius: 6, hp: 26, atk: 7, def: 1, speed: 58, range: 16, cd: 1.1, hit: 2, xp: 10, gold: [2, 5], ai: 'melee' },
    necro: { name: 'Morvath the Necromancer', anim: { idle: 'nc_stand', walk: 'nc_run', run: 'nc_run', attack: 'nc_atk1', heavy: 'nc_atk2', cast: 'nc_atk3', hurt: 'nc_hurt', death: 'nc_death' }, ax: 81, ay: 115, scale: 0.85, hgt: 52, radius: 10, hp: 480, atk: 16, def: 6, speed: 30, range: 22, cd: 2.4, hit: 6, keep: 110, xp: 220, gold: [90, 130], ai: 'necro', boss: true },
    shSamurai: { name: 'Shadow Samurai', anim: { idle: 'sam_idle', walk: 'sam_run', run: 'sam_run', attack: 'sam_attack1', heavy: 'sam_attack1', hurt: 'sam_hurt' }, ax: 46, ay: 81, scale: 1.3, radius: 7, hp: 1, atk: 10, def: 2, speed: 44, range: 24, cd: 1.1, hit: 3, xp: 0, gold: [0, 0], ai: 'melee', summon: true },
    knight: { name: 'Sir Varric, the Fallen', anim: KN_ANIM, ax: 54, ay: 83, scale: 1.3, radius: 12, hp: 1600, atk: 30, def: 14, speed: 40, range: 30, cd: 1.6, hit: 4, xp: 1000, gold: [400, 500], ai: 'knight', boss: true },
  };

  // ------------------------------------------------------------------ AREAS
  G.AREAS = [
    {
      id: 'courtyard', name: 'Mossy Courtyard', level: 1, theme: 'grass', w: 18, h: 30, seed: 11,
      desc: 'Overgrown grounds outside the old keep. Orc raiders have made camp here.',
      waves: [[['orc', 3]], [['orc', 5]], [['orc', 4], ['brute', 1]]],
    },
    {
      id: 'graveyard', name: 'Whispering Graveyard', level: 3, theme: 'graves', w: 18, h: 32, seed: 23,
      desc: 'Kobolds and deserters prowl the tombs, and the necromancer Morvath raises demons from the graves.',
      waves: [[['kobold', 3], ['archer', 1]], [['archer', 3], ['kobold', 3]], [['demon', 2], ['archer', 2]], [['orc', 3], ['demon', 2], ['kobold', 2]]], boss: 'necro',
    },
    {
      id: 'ruins', name: 'Sunken Ruins', level: 6, theme: 'ruins', w: 20, h: 34, seed: 37,
      desc: 'Crumbling halls where the orc warlord Grukk gathers his horde.',
      waves: [[['orc', 4], ['kobold', 2]], [['brute', 2], ['archer', 3]], [['orc', 5], ['brute', 2], ['kobold', 2]]], boss: 'warlord',
    },
    {
      id: 'shrine', name: 'Shrine of the Fallen', level: 9, theme: 'shrine', w: 20, h: 34, seed: 53,
      desc: 'The sealed shrine where a cursed knight still guards his broken oath.',
      waves: [[['archer', 4], ['brute', 2], ['demon', 2]], [['orc', 5], ['demon', 3], ['archer', 3]]], boss: 'knight',
    },
    {
      id: 'trial', name: 'Endless Trial', level: 10, theme: 'trial', w: 20, h: 30, seed: 71, endless: true,
      desc: 'An arena of endless waves. Enemies grow stronger each wave; a boss appears every 5th wave.',
      waves: [],
    },
  ];

  // ------------------------------------------------------------------ ITEMS
  G.RARITY = [
    { id: 'common', name: 'Common', color: '#d9d4c7', mult: 1.0, affixes: 0, weight: 60 },
    { id: 'uncommon', name: 'Uncommon', color: '#7ccf6a', mult: 1.25, affixes: 1, weight: 26 },
    { id: 'rare', name: 'Rare', color: '#5aa7ff', mult: 1.55, affixes: 2, weight: 10 },
    { id: 'epic', name: 'Epic', color: '#c47bff', mult: 1.9, affixes: 3, weight: 3.5 },
    { id: 'legendary', name: 'Legendary', color: '#ffa53a', mult: 2.4, affixes: 4, weight: 0.5 },
  ];
  G.ITEM_BASES = {
    weapon: [
      { name: 'Shortsword', atk: 4 }, { name: 'Iron Blade', atk: 5 }, { name: 'Broadsword', atk: 6 },
      { name: 'Falchion', atk: 5, crit: 0.02 }, { name: 'Runed Saber', atk: 6, crit: 0.015 },
    ],
    armor: [
      { name: 'Leather Vest', def: 3, maxHp: 10 }, { name: 'Chain Shirt', def: 4, maxHp: 12 },
      { name: 'Scale Coat', def: 5, maxHp: 14 }, { name: 'Traveler\'s Cloak', def: 3, maxHp: 20 },
    ],
    accessory: [
      { name: 'Copper Ring', crit: 0.02 }, { name: 'Sage Amulet', maxMp: 12 },
      { name: 'Swift Band', atkSpeed: 0.05 }, { name: 'Life Charm', maxHp: 24 },
    ],
  };
  G.ITEM_PREFIX = ['Worn', 'Sturdy', 'Fine', 'Valiant', 'Grim', 'Oathsworn', 'Ashen', 'Gilded', 'Stormforged', 'Kingsfall'];
  G.AFFIXES = [
    { stat: 'atk', base: 1.6, label: 'Attack' },
    { stat: 'def', base: 1.2, label: 'Defense' },
    { stat: 'maxHp', base: 9, label: 'Max HP' },
    { stat: 'maxMp', base: 5, label: 'Max MP' },
    { stat: 'crit', base: 0.008, label: 'Crit', pct: true },
    { stat: 'atkSpeed', base: 0.025, label: 'Attack Speed', pct: true },
    { stat: 'mpRegen', base: 0.12, label: 'MP Regen' },
  ];
  G.STAT_LABEL = { atk: 'Attack', def: 'Defense', maxHp: 'Max HP', maxMp: 'Max MP', crit: 'Crit', atkSpeed: 'Attack Speed', mpRegen: 'MP Regen' };
  G.PCT_STATS = { crit: 1, atkSpeed: 1 };

  G.CONSUMABLES = {
    hpPotion: { name: 'Health Potion', desc: 'Restores 40% HP.', stack: true, value: 10 },
    mpPotion: { name: 'Mana Potion', desc: 'Restores 50% MP.', stack: true, value: 8 },
    tusk: { name: 'Orc Tusk', desc: 'Quest material. The smith pays for these.', stack: true, value: 4, material: true },
  };

  // ------------------------------------------------------------------ QUESTS
  // type: kill(enemy|any) | collect(item) | clear(area) | boss(enemy) | break | level | wave
  G.QUESTS = [
    { id: 'q1', name: 'First Blood', desc: 'Defeat 8 Orc Grunts.', type: 'kill', target: 'orc', count: 8, reward: { gold: 50, xp: 40 } },
    { id: 'q2', name: 'Clear the Courtyard', desc: 'Clear every wave in the Mossy Courtyard.', type: 'clear', target: 'courtyard', count: 1, reward: { gold: 80, item: ['weapon', 'uncommon'] } },
    { id: 'q3', name: 'Smash and Grab', desc: 'Break 10 crates, barrels or pots.', type: 'break', count: 10, requires: 'q1', reward: { gold: 40, hpPotion: 2 } },
    { id: 'q4', name: 'Tusks for the Smith', desc: 'Collect 6 Orc Tusks from orcs.', type: 'collect', target: 'tusk', count: 6, requires: 'q2', reward: { gold: 120, item: ['armor', 'rare'] } },
    { id: 'q5', name: 'Restless Graves', desc: 'Clear the Whispering Graveyard.', type: 'clear', target: 'graveyard', count: 1, requires: 'q2', reward: { gold: 150, xp: 150 } },
    { id: 'q6', name: 'Silence the Archers', desc: 'Defeat 12 Deserter Archers.', type: 'kill', target: 'archer', count: 12, requires: 'q2', reward: { gold: 150, item: ['accessory', 'rare'] } },
    { id: 'q7', name: 'The Warlord', desc: 'Defeat Grukk the Warlord in the Sunken Ruins.', type: 'boss', target: 'warlord', count: 1, requires: 'q5', reward: { gold: 300, item: ['weapon', 'epic'] } },
    { id: 'q8', name: 'Seasoned Adventurer', desc: 'Reach level 8.', type: 'level', count: 8, requires: 'q5', reward: { gold: 200, mpPotion: 3, hpPotion: 3 } },
    { id: 'q9', name: 'The Fallen Knight', desc: 'Defeat Sir Varric in the Shrine of the Fallen.', type: 'boss', target: 'knight', count: 1, requires: 'q7', reward: { gold: 1000, item: ['armor', 'legendary'] } },
    { id: 'q10', name: 'Trial of Endurance', desc: 'Reach wave 10 in the Endless Trial.', type: 'wave', count: 10, requires: 'q9', reward: { gold: 1500, item: ['weapon', 'legendary'] } },
  ];
})();
