/* =========================================================================
   FALLEN OATH — Limitless Sorcerer class (DRAFT for testing). Inspired by
   Gojo Satoru (Jujutsu Kaisen): Lapse Blue, Infinity, Reversal Red, Blink,
   Six Eyes, Reverse Cursed Technique, Hollow Purple, Domain Expansion:
   Infinite Void.
   Plugs into the game through G.game.classSkills.limitless (see js/game.js),
   so the locked Storm Blade code is never touched.
   Hero: the Adventurer with the sword removed, white hair and a dark outfit
   ('adv_*~gojo' sheets). Effects: Gigapack sheets recoloured at load; the
   void, the glow and the screen dim are drawn in code.
   ========================================================================= */
(function () {
  'use strict';
  const G = window.G;
  const game = G.game;
  let K = null;

  const isMine = () => G.profile && G.profile.path === 'limitless';
  const live = (run) => game.run === run;

  // damage without the shared crit spark
  function strike(run, e, mult, o) {
    o = o || {};
    const pl = run.player;
    const r = K.rollDamage(K.power(run), mult, e.defense, o.crit != null ? o.crit : pl.stats.crit, pl.stats.critDmg);
    const dealt = K.damageEnemy(run, e, r.dmg, { crit: r.crit, skill: true, knock: o.knock == null ? 0 : o.knock });
    K.hitStop(run, o.stop == null ? 0.04 : o.stop);
    return dealt;
  }
  function fail(run, key, sk, msg) {
    const pl = run.player;
    pl.mp += sk.mp; pl.cds[key] = 0;
    G.ui.toast(msg, 'warn');
    return false;
  }
  function sixEyes(run, sk) { // Six Eyes: part of the MP cost comes back
    const r = K.passiveRank('sixeyes');
    if (r) run.player.mp = Math.min(run.player.stats.maxMp, run.player.mp + sk.mp * r * G.SKILLS.sixeyes.mpSave);
  }
  const handX = (pl) => pl.x + ((K.DIRV[pl.dir] || [1, 0])[0]) * 8;

  // ---------------------------------------------------------------- skills
  const CAST = {
    // ---- Lv 1: Lapse: Blue - a point of Blue drags enemies together, then implodes
    lapseblue(run, sk, rank, mult, key) {
      const pl = run.player;
      const t = K.nearestEnemy(run, pl, 170);
      if (!t) return fail(run, key, sk, 'No enemy in range');
      sixEyes(run, sk);
      const a = Math.atan2(t.y - pl.y, t.x - pl.x);
      K.faceToward(pl, t.x, t.y);
      const D = Math.min(70, Math.max(40, K.dist(t, pl)));
      const ox = pl.x + Math.cos(a) * D, oy = pl.y + Math.sin(a) * D - 10;
      const PULL = sk.pull;
      pl.castLock = 0.35;
      K.swing(run, 1, 1.4, false);
      G.voice('light', { minGap: 0 });
      run.goGlow = { t0: run.time, t1: run.time + 0.25, hx: () => handX(pl), hy: () => pl.y - 15, c: 'blue' };
      G.sfx('shCharge', { minGap: 0, vol: 0.6, rate: 1.3 });
      K.schedule(run, 0.12, () => {
        if (!live(run)) return;
        K.fx(run, 'chargeBlue', ox, oy, { scale: 0.55, fps: 22, loop: true, dur: PULL });
        G.sfx('shLift', { minGap: 0, vol: 0.7, rate: 1.2 });
      });
      const caught = K.enemiesNear(run, ox, oy + 10, sk.radius);
      const steps = 24;
      for (let k = 1; k <= steps; k++) K.schedule(run, 0.12 + PULL * k / steps, () => {
        if (!live(run)) return;
        caught.forEach((e) => {
          if (e.dead) return;
          const dx = ox - e.x, dy = oy + 10 - e.y, d = Math.hypot(dx, dy), want = 6 + (e.r || 6);
          if (d > want && !e.boss) { const s = Math.min(d - want, 3.2 + d * 0.06); e.x += dx / d * s; e.y += dy / d * s; G.collide(run.map, e, e.r || 6); }
        });
        if (k % 6 === 0) {
          caught.forEach((e) => { if (K.alive(e)) { strike(run, e, sk.tick, { stop: 0.01 }); K.fx(run, 'sparkleBlue', e.x, K.bodyY(e), { scale: 0.4, fps: 30 }); } });
          G.sfx('slashHit', { minGap: 0, vol: 0.3, rate: 1.4 });
        }
      });
      K.schedule(run, 0.12 + PULL, () => {
        if (!live(run)) return;
        K.fx(run, 'impBlue2', ox, oy, { scale: 0.7, fps: 26, important: true });
        caught.forEach((e) => { if (K.alive(e)) strike(run, e, mult, { stop: 0.06 }); });
        G.sfx('shBlast', { minGap: 0, vol: 0.7, rate: 1.2 });
        K.shake(run, 4);
      });
      return true;
    },

    // ---- Lv 3: Reversal: Red - a red point at the fingertip explodes forward
    reversalred(run, sk, rank, mult) {
      const pl = run.player;
      sixEyes(run, sk);
      const t = K.nearestEnemy(run, pl, 170);
      const a = t ? Math.atan2(t.y - pl.y, t.x - pl.x) : Math.atan2(K.DIRV[pl.dir][1], K.DIRV[pl.dir][0]);
      if (t) K.faceToward(pl, t.x, t.y);
      pl.castLock = 0.5;
      const fx0 = () => pl.x + Math.cos(a) * 12, fy0 = () => pl.y - 14 + Math.sin(a) * 6;
      K.swing(run, 1, 1.0, false);
      G.sfx('shCharge', { minGap: 0, vol: 0.6, rate: 1.5 });
      K.fx(run, 'chargeRed', fx0(), fy0(), { scale: 0.28, fps: 30 });
      run.goGlow = { t0: run.time, t1: run.time + 0.32, hx: fx0, hy: fy0, c: 'red' };
      K.schedule(run, 0.34, () => {
        if (!live(run)) return;
        K.swing(run, 0, 2.4, false);
        G.voice('heavy', { minGap: 0 });
        const bx = fx0(), by = fy0();
        K.fx(run, 'lightBurstRed', bx, by, { scale: 0.35, fps: 30, rot: a });
        K.fx(run, 'coneRed', bx + Math.cos(a) * 34, by + Math.sin(a) * 34, { scale: 1.3, fps: 18, rot: a + Math.PI / 2, important: true });
        K.fx(run, 'boomRed', bx + Math.cos(a) * 42, by + Math.sin(a) * 30, { scale: 0.75, fps: 24, important: true });
        K.schedule(run, 0.05, () => { if (live(run)) K.fx(run, 'impRed6', bx + Math.cos(a) * 60, by + Math.sin(a) * 44, { scale: 0.6, fps: 24 }); });
        G.sfx('shBlast', { minGap: 0 }); G.sfx('impact', { minGap: 0, vol: 0.6 });
        K.shake(run, 7);
        K.enemiesNear(run, pl.x, pl.y, sk.range).forEach((e) => {
          let da = Math.atan2(e.y - pl.y, e.x - pl.x) - a; da = Math.atan2(Math.sin(da), Math.cos(da));
          if (Math.abs(da) > sk.cone) return;
          strike(run, e, mult, { stop: 0.05 });
          if (e.boss) return;
          const ea = Math.atan2(e.y - pl.y, e.x - pl.x), push = sk.knock - K.dist(e, pl) * 0.3;
          for (let k = 1; k <= 10; k++) K.schedule(run, k * 0.025, () => { if (e.dead) return; const s = push / 10 * (1.4 - k * 0.08); e.x += Math.cos(ea) * s; e.y += Math.sin(ea) * s; G.collide(run.map, e, e.r || 6); });
          K.schedule(run, 0.27, () => { if (live(run)) K.fx(run, 'boomRed', e.x, e.y - 10, { scale: 0.35, fps: 26 }); });
        });
      });
      return true;
    },

    // ---- Lv 4: Blink - teleport a short way, untouchable for an instant
    blink(run, sk, rank) {
      const pl = run.player;
      sixEyes(run, sk);
      pl.cds.blink = Math.max(1.5, sk.cd - sk.cdPerRank * (rank - 1));
      const t = K.nearestEnemy(run, pl, 120);
      let a;
      if (t) a = Math.atan2(pl.y - t.y, pl.x - t.x);
      else { const v = K.DIRV[pl.dir]; a = Math.atan2(-v[1], -v[0]); }
      const mv = Math.hypot(G.input.mx, G.input.my);
      if (mv > 0.3) a = Math.atan2(G.input.my, G.input.mx);
      const ox = pl.x, oy = pl.y;
      pl.castLock = 0.12; pl.invuln = Math.max(pl.invuln, 0.35);
      G.sfx('shTeleport', { minGap: 0, vol: 0.7, rate: 1.3 });
      G.voice('dodge', { minGap: 0 });
      K.fx(run, 'chargeBlue', ox, oy - 14, { scale: 0.35, fps: 40 });
      K.fx(run, 'sparkleBlue', ox, oy - 14, { scale: 0.6, fps: 30 });
      pl.shSink = true;
      K.schedule(run, 0.06, () => {
        if (!live(run)) return;
        pl.x = ox + Math.cos(a) * sk.dist; pl.y = oy + Math.sin(a) * sk.dist; G.collide(run.map, pl, pl.r);
        if (t && K.alive(t)) K.faceToward(pl, t.x, t.y);
        K.fx(run, 'impBlue3', pl.x, pl.y - 14, { scale: 0.4, fps: 30 });
        K.fx(run, 'sparkleBlue', pl.x, pl.y - 14, { scale: 0.6, fps: 30 });
        K.schedule(run, 0.06, () => { pl.shSink = false; });
      });
      return true;
    },

    // ---- Lv 7: Hollow Purple - Blue and Red collide into a sphere that erases a line
    hollowpurple(run, sk, rank, mult) {
      const pl = run.player;
      sixEyes(run, sk);
      const t = K.nearestEnemy(run, pl, 220);
      const a = t ? Math.atan2(t.y - pl.y, t.x - pl.x) : Math.atan2(K.DIRV[pl.dir][1], K.DIRV[pl.dir][0]);
      if (t) K.faceToward(pl, t.x, t.y);
      pl.castLock = 0.7; pl.invuln = Math.max(pl.invuln, 0.8);
      const cx = () => pl.x + Math.cos(a) * 14, cy = () => pl.y - 16;
      const px = -Math.sin(a), py = Math.cos(a);
      G.voice('ult', { minGap: 0 });
      G.sfx('shCharge', { minGap: 0, vol: 0.8 });
      run.goDim = { t0: run.time, dur: 1.6, peak: 0.45 };
      K.fx(run, 'chargeBlue', cx() + px * 14, cy() + py * 10, { scale: 0.3, fps: 26, loop: true, dur: 0.42 });
      K.fx(run, 'chargeRed', cx() - px * 14, cy() - py * 10, { scale: 0.3, fps: 26, loop: true, dur: 0.42 });
      K.swing(run, 1, 0.9, false);
      const TC = 0.45;
      K.schedule(run, TC, () => {
        if (!live(run)) return;
        K.fx(run, 'lightBurstBlue', cx(), cy(), { scale: 0.45, fps: 34 });
        K.fx(run, 'impPurple3', cx(), cy(), { scale: 0.5, fps: 28 });
        G.sfx('shPortal', { minGap: 0, vol: 0.8 });
      });
      const S = { x: cx(), y: cy(), a, t0: run.time + TC + 0.15, speed: sk.speed, life: sk.life, r: sk.width };
      (run.goSpheres || (run.goSpheres = [])).push(S);
      const hit = new Set();
      for (let s = 0; s < 16; s++) K.schedule(run, TC + 0.15 + s * 0.05, () => {
        if (!live(run)) return;
        const el = s * 0.05, x = S.x + Math.cos(a) * S.speed * el, y = S.y + Math.sin(a) * S.speed * el;
        if (s % 2 === 0) K.fx(run, 'sparkVoid', x, y, { scale: 0.45, fps: 28 });
        if (s === 0) { G.sfx('shBlast', { minGap: 0 }); G.sfx('finisher', { minGap: 0, vol: 0.5 }); K.shake(run, 6); }
        K.enemiesNear(run, x, y + 12, S.r + 6).forEach((e) => {
          if (hit.has(e)) return;
          hit.add(e);
          strike(run, e, mult, { stop: 0.05 });
          K.fx(run, 'impPurple3', e.x, K.bodyY(e), { scale: 0.45, fps: 26 });
          K.shake(run, 3);
        });
      });
      return true;
    },

    // ---- Ultimate: Domain Expansion: Infinite Void - everyone inside freezes, then takes heavy damage
    infinitevoid(run, sk, rank, mult) {
      const pl = run.player;
      sixEyes(run, sk);
      pl.castLock = 0.6; pl.invuln = Math.max(pl.invuln, 1.2);
      K.swing(run, 0, 0.6, false);
      G.ui.banner('Domain Expansion', 'Infinite Void');
      G.voice('ult', { minGap: 0, vol: 1 });
      G.sfx('shCharge', { minGap: 0 });
      const R = sk.radius, cx = pl.x, cy = pl.y;
      run.goVoid = {
        t0: run.time + 0.25, dur: sk.freeze + 0.6, x: cx, y: cy, r: R,
        stars: Array.from({ length: 70 }, () => ({ a: Math.random() * Math.PI * 2, d: Math.random(), s: Math.random() < 0.15 ? 2 : 1, tw: Math.random() * 6 })),
        rays: Array.from({ length: 26 }, () => ({ a: Math.random() * Math.PI * 2, sp: 0.6 + Math.random() * 0.8, off: Math.random() })),
      };
      K.schedule(run, 0.25, () => {
        if (!live(run)) return;
        K.fx(run, 'impBlue2', cx, cy - 12, { scale: 0.7, fps: 22, important: true });
        G.sfx('shPortal', { minGap: 0 }); G.sfx('shShadow', { minGap: 0, vol: 0.8 }); K.shake(run, 6);
      });
      K.schedule(run, 0.5, () => {
        if (!live(run)) return;
        K.enemiesNear(run, cx, cy, R).forEach((e) => {
          K.applyStatus(run, e, 'stun', { t: sk.freeze, noFx: true, label: e.boss ? null : 'FROZEN', labelColor: '#bfe0ff' });
          K.fx(run, 'sparkleBlue', e.x, K.bodyY(e) - 8, { scale: 0.6, fps: 20 });
          for (let k = 0; k < 8; k++) K.schedule(run, k * 0.3, () => { if (!e.dead) e.flash = 0.06; });
          K.schedule(run, sk.freeze - 0.1, () => {
            if (!live(run) || !K.alive(e)) return;
            strike(run, e, mult, { stop: 0.03 });
            K.fx(run, 'impBlue3', e.x, K.bodyY(e), { scale: 0.45, fps: 26 });
          });
        });
      });
      K.schedule(run, 0.5 + sk.freeze, () => { if (live(run)) { G.sfx('shBlast', { minGap: 0 }); K.shake(run, 5); } });
      return true;
    },
  };

  // ---------------------------------------------------------------- drawing
  function drawGlow(run, out) { // the hand lights up (blue or red)
    const g = run.goGlow;
    if (!g) return;
    const now = run.time;
    if (now > g.t1 + 0.18) { run.goGlow = null; return; }
    const fadeIn = Math.min(1, (now - g.t0) / 0.06), fadeOut = now > g.t1 ? 1 - (now - g.t1) / 0.18 : 1;
    const a = Math.max(0, fadeIn * fadeOut) * (0.85 + 0.15 * Math.sin(now * 40)), x = g.hx(), y = g.hy();
    const c = g.c === 'red' ? ['255,190,180', '255,70,60', '200,20,20'] : ['170,215,255', '70,150,255', '30,90,255'];
    out.push({ y: run.player.y + 1, t: 5, draw: (ctx) => {
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      const gr = ctx.createRadialGradient(x, y, 0, x, y, 14);
      gr.addColorStop(0, `rgba(${c[0]},${0.95 * a})`); gr.addColorStop(0.35, `rgba(${c[1]},${0.6 * a})`); gr.addColorStop(1, `rgba(${c[2]},0)`);
      ctx.fillStyle = gr; ctx.beginPath(); ctx.arc(x, y, 14, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    } });
  }
  function drawDim(run, out) {
    const dm = run.goDim;
    if (!dm) return;
    const u = (run.time - dm.t0) / dm.dur;
    if (u > 1) { run.goDim = null; return; }
    const a = (u < 0.15 ? u / 0.15 : 1 - (u - 0.15) / 0.85) * dm.peak, px = run.player.x, py = run.player.y - 10;
    out.push({ y: 1e9, t: 5, draw: (ctx) => {
      ctx.save();
      const gr = ctx.createRadialGradient(px, py, 40, px, py, 260);
      gr.addColorStop(0, 'rgba(10,0,20,0)'); gr.addColorStop(1, `rgba(10,0,20,${a})`);
      ctx.fillStyle = gr; ctx.fillRect(px - 400, py - 400, 800, 800);
      ctx.restore();
    } });
  }
  function drawSpheres(run, out) { // Hollow Purple
    const list = run.goSpheres;
    if (!list || !list.length) return;
    for (let i = list.length - 1; i >= 0; i--) {
      const S = list[i], el = run.time - S.t0;
      if (el > S.life) { list.splice(i, 1); continue; }
      if (el < 0) continue;
      const x = S.x + Math.cos(S.a) * S.speed * el, y = S.y + Math.sin(S.a) * S.speed * el;
      const grow = Math.min(1, el / 0.1), fade = el > S.life - 0.15 ? (S.life - el) / 0.15 : 1;
      const im = G.img('fx:orbPurple'), d = G.FX.orbPurple, rot = run.time * 6;
      out.push({ y: y + 40, t: 5, draw: (ctx) => {
        ctx.save(); ctx.globalAlpha = Math.max(0, fade);
        ctx.globalCompositeOperation = 'lighter';
        const g = ctx.createRadialGradient(x, y, 0, x, y, S.r * 1.8 * grow);
        g.addColorStop(0, 'rgba(230,200,255,0.8)'); g.addColorStop(0.5, 'rgba(150,70,255,0.45)'); g.addColorStop(1, 'rgba(80,20,180,0)');
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, S.r * 1.8 * grow, 0, Math.PI * 2); ctx.fill();
        ctx.globalCompositeOperation = 'source-over';
        ctx.translate(x, y); ctx.rotate(rot);
        const sz = S.r * 2 * grow;
        if (im) ctx.drawImage(im, d.fw, 0, d.fw, d.fh, -sz / 2, -sz / 2, sz, sz);
        ctx.restore();
      } });
    }
  }
  function drawVoid(run, out) { // Infinite Void: a starry field with information streaming in
    const V = run.goVoid;
    if (!V) return;
    const el = run.time - V.t0;
    if (el > V.dur) { run.goVoid = null; return; }
    if (el < 0) return;
    const grow = 1 - Math.pow(1 - Math.min(1, el / 0.5), 3), rr = V.r * grow, fade = el > V.dur - 0.4 ? (V.dur - el) / 0.4 : 1, now = run.time;
    out.push({ y: -1e9, t: 5, draw: (ctx) => {
      ctx.save(); ctx.translate(V.x, V.y);
      const g = ctx.createRadialGradient(0, 0, rr * 0.05, 0, 0, rr);
      g.addColorStop(0, `rgba(10,14,40,${0.96 * fade})`); g.addColorStop(0.75, `rgba(4,6,22,${0.94 * fade})`); g.addColorStop(1, `rgba(40,70,160,${0.5 * fade})`);
      ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(0, 0, rr, rr * 0.78, 0, 0, Math.PI * 2); ctx.fill();
      ctx.globalCompositeOperation = 'lighter';
      ctx.lineWidth = 1;
      V.rays.forEach((ry) => {
        const u = (now * ry.sp + ry.off) % 1, d0 = rr * (1 - u), d1 = Math.max(0, d0 - 22);
        ctx.strokeStyle = `rgba(200,225,255,${0.55 * fade * u})`;
        ctx.beginPath(); ctx.moveTo(Math.cos(ry.a) * d0, Math.sin(ry.a) * d0 * 0.78); ctx.lineTo(Math.cos(ry.a) * d1, Math.sin(ry.a) * d1 * 0.78); ctx.stroke();
      });
      V.stars.forEach((st) => {
        const d = st.d * rr;
        ctx.fillStyle = `rgba(235,242,255,${(0.5 + 0.5 * Math.sin(now * 3 + st.tw)) * fade})`;
        ctx.fillRect(Math.cos(st.a) * d, Math.sin(st.a) * d * 0.78, st.s, st.s);
      });
      ctx.lineWidth = 1.5; ctx.strokeStyle = `rgba(170,210,255,${0.8 * fade})`;
      ctx.beginPath(); ctx.ellipse(0, 0, rr, rr * 0.78, 0, 0, Math.PI * 2); ctx.stroke();
      ctx.restore();
    } });
  }

  // ---------------------------------------------------------------- Reverse Cursed Technique: regen in combat
  function updateRegen(run, dt) {
    const r = K.passiveRank('rct'), pl = run.player;
    if (!r || pl.dead || pl.hp >= pl.stats.maxHp) return;
    if (!run.enemies.some((e) => K.alive(e) && K.dist(e, pl) < 200)) return;
    pl.hp = Math.min(pl.stats.maxHp, pl.hp + pl.stats.maxHp * G.SKILLS.rct.regen * r * dt);
  }

  game.classSkills.limitless = {
    cast(run, key, sk, rank, kit) {
      K = kit;
      const fn = CAST[key];
      if (!fn) return false;
      return fn(run, sk, rank, kit.skillMult(key), key);
    },
    update(run, dt, kit) {
      K = kit;
      if (!isMine()) return;
      updateRegen(run, dt);
    },
    drawables(run, out) {
      if (!K || !isMine()) return;
      drawVoid(run, out);
      drawDim(run, out);
      drawGlow(run, out);
      drawSpheres(run, out);
    },
  };
})();
