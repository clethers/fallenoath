/* =========================================================================
   FALLEN OATH — Asset manifest
   Every path below points to a file that exists inside ./assets/, extracted
   unchanged from the original packs in the Prologue folder. No asset is
   generated, downloaded or drawn by code. See ASSET_INVENTORY.md.
   ========================================================================= */
(function () {
  'use strict';
  const G = (window.G = window.G || {});

  const P = {
    adv: 'assets/FREE_Adventurer 2D Pixel Art/Sprites/',
    gojo: 'assets/Gojo (edited FREE Adventurer)/', // the Adventurer with the sword removed, white hair, dark outfit
    jw: 'assets/Jin-Woo (edited FREE Adventurer)/', // the Adventurer with the sword removed, black hair and coat, purple eyes
    zen: 'assets/Zenitsu (edited FREE Adventurer)/', // Storm Blade: yellow hair and haori, katana sheathed at the hip
    asta: 'assets/Asta (edited FREE Adventurer)/', // ash hair, headband, black outfit, giant black sword
    luffy: 'assets/Luffy (edited FREE Adventurer)/', // the Adventurer with the sword removed: straw hat, red vest, blue shorts
    knight: 'assets/FREE_Knight 2D Pixel Art v1.2/Sprites/',
    samurai: 'assets/FREE_Samurai 2D Pixel Art v1.2/Sprites/',
    tiny: 'assets/Tiny RPG Character Asset Pack -Demo Soldier&Orc/',
    tex: 'assets/Pixel Art Top Down - Basic v1.2.3/Texture/',
    fx: 'assets/Super Pixel Effects Gigapack (Free Version)/spritesheet/',
    thunder: 'assets/Thunder Effect 02/',
    fire: 'assets/Pixel fire asset pack v1.2/Pixel Fire Asset Pack Colored/',
  };

  // ---- Character sheets: horizontal strips, frame size given, frame count = width / fw
  const SHEETS = {};
  ['down', 'left', 'right', 'up'].forEach((d) => {
    SHEETS['adv_idle_' + d] = { src: P.adv + 'IDLE/idle_' + d + '.png', fw: 96, fh: 80 };
    SHEETS['adv_run_' + d] = { src: P.adv + 'RUN/run_' + d + '.png', fw: 96, fh: 80 };
    SHEETS['adv_atk1_' + d] = { src: P.adv + 'ATTACK 1/attack1_' + d + '.png', fw: 96, fh: 80 };
    SHEETS['adv_atk2_' + d] = { src: P.adv + 'ATTACK 2/attack2_' + d + '.png', fw: 96, fh: 80 };
    // Storm Blade hero: same frames as the Adventurer, drawn as 'adv_*~zenitsu'
    SHEETS['zen_idle_' + d] = { src: P.zen + 'IDLE/idle_' + d + '.png', fw: 96, fh: 80 };
    SHEETS['zen_run_' + d] = { src: P.zen + 'RUN/run_' + d + '.png', fw: 96, fh: 80 };
    SHEETS['zen_atk1_' + d] = { src: P.zen + 'ATTACK 1/attack1_' + d + '.png', fw: 96, fh: 80 };
    SHEETS['zen_atk2_' + d] = { src: P.zen + 'ATTACK 2/attack2_' + d + '.png', fw: 96, fh: 80 };
    // Rubber Brawler hero: same frames as the Adventurer, drawn as 'adv_*~luffy'
    SHEETS['luffy_idle_' + d] = { src: P.luffy + 'IDLE/idle_' + d + '.png', fw: 96, fh: 80 };
    SHEETS['luffy_run_' + d] = { src: P.luffy + 'RUN/run_' + d + '.png', fw: 96, fh: 80 };
    SHEETS['luffy_atk1_' + d] = { src: P.luffy + 'ATTACK 1/attack1_' + d + '.png', fw: 96, fh: 80 };
    SHEETS['luffy_atk2_' + d] = { src: P.luffy + 'ATTACK 2/attack2_' + d + '.png', fw: 96, fh: 80 };
    // Anti-Magic Knight hero: same frames as the Adventurer, drawn as 'adv_*~asta'
    SHEETS['asta_idle_' + d] = { src: P.asta + 'IDLE/idle_' + d + '.png', fw: 96, fh: 80 };
    SHEETS['asta_run_' + d] = { src: P.asta + 'RUN/run_' + d + '.png', fw: 96, fh: 80 };
    SHEETS['asta_atk1_' + d] = { src: P.asta + 'ATTACK 1/attack1_' + d + '.png', fw: 96, fh: 80 };
    SHEETS['asta_atk2_' + d] = { src: P.asta + 'ATTACK 2/attack2_' + d + '.png', fw: 96, fh: 80 };
    // Shadow Monarch hero: same frames as the Adventurer, drawn as 'adv_*~jinwoo'
    SHEETS['jw_idle_' + d] = { src: P.jw + 'IDLE/idle_' + d + '.png', fw: 96, fh: 80 };
    SHEETS['jw_run_' + d] = { src: P.jw + 'RUN/run_' + d + '.png', fw: 96, fh: 80 };
    SHEETS['jw_atk1_' + d] = { src: P.jw + 'ATTACK 1/attack1_' + d + '.png', fw: 96, fh: 80 };
    SHEETS['jw_atk2_' + d] = { src: P.jw + 'ATTACK 2/attack2_' + d + '.png', fw: 96, fh: 80 };
    // Limitless Sorcerer hero: same frames as the Adventurer, drawn as 'adv_*~gojo'
    SHEETS['gojo_idle_' + d] = { src: P.gojo + 'IDLE/idle_' + d + '.png', fw: 96, fh: 80 };
    SHEETS['gojo_run_' + d] = { src: P.gojo + 'RUN/run_' + d + '.png', fw: 96, fh: 80 };
    SHEETS['gojo_atk1_' + d] = { src: P.gojo + 'ATTACK 1/attack1_' + d + '.png', fw: 96, fh: 80 };
    SHEETS['gojo_atk2_' + d] = { src: P.gojo + 'ATTACK 2/attack2_' + d + '.png', fw: 96, fh: 80 };
  });
  ['IDLE', 'RUN', 'WALK', 'ATTACK 1', 'ATTACK 2', 'ATTACK 3', 'BLOCK', 'HURT', 'DEATH'].forEach((n) => {
    SHEETS['knight_' + n.replace(' ', '').toLowerCase()] = { src: P.knight + n + '.png', fw: 112, fh: 96 };
  });
  // FREE Samurai 2D (same artist as the Knight): the Shadow Monarch's shadow samurai
  [['IDLE', 'idle'], ['ATTACK 1', 'attack1'], ['RUN', 'run'], ['HURT', 'hurt']].forEach(([f, n]) => {
    SHEETS['sam_' + n] = { src: P.samurai + f + '.png', fw: 96, fh: 96 };
  });
  ['Idle', 'Walk', 'Attack01', 'Attack02', 'Hit', 'Death'].forEach((n) => {
    SHEETS['orc_' + n.toLowerCase()] = { src: P.tiny + 'Orc/Orc_' + n + '.png', fw: 100, fh: 100 };
  });
  ['Idle', 'Walk', 'Attack01', 'Attack02', 'Attack03', 'Hit', 'Death'].forEach((n) => {
    SHEETS['soldier_' + n.toLowerCase()] = { src: P.tiny + 'Soldier/Soldier_' + n + '.png', fw: 100, fh: 100 };
  });

  // ---- Shadow Monarch hero: Necromancer by creativekind (sheet rows cut into strips, 160x128 frames)
  ['stand', 'run', 'atk1', 'atk2', 'atk3', 'hurt', 'death'].forEach((n) => {
    SHEETS['nc_' + n] = { src: 'assets/Necromancer (creativekind)/nc_' + n + '.png', fw: 160, fh: 128 };
  });

  // ---- Top-down orcs (CraftPix, free): 64x64 frames, one row per direction (down, up, left, right)
  ['1', '2', '3'].forEach((o) => ['idle', 'walk', 'run', 'attack', 'runatk', 'walkatk', 'hurt', 'death'].forEach((a) => {
    SHEETS['td' + o + '_' + a] = { src: 'assets/Top-Down Orcs (CraftPix)/orc' + o + '_' + a + '.png', fw: 64, fh: 64, rows: 4 };
  }));

  // ---- Tiny RPG 02 Demon (100x100) and Kobold Warrior (148x96): side view, facing right
  ['idle', 'walk', 'attack01', 'attack02', 'hurt', 'death'].forEach((a) => {
    SHEETS['demon_' + a] = { src: 'assets/Tiny RPG Demon (Zerie)/demon_' + a + '.png', fw: 100, fh: 100 };
  });
  ['idle', 'run', 'attack'].forEach((a) => {
    SHEETS['kobold_' + a] = { src: 'assets/Kobold Warrior/kobold_' + a + '.png', fw: 148, fh: 96 };
  });

  // ---- Static textures (tilesets / props)
  const TEX = {
    grass: P.tex + 'TX Tileset Grass.png',
    stone: P.tex + 'TX Tileset Stone Ground.png',
    wall: P.tex + 'TX Tileset Wall.png',
    struct: P.tex + 'TX Struct.png',
    props: P.tex + 'Extra/TX Props with Shadow.png',
    plants: P.tex + 'Extra/TX Plant with Shadow.png',
    // Undead Tileset (CraftPix, free): the undead dungeon ground, ground details and an atlas of its objects
    udGround: 'assets/Undead Tileset (CraftPix)/Ground_rocks.png',
    udDetails: 'assets/Undead Tileset (CraftPix)/Details.png',
    udObj: 'assets/Undead Tileset (CraftPix)/ud_objects.png',
  };

  // ---- Prop atlas: [sheet, sx, sy, sw, sh, anchorX, anchorY, colliderRadius]
  // anchor = the object's ground contact point inside the rect (shadow extends right)
  const PROPS = {
    slab: ['props', 31, 17, 41, 48, 17, 46, 10],
    chestClosed: ['props', 95, 29, 39, 33, 17, 31, 10],
    chestOpen: ['props', 95, 75, 41, 51, 17, 49, 10],
    crate: ['props', 159, 17, 41, 48, 17, 46, 11],
    crateSmall: ['props', 162, 85, 33, 41, 14, 39, 9],
    runeStone: ['props', 226, 8, 34, 54, 14, 52, 8],
    bench: ['props', 291, 18, 65, 43, 29, 40, 14],
    statue: ['props', 444, 19, 43, 75, 21, 72, 14],
    runePillar: ['props', 226, 90, 39, 68, 14, 66, 9],
    sarcophagus: ['props', 287, 86, 69, 38, 33, 36, 16],
    leanSlab: ['props', 386, 1, 34, 63, 14, 61, 8],
    leanSlab2: ['props', 386, 97, 33, 63, 14, 61, 8],
    lantern: ['props', 452, 117, 34, 40, 12, 38, 8],
    signEast: ['props', 98, 159, 31, 34, 14, 33, 4],
    signWest: ['props', 95, 223, 32, 34, 14, 33, 4],
    barrel: ['props', 161, 152, 33, 38, 15, 36, 9],
    coffin: ['props', 287, 157, 37, 59, 17, 57, 10],
    pillar: ['props', 351, 173, 46, 79, 17, 77, 11],
    brokenPillar: ['props', 415, 193, 37, 59, 17, 57, 11],
    brokenTomb: ['props', 226, 182, 33, 40, 14, 38, 9],
    vase: ['props', 164, 216, 25, 36, 11, 35, 7],
    ripGrave: ['props', 224, 238, 37, 43, 16, 41, 10],
    smallGrave: ['props', 288, 250, 34, 31, 16, 29, 10],
    altar: ['props', 352, 268, 99, 74, 48, 60, 0],
    pot: ['props', 163, 287, 30, 29, 13, 28, 7],
    cross: ['props', 226, 302, 36, 42, 14, 41, 5],
    doubleBlock: ['props', 287, 305, 48, 55, 17, 47, 11],
    vase2: ['props', 164, 347, 25, 34, 11, 33, 7],
    well: ['props', 419, 358, 60, 51, 28, 49, 18],
    boulder: ['props', 2, 429, 62, 46, 29, 44, 20],
    rock1: ['props', 9, 491, 14, 12, 6, 11, 0],
    rock2: ['props', 39, 489, 19, 16, 9, 15, 0],
    rock3: ['props', 67, 486, 27, 21, 13, 20, 7],
    rock4: ['props', 99, 486, 27, 21, 13, 20, 7],
    rock5: ['props', 129, 483, 31, 24, 14, 23, 9],
    rock6: ['props', 161, 481, 31, 29, 15, 28, 10],
    rubble1: ['props', 230, 488, 20, 18, 10, 16, 0],
    rubble2: ['props', 262, 487, 21, 18, 10, 16, 0],
    rubble3: ['props', 288, 485, 33, 21, 16, 19, 0],
    tree1: ['plants', 23, 13, 115, 141, 56, 139, 9],
    tree2: ['plants', 160, 16, 99, 138, 47, 136, 9],
    tree3: ['plants', 294, 30, 85, 122, 42, 120, 8],
    bush1: ['plants', 37, 197, 25, 23, 12, 21, 0],
    bush2: ['plants', 97, 194, 31, 29, 14, 27, 0],
    bush3: ['plants', 155, 189, 43, 35, 20, 33, 12],
    bush4: ['plants', 215, 184, 52, 46, 24, 44, 15],
    bush5: ['plants', 281, 185, 43, 49, 20, 47, 12],
    bush6: ['plants', 345, 189, 45, 39, 21, 37, 13],
    tuft1: ['plants', 7, 393, 19, 11, 9, 10, 0],
    tuft2: ['plants', 40, 393, 18, 12, 9, 11, 0],
    tuft3: ['plants', 72, 393, 17, 12, 8, 11, 0],
    tuft4: ['plants', 101, 393, 17, 13, 8, 12, 0],
    tuft5: ['plants', 8, 425, 14, 12, 7, 11, 0],
    tuft6: ['plants', 42, 426, 15, 11, 7, 10, 0],
    tuft7: ['plants', 70, 458, 16, 12, 8, 11, 0],
    tuft8: ['plants', 10, 490, 12, 12, 6, 11, 0],
    // TX Struct.png (no shadow variant exists)
    wallA: ['struct', 31, 31, 66, 98, 33, 96, 0],
    wallB: ['struct', 127, 31, 67, 98, 33, 96, 0],
    wallC: ['struct', 223, 31, 67, 98, 33, 96, 0],
    wallMossA: ['struct', 31, 159, 66, 98, 33, 96, 0],
    wallMossB: ['struct', 127, 159, 67, 98, 33, 96, 0],
    wallMossC: ['struct', 223, 159, 67, 98, 33, 96, 0],
    arch: ['struct', 407, 26, 82, 66, 41, 64, 0],
    archSmall: ['struct', 415, 127, 66, 66, 33, 64, 0],
    // TX Tileset Wall.png
    wallFront: ['wall', 31, 191, 130, 66, 0, 66, 0],
    wallWindow: ['wall', 191, 191, 34, 66, 0, 66, 0],
    wallBlockA: ['wall', 31, 287, 66, 66, 0, 66, 0],
    wallBlockB: ['wall', 127, 287, 66, 66, 0, 66, 0],
    wallEdgeV: ['wall', 287, 31, 12, 98, 0, 0, 0],
    wallEdgeV2: ['wall', 343, 31, 10, 98, 0, 0, 0],
    wallEdgeH: ['wall', 383, 31, 98, 10, 0, 0, 0],
  };

  // ---- Effects (Super Pixel Effects Gigapack spritesheets, row-major grids, 15 fps native)
  function gp(cat, name, variant, fw, fh, n) {
    return { src: P.fx + cat + '/' + name + '/' + name + '_' + variant + '/spritesheet.png', fw, fh, n };
  }
  const FX = {
    // combat hits
    hit: gp('Impacts', 'symmetrical_impact_001', 'small_yellow', 48, 48, 7),
    hitCrit: Object.assign(gp('Impacts', 'symmetrical_impact_006', 'small_yellow', 80, 80, 8), { warm: 'lum' }),
    hitPlayer: gp('Impacts', 'symmetrical_impact_002', 'small_blue', 48, 48, 10),
    hitArrow: gp('Impacts', 'directional_impact_001', 'small_blue', 32, 32, 7),
    hitLunge: gp('Impacts', 'directional_impact_002', 'large_white', 140, 50, 7),
    hitHeavy: gp('Impacts', 'symmetrical_impact_004', 'large_yellow', 96, 96, 8),
    // skills
    flame: gp('Explosions', 'epic_explosion_001', 'large_orange', 128, 128, 13),
    nova: gp('Explosions', 'stylized_explosion_002', 'large_violet', 96, 96, 10),
    novaSpark: gp('Lightning', 'lightning_burst_003', 'large_violet', 96, 96, 10),
    heal: gp('Fantasy Spells', 'spell_heal_001', 'large_red', 128, 128, 16),
    guard: gp('Fantasy Spells', 'spell_defense_up_001', 'large_blue', 128, 128, 18),
    haste: gp('Fantasy Spells', 'spell_haste_001', 'large_green', 128, 128, 29),
    warcry: gp('Fantasy Spells', 'spell_attack_up_001', 'large_red', 128, 128, 18),
    poison: gp('Fantasy Spells', 'spell_poison_001', 'large_green', 128, 128, 17),
    absorb: gp('Fantasy Spells', 'spell_absorb_001', 'large_violet', 128, 128, 31),
    deathMark: gp('Fantasy Spells', 'spell_death_001', 'large_red', 64, 64, 50),
    // statuses (looping)
    statusPoison: gp('Fantasy Spells', 'status_poison_001', 'small_green', 48, 48, 24),
    statusStun: Object.assign(gp('Lightning', 'lightning_aura_002', 'small_blue', 48, 48, 16), { warm: 'lum' }),
    sparkle: gp('Fantasy Spells', 'status_sparkling_001', 'small_yellow', 48, 48, 24),
    // world / feedback
    spawnSmoke: gp('Smoke Bursts', 'symmetrical_smoke_burst_001', 'large_brown', 64, 64, 10),
    breakSmoke: gp('Smoke Bursts', 'symmetrical_smoke_burst_001', 'small_brown', 32, 32, 10),
    skullSmoke: gp('Smoke Bursts', 'stylized_skull_smoke_burst_001', 'small_white', 32, 32, 12),
    coins: gp('Magic Bursts', 'directional_coin_burst_001', 'small_yellow', 64, 64, 31),
    hearts: gp('Magic Bursts', 'round_heart_burst_001', 'small_red', 64, 64, 23),
    manaBurst: gp('Magic Bursts', 'round_sparkle_burst_001', 'large_blue', 64, 64, 14),
    lightBurst: gp('Magic Bursts', 'round_light_burst_001', 'large_yellow', 256, 144, 9),
    levelUp: gp('Symbols', 'symbol_level_up_text_001', 'small_blue', 160, 64, 43),
    complete: gp('Symbols', 'symbol_complete_text_001', 'small_blue', 160, 48, 55),
    youWon: gp('Symbols', 'symbol_you_won_text_001', 'small_green', 144, 64, 41),
    gameOver: gp('Symbols', 'symbol_game_over_text_001', 'small_red', 208, 64, 44),
    alert: gp('Symbols', 'symbol_alert_001', 'small_red', 40, 40, 14),
    defUp: gp('Symbols', 'symbol_defense_up_001', 'small_blue', 40, 40, 60),
    slamDust: gp('Smoke Bursts', 'symmetrical_smoke_burst_001', 'large_brown', 64, 64, 10),
    slamBlast: gp('Explosions', 'symmetrical_explosion_002', 'large_orange', 64, 64, 11),
    bossBolt: gp('Lightning', 'lightning_strike_001', 'large_violet', 128, 128, 7),
    warp: gp('Sci-fi', 'scifi_warp_003', 'large_blue', 128, 128, 12),
    // sword-art effects
    dashSmoke: gp('Smoke Bursts', 'directional_smoke_burst_001', 'large_white', 64, 64, 21),
    critBig: gp('Impacts', 'symmetrical_impact_006', 'large_yellow', 160, 160, 8),
    slashBlue: gp('Impacts', 'directional_impact_001', 'large_blue', 64, 64, 7),
    slashGold: gp('Impacts', 'directional_impact_004', 'large_yellow', 80, 80, 5),
    impactBig: gp('Impacts', 'symmetrical_impact_003', 'large_yellow', 96, 96, 7),
    slashArc: Object.assign(gp('Impacts', 'directional_impact_002', 'small_white', 70, 25, 7), { warm: 'mul' }), // basic sword hit (fan points up at rot 0)
    flashKick: Object.assign(gp('Sci-fi', 'scifi_muzzle_flash_003', 'large_yellow', 96, 48, 8), { warm: 'mul' }), // flash-step departure burst (points right)
    // elemental skill-tree effects
    lbolt1: gp('Lightning', 'lightning_burst_001', 'large_violet', 64, 64, 8),
    lbolt2: gp('Lightning', 'lightning_burst_002', 'large_violet', 64, 64, 9),
    staticAura: gp('Lightning', 'lightning_aura_002', 'large_blue', 96, 96, 16),
    chargeUp: gp('Sci-fi', 'scifi_charge_up_001', 'large_yellow', 96, 96, 12),
    sparkBurst: Object.assign(gp('Sci-fi', 'scifi_spark_burst_001', 'large_yellow', 128, 128, 12), { warm: 'mul' }),
    bigBoom: gp('Explosions', 'epic_explosion_002', 'large_yellow', 192, 192, 15),
    ringBoom: gp('Explosions', 'symmetrical_explosion_004', 'large_orange', 96, 96, 12),
    smallBoom: gp('Explosions', 'stylized_explosion_001', 'large_yellow', 96, 96, 9),
    wideBoom: gp('Explosions', 'stylized_explosion_003', 'large_yellow', 128, 96, 14),
    fireLoop: gp('Fire', 'fire_looping_004B', 'large_orange', 80, 128, 15),
    voidWarp: gp('Sci-fi', 'scifi_warp_002', 'large_red', 96, 96, 10),
    skullBig: gp('Smoke Bursts', 'stylized_skull_smoke_burst_001', 'large_white', 64, 64, 12),
    voidImpact: gp('Impacts', 'directional_impact_003', 'large_violet', 80, 80, 6),
    venomSplash: gp('Splatters', 'burst_splatter_003', 'large_green', 96, 96, 8),
    redSparkle: gp('Magic Bursts', 'round_sparkle_burst_003', 'large_red', 64, 64, 17),
    // black lightning: the same Thunder/Gigapack sheets, darkened at load time (see DARK below)
    thunderStrikeDark: { src: P.thunder + 'Thunder Strike/Thunderstrike w blur.png', fw: 64, fh: 64, n: 13, dark: true },
    thunderSplashDark: { src: P.thunder + 'Thunder Splash/Thunder splash w blur.png', fw: 48, fh: 48, n: 14, dark: true },
    boltDark: Object.assign(gp('Lightning', 'lightning_strike_001', 'large_violet', 128, 128, 7), { dark: true }),
    burstDark: Object.assign(gp('Lightning', 'lightning_burst_002', 'large_violet', 64, 64, 9), { dark: true }),
    auraDark: Object.assign(gp('Lightning', 'lightning_aura_002', 'large_blue', 96, 96, 16), { dark: true }),
    // ---- Shadow Monarch (assassin: red & blue cuts, blue lightning, black shadows with a blue rim). Same packs, recoloured at load.
    shadowArc: Object.assign(gp('Impacts', 'directional_impact_002', 'small_white', 70, 25, 7), { tint: { mode: 'mul', color: '#b98aff' } }),
    soulMark: Object.assign(gp('Fantasy Spells', 'status_sparkling_001', 'small_yellow', 48, 48, 24), { tint: { mode: 'lum', color: '#9a63ff' } }),
    portalVoid: Object.assign(gp('Sci-fi', 'scifi_warp_002', 'large_red', 96, 96, 10), { tint: { mode: 'lum', color: '#8f55ff' } }),
    smokeDark: Object.assign(gp('Smoke Bursts', 'directional_smoke_burst_001', 'large_white', 64, 64, 21), { dark: true, rim: '#b07aff' }),
    riseSkull: Object.assign(gp('Smoke Bursts', 'stylized_skull_smoke_burst_001', 'large_white', 64, 64, 12), { dark: true, rim: '#b07aff' }),
    shadowMist: Object.assign(gp('Smoke Bursts', 'looping_smoke_burst_002', 'large_gray', 64, 64, 16), { dark: true, rim: '#8f55ff' }),
    fearMark: gp('Fantasy Spells', 'spell_death_001', 'small_red', 32, 32, 50),
    absorbVoid: Object.assign(gp('Fantasy Spells', 'spell_absorb_001', 'large_violet', 128, 128, 31), { tint: { mode: 'lum', color: '#9a63ff' } }),
    sparkVoid: Object.assign(gp('Lightning', 'lightning_burst_003', 'large_violet', 96, 96, 10), { tint: { mode: 'lum', color: '#8f55ff' } }),
    voidCut: Object.assign(gp('Impacts', 'directional_impact_003', 'large_violet', 80, 80, 6), { tint: { mode: 'lum', color: '#ff2e44' } }),
    cutRed: Object.assign(gp('Impacts', 'directional_impact_002', 'small_white', 70, 25, 7), { tint: { mode: 'mul', color: '#ff3a4c' } }),
    cutBlue: Object.assign(gp('Impacts', 'directional_impact_002', 'small_white', 70, 25, 7), { tint: { mode: 'mul', color: '#b07aff' } }),
    arcRed: Object.assign(gp('Impacts', 'directional_impact_002', 'large_white', 140, 50, 7), { tint: { mode: 'mul', color: '#ff3a4c' } }),
    arcBlue: Object.assign(gp('Impacts', 'directional_impact_002', 'large_white', 140, 50, 7), { tint: { mode: 'mul', color: '#b07aff' } }),
    boomRed: Object.assign(gp('Explosions', 'symmetrical_explosion_004', 'large_orange', 96, 96, 12), { tint: { mode: 'mul', color: '#ff3036' } }),
    // blue lightning
    boltBlue: Object.assign(gp('Lightning', 'lightning_strike_001', 'large_violet', 128, 128, 7), { tint: { mode: 'lum', color: '#a46bff' } }),
    burstBlue: Object.assign(gp('Lightning', 'lightning_burst_002', 'large_violet', 64, 64, 9), { tint: { mode: 'lum', color: '#a46bff' } }),
    zapBlue: Object.assign(gp('Lightning', 'lightning_burst_001', 'large_violet', 64, 64, 8), { tint: { mode: 'lum', color: '#c08cff' } }),
    auraBlue: gp('Lightning', 'lightning_aura_002', 'large_blue', 96, 96, 16),
    thunderBlue: { src: P.thunder + 'Thunder Strike/Thunderstrike wo blur.png', fw: 64, fh: 64, n: 13, tint: { mode: 'lum', color: '#9a5cff' } },
    // ---- Shadow Monarch kit v2: black & purple shadow, blue telekinesis (Ruler's Authority)
    // beam: one thin wavy tendril cut from lightning_strike_001 frames 3-5 (x 16-56, y 4-84), recoloured purple
    beamPurple: { src: P.fx + 'Lightning/lightning_strike_001/lightning_strike_001_large_violet/spritesheet.png', fw: 40, fh: 80, n: 3,
      cut: { from: 128, frames: [3, 4, 5], x: 16, y: 4 }, tint: { mode: 'lum', color: '#c08cff' } },
    shadeBurst: Object.assign(gp('Smoke Bursts', 'symmetrical_smoke_burst_001', 'large_brown', 64, 64, 10), { dark: true, rim: '#b07aff' }),
    impDarkP: Object.assign(gp('Impacts', 'symmetrical_impact_004', 'large_yellow', 96, 96, 8), { dark: true, rim: '#a77bff' }),
    fearPurple: Object.assign(gp('Fantasy Spells', 'spell_death_001', 'small_red', 32, 32, 50), { tint: { mode: 'lum', color: '#b48cff' } }),
    sparkleBlue: Object.assign(gp('Fantasy Spells', 'status_sparkling_001', 'small_yellow', 48, 48, 24), { tint: { mode: 'lum', color: '#5fb0ff' } }),
    impBlue2: gp('Impacts', 'symmetrical_impact_002', 'large_blue', 96, 96, 10),
    impDark4: Object.assign(gp('Impacts', 'symmetrical_impact_004', 'large_yellow', 96, 96, 8), { dark: true, rim: '#4fa3ff' }),
    // ---- Limitless Sorcerer (Gojo): Blue, Red, Hollow Purple
    chargeBlue: Object.assign(gp('Sci-fi', 'scifi_charge_up_001', 'large_yellow', 96, 96, 12), { tint: { mode: 'lum', color: '#4fa3ff' } }),
    impBlue3: Object.assign(gp('Impacts', 'symmetrical_impact_003', 'large_yellow', 96, 96, 7), { tint: { mode: 'lum', color: '#4fa3ff' } }),
    tapBlue: gp('Impacts', 'directional_impact_001', 'large_blue', 64, 64, 7),
    lightBurstBlue: Object.assign(gp('Magic Bursts', 'round_light_burst_001', 'large_yellow', 144, 144, 16), { tint: { mode: 'lum', color: '#4fa3ff' } }),
    chargeRed: Object.assign(gp('Sci-fi', 'scifi_charge_up_001', 'large_yellow', 96, 96, 12), { tint: { mode: 'lum', color: '#ff3a3a' } }),
    impRed6: Object.assign(gp('Impacts', 'symmetrical_impact_006', 'large_yellow', 160, 160, 8), { tint: { mode: 'lum', color: '#ff3d3d' } }),
    coneRed: Object.assign(gp('Impacts', 'directional_impact_004', 'large_yellow', 80, 80, 5), { tint: { mode: 'lum', color: '#ff3d3d' } }),
    lightBurstRed: Object.assign(gp('Magic Bursts', 'round_light_burst_001', 'large_yellow', 144, 144, 16), { tint: { mode: 'lum', color: '#ff4a4a' } }),
    orbPurple: gp('Explosions', 'stylized_explosion_002', 'large_violet', 96, 96, 10),
    impPurple3: Object.assign(gp('Impacts', 'symmetrical_impact_003', 'large_yellow', 96, 96, 7), { tint: { mode: 'lum', color: '#b06bff' } }),
    // item icons: one 32x32 strip picked from free icon packs (assets/Item Icons/CREDITS.txt); frame order = G.ITEM_ICON
    items: { src: 'assets/Item Icons/items.png', fw: 32, fh: 32, n: 17 },
    // ---- Anti-Magic Knight (Asta): black anti-magic with a red edge
    amSlash: Object.assign(gp('Impacts', 'directional_impact_002', 'large_white', 140, 50, 7), { dark: true, rim: '#e8202e' }),
    amCut: Object.assign(gp('Impacts', 'directional_impact_002', 'small_white', 70, 25, 7), { dark: true, rim: '#e8202e' }),
    amShock: Object.assign(gp('Impacts', 'symmetrical_impact_004', 'large_yellow', 96, 96, 8), { dark: true, rim: '#e8202e' }),
    amBurst: Object.assign(gp('Lightning', 'lightning_burst_002', 'large_violet', 64, 64, 9), { dark: true, rim: '#e8202e' }),
    amSmoke: Object.assign(gp('Smoke Bursts', 'directional_smoke_burst_001', 'large_white', 64, 64, 21), { dark: true, rim: '#e8202e' }),
    amAura: Object.assign(gp('Lightning', 'lightning_aura_002', 'large_blue', 96, 96, 16), { dark: true, rim: '#e8202e' }),
    // Thunder Effect 02 (strips)
    thunderStrike: { src: P.thunder + 'Thunder Strike/Thunderstrike wo blur.png', fw: 64, fh: 64, n: 13, warm: 'mul' },
    thunderSplash: { src: P.thunder + 'Thunder Splash/Thunder splash wo blur.png', fw: 48, fh: 48, n: 14, warm: 'mul' },
    // Pixel fire asset pack (8-frame strips)
    burn: { src: P.fire + 'fire asset red/Group 4 - 3/Group 4 - 3.png', fw: 16, fh: 32, n: 8 },
    torch: { src: P.fire + 'fire asset red/Group 5 - 2/Group 5 - 2.png', fw: 32, fh: 48, n: 8 },
    torchBlue: { src: P.fire + 'fire asset blue/Group 5 - 2/Group 5 - 2.png', fw: 32, fh: 48, n: 8 },
    orb: { src: P.fire + 'fire asset red/Group 5 - 5/Group 5 - 5.png', fw: 32, fh: 32, n: 8 },
    torchPurple: { src: P.fire + 'fire asset purple/Group 4 - 1/Group 4 - 1.png', fw: 32, fh: 48, n: 8 },
  };

  // Archer projectile: the arrow streak drawn inside Soldier_Attack03 (8th frame, x 759-777, y 48-53)
  const ARROW = { sheet: 'soldier_attack03', sx: 759, sy: 48, sw: 19, sh: 6 };

  G.ASSET_PATHS = P;
  G.SHEETS = SHEETS;
  G.TEX = TEX;
  // Undead dungeon objects (packed from the pack's Objects_separately, 'shadow1' versions)
  Object.assign(PROPS, {
    udGrave1: ["udObj",  17,  314,  16,  18,  8,  17,  5],
    udGrave2: ["udObj",  34,  314,  15,  18,  6,  17,  5],
    udGrave3: ["udObj",  0,  314,  16,  19,  8,  18,  5],
    udGrave4: ["udObj",  494,  284,  16,  21,  8,  20,  5],
    udGrave9: ["udObj",  64,  284,  16,  28,  9,  27,  5],
    udGrave10: ["udObj",  308,  284,  21,  23,  8,  22,  6],
    udGrave11: ["udObj",  330,  284,  24,  23,  9,  22,  6],
    udGrave14: ["udObj",  245,  284,  18,  24,  10,  23,  5],
    udGrave16: ["udObj",  198,  284,  18,  25,  11,  24,  5],
    udGrave17: ["udObj",  264,  284,  18,  24,  10,  23,  5],
    udRock1: ["udObj",  426,  114,  57,  56,  30,  55,  18],
    udRock2: ["udObj",  0,  239,  45,  44,  14,  43,  14],
    udRock3: ["udObj",  337,  239,  34,  33,  19,  32,  11],
    udRock4: ["udObj",  135,  284,  26,  27,  8,  26,  0],
    udRock5: ["udObj",  66,  314,  15,  16,  7,  15,  0],
    udRuin1: ["udObj",  151,  0,  80,  95,  37,  94,  20],
    udRuin2: ["udObj",  173,  114,  79,  62,  49,  61,  20],
    udRuin3: ["udObj",  0,  184,  55,  54,  29,  53,  12],
    udRuin4: ["udObj",  383,  184,  47,  46,  15,  45,  10],
    udRuin5: ["udObj",  411,  284,  29,  22,  17,  21,  0],
    udDeadTree1: ["udObj",  232,  0,  63,  89,  39,  88,  7],
    udDeadTree2: ["udObj",  0,  114,  59,  69,  22,  68,  7],
    udDeadTree3: ["udObj",  431,  184,  46,  45,  27,  44,  5],
    udTree1: ["udObj",  407,  0,  59,  74,  26,  73,  8],
    udTree2: ["udObj",  123,  114,  49,  63,  23,  62,  7],
    udTree3: ["udObj",  103,  239,  32,  41,  16,  40,  5],
    udLog: ["udObj",  136,  239,  84,  39,  39,  38,  10],
    udStump2: ["udObj",  417,  239,  23,  32,  12,  31,  6],
    udStump3: ["udObj",  0,  284,  30,  29,  15,  28,  5],
    udStump4: ["udObj",  441,  239,  41,  31,  20,  30,  0],
    udStump6: ["udObj",  355,  284,  30,  23,  14,  22,  0],
    udSkulls: ["udObj",  183,  184,  71,  51,  28,  50,  16],
    udSkullDoor: ["udObj",  351,  184,  31,  47,  15,  46,  11],
    udLich: ["udObj",  0,  0,  150,  113,  70,  112,  40],
    udCrystal1: ["udObj",  255,  184,  46,  50,  19,  49,  9],
    udCrystal2: ["udObj",  264,  239,  39,  36,  18,  35,  7],
    udCrystal3: ["udObj",  217,  284,  27,  25,  14,  24,  0],
    udCrystal4: ["udObj",  82,  314,  13,  14,  6,  13,  0],
    udArm1: ["udObj",  253,  114,  61,  62,  44,  61,  8],
    udArm2: ["udObj",  380,  114,  45,  57,  17,  56,  6],
    udArm3: ["udObj",  56,  184,  31,  53,  16,  52,  0],
    udArm4: ["udObj",  74,  239,  28,  43,  13,  42,  0],
    udBones1: ["udObj",  441,  284,  26,  22,  9,  21,  0],
    udBones2: ["udObj",  96,  314,  15,  13,  7,  12,  0],
    udBones3: ["udObj",  468,  284,  25,  22,  16,  21,  0],
    udBones4: ["udObj",  31,  284,  32,  29,  16,  28,  0],
    udBones5: ["udObj",  81,  284,  22,  28,  8,  27,  0],
    udBones6: ["udObj",  302,  184,  48,  48,  14,  47,  9],
    udBones8: ["udObj",  46,  239,  27,  44,  16,  43,  0],
    udBones9: ["udObj",  60,  114,  31,  64,  11,  63,  5],
    udBones10: ["udObj",  92,  114,  30,  64,  20,  63,  5],
    udBones11: ["udObj",  372,  239,  44,  33,  38,  32,  0],
    udBones13: ["udObj",  304,  239,  32,  34,  6,  33,  0],
    udBones16: ["udObj",  283,  284,  24,  24,  16,  23,  0],
    udPlant1: ["udObj",  315,  114,  64,  58,  31,  57,  0],
    udPlant2: ["udObj",  221,  239,  42,  37,  18,  36,  0],
    udPlant3: ["udObj",  104,  284,  30,  28,  15,  27,  0],
    udPlant4: ["udObj",  50,  314,  15,  17,  8,  16,  0],
    udThorn1: ["udObj",  296,  0,  110,  80,  55,  79,  0],
    udThorn2: ["udObj",  88,  184,  94,  53,  49,  52,  0],
    udThorn3: ["udObj",  386,  284,  24,  23,  11,  22,  0],
    udThorn5: ["udObj",  162,  284,  35,  27,  4,  26,  0]
  });
  // ground decals inside Details.png: L = grey cracks, roots, stones and crystals; R = beige pebbles (path edges)
  G.UD_DECALS = {"L": [[0, 0, 31, 31], [34, 2, 26, 27], [128, 14, 16, 20], [65, 16, 15, 15], [145, 16, 14, 17], [82, 18, 12, 12], [162, 18, 12, 14], [99, 19, 9, 10], [86, 30, 32, 26], [160, 30, 32, 26], [0, 33, 32, 26], [30, 33, 14, 14], [66, 33, 14, 14], [38, 40, 32, 26], [129, 40, 33, 58], [94, 61, 36, 37], [2, 62, 32, 26], [67, 69, 26, 21], [30, 72, 32, 39], [170, 73, 14, 14], [180, 98, 9, 11], [89, 100, 13, 9], [121, 100, 13, 9], [159, 100, 9, 8], [8, 106, 16, 13], [64, 106, 16, 13], [147, 108, 13, 9], [132, 110, 9, 8], [172, 111, 10, 17], [41, 113, 16, 13], [82, 115, 13, 9], [99, 115, 9, 8], [115, 122, 9, 8], [50, 126, 14, 22], [68, 126, 14, 22], [89, 126, 14, 22], [131, 127, 10, 17], [9, 132, 14, 22], [155, 135, 10, 17], [179, 135, 10, 17], [32, 140, 14, 22], [118, 140, 14, 22], [3, 158, 10, 17], [68, 158, 9, 11], [147, 158, 9, 13], [56, 159, 10, 17], [30, 160, 10, 16], [19, 161, 10, 15], [116, 161, 9, 13], [126, 161, 9, 13], [94, 163, 9, 11], [164, 165, 9, 11], [85, 167, 9, 9]], "R": [[384, 0, 31, 31], [418, 2, 26, 27], [512, 14, 16, 20], [449, 16, 15, 15], [529, 16, 14, 17], [466, 18, 12, 12], [546, 18, 12, 14], [483, 19, 9, 10], [564, 31, 12, 13], [424, 33, 16, 15], [464, 33, 16, 15], [537, 33, 14, 13], [391, 41, 16, 15], [449, 41, 16, 15], [489, 42, 14, 13], [513, 43, 14, 13], [434, 46, 16, 15], [529, 46, 14, 13], [465, 49, 14, 13], [414, 51, 16, 15], [545, 53, 14, 13], [564, 53, 12, 13], [487, 62, 11, 10], [435, 66, 11, 10], [471, 67, 11, 10], [562, 67, 12, 10], [450, 72, 11, 10], [494, 72, 11, 10], [395, 74, 11, 10], [522, 74, 12, 10], [419, 75, 11, 10], [548, 75, 12, 10], [434, 78, 11, 10], [562, 78, 12, 10], [459, 83, 11, 10], [498, 83, 12, 10], [483, 88, 11, 10], [470, 94, 12, 10], [521, 94, 9, 9], [430, 99, 12, 10], [454, 99, 12, 10], [500, 99, 9, 9], [542, 99, 9, 9], [569, 99, 7, 9], [394, 100, 12, 10], [418, 104, 12, 10], [478, 104, 12, 10], [526, 104, 9, 9], [436, 110, 8, 8], [555, 111, 10, 17], [389, 116, 8, 8], [398, 116, 8, 8], [426, 116, 8, 8], [452, 122, 14, 26], [434, 126, 14, 22], [473, 126, 14, 22], [515, 127, 10, 17], [393, 132, 14, 22], [539, 135, 10, 17], [563, 135, 10, 17], [416, 140, 14, 22], [502, 140, 14, 22], [387, 158, 10, 17], [452, 158, 9, 11], [531, 158, 9, 13], [440, 159, 10, 17], [414, 160, 10, 16], [403, 161, 10, 15], [500, 161, 9, 13], [510, 161, 9, 13], [478, 163, 9, 11], [564, 163, 9, 11], [548, 165, 9, 11], [469, 167, 9, 9]]};
  G.PROPS = PROPS;
  G.FX = FX;
  G.ARROW = ARROW;

  // ---------------------------------------------------------------- Loader
  const images = {};
  const failed = [];
  G.img = (key) => images[key];
  G.assetFailures = failed;

  // one image, retried up to 3 times (phones on mobile data sometimes drop requests)
  function load(key, src, optional) {
    return new Promise((res) => {
      let tries = 0;
      const attempt = () => {
        const im = new Image();
        im.onload = () => {
          images[key] = im;
          res();
        };
        im.onerror = () => {
          if (optional) return res(); // optional art (e.g. private test sprites) may be absent
          if (++tries < 3 && !/^data:/.test(src)) { setTimeout(attempt, 400 * tries); return; }
          failed.push(src);
          console.warn('[assets] missing:', src);
          res();
        };
        im.src = /^data:/.test(src) ? src : encodeURI(src) + (tries ? (src.includes('?') ? '&' : '?') + 'retry=' + tries : '');
      };
      attempt();
    });
  }
  // run jobs a few at a time instead of hundreds at once
  function pool(jobs, size, run) {
    let i = 0;
    const next = () => (i < jobs.length ? run(jobs[i++]).then(next) : Promise.resolve());
    return Promise.all(Array.from({ length: Math.min(size, jobs.length) }, next));
  }

  G.loadAssets = function (onProgress) {
    const jobs = [];
    Object.keys(SHEETS).forEach((k) => jobs.push(['sheet:' + k, SHEETS[k].src, SHEETS[k].optional]));
    Object.keys(TEX).forEach((k) => jobs.push(['tex:' + k, TEX[k]]));
    Object.keys(FX).forEach((k) => jobs.push(['fx:' + k, FX[k].src]));
    let done = 0;
    return pool(jobs, 12, ([k, s, o]) =>
      load(k, s, o).then(() => {
        done++;
        onProgress && onProgress(done / jobs.length);
      })
    ).then(() => {
      // derive frame counts for character sheets from their real widths
      Object.keys(SHEETS).forEach((k) => {
        const im = images['sheet:' + k];
        SHEETS[k].n = im ? Math.max(1, Math.floor(im.width / SHEETS[k].fw)) : 0;
      });
      // tinted copies of character sheets: '~shadow' = shadow soldiers (black core, purple rim), '~monarch' = the darkened hero
      Object.keys(SHEETS).forEach((k) => {
        const im = images['sheet:' + k];
        if (!im || k.includes('~')) return;
        // only the sheets the Shadow Monarch's soldiers and afterimages use get copies (saves memory on phones)
        // (the Shadow Monarch's afterimages are made from his own sword-less sheets)
        const styles = /^knight_/.test(k) ? ['shadow', 'iron'] : /^sam_/.test(k) ? ['shadow', 'cursed'] : /^adv_/.test(k) ? ['shadow'] : []; // iron = Oathbound Knight, cursed = Cursed Samurai
        styles.forEach((style) => {
          const src = /^adv_/.test(k) && images['sheet:jw_' + k.slice(4)] ? images['sheet:jw_' + k.slice(4)] : im;
          images['sheet:' + k + '~' + style] = tintSheet(src, style);
          SHEETS[k + '~' + style] = Object.assign({}, SHEETS[k]);
        });
      });
      // the Limitless Sorcerer's own hero sheets stand in for the Adventurer's ('adv_idle_down~gojo' = 'gojo_idle_down')
      Object.keys(SHEETS).forEach((k) => {
        const m = /^(gojo|jw|zen|asta|luffy)_/.exec(k);
        if (!m || k.includes('~') || !images['sheet:' + k]) return;
        const a = 'adv_' + k.slice(m[0].length) + '~' + { gojo: 'gojo', jw: 'jinwoo', zen: 'zenitsu', asta: 'asta', luffy: 'luffy' }[m[1]];
        images['sheet:' + a] = images['sheet:' + k]; SHEETS[a] = Object.assign({}, SHEETS[k]);
      });
      Object.keys(FX).forEach((k) => {
        let im = images['fx:' + k];
        // gold tint for the black & yellow kit: 'mul' warms pale/white sheets, 'lum' recolours blue ones
        if (im && FX[k].cut) { // build a strip from a region of chosen frames of an existing sheet
          const c = FX[k].cut, cv = document.createElement('canvas');
          cv.width = FX[k].fw * c.frames.length; cv.height = FX[k].fh;
          const g = cv.getContext('2d');
          c.frames.forEach((f, i) => g.drawImage(im, f * c.from + c.x, c.y, FX[k].fw, FX[k].fh, i * FX[k].fw, 0, FX[k].fw, FX[k].fh));
          images['fx:' + k] = im = cv;
        }
        const tint = FX[k].tint || (FX[k].warm === 'lum' ? { mode: 'lum', color: '#ffc93a' } : FX[k].warm === 'void' ? { mode: 'lum', color: '#8a5cff' } : FX[k].warm ? { mode: 'mul', color: '#ffdd55' } : null);
        if (im && tint) {
          const c = document.createElement('canvas');
          c.width = im.width; c.height = im.height;
          const g = c.getContext('2d');
          if (tint.mode === 'lum') { // recolour any hue, keep the sheet's light and dark
            g.fillStyle = tint.color; g.fillRect(0, 0, c.width, c.height);
            g.globalCompositeOperation = 'luminosity'; g.drawImage(im, 0, 0);
          } else { // multiply: turns white/pale sheets into the colour
            g.drawImage(im, 0, 0);
            g.globalCompositeOperation = 'multiply'; g.fillStyle = tint.color; g.fillRect(0, 0, c.width, c.height);
          }
          g.globalCompositeOperation = 'destination-in'; g.drawImage(im, 0, 0); // keep the original shape/alpha
          images['fx:' + k] = im = c;
        }
        // "black lightning": an existing sheet redrawn with a near-black overlay on its own pixels
        if (im && FX[k].dark) {
          const c = document.createElement('canvas');
          c.width = im.width; c.height = im.height;
          const g = c.getContext('2d');
          // 1) a yellow copy, stamped 1px around in 8 directions -> crisp yellow outline
          const y = document.createElement('canvas');
          y.width = im.width; y.height = im.height;
          const yg = y.getContext('2d');
          yg.drawImage(im, 0, 0);
          yg.globalCompositeOperation = 'source-atop';
          yg.fillStyle = FX[k].rim || '#ffd23f';
          yg.fillRect(0, 0, y.width, y.height);
          for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1], [-1, -1], [1, -1], [-1, 1], [1, 1]]) g.drawImage(y, dx, dy);
          // 2) the near-black core on top (compositing only, so it also works from file://)
          const d = document.createElement('canvas');
          d.width = im.width; d.height = im.height;
          const dg = d.getContext('2d');
          dg.drawImage(im, 0, 0);
          dg.globalCompositeOperation = 'source-atop';
          dg.fillStyle = 'rgba(12,9,4,0.9)';
          dg.fillRect(0, 0, d.width, d.height);
          g.drawImage(d, 0, 0);
          images['fx:' + k] = im = c;
        }
        FX[k].ok = !!im;
        if (im) FX[k].cols = Math.max(1, Math.floor(im.width / FX[k].fw));
      });
      return failed;
    });
  };

  function tintSheet(im, style) {
    const mk = () => { const c = document.createElement('canvas'); c.width = im.width; c.height = im.height; return c; };
    const c = mk(), g = c.getContext('2d');
    if (style === 'shadow') {
      const r = mk(), rg = r.getContext('2d');
      rg.drawImage(im, 0, 0); rg.globalCompositeOperation = 'source-atop'; rg.fillStyle = '#a77bff'; rg.fillRect(0, 0, r.width, r.height);
      for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) g.drawImage(r, dx, dy);
      const d = mk(), dg = d.getContext('2d');
      dg.drawImage(im, 0, 0); dg.globalCompositeOperation = 'source-atop'; dg.fillStyle = 'rgba(16,8,30,0.84)'; dg.fillRect(0, 0, d.width, d.height);
      g.drawImage(d, 0, 0);
    } else { // keep the sprite's detail, shift its colours: monarch = cold purple-black, iron = dark steel, cursed = sickly green
      const T = { monarch: ['#8e98c6', 'rgba(14,6,30,0.18)'], iron: ['#77808f', 'rgba(8,10,18,0.3)'], cursed: ['#a6cc96', 'rgba(16,34,8,0.22)'] }[style] || ['#8e98c6', 'rgba(14,6,30,0.18)'];
      g.drawImage(im, 0, 0);
      g.globalCompositeOperation = 'multiply'; g.fillStyle = T[0]; g.fillRect(0, 0, c.width, c.height);
      g.globalCompositeOperation = 'source-atop'; g.fillStyle = T[1]; g.fillRect(0, 0, c.width, c.height);
      g.globalCompositeOperation = 'destination-in'; g.drawImage(im, 0, 0);
    }
    return c;
  }
  G.tintedSheet = (key, style) => (style && images['sheet:' + key + '~' + style] ? key + '~' + style : key);

  // URL usable in CSS/IMG for UI icons (a single effect frame shown via background-position)
  // tone: 'gold' warms any sheet to the kit's yellow, 'dark' makes black lightning with a gold rim (CSS filters, see --icof)
  const ICON_TONE = {
    gold: 'sepia(1) saturate(3.2) hue-rotate(-6deg) brightness(1.08)',
    void: 'sepia(1) saturate(2.6) hue-rotate(215deg) brightness(0.95)',
    red: 'sepia(1) saturate(6) hue-rotate(-45deg) brightness(0.95)',
    blue: 'sepia(1) saturate(3.4) hue-rotate(175deg) brightness(1.05)',
    dark: 'brightness(0.12) drop-shadow(1px 0 0 #ffd23f) drop-shadow(-1px 0 0 #ffd23f) drop-shadow(0 1px 0 #ffd23f) drop-shadow(0 -1px 0 #ffd23f)',
  };
  G.fxIconStyle = function (fxKey, frame, size, tone) {
    const d = FX[fxKey];
    if (!d) return '';
    const cols = d.cols || Math.max(1, Math.round(d.n));
    const f = Math.min(frame, d.n - 1);
    const cx = f % cols, cy = Math.floor(f / cols);
    const s = size / Math.max(d.fw, d.fh);
    const im = images['fx:' + fxKey];
    const W = im ? im.width : d.fw * d.n, H = im ? im.height : d.fh;
    return `background-image:url("${encodeURI(d.src)}");background-size:${W * s}px ${H * s}px;` +
      `background-position:${-cx * d.fw * s + (size - d.fw * s) / 2}px ${-cy * d.fh * s + (size - d.fh * s) / 2}px;` +
      (ICON_TONE[tone] ? `--icof:${ICON_TONE[tone]};` : '');
  };
})();
