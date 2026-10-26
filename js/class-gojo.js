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
  // code-drawn shapes: coloured shock rings, gravity streaks, the Hollow Purple scar, Blink afterimages
  function shape(run, o) { o.t0 = run.time; (run.goFx || (run.goFx = [])).push(o); return o; }
  const COL = { blue: ['120,190,255', '30,90,255'], red: ['255,120,110', '210,20,20'], purple: ['210,150,255', '120,40,230'] };

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
        K.fx(run, 'chargeBlue', ox, oy, { scale: 0.95, fps: 22, loop: true, dur: PULL });
        shape(run, { kind: 'gravity', x: ox, y: oy, r: sk.radius, life: PULL, c: 'blue', lines: Array.from({ length: 14 }, (_, i) => ({ a: (i / 14) * Math.PI * 2, off: Math.random() })) });
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
          caught.forEach((e) => { if (K.alive(e)) { strike(run, e, sk.tick, { stop: 0.01 }); K.fx(run, 'sparkleBlue', e.x, K.bodyY(e), { scale: 0.7, fps: 30 }); } });
          G.sfx('slashHit', { minGap: 0, vol: 0.3, rate: 1.4 });
        }
      });
      K.schedule(run, 0.12 + PULL, () => {
        if (!live(run)) return;
        K.fx(run, 'impBlue2', ox, oy, { scale: 1.25, fps: 26, important: true });
        shape(run, { kind: 'ring', x: ox, y: oy + 10, r0: 10, r1: sk.radius, life: 0.4, c: 'blue', w: 4 });
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
      K.fx(run, 'chargeRed', fx0(), fy0(), { scale: 0.5, fps: 30 });
      run.goGlow = { t0: run.time, t1: run.time + 0.32, hx: fx0, hy: fy0, c: 'red' };
      K.schedule(run, 0.34, () => {
        if (!live(run)) return;
        K.swing(run, 0, 2.4, false);
        G.voice('heavy', { minGap: 0 });
        const bx = fx0(), by = fy0();
        K.fx(run, 'lightBurstRed', bx, by, { scale: 0.6, fps: 30, rot: a });
        K.fx(run, 'coneRed', bx + Math.cos(a) * 58, by + Math.sin(a) * 50, { scale: 1.6, fps: 18, rot: a + Math.PI / 2, important: true });
        K.fx(run, 'boomRed', bx + Math.cos(a) * 52, by + Math.sin(a) * 38, { scale: 1.2, fps: 24, important: true });
        K.schedule(run, 0.05, () => { if (live(run)) K.fx(run, 'impRed6', bx + Math.cos(a) * 74, by + Math.sin(a) * 54, { scale: 1, fps: 24 }); });
        shape(run, { kind: 'cone', x: bx, y: by, a, r: sk.range, spread: sk.cone, life: 0.35, c: 'red' });
        shape(run, { kind: 'ring', x: bx, y: by + 14, r0: 8, r1: sk.range * 0.7, life: 0.35, c: 'red', w: 4 });
        G.sfx('shBlast', { minGap: 0 }); G.sfx('impact', { minGap: 0, vol: 0.6 });
        K.shake(run, 7);
        K.enemiesNear(run, pl.x, pl.y, sk.range).forEach((e) => {
          let da = Math.atan2(e.y - pl.y, e.x - pl.x) - a; da = Math.atan2(Math.sin(da), Math.cos(da));
          if (Math.abs(da) > sk.cone) return;
          strike(run, e, mult, { stop: 0.05 });
          if (e.boss) return;
          const ea = Math.atan2(e.y - pl.y, e.x - pl.x), push = sk.knock - K.dist(e, pl) * 0.3;
          for (let k = 1; k <= 10; k++) K.schedule(run, k * 0.025, () => { if (e.dead) return; const s = push / 10 * (1.4 - k * 0.08); e.x += Math.cos(ea) * s; e.y += Math.sin(ea) * s; G.collide(run.map, e, e.r || 6); });
          K.schedule(run, 0.27, () => { if (live(run)) K.fx(run, 'boomRed', e.x, e.y - 10, { scale: 0.6, fps: 26 }); });
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
      K.fx(run, 'chargeBlue', ox, oy - 14, { scale: 0.6, fps: 40 });
      K.fx(run, 'sparkleBlue', ox, oy - 14, { scale: 1, fps: 30 });
      shape(run, { kind: 'ghost', x: ox, y: oy, dir: pl.dir, life: 0.45 });
      shape(run, { kind: 'ring', x: ox, y: oy - 2, r0: 6, r1: 30, life: 0.3, c: 'blue', w: 3, flat: true });
      pl.shSink = true;
      K.schedule(run, 0.06, () => {
        if (!live(run)) return;
        pl.x = ox + Math.cos(a) * sk.dist; pl.y = oy + Math.sin(a) * sk.dist; G.collide(run.map, pl, pl.r);
        if (t && K.alive(t)) K.faceToward(pl, t.x, t.y);
        K.fx(run, 'impBlue3', pl.x, pl.y - 14, { scale: 0.8, fps: 30 });
        K.fx(run, 'sparkleBlue', pl.x, pl.y - 14, { scale: 1, fps: 30 });
        shape(run, { kind: 'streak', x0: ox, y0: oy - 14, x1: pl.x, y1: pl.y - 14, life: 0.25, c: 'blue' });
        shape(run, { kind: 'ring', x: pl.x, y: pl.y - 2, r0: 30, r1: 6, life: 0.25, c: 'blue', w: 3, flat: true });
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
      K.fx(run, 'chargeBlue', cx() + px * 20, cy() + py * 14, { scale: 0.55, fps: 26, loop: true, dur: 0.42 });
      K.fx(run, 'chargeRed', cx() - px * 20, cy() - py * 14, { scale: 0.55, fps: 26, loop: true, dur: 0.42 });
      K.swing(run, 1, 0.9, false);
      const TC = 0.45;
      K.schedule(run, TC, () => {
        if (!live(run)) return;
        K.fx(run, 'lightBurstBlue', cx(), cy(), { scale: 0.8, fps: 34 });
        K.fx(run, 'impPurple3', cx(), cy(), { scale: 0.9, fps: 28 });
        shape(run, { kind: 'ring', x: cx(), y: cy(), r0: 6, r1: 50, life: 0.35, c: 'purple', w: 4 });
        G.sfx('shPortal', { minGap: 0, vol: 0.8 });
      });
      const S = { x: cx(), y: cy(), a, t0: run.time + TC + 0.15, speed: sk.speed, life: sk.life, r: sk.width };
      (run.goSpheres || (run.goSpheres = [])).push(S);
      shape(run, { kind: 'scar', S, life: TC + 0.15 + sk.life + 0.6, c: 'purple' }); // the line it erases glows, then fades
      const hit = new Set();
      for (let s = 0; s < 16; s++) K.schedule(run, TC + 0.15 + s * 0.05, () => {
        if (!live(run)) return;
        const el = s * 0.05, x = S.x + Math.cos(a) * S.speed * el, y = S.y + Math.sin(a) * S.speed * el;
        if (s % 2 === 0) K.fx(run, 'sparkVoid', x, y, { scale: 0.75, fps: 28 });
        if (s === 0) { G.sfx('shBlast', { minGap: 0 }); G.sfx('finisher', { minGap: 0, vol: 0.5 }); K.shake(run, 6); }
        K.enemiesNear(run, x, y + 12, S.r + 6).forEach((e) => {
          if (hit.has(e)) return;
          hit.add(e);
          strike(run, e, mult, { stop: 0.05 });
          K.fx(run, 'impPurple3', e.x, K.bodyY(e), { scale: 0.75, fps: 26 });
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
        K.fx(run, 'impBlue2', cx, cy - 12, { scale: 1.1, fps: 22, important: true });
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
  function drawShapes(run, out) {
    const list = run.goFx;
    if (!list || !list.length) return;
    const now = run.time, pl = run.player;
    for (let i = list.length - 1; i >= 0; i--) {
      const o = list[i], el = now - o.t0;
      if (el > o.life) { list.splice(i, 1); continue; }
      const u = el / o.life, fade = Math.min(1, (1 - u) / 0.35), C = COL[o.c] || COL.blue;
      if (o.kind === 'ring') {
        const r = o.r0 + (o.r1 - o.r0) * (1 - Math.pow(1 - u, 2));
        out.push({ y: o.flat ? -1e9 : o.y + 6, t: 5, draw: (ctx) => {
          ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = fade;
          ctx.beginPath(); ctx.ellipse(o.x, o.y, r, r * (o.flat ? 0.5 : 0.75), 0, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(${C[1]},0.8)`; ctx.lineWidth = (o.w || 3) + 3; ctx.stroke();
          ctx.strokeStyle = `rgba(${C[0]},1)`; ctx.lineWidth = o.w || 3; ctx.stroke();
          ctx.restore();
        } });
      } else if (o.kind === 'gravity') { // streaks spiralling into the point of Blue
        out.push({ y: o.y + 30, t: 5, draw: (ctx) => {
          ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.lineCap = 'round';
          o.lines.forEach((ln) => {
            const p = (now * 1.8 + ln.off) % 1, d0 = o.r * (1 - p), d1 = Math.max(4, d0 - 18), tw = 0.9 * (1 - p);
            ctx.strokeStyle = `rgba(${C[0]},${0.85 * p * fade})`; ctx.lineWidth = 2;
            ctx.beginPath(); ctx.moveTo(o.x + Math.cos(ln.a + tw) * d0, o.y + Math.sin(ln.a + tw) * d0 * 0.7);
            ctx.lineTo(o.x + Math.cos(ln.a + tw + 0.35) * d1, o.y + Math.sin(ln.a + tw + 0.35) * d1 * 0.7); ctx.stroke();
          });
          const g = ctx.createRadialGradient(o.x, o.y, 2, o.x, o.y, 26);
          g.addColorStop(0, `rgba(${C[0]},${0.6 * fade})`); g.addColorStop(1, `rgba(${C[1]},0)`);
          ctx.fillStyle = g; ctx.beginPath(); ctx.arc(o.x, o.y, 26, 0, Math.PI * 2); ctx.fill();
          ctx.restore();
        } });
      } else if (o.kind === 'cone') { // the red blast wedge
        out.push({ y: o.y + 40, t: 5, draw: (ctx) => {
          ctx.save(); ctx.globalCompositeOperation = 'lighter';
          const r = o.r * (0.4 + 0.6 * Math.min(1, u * 3));
          const g = ctx.createRadialGradient(o.x, o.y, 4, o.x, o.y, r);
          g.addColorStop(0, `rgba(${C[0]},${0.7 * fade})`); g.addColorStop(1, `rgba(${C[1]},0)`);
          ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(o.x, o.y); ctx.arc(o.x, o.y, r, o.a - o.spread, o.a + o.spread); ctx.closePath(); ctx.fill();
          ctx.restore();
        } });
      } else if (o.kind === 'streak') {
        out.push({ y: Math.max(o.y0, o.y1) + 14, t: 5, draw: (ctx) => {
          ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = fade; ctx.lineCap = 'round';
          ctx.beginPath(); ctx.moveTo(o.x0, o.y0); ctx.lineTo(o.x1, o.y1);
          ctx.strokeStyle = `rgba(${C[1]},0.7)`; ctx.lineWidth = 8 * (1 - u) + 2; ctx.stroke();
          ctx.strokeStyle = `rgba(${C[0]},1)`; ctx.lineWidth = 3 * (1 - u) + 1; ctx.stroke();
          ctx.restore();
        } });
      } else if (o.kind === 'ghost') { // Blink: a fading blue afterimage where Gojo stood
        out.push({ y: o.y - 0.2, t: 5, draw: (ctx) => {
          ctx.save(); ctx.globalCompositeOperation = 'lighter';
          K.drawSheet(ctx, G.tintedSheet('adv_idle_' + o.dir, 'gojo'), 0, o.x, o.y, 46, 57, 1, false, 0.6 * fade);
          ctx.restore();
        } });
      } else if (o.kind === 'scar') { // Hollow Purple: the erased line glows behind the sphere
        const S = o.S, sel = Math.max(0, Math.min(S.life, now - S.t0));
        if (now < S.t0) continue;
        const x1 = S.x + Math.cos(S.a) * S.speed * sel, y1 = S.y + Math.sin(S.a) * S.speed * sel;
        const tail = now - S.t0 > S.life ? 1 - (now - S.t0 - S.life) / 0.6 : 1;
        out.push({ y: Math.max(S.y, y1) + 30, t: 5, draw: (ctx) => {
          ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.lineCap = 'round'; ctx.globalAlpha = Math.max(0, tail);
          ctx.beginPath(); ctx.moveTo(S.x, S.y); ctx.lineTo(x1, y1);
          ctx.strokeStyle = `rgba(${C[1]},0.55)`; ctx.lineWidth = S.r * 1.6; ctx.stroke();
          ctx.strokeStyle = `rgba(${C[0]},0.7)`; ctx.lineWidth = S.r * 0.6; ctx.stroke();
          ctx.restore();
        } });
      }
    }
  }
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
      drawShapes(run, out);
    },
  };
})();
