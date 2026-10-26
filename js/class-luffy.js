/* =========================================================================
   FALLEN OATH — Rubber Brawler class (DRAFT for testing). Inspired by
   Monkey D. Luffy (One Piece): Gum-Gum Pistol, Rubber Body, Gatling,
   Rocket, Gear Second, Armament Haki, Bazooka and Gear Fifth.
   Plugs into the game through G.game.classSkills.gomu (see js/game.js),
   so the locked Storm Blade code is never touched.
   Hero: the Adventurer with the sword removed, straw hat, red vest and blue
   shorts ('adv_*~luffy' sheets). The stretching arms, the Gear Fifth glow
   and the giant fist are drawn in code; impacts are the shared Gigapack ones.
   ========================================================================= */
(function () {
  'use strict';
  const G = window.G;
  const game = G.game;
  let K = null;

  const isMine = () => G.profile && G.profile.path === 'gomu';
  const live = (run) => game.run === run;
  const SKIN = '#f2c49a', SKIN_D = '#b8794e', OUT = '#3a2018', SLEEVE = '#cc2026';

  function strike(run, e, mult, o) {
    o = o || {};
    const pl = run.player;
    const r = K.rollDamage(K.power(run), mult, e.defense, pl.stats.crit, pl.stats.critDmg);
    const dealt = K.damageEnemy(run, e, r.dmg, { crit: r.crit, skill: true, knock: o.knock == null ? 10 : o.knock });
    K.hitStop(run, o.stop == null ? 0.04 : o.stop);
    return dealt;
  }
  const dirAngle = (pl) => { const v = K.DIRV[pl.dir] || [1, 0]; return Math.atan2(v[1], v[0]); };
  function aim(run, range) {
    const pl = run.player, t = K.nearestEnemy(run, pl, range);
    if (t) { K.faceToward(pl, t.x, t.y); return { a: Math.atan2(t.y - pl.y, t.x - pl.x), t }; }
    return { a: dirAngle(pl), t: null };
  }
  // first enemy along a ray (for the Pistol)
  function firstOnRay(run, x, y, a, len, w) {
    let best = null, bd = 1e9;
    for (const e of run.enemies) {
      if (!K.alive(e)) continue;
      const dx = e.x - x, dy = e.y - y, along = dx * Math.cos(a) + dy * Math.sin(a), side = Math.abs(-dx * Math.sin(a) + dy * Math.cos(a));
      if (along > 0 && along < len + e.r && side < w + e.r && along < bd) { bd = along; best = e; }
    }
    return best ? { e: best, d: bd } : null;
  }

  // a stretching arm: grows out to len, holds, snaps back. Drawn every frame from run.luArms.
  function arm(run, a, len, o) {
    o = o || {};
    const A = { a, len, t0: run.time, out: o.out || 0.1, hold: o.hold || 0.04, back: o.back || 0.1, side: o.side || 0, big: o.big || 1, alpha: o.alpha || 1 };
    (run.luArms || (run.luArms = [])).push(A);
    return A;
  }
  function armReach(run, A) {
    const el = run.time - A.t0;
    if (el < A.out) return A.len * (el / A.out);
    if (el < A.out + A.hold) return A.len;
    const u = (el - A.out - A.hold) / A.back;
    return u >= 1 ? -1 : A.len * (1 - u);
  }

  // ---------------------------------------------------------------- skills
  const CAST = {
    // ---- Lv 1: Gum-Gum Pistol - one long punch, hits the first enemy in line
    gumpistol(run, sk, rank, mult) {
      const pl = run.player;
      const { a } = aim(run, sk.range + 20);
      pl.castLock = 0.28;
      K.swing(run, 0, 1.6, false);
      G.voice('light', { minGap: 0 });
      G.sfx('slash', { minGap: 0, rate: 1.4, vol: 0.6 });
      const hit = firstOnRay(run, pl.x, pl.y - 4, a, sk.range, 8);
      const len = hit ? Math.max(20, hit.d - 4) : sk.range;
      arm(run, a, len, { out: 0.1, hold: 0.05, back: 0.12 });
      K.schedule(run, 0.1, () => {
        if (!live(run) || !hit || !K.alive(hit.e)) return;
        strike(run, hit.e, mult, { knock: 24, stop: 0.06 });
        K.fx(run, 'impactBig', hit.e.x, K.bodyY(hit.e), { scale: 0.55, fps: 26 });
        G.sfx('slashHit', { minGap: 0, rate: 0.7 });
        K.shake(run, 3);
      });
      return true;
    },

    // ---- Lv 3: Gum-Gum Gatling - a blur of fists in front
    gumgatling(run, sk, rank, mult) {
      const pl = run.player;
      const { a } = aim(run, sk.range + 40);
      pl.castLock = sk.time;
      G.voice('heavy', { minGap: 0 });
      const n = Math.round(sk.time / sk.tick);
      for (let i = 0; i < n; i++) K.schedule(run, i * sk.tick, () => {
        if (!live(run) || pl.dead) return;
        // a blur of many arms: 3 solid fists per beat plus 3 faint afterimages, spread side to side
        for (let k = 0; k < 6; k++) {
          const ghost = k >= 3, aa = a + (Math.random() - 0.5) * 0.8, len = sk.range * (0.5 + Math.random() * 0.5);
          arm(run, aa, len, { out: 0.05, hold: 0.02, back: 0.06, side: (Math.random() - 0.5) * 14, alpha: ghost ? 0.35 : 1, big: ghost ? 0.9 : 1 });
        }
        if (i % 3 === 0) K.swing(run, i % 2, 3, false);
        const cx = pl.x + Math.cos(a) * sk.range * 0.55, cy = pl.y + Math.sin(a) * sk.range * 0.55;
        let any = false;
        K.enemiesNear(run, cx, cy, sk.range * 0.55).forEach((e) => {
          strike(run, e, mult, { knock: 3, stop: 0.005 }); any = true;
          if (i % 2 === 0) K.fx(run, 'hit', e.x + (Math.random() - 0.5) * 10, K.bodyY(e) + (Math.random() - 0.5) * 10, { scale: 0.6, fps: 30 });
        });
        G.sfx(any ? 'slashHit' : 'slash', { minGap: 50, vol: 0.4, rate: 1.4 + Math.random() * 0.3 });
      });
      return true;
    },

    // ---- Lv 4: Gum-Gum Rocket - stretch to a far enemy, then fly into it
    gumrocket(run, sk, rank, mult) {
      const pl = run.player;
      const { a, t } = aim(run, sk.range);
      const D = t ? Math.max(30, K.dist(t, pl) - (t.r || 8) - 6) : sk.range * 0.7;
      const tx = pl.x + Math.cos(a) * D, ty = pl.y + Math.sin(a) * D;
      pl.castLock = 0.2;
      K.swing(run, 1, 2, false);
      G.sfx('slash', { minGap: 0, rate: 1.2 });
      arm(run, a, D, { out: 0.14, hold: 0.04, back: 0.18 });
      arm(run, a, D, { out: 0.14, hold: 0.04, back: 0.18, side: 5 });
      K.schedule(run, 0.16, () => {
        if (!live(run)) return;
        run.luArms = (run.luArms || []).filter((A) => run.time - A.t0 > 0.3);
        G.voice('heavy', { minGap: 0 });
        K.startDash(run, tx, ty, 0.14, null, () => {
          if (!live(run)) return;
          K.fx(run, 'hitHeavy', pl.x + Math.cos(a) * 10, pl.y - 10 + Math.sin(a) * 10, { scale: 0.8, fps: 24 });
          K.fx(run, 'slamDust', pl.x, pl.y, { scale: 0.8, fps: 24 });
          G.sfx('shBlast', { minGap: 0, vol: 0.6, rate: 1.3 });
          K.shake(run, 5);
          K.enemiesNear(run, pl.x + Math.cos(a) * 12, pl.y + Math.sin(a) * 12, sk.radius).forEach((e) => strike(run, e, mult, { knock: 30, stop: 0.06 }));
        }, (x, y, i) => { if (i % 2 === 0) K.fx(run, 'dashSmoke', x, y - 4, { rot: a + Math.PI, scale: 0.4, fps: 30 }); });
      });
      return true;
    },

    // ---- Lv 7: Gum-Gum Bazooka - double palm strike, big knockback and stun
    gumbazooka(run, sk, rank, mult) {
      const pl = run.player;
      const { a } = aim(run, sk.range + 40);
      pl.castLock = 0.5;
      K.swing(run, 0, 1, false);
      G.voice('heavy', { minGap: 0 });
      G.sfx('shCharge', { minGap: 0, vol: 0.5, rate: 1.4 });
      // wind up (arms pulled back), then fire both palms
      arm(run, a + Math.PI, 14, { out: 0.2, hold: 0.02, back: 0.02, side: -4 });
      arm(run, a + Math.PI, 14, { out: 0.2, hold: 0.02, back: 0.02, side: 4 });
      K.schedule(run, 0.24, () => {
        if (!live(run)) return;
        arm(run, a, sk.range, { out: 0.06, hold: 0.08, back: 0.12, side: -4, big: 1.5 });
        arm(run, a, sk.range, { out: 0.06, hold: 0.08, back: 0.12, side: 4, big: 1.5 });
        K.swing(run, 1, 2, false);
      });
      K.schedule(run, 0.3, () => {
        if (!live(run)) return;
        const hx = pl.x + Math.cos(a) * sk.range * 0.8, hy = pl.y + Math.sin(a) * sk.range * 0.8;
        K.fx(run, 'hitHeavy', hx, hy - 10, { scale: 1, fps: 22, important: true });
        K.fx(run, 'impactBig', hx, hy - 10, { scale: 0.7, fps: 24 });
        G.sfx('shBlast', { minGap: 0 }); G.sfx('slashHit', { minGap: 0, rate: 0.6 });
        K.shake(run, 6); K.hitStop(run, 0.08);
        const L = K.enemiesOnLine(run, pl.x, pl.y, pl.x + Math.cos(a) * (sk.range + 10), pl.y + Math.sin(a) * (sk.range + 10), sk.width);
        L.forEach((e) => { strike(run, e, mult, { knock: 50, stop: 0.04 }); if (K.alive(e)) K.stun(run, e, sk.stun); });
      });
      return true;
    },

    // ---- Ultimate: Gear Fifth - glow white, then a giant fist crashes down around you
    gearfifth(run, sk, rank, mult) {
      const pl = run.player;
      pl.castLock = 1.1; pl.invuln = Math.max(pl.invuln, 1.6);
      K.swing(run, 0, 0.7, false);
      G.ui.banner('Gear Fifth', 'Sun God Nika');
      G.voice('ult', { minGap: 0, vol: 1 });
      G.sfx('shCharge', { minGap: 0 });
      const t = K.nearestEnemy(run, pl, sk.radius);
      const fx0 = t ? t.x : pl.x + Math.cos(dirAngle(pl)) * 40, fy0 = t ? t.y : pl.y + Math.sin(dirAngle(pl)) * 40;
      run.luG5 = { t0: run.time, glowEnd: run.time + 4, fist: { x: fx0, y: fy0, t0: run.time + 0.55, fall: 0.35, hold: 0.2 } };
      K.schedule(run, 0.55 + 0.35, () => {
        if (!live(run)) return;
        K.fx(run, 'critBig', fx0, fy0 - 14, { scale: 1.1, fps: 22, important: true });
        K.fx(run, 'impactBig', fx0, fy0 - 6, { scale: 1.4, fps: 20 });
        K.fx(run, 'slamDust', fx0 - 30, fy0, { scale: 1.1, fps: 22 });
        K.fx(run, 'slamDust', fx0 + 30, fy0, { scale: 1.1, fps: 22 });
        G.sfx('shBlast', { minGap: 0 }); G.sfx('finisher', { minGap: 0, vol: 0.7 });
        K.shake(run, 10); K.hitStop(run, 0.12);
        K.enemiesNear(run, fx0, fy0, sk.radius).forEach((e) => { strike(run, e, mult, { knock: 30, stop: 0.04 }); if (K.alive(e)) K.stun(run, e, sk.stun); });
      });
      return true;
    },
  };

  // ---------------------------------------------------------------- drawing
  function drawArms(run, out) {
    const list = run.luArms;
    if (!list || !list.length) return;
    const pl = run.player;
    for (let i = list.length - 1; i >= 0; i--) {
      const A = list[i], r = armReach(run, A);
      if (r < 0) { list.splice(i, 1); continue; }
      const px = -Math.sin(A.a) * A.side, py = Math.cos(A.a) * A.side;
      const x0 = pl.x + Math.cos(A.a) * 6 + px, y0 = pl.y - 16 + Math.sin(A.a) * 4 + py;
      const x1 = x0 + Math.cos(A.a) * r, y1 = y0 + Math.sin(A.a) * r, B = A.big;
      const g5 = run.luG5 && run.time < run.luG5.glowEnd;
      out.push({ y: Math.max(pl.y, y1 + 16) + 0.5, t: 5, draw: (ctx) => {
        ctx.save(); ctx.lineCap = 'round'; ctx.globalAlpha = A.alpha;
        ctx.strokeStyle = OUT; ctx.lineWidth = 5 * B; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke();
        ctx.strokeStyle = g5 ? '#ffffff' : SKIN; ctx.lineWidth = 3 * B; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke();
        ctx.strokeStyle = g5 ? '#e8e8f0' : SKIN_D; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x0, y0 + 1); ctx.lineTo(x1, y1 + 1); ctx.stroke();
        if (!g5) { ctx.fillStyle = SLEEVE; ctx.beginPath(); ctx.arc(x0, y0, 2.6 * B, 0, Math.PI * 2); ctx.fill(); }
        ctx.fillStyle = OUT; ctx.beginPath(); ctx.arc(x1, y1, 4.6 * B, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = g5 ? '#ffffff' : SKIN; ctx.beginPath(); ctx.arc(x1, y1, 3.6 * B, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
      } });
    }
  }
  function drawGear5(run, out) {
    const V = run.luG5;
    if (!V) return;
    const now = run.time, pl = run.player;
    const F = V.fist, fEnd = F.t0 + F.fall + F.hold + 0.25;
    if (now > V.glowEnd && now > fEnd) { run.luG5 = null; return; }
    if (now < V.glowEnd) { // white sun-god glow with drifting cloud puffs
      const fade = V.glowEnd - now < 0.5 ? (V.glowEnd - now) / 0.5 : Math.min(1, (now - V.t0) / 0.25);
      const x = pl.x, y = pl.y - 16;
      out.push({ y: pl.y + 1, t: 5, draw: (ctx) => {
        ctx.save(); ctx.globalCompositeOperation = 'lighter';
        const g = ctx.createRadialGradient(x, y, 2, x, y, 30);
        g.addColorStop(0, `rgba(255,255,255,${0.7 * fade})`); g.addColorStop(0.5, `rgba(255,250,235,${0.3 * fade})`); g.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, 30, 0, Math.PI * 2); ctx.fill();
        ctx.globalCompositeOperation = 'source-over'; ctx.fillStyle = `rgba(255,255,255,${0.85 * fade})`;
        for (let k = 0; k < 6; k++) {
          const a = now * 1.6 + k * 1.05, rr = 14 + 3 * Math.sin(now * 3 + k);
          ctx.beginPath(); ctx.arc(x + Math.cos(a) * rr, y - 6 + Math.sin(a) * rr * 0.6, 2.4, 0, Math.PI * 2); ctx.fill();
        }
        ctx.restore();
      } });
    }
    const el = now - F.t0;
    if (el >= -0.2 && now <= fEnd) { // the giant fist falls from above onto the target
      const u = Math.max(0, Math.min(1, el / F.fall)), drop = (1 - u * u) * 160;
      const fade = now > fEnd - 0.25 ? (fEnd - now) / 0.25 : Math.min(1, (el + 0.2) / 0.2);
      const R = 34, x = F.x, y = F.y - 20 - drop;
      out.push({ y: F.y + 30, t: 5, draw: (ctx) => {
        ctx.save(); ctx.globalAlpha = Math.max(0, fade);
        ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.beginPath(); ctx.ellipse(F.x, F.y + 2, R * (0.5 + 0.5 * u), R * 0.35 * (0.5 + 0.5 * u), 0, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = OUT; ctx.lineWidth = 3;
        ctx.fillStyle = '#ffffff'; ctx.fillRect(x - R * 0.35, y - R * 1.9, R * 0.7, R * 1.2); ctx.strokeRect(x - R * 0.35, y - R * 1.9, R * 0.7, R * 1.2); // forearm
        ctx.beginPath(); ctx.ellipse(x, y, R, R * 0.8, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); // fist
        ctx.lineWidth = 2; ctx.strokeStyle = '#9a9aa8';
        for (let k = -1; k <= 1; k++) { ctx.beginPath(); ctx.moveTo(x + k * R * 0.42, y + R * 0.15); ctx.lineTo(x + k * R * 0.42, y + R * 0.7); ctx.stroke(); } // knuckles
        ctx.restore();
      } });
    }
  }

  game.classSkills.gomu = {
    cast(run, key, sk, rank, kit) {
      K = kit;
      const fn = CAST[key];
      if (!fn) return false;
      return fn(run, sk, rank, kit.skillMult(key), key);
    },
    update(run, dt, kit) { K = kit; },
    drawables(run, out) {
      if (!K || !isMine()) return;
      drawGear5(run, out);
      drawArms(run, out);
    },
  };
})();
