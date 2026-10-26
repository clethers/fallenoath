/* =========================================================================
   FALLEN OATH — Anti-Magic Knight class (DRAFT for testing). Inspired by
   Asta (Black Clover): Bull Thrust, Anti-Magic Body, Black Divider,
   Black Hurricane, Endless Training, Devil's Grudge, Black Meteorite and
   Black Asta (Devil Union).
   Plugs into the game through G.game.classSkills.antimagic (see js/game.js),
   so the locked Storm Blade code is never touched.
   Hero: the Adventurer recoloured (ash hair, headband, black outfit) with a
   giant black sword ('adv_*~asta' sheets). Effects: the streaks, crescent waves,
   rings, cracks, the hurricane and the Devil Union flames are drawn in code
   (black core, red edge); Gigapack sheets darkened at load are used for hits.
   ========================================================================= */
(function () {
  'use strict';
  const G = window.G;
  const game = G.game;
  let K = null;

  const isMine = () => G.profile && G.profile.path === 'antimagic';
  const live = (run) => game.run === run;

  // damage without the shared crit spark
  function strike(run, e, mult, o) {
    o = o || {};
    const pl = run.player;
    const r = K.rollDamage(K.power(run), mult, e.defense, pl.stats.crit, pl.stats.critDmg);
    const dealt = K.damageEnemy(run, e, r.dmg, { crit: r.crit, skill: true, knock: o.knock == null ? 8 : o.knock });
    K.hitStop(run, o.stop == null ? 0.04 : o.stop);
    return dealt;
  }
  const dirAngle = (pl) => { const v = K.DIRV[pl.dir] || [1, 0]; return Math.atan2(v[1], v[0]); };
  function aimAngle(run, range) {
    const pl = run.player, t = K.nearestEnemy(run, pl, range);
    if (t) { K.faceToward(pl, t.x, t.y); return { a: Math.atan2(t.y - pl.y, t.x - pl.x), t }; }
    return { a: dirAngle(pl), t: null };
  }

  // ---- code-drawn anti-magic shapes: black core, red edge (streaks, crescent waves, rings, cracks)
  const RED = '#e8202e', DARK = '#0c0a0d';
  const BIG = 1.7; // all of Asta's effects are drawn this much larger
  function shape(run, o) { o.t0 = run.time; (run.amFx || (run.amFx = [])).push(o); return o; }
  // a quick black slash mark across a target (instead of the busy Gigapack cut sheet)
  function cut(run, x, y, rot) { shape(run, { kind: 'cut', x, y, a: rot - Math.PI / 2 + 0.7, life: 0.22, len: 14 * BIG }); }

  // a black anti-magic crescent travelling along a line, hitting each enemy once
  function wave(run, x, y, a, range, width, mult, scale) {
    const hit = new Set(), steps = Math.max(3, Math.round(range / 22)), dt = 0.035;
    shape(run, { kind: 'crescent', x, y: y - 12, a, speed: range / (steps * dt), life: steps * dt + 0.08, r: (16 * scale + width * 0.6) * BIG });
    for (let s = 0; s <= steps; s++) K.schedule(run, s * dt, () => {
      if (!live(run)) return;
      const d = (range * s) / steps, wx = x + Math.cos(a) * d, wy = y + Math.sin(a) * d;
      K.enemiesNear(run, wx, wy, width).forEach((e) => {
        if (hit.has(e)) return;
        hit.add(e);
        strike(run, e, mult, { knock: 14, stop: 0.03 });
        cut(run, e.x, K.bodyY(e), a + Math.PI / 2);
      });
    });
    return hit;
  }

  // ---------------------------------------------------------------- skills
  const CAST = {
    // ---- Lv 1: Bull Thrust - charge forward sword-first, piercing everything in the path
    bullthrust(run, sk, rank, mult) {
      const pl = run.player;
      const { a } = aimAngle(run, sk.dist + 40);
      const tx = pl.x + Math.cos(a) * sk.dist, ty = pl.y + Math.sin(a) * sk.dist;
      G.voice('light', { minGap: 0 });
      G.sfx('slash', { minGap: 0, vol: 0.9, rate: 0.75 });
      // a black streak follows the hero from the start point (drawn until it fades)
      const st = shape(run, { kind: 'streak', x0: pl.x, y0: pl.y - 12, x1: pl.x, y1: pl.y - 12, life: sk.time + 0.25, w: 4 });
      st.follow = () => { st.x1 = pl.x; st.y1 = pl.y - 12; };
      K.startDash(run, tx, ty, sk.time, (e) => {
        strike(run, e, mult, { knock: 22, stop: 0.05 });
        cut(run, e.x, K.bodyY(e), a + Math.PI / 2);
        G.sfx('slashHit', { minGap: 40, rate: 0.85 });
        K.shake(run, 2.5);
      }, () => {
        st.follow = null;
        shape(run, { kind: 'ring', x: pl.x + Math.cos(a) * 10, y: pl.y - 10 + Math.sin(a) * 10, r0: 6, r1: 18 * BIG, life: 0.26, w: 3 });
      });
      return true;
    },

    // ---- Lv 3: Black Divider - a big swing that sends a wide anti-magic wave
    blackdivider(run, sk, rank, mult) {
      const pl = run.player;
      const { a } = aimAngle(run, sk.range);
      pl.castLock = 0.3;
      K.swing(run, 1, 1.1, false);
      G.voice('heavy', { minGap: 0 });
      G.sfx('slash', { minGap: 0, rate: 0.7 });
      K.schedule(run, 0.12, () => {
        if (!live(run)) return;
        G.sfx('shBlast', { minGap: 0, vol: 0.6, rate: 1.3 });
        K.shake(run, 3);
        wave(run, pl.x + Math.cos(a) * 16, pl.y + Math.sin(a) * 16, a, sk.range, sk.width, mult, 0.85);
      });
      return true;
    },

    // ---- Lv 4: Black Hurricane - spin in a black whirlwind, drag enemies in, cut repeatedly
    blackhurricane(run, sk, rank, mult) {
      const pl = run.player;
      pl.spin = { t: sk.time, tick: 0, am: true };
      G.voice('heavy', { minGap: 0 });
      G.sfx('slash', { minGap: 0, rate: 0.8 });
      shape(run, { kind: 'ring', x: pl.x, y: pl.y - 8, r0: 10, r1: sk.radius * 1.2, life: 0.3, w: 3 });
      return true;
    },

    // ---- Lv 7: Black Meteorite - leap high onto the enemy and crash down in a stunning shockwave
    blackmeteorite(run, sk, rank, mult) {
      const pl = run.player;
      const { a, t } = aimAngle(run, sk.range);
      const D = t ? Math.min(sk.range, K.dist(t, pl)) : 60;
      const tx = pl.x + Math.cos(a) * D, ty = pl.y + Math.sin(a) * D;
      const LEAP = 0.46, H = 64;
      G.voice('ult', { minGap: 0, vol: 0.8 });
      G.sfx('shLift', { minGap: 0, vol: 0.6, rate: 1.2 });
      pl.invuln = Math.max(pl.invuln, LEAP + 0.3);
      shape(run, { kind: 'ring', x: pl.x, y: pl.y - 2, r0: 6, r1: 20 * BIG, life: 0.25, w: 2, flat: true }); // push-off dust ring
      const mark = shape(run, { kind: 'target', x: tx, y: ty, life: LEAP, r: sk.radius * 0.7 });
      K.startDash(run, tx, ty, LEAP, null, () => {
        pl.liftY = 0;
        if (!live(run)) return;
        shape(run, { kind: 'ring', x: pl.x, y: pl.y - 2, r0: 10, r1: (sk.radius + 8) * 1.5, life: 0.45, w: 5, flat: true });
        shape(run, { kind: 'ring', x: pl.x, y: pl.y - 2, r0: 6, r1: sk.radius, life: 0.3, w: 3, flat: true });
        shape(run, { kind: 'cracks', x: pl.x, y: pl.y, life: 0.9, rays: Array.from({ length: 9 }, (_, i) => ({ a: (i / 9) * Math.PI * 2 + Math.random() * 0.4, len: sk.radius * 1.4 * (0.55 + Math.random() * 0.5) })) });
        K.fx(run, 'amShock', pl.x, pl.y - 6, { scale: 1.3, fps: 20, important: true });
        G.sfx('shBlast', { minGap: 0 }); G.sfx('finisher', { minGap: 0, vol: 0.5 });
        K.shake(run, 8); K.hitStop(run, 0.08);
        K.enemiesNear(run, pl.x, pl.y, sk.radius).forEach((e) => {
          strike(run, e, mult, { knock: 18, stop: 0.04 });
          if (K.alive(e)) K.stun(run, e, sk.stun);
        });
      });
      // the arc of the jump: the hero rises and drops back onto the target
      const steps = 14;
      for (let k = 1; k < steps; k++) K.schedule(run, (LEAP * k) / steps, () => { if (pl.dash) pl.liftY = Math.sin(Math.PI * (k / steps)) * H; });
      void mark;
      return true;
    },

    // ---- Ultimate: Black Asta (Devil Union) - a timed power-up, every swing sends a wave
    blackasta(run, sk, rank) {
      const pl = run.player;
      const dur = sk.time + (sk.perRankTime || 0) * Math.max(0, rank - 1);
      sk.buff = { atk: sk.atk, speed: sk.speed }; // the game removes these when the timer runs out
      pl.buffTimers = pl.buffTimers || {};
      pl.buffTimers.blackasta = dur;
      pl.buffs.atk = sk.atk; pl.buffs.speed = sk.speed;
      run.amUnion = { t0: run.time, t1: run.time + dur };
      pl.castLock = 0.5; pl.invuln = Math.max(pl.invuln, 0.8);
      K.swing(run, 0, 0.7, false);
      G.ui.banner('Devil Union', 'Black Asta');
      G.voice('ult', { minGap: 0, vol: 1 });
      G.sfx('shCharge', { minGap: 0 }); G.sfx('shShadow', { minGap: 0, vol: 0.8 });
      K.fx(run, 'amBurst', pl.x, pl.y - 14, { scale: 0.9, fps: 24, important: true });
      shape(run, { kind: 'ring', x: pl.x, y: pl.y - 2, r0: 8, r1: 40 * BIG, life: 0.5, w: 4, flat: true });
      K.shake(run, 5);
      return true;
    },
  };

  // ---------------------------------------------------------------- per-frame
  function updateSpin(run, dt) {
    const pl = run.player, S = pl.spin;
    if (!S || !S.am) return;
    const sk = G.SKILLS.blackhurricane, mult = K.skillMult('blackhurricane');
    S.t -= dt; S.tick -= dt;
    if (pl.dead || S.t <= 0) { pl.spin = null; return; }
    // drag nearby enemies in
    K.enemiesNear(run, pl.x, pl.y, sk.radius + 30).forEach((e) => {
      if (e.boss) return;
      const dx = pl.x - e.x, dy = pl.y - e.y, d = Math.hypot(dx, dy), want = 14 + (e.r || 6);
      if (d > want) { const s = Math.min(d - want, 70 * dt); e.x += (dx / d) * s; e.y += (dy / d) * s; if (G.collide) G.collide(run.map, e, e.r || 6); }
    });
    if (S.tick <= 0) {
      S.tick += sk.tick;
      S.n = (S.n || 0) + 1;
      const ang = S.n * 1.9;
      let any = false;
      K.enemiesNear(run, pl.x, pl.y, sk.radius).forEach((e) => {
        strike(run, e, mult, { knock: 0, stop: 0.01 }); any = true;
        if (S.n % 2 === 0) cut(run, e.x, K.bodyY(e), ang);
      });
      G.sfx(any ? 'slashHit' : 'slash', { minGap: 60, vol: 0.5, rate: 1.1 });
    }
  }

  // a basic sword hit just landed: Devil's Grudge and Black Asta add their cuts and waves
  function onBasicHit(run) {
    const pl = run.player;
    const t = K.nearestEnemy(run, pl, 70);
    const a = t ? Math.atan2(t.y - pl.y, t.x - pl.x) : dirAngle(pl);
    const gr = K.passiveRank('grudge');
    if (gr && t && pl.hp < pl.stats.maxHp * G.SKILLS.grudge.below) {
      const g = G.SKILLS.grudge;
      strike(run, t, g.mult + g.perRank * (gr - 1), { knock: 6, stop: 0.02 });
      cut(run, t.x, K.bodyY(t), a + Math.PI / 2 + 0.6);
    }
    if (run.amUnion && run.time < run.amUnion.t1) {
      const sk = G.SKILLS.blackasta;
      wave(run, pl.x + Math.cos(a) * 14, pl.y + Math.sin(a) * 14, a, 110, 16, sk.wave, 0.6);
      G.sfx('shBlast', { minGap: 120, vol: 0.35, rate: 1.5 });
    }
  }
  function updateSwings(run) {
    const pl = run.player;
    const landed = pl.state === 'attack' && pl.hitDone && !pl.atkFps && !pl.skillSwing;
    if (landed && !run.amPrevHit) onBasicHit(run);
    run.amPrevHit = landed;
  }
  function updateUnion(run) {
    const U = run.amUnion, pl = run.player;
    if (!U) return;
    if (run.time >= U.t1 || pl.dead) {
      run.amUnion = null;
      if (live(run)) shape(run, { kind: 'ring', x: pl.x, y: pl.y - 2, r0: 6, r1: 26, life: 0.3, w: 3, flat: true });
      return;
    }
  }

  // ---------------------------------------------------------------- drawing
  function edge(ctx, w) { // stroke the current path twice: red edge, black core
    w *= BIG;
    ctx.strokeStyle = RED; ctx.lineWidth = w + 2.5; ctx.stroke();
    ctx.strokeStyle = DARK; ctx.lineWidth = w; ctx.stroke();
  }
  function drawShapes(run, out) {
    const list = run.amFx;
    if (!list || !list.length) return;
    const now = run.time;
    for (let i = list.length - 1; i >= 0; i--) {
      const o = list[i], el = now - o.t0;
      if (el > o.life) { list.splice(i, 1); continue; }
      if (o.follow) o.follow();
      const u = el / o.life, fade = Math.min(1, (1 - u) / 0.35);
      if (o.kind === 'streak') {
        out.push({ y: Math.max(o.y0, o.y1) + 12, t: 5, draw: (ctx) => {
          ctx.save(); ctx.globalAlpha = fade; ctx.lineCap = 'round';
          ctx.beginPath(); ctx.moveTo(o.x0, o.y0); ctx.lineTo(o.x1, o.y1); edge(ctx, o.w * fade + 1);
          ctx.restore();
        } });
      } else if (o.kind === 'crescent') { // a black crescent blade facing its direction of travel
        const x = o.x + Math.cos(o.a) * o.speed * el, y = o.y + Math.sin(o.a) * o.speed * el, R = o.r;
        out.push({ y: y + 14, t: 5, draw: (ctx) => {
          ctx.save(); ctx.globalAlpha = fade; ctx.translate(x, y); ctx.rotate(o.a); ctx.scale(0.6, 1);
          ctx.beginPath(); ctx.arc(0, 0, R, -1.15, 1.15); ctx.arc(-R * 0.45, 0, R * 0.85, 1.05, -1.05, true); ctx.closePath();
          ctx.fillStyle = DARK; ctx.fill(); ctx.strokeStyle = RED; ctx.lineWidth = 2.2; ctx.stroke();
          ctx.restore();
        } });
      } else if (o.kind === 'ring') {
        const r = o.r0 + (o.r1 - o.r0) * (1 - Math.pow(1 - u, 2));
        out.push({ y: o.flat ? -1e9 : o.y + 4, t: 5, draw: (ctx) => {
          ctx.save(); ctx.globalAlpha = fade;
          ctx.beginPath(); ctx.ellipse(o.x, o.y, r, o.flat ? r * 0.55 : r, 0, 0, Math.PI * 2); edge(ctx, o.w * (1 - u) + 1);
          ctx.restore();
        } });
      } else if (o.kind === 'cracks') { // jagged cracks in the ground around a landing
        out.push({ y: -1e9, t: 5, draw: (ctx) => {
          ctx.save(); ctx.globalAlpha = fade; ctx.lineCap = 'round';
          o.rays.forEach((ry) => {
            ctx.beginPath(); ctx.moveTo(o.x, o.y);
            for (let k = 1; k <= 3; k++) { const d = (ry.len * k) / 3, j = (k % 2 ? 1 : -1) * 3; ctx.lineTo(o.x + Math.cos(ry.a) * d - Math.sin(ry.a) * j, o.y + (Math.sin(ry.a) * d + Math.cos(ry.a) * j) * 0.55); }
            edge(ctx, 1.6);
          });
          ctx.restore();
        } });
      } else if (o.kind === 'cut') {
        const L = o.len * (0.6 + 0.4 * Math.min(1, u * 3)), cx = Math.cos(o.a) * L, cy = Math.sin(o.a) * L;
        out.push({ y: o.y + 30, t: 5, draw: (ctx) => {
          ctx.save(); ctx.globalAlpha = fade; ctx.lineCap = 'round';
          ctx.beginPath(); ctx.moveTo(o.x - cx, o.y - cy); ctx.lineTo(o.x + cx, o.y + cy); edge(ctx, 2.2 * (1 - u) + 0.8);
          ctx.restore();
        } });
      } else if (o.kind === 'target') { // where the leap will land
        out.push({ y: -1e9, t: 5, draw: (ctx) => {
          ctx.save(); ctx.globalAlpha = 0.55 * (0.4 + 0.6 * u);
          ctx.beginPath(); ctx.ellipse(o.x, o.y, o.r * (1 - 0.3 * u), o.r * 0.55 * (1 - 0.3 * u), 0, 0, Math.PI * 2);
          ctx.strokeStyle = RED; ctx.lineWidth = 1.2; ctx.setLineDash([4, 3]); ctx.stroke();
          ctx.restore();
        } });
      }
    }
  }
  function drawVortex(run, out) { // Black Hurricane: black blades whirling around the hero
    const pl = run.player, S = pl.spin;
    if (!S || !S.am) return;
    const sk = G.SKILLS.blackhurricane, now = run.time, R = sk.radius * 0.95, x = pl.x, y = pl.y - 8;
    const fadeIn = Math.min(1, (sk.time - S.t) / 0.12), fadeOut = Math.min(1, S.t / 0.15), a = Math.min(fadeIn, fadeOut);
    const draw = (front) => (ctx) => {
      ctx.save(); ctx.globalAlpha = a; ctx.lineCap = 'round';
      for (let k = 0; k < 4; k++) {
        const ang = now * 14 + (k * Math.PI) / 2, r = R * (0.75 + 0.25 * ((k % 2) ? 1 : 0.8));
        const s0 = ang, s1 = ang + 1.1, mid = Math.sin(ang + 0.55);
        if ((mid > 0) !== front) continue; // the front half draws over the hero, the back half behind
        ctx.beginPath(); ctx.ellipse(x, y, r, r * 0.5, 0, s0, s1); edge(ctx, 3);
      }
      ctx.restore();
    };
    out.push({ y: pl.y - 0.5, t: 5, draw: draw(false) });
    out.push({ y: pl.y + 0.5, t: 5, draw: draw(true) });
  }
  function drawUnion(run, out) { // Black Asta: black flames with a red edge rising off the body
    const U = run.amUnion;
    if (!U) return;
    const pl = run.player, now = run.time;
    const grow = Math.min(1, (now - U.t0) / 0.3), fade = U.t1 - now < 0.5 ? Math.max(0, (U.t1 - now) / 0.5) : 1;
    const al = grow * fade, x = pl.x, base = pl.y - 2 - (pl.liftY || 0);
    const flame = (k, back) => {
      const ph = now * 7 + k * 1.7, hgt = (16 + 8 * Math.sin(ph) + (k % 3) * 4) * BIG, off = (k - 3.5) * 3.2 * 1.4, sway = Math.sin(ph * 1.3) * 2.5 * BIG;
      return { off, hgt, sway, back };
    };
    const flames = Array.from({ length: 8 }, (_, k) => flame(k, k % 2 === 0));
    const draw = (back) => (ctx) => {
      ctx.save(); ctx.globalAlpha = al * (back ? 0.9 : 0.6);
      flames.filter((f) => f.back === back).forEach((f) => {
        const bx = x + f.off, ty = base - 10 - f.hgt;
        ctx.beginPath(); ctx.moveTo(bx - 5, base - 4); ctx.quadraticCurveTo(bx - 6 + f.sway, base - 4 - f.hgt * 0.6, bx + f.sway * 1.6, ty);
        ctx.quadraticCurveTo(bx + 6 + f.sway, base - 4 - f.hgt * 0.6, bx + 5, base - 4); ctx.closePath();
        ctx.fillStyle = DARK; ctx.fill(); ctx.strokeStyle = RED; ctx.lineWidth = 1.6; ctx.stroke();
      });
      ctx.restore();
    };
    out.push({ y: pl.y - 0.6, t: 5, draw: draw(true) });
    out.push({ y: pl.y + 0.6, t: 5, draw: draw(false) });
  }

  game.classSkills.antimagic = {
    cast(run, key, sk, rank, kit) {
      K = kit;
      const fn = CAST[key];
      if (!fn) return false;
      return fn(run, sk, rank, kit.skillMult(key), key);
    },
    update(run, dt, kit) {
      K = kit;
      if (!isMine()) return;
      updateSpin(run, dt);
      updateSwings(run);
      updateUnion(run);
    },
    drawables(run, out) {
      if (!K || !isMine()) return;
      drawShapes(run, out);
      drawVortex(run, out);
      drawUnion(run, out);
    },
  };
})();
