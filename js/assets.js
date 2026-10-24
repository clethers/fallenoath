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
    knight: 'assets/FREE_Knight 2D Pixel Art v1.2/Sprites/',
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
  });
  ['IDLE', 'RUN', 'WALK', 'ATTACK 1', 'ATTACK 2', 'ATTACK 3', 'BLOCK', 'HURT', 'DEATH'].forEach((n) => {
    SHEETS['knight_' + n.replace(' ', '').toLowerCase()] = { src: P.knight + n + '.png', fw: 112, fh: 96 };
  });
  ['Idle', 'Walk', 'Attack01', 'Attack02', 'Hit', 'Death'].forEach((n) => {
    SHEETS['orc_' + n.toLowerCase()] = { src: P.tiny + 'Orc/Orc_' + n + '.png', fw: 100, fh: 100 };
  });
  ['Idle', 'Walk', 'Attack01', 'Attack02', 'Attack03', 'Hit', 'Death'].forEach((n) => {
    SHEETS['soldier_' + n.toLowerCase()] = { src: P.tiny + 'Soldier/Soldier_' + n + '.png', fw: 100, fh: 100 };
  });

  // ---- Static textures (tilesets / props)
  const TEX = {
    grass: P.tex + 'TX Tileset Grass.png',
    stone: P.tex + 'TX Tileset Stone Ground.png',
    wall: P.tex + 'TX Tileset Wall.png',
    struct: P.tex + 'TX Struct.png',
    props: P.tex + 'Extra/TX Props with Shadow.png',
    plants: P.tex + 'Extra/TX Plant with Shadow.png',
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
    hitCrit: gp('Impacts', 'symmetrical_impact_006', 'small_yellow', 80, 80, 8),
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
    statusStun: gp('Lightning', 'lightning_aura_002', 'small_blue', 48, 48, 16),
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
    // elemental skill-tree effects
    lbolt1: gp('Lightning', 'lightning_burst_001', 'large_violet', 64, 64, 8),
    lbolt2: gp('Lightning', 'lightning_burst_002', 'large_violet', 64, 64, 9),
    staticAura: gp('Lightning', 'lightning_aura_002', 'large_blue', 96, 96, 16),
    chargeUp: gp('Sci-fi', 'scifi_charge_up_001', 'large_yellow', 96, 96, 12),
    sparkBurst: gp('Sci-fi', 'scifi_spark_burst_001', 'large_yellow', 128, 128, 12),
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
    // Thunder Effect 02 (strips)
    thunderStrike: { src: P.thunder + 'Thunder Strike/Thunderstrike wo blur.png', fw: 64, fh: 64, n: 13 },
    thunderSplash: { src: P.thunder + 'Thunder Splash/Thunder splash wo blur.png', fw: 48, fh: 48, n: 14 },
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
  G.PROPS = PROPS;
  G.FX = FX;
  G.ARROW = ARROW;

  // ---------------------------------------------------------------- Loader
  const images = {};
  const failed = [];
  G.img = (key) => images[key];
  G.assetFailures = failed;

  function load(key, src) {
    return new Promise((res) => {
      const im = new Image();
      im.onload = () => {
        images[key] = im;
        res();
      };
      im.onerror = () => {
        failed.push(src);
        console.warn('[assets] missing:', src);
        res();
      };
      im.src = encodeURI(src);
    });
  }

  G.loadAssets = function (onProgress) {
    const jobs = [];
    Object.keys(SHEETS).forEach((k) => jobs.push(['sheet:' + k, SHEETS[k].src]));
    Object.keys(TEX).forEach((k) => jobs.push(['tex:' + k, TEX[k]]));
    Object.keys(FX).forEach((k) => jobs.push(['fx:' + k, FX[k].src]));
    let done = 0;
    return Promise.all(
      jobs.map(([k, s]) =>
        load(k, s).then(() => {
          done++;
          onProgress && onProgress(done / jobs.length);
        })
      )
    ).then(() => {
      // derive frame counts for character sheets from their real widths
      Object.keys(SHEETS).forEach((k) => {
        const im = images['sheet:' + k];
        SHEETS[k].n = im ? Math.max(1, Math.floor(im.width / SHEETS[k].fw)) : 0;
      });
      Object.keys(FX).forEach((k) => {
        let im = images['fx:' + k];
        // "black lightning": an existing sheet redrawn with a near-black overlay on its own pixels
        if (im && FX[k].dark) {
          const c = document.createElement('canvas');
          c.width = im.width; c.height = im.height;
          const g = c.getContext('2d');
          g.drawImage(im, 0, 0);
          g.globalCompositeOperation = 'source-atop';
          g.fillStyle = 'rgba(12,9,4,0.86)';
          g.fillRect(0, 0, c.width, c.height);
          images['fx:' + k] = im = c;
        }
        FX[k].ok = !!im;
        if (im) FX[k].cols = Math.max(1, Math.floor(im.width / FX[k].fw));
      });
      return failed;
    });
  };

  // URL usable in CSS/IMG for UI icons (a single effect frame shown via background-position)
  G.fxIconStyle = function (fxKey, frame, size) {
    const d = FX[fxKey];
    if (!d) return '';
    const cols = d.cols || Math.max(1, Math.round(d.n));
    const f = Math.min(frame, d.n - 1);
    const cx = f % cols, cy = Math.floor(f / cols);
    const s = size / Math.max(d.fw, d.fh);
    const im = images['fx:' + fxKey];
    const W = im ? im.width : d.fw * d.n, H = im ? im.height : d.fh;
    return `background-image:url("${encodeURI(d.src)}");background-size:${W * s}px ${H * s}px;` +
      `background-position:${-cx * d.fw * s + (size - d.fw * s) / 2}px ${-cy * d.fh * s + (size - d.fh * s) / 2}px;`;
  };
})();
