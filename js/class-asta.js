/* =========================================================================
   FALLEN OATH — Anti-Magic Knight class (DRAFT for testing). Inspired by
   Asta (Black Clover): Bull Thrust, Anti-Magic Body, Black Divider,
   Black Hurricane, Endless Training, Devil's Grudge, Black Meteorite and
   Black Asta (Devil Union).
   Plugs into the game through G.game.classSkills.antimagic (see js/game.js),
   so the locked Storm Blade code is never touched.
   Hero: the Adventurer recoloured (ash hair, headband, black outfit) with a
   giant black sword ('adv_*~asta' sheets). Effects: Gigapack sheets darkened
   at load with a red edge; the Black Asta aura is drawn in code.
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

  // a black anti-magic slash wave travelling along a line, hitting each enemy once
  function wave(run, x, y, a, range, width, mult, scale) {
    const hit = new Set(), steps = Math.max(3, Math.round(range / 22)), dt = 0.035;
    for (let s = 0; s <= steps; s++) K.schedule(run, s * dt, () => {
      if (!live(run)) return;
      const d = (range * s) / steps, wx = x + Math.cos(a) * d, wy = y + Math.sin(a) * d;
      if (s % 2 === 0) K.fx(run, 'amSlash', wx, wy - 10, { rot: a + Math.PI / 2, scale, fps: 30 });
      K.enemiesNear(run, wx, wy, width).forEach((e) => {
        if (hit.has(e)) return;
        hit.add(e);
        strike(run, e, mult, { knock: 14, stop: 0.03 });
        K.fx(run, 'amCut', e.x, K.bodyY(e), { rot: a + Math.PI / 2, scale: 0.8, fps: 28 });
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
      K.fx(run, 'amSmoke', pl.x, pl.y - 8, { rot: a + Math.PI, scale: 0.35, fps: 30 });
      K.startDash(run, tx, ty, sk.time, (e) => {
        strike(run, e, mult, { knock: 22, stop: 0.05 });
        K.fx(run, 'amCut', e.x, K.bodyY(e), { rot: a + Math.PI / 2, scale: 1, fps: 28 });
        G.sfx('slashHit', { minGap: 40, rate: 0.85 });
        K.shake(run, 2.5);
      }, () => {
        K.fx(run, 'amSlash', pl.x + Math.cos(a) * 14, pl.y - 10 + Math.sin(a) * 14, { rot: a + Math.PI / 2, scale: 0.9, fps: 28 });
      }, (x, y, i) => { if (i % 3 === 0) K.fx(run, 'amCut', x, y - 12, { rot: a + Math.PI / 2, scale: 0.55, fps: 32 }); });
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
      K.fx(run, 'amSmoke', pl.x, pl.y - 6, { scale: 0.45, fps: 26 });
      return true;
    },

    // ---- Lv 7: Black Meteorite - leap onto the enemy and crash down in a stunning shockwave
    blackmeteorite(run, sk, rank, mult) {
      const pl = run.player;
      const { a, t } = aimAngle(run, sk.range);
      const D = t ? Math.min(sk.range, K.dist(t, pl)) : 60;
      const tx = pl.x + Math.cos(a) * D, ty = pl.y + Math.sin(a) * D;
      G.voice('ult', { minGap: 0, vol: 0.8 });
      G.sfx('shLift', { minGap: 0, vol: 0.6, rate: 1.2 });
      K.fx(run, 'amSmoke', pl.x, pl.y - 4, { rot: -Math.PI / 2, scale: 0.4, fps: 28 });
      pl.invuln = Math.max(pl.invuln, 0.7);
      K.startDash(run, tx, ty, 0.32, null, () => {
        if (!live(run)) return;
        K.fx(run, 'amShock', pl.x, pl.y - 6, { scale: 0.9, fps: 22, important: true });
        K.fx(run, 'amBurst', pl.x, pl.y - 10, { scale: 0.8, fps: 26 });
        G.sfx('shBlast', { minGap: 0 }); G.sfx('finisher', { minGap: 0, vol: 0.5 });
        K.shake(run, 7); K.hitStop(run, 0.08);
        K.enemiesNear(run, pl.x, pl.y, sk.radius).forEach((e) => {
          strike(run, e, mult, { knock: 18, stop: 0.04 });
          if (K.alive(e)) K.stun(run, e, sk.stun);
        });
      }, (x, y, i) => { if (i % 2 === 0) K.fx(run, 'amCut', x, y - 18, { rot: a + Math.PI / 2, scale: 0.6, fps: 30 }); });
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
      K.fx(run, 'amBurst', pl.x, pl.y - 14, { scale: 0.9, fps: 22, important: true });
      K.fx(run, 'amSmoke', pl.x, pl.y - 6, { rot: -Math.PI / 2, scale: 0.5, fps: 24 });
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
      K.fx(run, 'amSlash', pl.x + Math.cos(ang) * 16, pl.y - 10 + Math.sin(ang) * 10, { rot: ang + Math.PI / 2, scale: 0.6, fps: 34 });
      if (S.n % 3 === 0) K.fx(run, 'amSmoke', pl.x, pl.y - 4, { rot: ang, scale: 0.3, fps: 32 });
      let any = false;
      K.enemiesNear(run, pl.x, pl.y, sk.radius).forEach((e) => { strike(run, e, mult, { knock: 0, stop: 0.01 }); any = true; });
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
      K.fx(run, 'amCut', t.x, K.bodyY(t), { rot: a + Math.PI / 2 + 0.6, scale: 0.9, fps: 28 });
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
      if (live(run)) K.fx(run, 'amSmoke', pl.x, pl.y - 8, { rot: -Math.PI / 2, scale: 0.4, fps: 26 });
      return;
    }
    if (!U.next || run.time >= U.next) { // wisps of black smoke rising off the body
      U.next = run.time + 0.35;
      K.fx(run, 'amSmoke', pl.x + (Math.random() - 0.5) * 12, pl.y - 18, { rot: -Math.PI / 2, scale: 0.22, fps: 24 });
    }
  }

  // ---------------------------------------------------------------- drawing
  function drawUnion(run, out) { // Black Asta: a dark aura with a red edge, and a horn-like flare over the head
    const U = run.amUnion;
    if (!U) return;
    const pl = run.player, now = run.time;
    const grow = Math.min(1, (now - U.t0) / 0.3), fade = U.t1 - now < 0.5 ? Math.max(0, (U.t1 - now) / 0.5) : 1;
    const a = grow * fade, x = pl.x, y = pl.y - 14, pulse = 1 + 0.08 * Math.sin(now * 12);
    out.push({ y: pl.y - 1, t: 5, draw: (ctx) => {
      ctx.save();
      const R = 26 * pulse;
      const g = ctx.createRadialGradient(x, y, 4, x, y, R);
      g.addColorStop(0, `rgba(0,0,0,${0.0})`); g.addColorStop(0.55, `rgba(8,8,12,${0.5 * a})`); g.addColorStop(0.85, `rgba(150,10,20,${0.4 * a})`); g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(x, y, R * 0.8, R, 0, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    } });
    out.push({ y: pl.y + 1, t: 5, draw: (ctx) => { // red rim flicker in front
      ctx.save(); ctx.globalAlpha = 0.5 * a; ctx.strokeStyle = '#e8202e'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.ellipse(x, y + 2, 15 * pulse, 21 * pulse, 0, Math.PI * 0.15, Math.PI * 0.85); ctx.stroke();
      ctx.restore();
    } });
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
      drawUnion(run, out);
    },
  };
})();
