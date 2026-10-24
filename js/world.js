/* =========================================================================
   FALLEN OATH — Area maps built from the Pixel Art Top Down tilesets
   ========================================================================= */
(function () {
  'use strict';
  const G = (window.G = window.G || {});
  const T = 16;

  function mulberry(seed) {
    let a = seed >>> 0;
    return function () {
      a |= 0; a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  // Tile coordinates (col,row) inside TX Tileset Grass.png (16px grid), verified visually
  const GRASS_PLAIN = []; for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) GRASS_PLAIN.push([c, r]);
  const GRASS_DECO = []; for (let r = 0; r < 8; r++) for (let c = 8; c < 16; c++) GRASS_DECO.push([c, r]);
  const PATH_FULL = [[0, 8], [1, 8], [5, 8], [6, 8], [0, 9], [1, 9], [2, 9], [5, 9], [6, 9], [8, 9], [9, 9], [8, 10], [9, 10], [2, 10], [3, 10], [11, 9], [12, 9], [11, 10]];
  const PATH_EDGE = [[2, 8], [3, 8], [3, 9], [0, 10], [1, 10], [10, 9], [13, 9], [14, 9], [15, 9], [10, 10], [12, 10], [13, 10], [14, 10], [15, 10],
    [0, 11], [1, 11], [2, 11], [3, 11], [5, 11], [6, 11], [0, 12], [1, 12], [2, 12], [3, 12], [5, 12], [6, 12], [8, 12], [11, 12], [0, 13], [1, 13], [2, 13],
    [3, 13], [5, 13], [6, 13], [12, 13], [15, 13], [0, 14], [1, 14], [2, 14], [3, 14], [5, 14], [6, 14], [9, 14], [10, 14], [0, 15], [3, 15], [6, 15], [8, 15], [9, 15], [10, 15], [11, 15]];
  // TX Tileset Stone Ground.png plain floor tiles
  const STONE_PLAIN = []; for (let c = 0; c < 6; c++) { STONE_PLAIN.push([c, 10], [c, 11], [c, 14], [c, 15]); }
  STONE_PLAIN.push([8, 6], [9, 6], [8, 7], [9, 7]);
  const STONE_RIVET = [[11, 8], [13, 8], [12, 9], [14, 9]];

  const BREAKABLE = { crate: 1, crateSmall: 1, barrel: 1, pot: 1, vase: 1, vase2: 1 };
  G.BREAKABLE = BREAKABLE;

  /** Build an area: returns {w,h,W,H,ground(canvas),props[],playMin/Max, spawnPoints[], start, chest} */
  G.buildArea = function (area) {
    const rand = mulberry(area.seed * 7919 + 13);
    const pick = (arr) => arr[Math.floor(rand() * arr.length)];
    const w = area.w, h = area.h, W = w * T, H = h * T;
    const theme = area.theme;
    const kind = []; // per-cell: 0 grass, 1 path, 2 stone
    for (let y = 0; y < h; y++) { kind.push(new Array(w).fill(theme === 'shrine' || theme === 'trial' ? 2 : 0)); }
    const set = (x, y, v) => { if (x >= 0 && y >= 0 && x < w && y < h) kind[y][x] = v; };

    // ---------- layout of paths / stone zones
    const cx = Math.floor(w / 2);
    if (theme === 'grass' || theme === 'graves') {
      // winding central path + cross path
      let px = cx;
      for (let y = 3; y < h; y++) {
        if (rand() < 0.3) px += rand() < 0.5 ? -1 : 1;
        px = Math.max(3, Math.min(w - 4, px));
        for (let dx = -1; dx <= 1; dx++) if (rand() < 0.92) set(px + dx, y, 1);
      }
      const ry = Math.floor(h * 0.45);
      for (let x = 2; x < w - 2; x++) if (rand() < 0.85) { set(x, ry, 1); if (rand() < 0.6) set(x, ry + 1, 1); }
      if (theme === 'grass') { // courtyard plaza
        for (let y = 5; y < 10; y++) for (let x = cx - 3; x <= cx + 3; x++) if (rand() < 0.8) set(x, y, 1);
      }
    } else if (theme === 'ruins') {
      for (let y = 4; y < h - 4; y++) for (let x = 3; x < w - 3; x++) {
        const edge = x === 3 || x === w - 4 || y === 4 || y === h - 5;
        if (!edge || rand() < 0.6) set(x, y, 2);
      }
      for (let y = h - 4; y < h; y++) for (let dx = -1; dx <= 1; dx++) set(cx + dx, y, 1);
    } else {
      // shrine / trial: stone everywhere with grass margins
      for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (x < 2 || x >= w - 2 || (rand() < 0.04)) set(x, y, rand() < 0.75 ? 0 : 2);
    }

    // ---------- render ground
    const ground = document.createElement('canvas');
    ground.width = W; ground.height = H + 72;
    const g = ground.getContext('2d');
    g.imageSmoothingEnabled = false;
    const grass = G.img('tex:grass'), stone = G.img('tex:stone');
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const k = kind[y][x];
      let src = grass, t;
      if (k === 0) t = rand() < 0.12 ? pick(GRASS_DECO) : pick(GRASS_PLAIN);
      else if (k === 1) {
        const nb = [kind[y - 1] && kind[y - 1][x], kind[y + 1] && kind[y + 1][x], kind[y][x - 1], kind[y][x + 1]];
        const edge = nb.some((v) => v !== 1);
        t = edge ? (rand() < 0.55 ? pick(PATH_EDGE) : pick(PATH_FULL)) : rand() < 0.85 ? pick(PATH_FULL) : pick(PATH_EDGE);
      } else { src = stone; t = rand() < 0.06 ? pick(STONE_RIVET) : pick(STONE_PLAIN); }
      if (src) g.drawImage(src, t[0] * T, t[1] * T, T, T, x * T, y * T, T, T);
    }
    // large stone slabs as floor decals for stone themes
    if (stone && (theme === 'shrine' || theme === 'trial' || theme === 'ruins')) {
      const slabs = theme === 'ruins' ? 3 : 5;
      for (let i = 0; i < slabs; i++) {
        const big = rand() < 0.5;
        const sx = big ? 160 : 0, sw = big ? 96 : 96, sh = 96;
        const dx = Math.floor((3 + rand() * (w - 9)) ) * T, dy = Math.floor((5 + rand() * (h - 12))) * T;
        g.drawImage(stone, sx, 0, sw, sh, dx, dy, sw, sh);
      }
    }

    // ---------- props
    const props = [];
    const occupied = [];
    const start = { x: W / 2, y: H - 48 };
    const free = (x, y, r) => {
      if (Math.hypot(x - start.x, y - start.y) < 46) return false;
      return occupied.every((o) => Math.hypot(o.x - x, o.y - y) > o.r + r);
    };
    const add = (key, x, y, opts) => {
      const d = G.PROPS[key];
      if (!d) return null;
      const p = Object.assign({ key, x: Math.round(x), y: Math.round(y), r: d[7], breakable: !!BREAKABLE[key] }, opts || {});
      props.push(p);
      occupied.push({ x: p.x, y: p.y, r: Math.max(p.r, 8) + 4 });
      return p;
    };
    const scatter = (keys, n, margin, cond) => {
      let tries = 0, made = 0;
      while (made < n && tries++ < n * 40) {
        const x = margin + rand() * (W - margin * 2), y = 80 + rand() * (H - 140);
        const cell = kind[Math.floor(y / T)] && kind[Math.floor(y / T)][Math.floor(x / T)];
        if (cond && !cond(cell, x, y)) continue;
        const key = pick(keys);
        const r = (G.PROPS[key] || [])[7] || 6;
        if (!free(x, y, r + 6)) continue;
        add(key, x, y);
        made++;
      }
    };

    // perimeter: top wall line (decorative, behind play area), side borders
    const deco = []; // drawn before entities, never collide
    for (let x = 0; x < W; x += 130) deco.push({ key: 'wallFront', x, y: 66 });
    for (let x = 0; x < W; x += 130) deco.push({ key: 'wallFront', x, y: H + 66 });
    for (let y = 60; y < H; y += 98) { deco.push({ key: 'wallEdgeV', x: 0, y, top: true }); deco.push({ key: 'wallEdgeV2', x: W - 10, y, top: true }); }
    for (let x = 0; x < W; x += 98) deco.push({ key: 'wallEdgeH', x, y: H - 10, top: true });

    const notPath = (c) => c !== 1;
    if (theme === 'grass') {
      add('tree1', 26, 120); add('tree2', W - 30, 200); add('tree3', 30, H - 120); add('tree2', W - 34, H - 170);
      add('statue', W / 2, 84); add('lantern', W / 2 - 40, 82); add('lantern', W / 2 + 40, 82);
      add('well', 50, H * 0.62);
      scatter(['bush3', 'bush4', 'bush6', 'bush5'], 7, 24, notPath);
      scatter(['crate', 'crateSmall', 'barrel', 'pot', 'vase', 'vase2'], 10, 26, notPath);
      scatter(['rock3', 'rock5', 'rock6', 'boulder'], 4, 26, notPath);
      scatter(['bush1', 'bush2', 'tuft1', 'tuft2', 'tuft3', 'tuft4', 'rock1', 'rock2'], 22, 16, notPath);
      add('signEast', W / 2 + 26, H - 70);
    } else if (theme === 'graves') {
      add('tree3', 26, 130); add('tree1', W - 40, 150); add('tree2', 34, H - 150);
      add('coffin', W / 2, 86); add('lantern', W / 2 - 36, 84); add('lantern', W / 2 + 36, 84);
      for (let row = 0; row < 4; row++) for (let col = 0; col < 3; col++) {
        const side = col < 2 ? 40 + col * 34 : W - 60;
        const x = side + (rand() - 0.5) * 8, y = 150 + row * 78 + (rand() - 0.5) * 10;
        if (free(x, y, 12)) add(pick(['ripGrave', 'smallGrave', 'cross', 'brokenTomb', 'ripGrave']), x, y);
        const x2 = W - side + (rand() - 0.5) * 8;
        if (free(x2, y + 20, 12)) add(pick(['ripGrave', 'smallGrave', 'cross', 'brokenTomb']), x2, y + 20);
      }
      add('sarcophagus', W / 2 + 50, H * 0.33);
      scatter(['bush3', 'bush6', 'bush4'], 5, 24, notPath);
      scatter(['crateSmall', 'pot', 'vase', 'vase2', 'barrel'], 9, 26, notPath);
      scatter(['bush1', 'bush2', 'tuft5', 'tuft6', 'tuft7', 'tuft8', 'rock1', 'rock2', 'rubble1'], 20, 16, notPath);
    } else if (theme === 'ruins') {
      props.push({ key: 'wallMossB', x: 42, y: H * 0.55, r: 0, wall: { w: 66, h: 30 } });
      props.push({ key: 'wallC', x: W - 42, y: H * 0.55, r: 0, wall: { w: 66, h: 30 } });
      occupied.push({ x: 42, y: H * 0.55, r: 40 }, { x: W - 42, y: H * 0.55, r: 40 });
      add('arch', W / 2, 84);
      [0.3, 0.42, 0.7, 0.82].forEach((f, i) => { add(i % 2 ? 'brokenPillar' : 'pillar', W / 2 - 64, H * f); add(i % 2 ? 'pillar' : 'brokenPillar', W / 2 + 64, H * f); });
      scatter(['rubble1', 'rubble2', 'rubble3', 'rock1', 'rock2', 'tuft2', 'tuft6'], 24, 16);
      scatter(['crate', 'barrel', 'pot', 'vase', 'crateSmall'], 10, 30);
      scatter(['boulder', 'rock5', 'rock6', 'leanSlab', 'leanSlab2'], 5, 30);
      add('tree3', 22, H - 80); add('tree1', W - 24, H - 60);
    } else if (theme === 'shrine') {
      deco.push({ key: 'altar', x: W / 2, y: 190, floor: true });
      add('statue', W / 2, 96);
      [[-70, 150], [70, 150], [-70, 240], [70, 240]].forEach(([dx, y]) => { const l = add('lantern', W / 2 + dx, y); l.torch = 'torchBlue'; });
      for (let i = 0; i < 4; i++) { add('pillar', 40, 300 + i * 70); add('pillar', W - 40, 300 + i * 70); }
      add('runeStone', W / 2 - 40, 98); add('runePillar', W / 2 + 40, 100);
      scatter(['rubble1', 'rubble2', 'rock1', 'rock2', 'tuft1', 'tuft3'], 16, 20);
      scatter(['vase', 'vase2', 'pot', 'crateSmall'], 8, 50);
    } else { // trial arena
      deco.push({ key: 'altar', x: W / 2, y: H / 2 + 30, floor: true });
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2, x = W / 2 + Math.cos(a) * 120, y = H / 2 + Math.sin(a) * 160;
        const l = add(i % 2 ? 'lantern' : 'brokenPillar', x, y);
        if (i % 2) l.torch = 'torchPurple';
      }
      add('statue', W / 2, 92);
      scatter(['rubble1', 'rubble2', 'rubble3', 'rock1', 'rock2'], 14, 20);
    }
    if (theme === 'grass' || theme === 'graves' || theme === 'ruins') {
      props.filter((p) => p.key === 'lantern').forEach((l) => (l.torch = 'torch'));
    }

    // chest spot near top (opened after clearing)
    let chest = null;
    if (!area.endless) {
      const cy = theme === 'shrine' ? 140 : 118;
      chest = { key: 'chestClosed', x: W / 2, y: cy, r: 10, chest: true, open: false, active: false };
      // remove anything overlapping the chest
      for (let i = props.length - 1; i >= 0; i--) if (Math.hypot(props[i].x - chest.x, props[i].y - chest.y) < 22 && props[i].key !== 'statue') props.splice(i, 1);
      props.push(chest);
    }

    // spawn points along edges, away from the start
    const spawnPoints = [];
    for (let i = 0; i < 10; i++) {
      const t = i / 9;
      spawnPoints.push({ x: 30 + t * (W - 60), y: 96 + rand() * 30 });
      spawnPoints.push({ x: i % 2 ? 24 : W - 24, y: 110 + t * (H * 0.55) });
    }
    const play = { x0: 14, y0: 74, x1: W - 14, y1: H - 16 };
    return { area, w, h, W, H, ground, props, deco, spawnPoints, start, chest, play, kind };
  };

  // Draw a prop atlas entry with its anchor at (x,y)
  G.drawProp = function (ctx, key, x, y, alpha) {
    const d = G.PROPS[key];
    if (!d) return;
    const im = G.img('tex:' + d[0]);
    if (!im) return;
    if (alpha != null) ctx.globalAlpha = alpha;
    ctx.drawImage(im, d[1], d[2], d[3], d[4], Math.round(x - d[5]), Math.round(y - d[6]), d[3], d[4]);
    if (alpha != null) ctx.globalAlpha = 1;
  };
  G.drawDeco = function (ctx, o) {
    const d = G.PROPS[o.key];
    if (!d) return;
    const im = G.img('tex:' + d[0]);
    if (!im) return;
    if (o.top) ctx.drawImage(im, d[1], d[2], d[3], d[4], o.x, o.y, d[3], d[4]);
    else ctx.drawImage(im, d[1], d[2], d[3], d[4], Math.round(o.x - d[5]), Math.round(o.y - d[6]), d[3], d[4]);
  };

  // obstacle collision for a circle at (x,y,r); mutates and returns pos
  G.collide = function (map, pos, r) {
    const pl = map.play;
    for (const p of map.props) {
      if (p.dead) continue;
      if (p.wall) {
        const hw = p.wall.w / 2, top = p.y - p.wall.h;
        const nx = Math.max(p.x - hw, Math.min(pos.x, p.x + hw)), ny = Math.max(top, Math.min(pos.y, p.y));
        const dx = pos.x - nx, dy = pos.y - ny, d = Math.hypot(dx, dy);
        if (d < r) {
          if (d > 0.001) { pos.x = nx + (dx / d) * r; pos.y = ny + (dy / d) * r; }
          else pos.y = p.y + r;
        }
        continue;
      }
      if (!p.r) continue;
      const dx = pos.x - p.x, dy = pos.y - p.y, d = Math.hypot(dx, dy), m = p.r + r;
      if (d < m && d > 0.001) { pos.x = p.x + (dx / d) * m; pos.y = p.y + (dy / d) * m; }
    }
    pos.x = Math.max(pl.x0 + r, Math.min(pl.x1 - r, pos.x));
    pos.y = Math.max(pl.y0 + r, Math.min(pl.y1 - r, pos.y));
    return pos;
  };
})();
