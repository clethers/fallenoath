/* =========================================================================
   FALLEN OATH — Shadow Monarch class, kit v2 (black & purple shadow, purple
   lightning, blue telekinesis). Inspired by Sung Jinwoo (Solo Leveling):
   Shadow Fang, Stealth, Ruler's Authority, Shadow Step, Quicksilver,
   Monarch's Presence, Bloodlust and Army of Shadows (with the Monarch's Domain).
   Plugs into the game through G.game.classSkills.shadow (see js/game.js), so the
   locked Storm Blade code is never touched.
   Art: shadow soldiers are sprite sheets redrawn as black silhouettes with a
   purple rim at load time (G.tintedSheet(..., 'shadow')); afterimages use the
   same treatment on the hero's own frames. Spec: classes/shadow-monarch/SPEC.md
   ========================================================================= */
(function () {
  'use strict';
  const G = window.G;
  const game = G.game;
  const { rnd } = G.util;
  let K = null; // building blocks from game.js (set on first update/cast)

  const isShadow = () => G.profile && G.profile.path === 'shadow';
  const army = (run) => run.shadows || (run.shadows = []);
  const live = (run) => game.run === run; // scheduled callbacks: stop if the run ended
  const ANIM_FPS = { idle: 8, walk: 10, run: 12, attack: 13, heavy: 12, lunge: 13, hurt: 14, death: 10 };
  const ARMY_CAP = 12;

  // ---------------------------------------------------------------- damage without the shared crit spark
  function strike(run, e, mult, o) {
    o = o || {};
    const pl = run.player;
    const r = K.rollDamage(K.power(run), mult, e.defense, o.crit != null ? o.crit : pl.stats.crit, pl.stats.critDmg);
    const dealt = K.damageEnemy(run, e, r.dmg, { crit: r.crit, skill: true, knock: o.knock == null ? 14 : o.knock });
    K.hitStop(run, o.stop == null ? 0.05 : o.stop);
    return dealt;
  }

  // ---------------------------------------------------------------- the Monarch's Domain (ultimate)
  function inDomain(run, x, y) {
    const d = run.shDomain;
    if (!d) return false;
    const dx = x - d.x, dy = (y - d.y) / 0.72;
    return dx * dx + dy * dy <= d.r * d.r;
  }
  function updateDomain(run) {
    const d = run.shDomain;
    if (!d) return;
    if (run.time - d.t0 > d.dur) { run.shDomain = null; return; }
    for (const e of run.enemies) {
      if (!K.alive(e) || !inDomain(run, e.x, e.y)) continue;
      K.applyStatus(run, e, 'slow', { t: 0.3, amt: d.slow, noFx: true });
      K.applyStatus(run, e, 'vuln', { t: 0.3, amt: d.vuln, noFx: true });
    }
  }

  // ---------------------------------------------------------------- shadow soldiers
  function raise(run, id, x, y, o) {
    const def = G.ENEMIES[id];
    if (!def) return null;
    const list = army(run);
    if (list.length >= ARMY_CAP) { const old = list.shift(); vanish(run, old); }
    const sh = {
      id, def, x, y, r: def.radius, face: x < run.player.x ? 1 : -1, anim: 'idle', animT: 0, state: 'rise', stateT: 0, scale: o.scale || def.scale,
      life: o.life, maxLife: o.life, mult: o.mult, cdT: rnd(0.15, 0.5), target: null, igris: !!o.igris, kind: o.kind || null, slot: Math.random() * Math.PI * 2,
    };
    list.push(sh);
    // rising out of the ground: black puff on the floor, dark mist, a few sparkles
    K.fx(run, 'smokeDark', x, y - 2, { scale: 0.5, fps: 22, ground: true });
    K.fx(run, 'shadowMist', x, y - 8, { scale: 0.5, fps: 22, alpha: 0.8 });
    K.fx(run, 'soulMark', x, y - 22, { scale: 0.6, fps: 24 });
    return sh;
  }
  function vanish(run, sh) {
    if (!sh) return;
    K.fx(run, 'smokeDark', sh.x, sh.y - 10, { scale: sh.scale * 0.5, fps: 22 });
  }
  function setA(sh, a) { if (sh.anim !== a) { sh.anim = a; sh.animT = 0; } }
  function anim(sh) {
    const key = sh.def.anim[sh.anim] || sh.def.anim.idle;
    const s = G.SHEETS[key];
    const n = (s && s.n) || 1, fps = ANIM_FPS[sh.anim] || 10;
    return { key, n, frame: Math.floor(sh.animT * fps), done: sh.animT * fps >= n };
  }
  function nearestFoe(run, from, r) {
    let best = null, bd = r;
    for (const e of run.enemies) {
      if (!K.alive(e)) continue;
      const d = K.dist(e, from);
      if (d < bd) { bd = d; best = e; }
    }
    return best;
  }
  function moveTo(run, sh, tx, ty, sp, dt) {
    const a = Math.atan2(ty - sh.y, tx - sh.x);
    sh.x += Math.cos(a) * sp * dt; sh.y += Math.sin(a) * sp * dt;
    G.collide(run.map, sh, sh.r);
    if (Math.abs(Math.cos(a)) > 0.2) sh.face = Math.cos(a) > 0 ? 1 : -1;
  }
  function shadowHit(run, sh, e, mult) {
    const bonus = inDomain(run, sh.x, sh.y) && run.shDomain ? 1 + run.shDomain.armyBonus : 1;
    const r = K.rollDamage(K.power(run) * sh.mult * bonus, mult || 1, e.defense, 0.08, 1.6);
    K.damageEnemy(run, e, r.dmg, { crit: r.crit, skill: true, knock: sh.igris ? 12 : 6 });
    K.fx(run, 'cutBlue', e.x, K.bodyY(e), { scale: sh.igris ? 0.8 : 0.55, fps: 26, rot: Math.random() * Math.PI });
  }
  function updateShadow(run, sh, i, dt) {
    const pl = run.player;
    sh.animT += dt; sh.stateT += dt; sh.life -= dt;
    if (sh.life <= 0 || pl.dead) { vanish(run, sh); return false; }
    if (sh.state === 'rise') { setA(sh, 'idle'); if (sh.stateT > 0.45) sh.state = 'chase'; return true; }
    sh.cdT -= dt;
    const def = sh.def;
    if (sh.state === 'attack') {
      const a = anim(sh);
      if (!sh.hitDone && a.frame >= def.hit) {
        sh.hitDone = true;
        const t = sh.target;
        if (sh.igris) { // Igris cleaves everything in front of him
          const fx0 = sh.x + sh.face * def.range * 0.8;
          for (const e of run.enemies) if (K.alive(e) && Math.hypot(e.x - fx0, e.y - sh.y) < def.range + e.r + 6) shadowHit(run, sh, e, G.SKILLS.shadowarmy.igris);
          G.sfx('slashHit', { vol: 0.55, minGap: 90, rate: 0.85 });
        } else if (t && K.alive(t) && K.dist(t, sh) < def.range + t.r + 10) {
          shadowHit(run, sh, t, sh.anim === 'heavy' ? 1.3 : 1);
          G.sfx('slashHit', { vol: 0.35, minGap: 110, rate: 0.9 });
        }
      }
      if (a.done) { sh.state = 'chase'; sh.cdT = def.cd * 0.65 * rnd(0.85, 1.15); setA(sh, 'idle'); }
      return true;
    }
    // chase the nearest enemy close to the hero, otherwise follow the hero in a loose ring
    let t = sh.target;
    if (!t || !K.alive(t) || K.dist(t, pl) > 260) t = sh.target = nearestFoe(run, sh, 200) || nearestFoe(run, pl, 220);
    const sp = def.speed * 1.5 + 22;
    if (t) {
      const reach = def.range + t.r + 4;
      const d = K.dist(t, sh);
      if (d > reach) { moveTo(run, sh, t.x - Math.sign(t.x - sh.x || 1) * reach * 0.7, t.y, sp, dt); setA(sh, sh.igris ? 'run' : 'walk'); }
      else if (sh.cdT <= 0) {
        sh.face = t.x >= sh.x ? 1 : -1;
        sh.state = 'attack'; sh.hitDone = false;
        setA(sh, sh.igris ? (Math.random() < 0.5 ? 'attack' : 'heavy') : Math.random() < 0.3 ? 'heavy' : 'attack');
      } else setA(sh, 'idle');
    } else {
      const ang = sh.slot + run.time * 0.4, rr = 26 + (i % 3) * 8;
      const tx = pl.x + Math.cos(ang) * rr, ty = pl.y + Math.sin(ang) * rr * 0.6;
      if (Math.hypot(tx - sh.x, ty - sh.y) > 10) { moveTo(run, sh, tx, ty, Math.min(sp, 30 + Math.hypot(tx - sh.x, ty - sh.y) * 2), dt); setA(sh, 'walk'); }
      else { setA(sh, 'idle'); sh.face = pl.x >= sh.x ? 1 : -1; }
    }
    return true;
  }

  // ---------------------------------------------------------------- Monarch's Presence (passive)
  // enemies close to the hero take extra damage from every source
  function updatePresence(run) {
    const r = K.passiveRank('presence'), pl = run.player;
    if (!r || pl.dead) return;
    const sk = G.SKILLS.presence;
    for (const e of K.enemiesNear(run, pl.x, pl.y, sk.radius)) K.applyStatus(run, e, 'presence', { t: 0.25, amt: sk.amt * r, noFx: true });
  }
  function drawPresence(run, out) { // a faint purple aura on the ground around the hero
    const r = K.passiveRank('presence'), pl = run.player;
    if (!r || pl.dead) return;
    const R = G.SKILLS.presence.radius, a = 0.16 + 0.05 * Math.sin(run.time * 2.5);
    out.push({ y: -1e9 + 1, t: 5, draw: (ctx) => {
      ctx.save(); ctx.translate(pl.x, pl.y); ctx.scale(1, 0.72);
      const gr = ctx.createRadialGradient(0, 0, R * 0.55, 0, 0, R);
      gr.addColorStop(0, 'rgba(60,20,110,0)'); gr.addColorStop(1, `rgba(90,40,170,${a})`);
      ctx.fillStyle = gr; ctx.beginPath(); ctx.arc(0, 0, R, 0, Math.PI * 2); ctx.fill();
      ctx.lineWidth = 1; ctx.strokeStyle = `rgba(167,123,255,${a * 1.6})`; ctx.stroke();
      ctx.restore();
    } });
  }

  // ---------------------------------------------------------------- Stealth (passive)
  // 2 s without attacking or casting: the hero fades out; the next hit (basic or skill) crits with a bonus
  function updateStealth(run, dt) {
    const pl = run.player, r = K.passiveRank('stealth');
    if (!r || pl.dead) { pl.stealth = null; return; }
    const busy = pl.state === 'attack' || pl.castLock > 0 || pl.dash || pl.spin;
    if (busy && !pl.stealth) { pl.stealthT = 0; return; }
    if (pl.stealth) return;
    pl.stealthT = (pl.stealthT || 0) + dt;
    if (pl.stealthT >= G.SKILLS.stealth.delay) {
      pl.stealth = { bonus: r * G.SKILLS.stealth.bonus };
      K.fx(run, 'smokeDark', pl.x, pl.y - 12, { scale: 0.7, fps: 22 });
      G.sfx('shShadow', { minGap: 0, vol: 0.35 });
    }
  }
  function takeStealth(run) { // skills: consume stealth -> guaranteed crit and bonus
    const pl = run.player;
    if (!pl.stealth) { pl.stealthT = 0; return { crit: null, bonus: 1 }; }
    const b = pl.stealth.bonus;
    pl.stealth = null; pl.stealthT = 0;
    K.fx(run, 'smokeDark', pl.x, pl.y - 12, { scale: 0.6, fps: 26 });
    return { crit: 1, bonus: 1 + b };
  }

  // ---------------------------------------------------------------- afterimages
  const ghosts = (run) => run.shGhosts || (run.shGhosts = []);
  function ghostAt(run, x, y, key, frame, dur, a0) { ghosts(run).push({ x, y, key, frame, t: 0, dur, a0 }); }
  const dirOf = (a) => (Math.abs(Math.cos(a)) > Math.abs(Math.sin(a)) ? (Math.cos(a) > 0 ? 'right' : 'left') : Math.sin(a) > 0 ? 'down' : 'up');
  const OPP = { left: 'right', right: 'left', up: 'down', down: 'up' };

  // ---------------------------------------------------------------- a crackling purple beam between two points
  // the thin tendril sprite stretched along the line, flickering twice, a small glowing head and sparkles
  function beam(run, ax, ay, bx, by, sc) {
    const dx = bx - ax, dy = by - ay, d = Math.hypot(dx, dy) || 1, rot = Math.atan2(dy, dx) - Math.PI / 2, s = Math.max(0.3, d / 80) * (sc || 1);
    K.fx(run, 'beamPurple', (ax + bx) / 2, (ay + by) / 2, { rot, scale: s, fps: 24 });
    K.schedule(run, 0.045, () => { if (live(run)) K.fx(run, 'beamPurple', (ax + bx) / 2, (ay + by) / 2, { rot, scale: s, fps: 30, flip: true }); });
    K.fx(run, 'zapBlue', bx, by, { scale: 0.28, fps: 34 });
    for (let k = 0; k < 3; k++) {
      const u = 0.2 + Math.random() * 0.6;
      K.schedule(run, 0.03 + k * 0.03, () => { if (live(run)) K.fx(run, 'soulMark', ax + dx * u + (Math.random() - 0.5) * 8, ay + dy * u + 4 + Math.random() * 6, { scale: 0.45, fps: 26 }); });
    }
  }

  // ---------------------------------------------------------------- skills
  function fail(run, key, sk, msg) {
    const pl = run.player;
    pl.mp += sk.mp; pl.cds[key] = 0; // refund: nothing happened
    G.ui.toast(msg, 'warn');
    return false;
  }

  const CAST = {
    // ---- Lv 1: Shadow Fang - purple lightning leaps through up to 4 enemies, then a shadow-step dash behind the last one
    shadowfang(run, sk, rank, mult, key) {
      const pl = run.player;
      let cur = K.nearestEnemy(run, pl, sk.radius);
      if (!cur) return fail(run, key, sk, 'No enemy in range');
      const st = takeStealth(run);
      const chain = [cur], seen = new Set([cur]);
      while (chain.length < sk.hops) {
        const c = cur;
        const nx = K.enemiesNear(run, c.x, c.y, sk.hopRange).filter((e) => !seen.has(e)).sort((a, b) => K.dist(a, c) - K.dist(b, c))[0];
        if (!nx) break;
        chain.push(nx); seen.add(nx); cur = nx;
      }
      K.faceToward(pl, chain[0].x, chain[0].y);
      K.swing(run, 1, 2.6, false);
      G.voice('light', { minGap: 0 });
      G.sfx('whoosh', { minGap: 0, vol: 0.7 });
      const hop = 0.08;
      let from = { x: pl.x, y: pl.y - 14 }, t = 0.04;
      chain.forEach((e, i) => {
        const f0 = from;
        K.schedule(run, t, () => {
          if (!live(run)) return;
          const tx = e.x, ty = K.bodyY(e);
          beam(run, f0.x, f0.y, tx, ty);
          K.schedule(run, 0.035, () => {
            if (!live(run) || !K.alive(e)) return;
            strike(run, e, sk.hopMult * st.bonus, { crit: st.crit, knock: 4, stop: 0.03 });
            K.fx(run, 'cutBlue', tx, ty, { rot: Math.random() * 3, scale: 0.6, fps: 30 });
            G.sfx('strike', { minGap: 0, vol: 0.5, rate: 1.1 + i * 0.07 }); G.sfx('slashHit', { minGap: 0, vol: 0.35, rate: 1.2 });
          });
        });
        from = { x: e.x, y: K.bodyY(e) }; t += hop;
      });
      t += 0.06;
      const last = chain[chain.length - 1];
      const lastPos = { x: last.x, y: last.y, r: last.r };
      pl.castLock = t + 0.12 + 0.13 + 0.1;
      pl.invuln = Math.max(pl.invuln, pl.castLock + 0.1);
      // sink into a shadow pool; the landing burst behind the last target opens while he is still sinking
      K.schedule(run, t - 0.04, () => {
        if (!live(run)) return;
        if (K.alive(last)) { lastPos.x = last.x; lastPos.y = last.y; }
        K.fx(run, 'smokeDark', pl.x, pl.y - 10, { scale: 0.8, fps: 24 });
        K.fx(run, 'shadowMist', pl.x, pl.y - 4, { scale: 0.7, fps: 20, alpha: 0.7 });
        G.sfx('shTeleport', { minGap: 0, vol: 0.7 });
        const a0 = Math.atan2(lastPos.y - pl.y, lastPos.x - pl.x);
        K.fx(run, 'shadeBurst', lastPos.x + Math.cos(a0) * (lastPos.r + 14), lastPos.y + Math.sin(a0) * (lastPos.r + 14) - 8, { scale: 0.75, fps: 22 });
        pl.shSink = true;
      });
      // burst out of the pool and flash along a purple beam to just behind the last target
      K.schedule(run, t + 0.12, () => {
        if (!live(run)) return;
        pl.shSink = false;
        if (K.alive(last)) { lastPos.x = last.x; lastPos.y = last.y; }
        const a = Math.atan2(lastPos.y - pl.y, lastPos.x - pl.x);
        const ex = lastPos.x + Math.cos(a) * (lastPos.r + 14), ey = lastPos.y + Math.sin(a) * (lastPos.r + 14);
        const len = Math.hypot(ex - pl.x, ey - pl.y);
        K.fx(run, 'portalVoid', pl.x, pl.y - 8, { scale: 0.5, fps: 26 });
        beam(run, pl.x, pl.y - 12, ex, ey - 12, 1.1);
        G.sfx('slash', { minGap: 0, vol: 0.8, rate: 0.8 }); G.sfx('shShadow', { minGap: 0, vol: 0.5, rate: 1.3 }); // shadow dash: a blade whoosh, no lightning
        pl.flashing = true;
        K.startDash(run, ex, ey, 0.13, null, () => {
          pl.flashing = false;
          K.faceToward(pl, lastPos.x, lastPos.y);
          K.swing(run, 0, 2.2, false);
          K.fx(run, 'arcBlue', lastPos.x, lastPos.y - 12, { rot: a + Math.PI / 2 + 0.5, scale: 1.0, fps: 26, important: true });
          if (K.alive(last)) strike(run, last, mult * st.bonus, { crit: st.crit, knock: 16, stop: 0.08 });
          G.sfx('strikeBig', { minGap: 0, vol: 0.8 }); G.sfx('slashHit', { minGap: 0 });
          G.voice('heavy', { minGap: 0, chance: 0.5 });
          K.shake(run, 4);
        }, (x, y, i) => { if (i % 2) K.fx(run, 'zapBlue', x, y - 10, { scale: 0.45, fps: 30 }); });
        if (pl.dash) pl.dash.step = Math.max(10, len / 7);
      });
      return true;
    },

    // ---- Lv 3: Ruler's Authority - telekinetic grip, lift, slam (blue)
    rulers(run, sk, rank, mult, key) {
      const pl = run.player;
      const n = Math.floor(sk.targets + sk.perRankTargets * (rank - 1));
      const targets = K.enemiesNear(run, pl.x, pl.y, sk.radius).sort((a, b) => K.dist(a, pl) - K.dist(b, pl)).slice(0, n);
      if (!targets.length) return fail(run, key, sk, 'No enemy in range');
      const st = takeStealth(run);
      K.faceToward(pl, targets[0].x, targets[0].y);
      const LIFT = sk.lift, T_UP = 0.35, T_HOLD = 0.18, TS = 0.06 + T_UP + T_HOLD;
      const stun = sk.stun + sk.perRankStun * (rank - 1);
      pl.castLock = TS + 0.15;
      const hx = () => pl.x + ((K.DIRV[pl.dir] || [1, 0])[0]) * 8, hy = () => pl.y - 15;
      K.swing(run, 1, 1.2, false);
      G.voice('heavy', { minGap: 0 });
      G.sfx('shLift', { minGap: 0, vol: 0.9 });
      // the hand lights up blue from the cast until the slam
      run.shGlow = { t0: run.time, t1: run.time + TS + 0.07, hx, hy };
      for (let k = 0; k < 6; k++) K.schedule(run, 0.05 + k * 0.1, () => { if (live(run)) K.fx(run, 'sparkleBlue', hx() + (Math.random() - 0.5) * 6, hy() + (Math.random() - 0.5) * 6, { scale: 0.35, fps: 30 }); });
      const lifted = targets.filter((e) => !e.boss); // bosses are too heavy to lift: they only take the slam
      targets.forEach((e, i) => {
        K.applyStatus(run, e, 'stun', { t: TS + 0.07 + stun, noFx: true, label: e.boss ? null : 'SEIZED', labelColor: '#8fc8ff' });
        K.schedule(run, 0.04 + i * 0.03, () => {
          if (!live(run) || !K.alive(e)) return;
          K.fx(run, 'impBlue2', e.x, K.bodyY(e) - 20, { scale: 0.45, fps: 10 / (0.57 - i * 0.03) }); // holds them until the drop
          e.flash = 0.1;
        });
      });
      for (let k = 0; k <= 20; k++) K.schedule(run, 0.06 + (T_UP + T_HOLD) * k / 20, () => {
        const u = Math.min(1, (k / 20) * (T_UP + T_HOLD) / T_UP), ease = 1 - (1 - u) * (1 - u);
        lifted.forEach((e) => { e.liftY = e.dead ? 0 : ease * LIFT + (Math.random() - 0.5) * 2; });
      });
      K.schedule(run, TS - 0.04, () => { if (live(run)) { K.swing(run, 0, 2.2, false); G.sfx('whoosh', { minGap: 0, vol: 0.7 }); } });
      for (let k = 1; k <= 3; k++) K.schedule(run, TS + k * 0.02, () => lifted.forEach((e) => { e.liftY = e.dead ? 0 : LIFT * (1 - k / 3); }));
      K.schedule(run, TS + 0.07, () => {
        lifted.forEach((e) => { e.liftY = 0; });
        if (!live(run)) return;
        targets.forEach((e) => {
          if (!K.alive(e)) return;
          K.fx(run, 'impDark4', e.x, e.y - 2, { scale: 0.5, fps: 22, ground: true }); // shockwave on the ground, under the mob
          strike(run, e, mult * st.bonus, { crit: st.crit, knock: 0, stop: 0.09 });
        });
        G.sfx('shSlam', { minGap: 0 }); G.sfx('shBlast', { minGap: 0, vol: 0.7 });
        K.shake(run, 6);
      });
      return true;
    },

    // ---- Lv 4: Shadow Step - melt into the shadows and flash away; the shadow left behind bursts
    shadowstep(run, sk, rank, mult) {
      const pl = run.player;
      pl.cds.shadowstep = Math.max(1.5, sk.cd - sk.cdPerRank * (rank - 1));
      const t = K.nearestEnemy(run, pl, 120);
      let a;
      if (t) a = Math.atan2(pl.y - t.y, pl.x - t.x);
      else { const v = K.DIRV[pl.dir]; a = Math.atan2(-v[1], -v[0]); }
      const mv = Math.hypot(G.input.mx, G.input.my);
      if (mv > 0.3) a = Math.atan2(G.input.my, G.input.mx); // steer with the joystick
      const st = takeStealth(run);
      const ox = pl.x, oy = pl.y;
      G.sfx('slash', { minGap: 0, vol: 0.75, rate: 0.85 }); G.sfx('shTeleport', { minGap: 0, vol: 0.6 }); // shadow dash: no lightning
      G.voice('dodge', { minGap: 0 });
      // the shadow left behind: a black silhouette of the hero facing back
      const dir = dirOf(a + Math.PI);
      ghostAt(run, ox, oy, 'adv_atk2_' + dir, 2, 0.22, 0.95);
      K.schedule(run, 0.12, () => { // it bursts: damage only, no visual
        if (!live(run)) return;
        K.enemiesNear(run, ox, oy, sk.radius).forEach((e) => strike(run, e, mult * st.bonus, { crit: st.crit, knock: 16, stop: 0.03 }));
        G.sfx('shBlast', { minGap: 0, vol: 0.6 });
        K.shake(run, 1.5);
      });
      pl.flashing = true;
      let n = 0;
      K.startDash(run, ox + Math.cos(a) * sk.dist, oy + Math.sin(a) * sk.dist, sk.dashTime, null, () => {
        pl.flashing = false;
        K.fx(run, 'smokeDark', pl.x, pl.y - 4, { scale: 0.45, fps: 30, ground: true });
        K.fx(run, 'soulMark', pl.x, pl.y - 14, { scale: 0.5, fps: 28 });
        pl.invuln = Math.max(pl.invuln, 0.2);
      }, (x, y) => {
        n++;
        ghostAt(run, x, y, 'adv_atk2_' + OPP[dir], 3, 0.18 + n * 0.03, 0.5);
        if (n % 2) K.fx(run, 'shadowMist', x, y - 2, { scale: 0.35, fps: 26, alpha: 0.6, ground: true });
      });
      if (pl.dash) pl.dash.step = 14;
      return true;
    },

    // ---- Lv 7: Bloodlust - killing intent: a dark wave, fear and vulnerability
    bloodlust(run, sk, rank) {
      const pl = run.player;
      const targets = K.enemiesNear(run, pl.x, pl.y, sk.radius).sort((a, b) => K.dist(a, pl) - K.dist(b, pl));
      if (targets[0]) K.faceToward(pl, targets[0].x, targets[0].y);
      pl.castLock = 0.4;
      G.voice('stance', { minGap: 0 });
      K.fx(run, 'shadowMist', pl.x, pl.y - 2, { scale: 0.6, fps: 22, alpha: 0.7, ground: true });
      K.schedule(run, 0.1, () => { if (live(run)) K.fx(run, 'smokeDark', pl.x, pl.y - 4, { scale: 0.5, fps: 26, alpha: 0.8, ground: true }); });
      G.sfx('shCharge', { minGap: 0, vol: 0.7 });
      const TB = 0.3, fear = sk.fear + sk.perRankFear * (rank - 1);
      K.schedule(run, TB, () => {
        if (!live(run)) return;
        K.fx(run, 'impDarkP', pl.x, pl.y - 2, { scale: 2.4, fps: 20, ground: true, important: true });
        K.fx(run, 'shadeBurst', pl.x, pl.y - 6, { scale: 1.2, fps: 24, important: true, ground: true });
        run.shDim = { t0: run.time, dur: 0.9, peak: 0.75 };
        K.shake(run, 5);
        G.sfx('shDebuff', { minGap: 0 }); G.sfx('shShadow', { minGap: 0, vol: 0.8 });
      });
      const ox = pl.x, oy = pl.y;
      targets.forEach((e) => {
        const d = Math.max(0, Math.hypot(e.x - ox, e.y - oy) - 20);
        K.schedule(run, TB + 0.04 + d / 650, () => {
          if (!live(run) || !K.alive(e)) return;
          e.flash = 0.12;
          K.applyStatus(run, e, 'vuln', { t: sk.vulnTime, amt: sk.vuln, noFx: true });
          if (!e.boss) K.applyStatus(run, e, 'fear', { t: fear, fxKey: 'fearPurple', label: 'FEAR', labelColor: '#c39bff' });
          if (!e.boss) { const x0 = e.x; for (let k = 0; k < 12; k++) K.schedule(run, k * 0.04, () => { if (!e.dead && e.status.fear) e.x = x0 + (k % 2 ? 1 : -1) * (k < 11 ? 1 : 0); }); } // shiver
        });
      });
      return true;
    },

    // ---- Ultimate: the Monarch's Domain opens, four shadow samurai rise from it, then Igris
    shadowarmy(run, sk, rank, mult) {
      const pl = run.player;
      pl.castLock = 1.0; pl.invuln = Math.max(pl.invuln, 1.6);
      K.swing(run, 0, 0.8, false);
      G.ui.banner(sk.name, '');
      G.voice('ult', { minGap: 0, vol: 1 });
      G.sfx('shCharge', { minGap: 0 });
      run.shDim = { t0: run.time, dur: 3.2, peak: 0.55, hold: true };
      const t0 = K.nearestEnemy(run, pl, 220);
      const aim = t0 ? Math.atan2(t0.y - pl.y, t0.x - pl.x) : Math.atan2(K.DIRV[pl.dir][1], K.DIRV[pl.dir][0]);
      const cx = pl.x, cy = pl.y, DR = sk.domain;
      const life = sk.life + sk.perRankLife * (rank - 1);
      army(run).forEach((s) => { s.life = s.maxLife; }); // every shadow already fighting is restored
      // 1) the domain spreads over the ground
      K.schedule(run, 0.2, () => {
        if (!live(run)) return;
        run.shDomain = { t0: run.time, x: cx, y: cy, r: DR, dur: sk.domainTime, slow: sk.slow, vuln: sk.vuln, armyBonus: sk.armyBonus };
        K.fx(run, 'impDarkP', cx, cy - 2, { scale: 2.2, fps: 18, ground: true, important: true });
        G.sfx('shPortal', { minGap: 0 }); G.sfx('shShadow', { minGap: 0, vol: 0.8 });
        K.shake(run, 4);
        for (let k = 0; k < 10; k++) {
          const an = k / 10 * Math.PI * 2;
          K.schedule(run, 0.25 + Math.random() * 0.15, () => { if (live(run)) K.fx(run, 'shadowMist', cx + Math.cos(an) * DR * 0.92, cy + Math.sin(an) * DR * 0.72 * 0.92 - 2, { scale: 0.45, fps: 18, alpha: 0.7, ground: true }); });
        }
      });
      // 2) ARISE: shadow samurai rise around the hero, behind and to the sides
      const N = sk.soldiers;
      for (let i = 0; i < N; i++) {
        const an = aim + Math.PI * 0.75 + (i / Math.max(1, N - 1)) * Math.PI * 1.5;
        const x = cx + Math.cos(an) * 52, y = cy + Math.sin(an) * 38;
        K.schedule(run, 0.75 + i * 0.12, () => {
          if (!live(run)) return;
          const s = raise(run, 'shSamurai', x, y, { life, mult });
          if (s) s.ult = true;
          G.sfx('shSummon', { minGap: 0, vol: 0.5 });
        });
      }
      // 3) Igris arrives last, in front of the hero
      K.schedule(run, 1.45, () => {
        if (!live(run)) return;
        const ix = cx + Math.cos(aim) * 30, iy = cy + Math.sin(aim) * 22 + 4;
        K.fx(run, 'impDarkP', ix, iy - 2, { scale: 1.1, fps: 22, ground: true, important: true });
        K.fx(run, 'shadeBurst', ix, iy - 10, { scale: 0.9, fps: 22, important: true });
        const ig = raise(run, 'knight', ix, iy, { life, mult, igris: true, scale: 1.65 });
        if (ig) { ig.ult = true; K.text(run, ix, iy - 56, 'IGRIS', '#c39bff', true); }
        G.sfx('shSlam', { minGap: 0, vol: 0.8 }); G.sfx('finisher', { minGap: 0, vol: 0.6 });
        K.hitStop(run, 0.08); K.shake(run, 8);
      });
      return true;
    },
  };

  // ---------------------------------------------------------------- overlays drawn with the world
  function drawGlow(run, out) { // Ruler's Authority: the hero's hand glows blue
    const g = run.shGlow;
    if (!g) return;
    const now = run.time;
    if (now > g.t1 + 0.18) { run.shGlow = null; return; }
    const fadeIn = Math.min(1, (now - g.t0) / 0.06), fadeOut = now > g.t1 ? 1 - (now - g.t1) / 0.18 : 1;
    const a = Math.max(0, fadeIn * fadeOut) * (0.85 + 0.15 * Math.sin(now * 40)), x = g.hx(), y = g.hy();
    out.push({ y: run.player.y + 1, t: 5, draw: (ctx) => {
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      const gr = ctx.createRadialGradient(x, y, 0, x, y, 14);
      gr.addColorStop(0, `rgba(170,215,255,${0.95 * a})`); gr.addColorStop(0.35, `rgba(70,150,255,${0.6 * a})`); gr.addColorStop(1, 'rgba(30,90,255,0)');
      ctx.fillStyle = gr; ctx.beginPath(); ctx.arc(x, y, 14, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = `rgba(235,248,255,${a})`; ctx.beginPath(); ctx.arc(x, y, 1.8, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    } });
  }
  function drawDomain(run, out) { // the Monarch's Domain: a dark field on the ground with a pulsing purple rim
    const d = run.shDomain;
    if (!d) return;
    const el = run.time - d.t0, grow = Math.min(1, el / 0.45), rr = d.r * (1 - Math.pow(1 - grow, 3));
    const fade = el > d.dur - 0.5 ? Math.max(0, (d.dur - el) / 0.5) : 1;
    out.push({ y: -1e9, t: 5, draw: (ctx) => {
      ctx.save(); ctx.translate(d.x, d.y); ctx.scale(1, 0.72);
      const gr = ctx.createRadialGradient(0, 0, rr * 0.1, 0, 0, rr);
      gr.addColorStop(0, `rgba(6,0,14,${0.78 * fade})`); gr.addColorStop(0.8, `rgba(18,4,36,${0.62 * fade})`); gr.addColorStop(1, `rgba(60,20,110,${0.5 * fade})`);
      ctx.fillStyle = gr; ctx.beginPath(); ctx.arc(0, 0, rr, 0, Math.PI * 2); ctx.fill();
      ctx.lineWidth = 2; ctx.strokeStyle = `rgba(167,123,255,${(0.75 + 0.25 * Math.sin(run.time * 6)) * fade})`; ctx.stroke();
      ctx.lineWidth = 1; ctx.strokeStyle = `rgba(167,123,255,${0.35 * fade})`;
      ctx.beginPath(); ctx.arc(0, 0, rr * (0.55 + 0.1 * Math.sin(run.time * 3)), 0, Math.PI * 2); ctx.stroke();
      ctx.restore();
    } });
  }
  function drawDim(run, out) { // Bloodlust / ultimate: the screen darkens around the hero
    const dm = run.shDim;
    if (!dm) return;
    const u = (run.time - dm.t0) / dm.dur;
    if (u > 1) { run.shDim = null; return; }
    const a = (dm.hold ? (u < 0.06 ? u / 0.06 : u > 0.85 ? (1 - u) / 0.15 : 1) : (u < 0.15 ? u / 0.15 : 1 - (u - 0.15) / 0.85)) * dm.peak;
    const px = run.player.x, py = run.player.y - 10;
    out.push({ y: 1e9, t: 5, draw: (ctx) => {
      ctx.save();
      const gr = ctx.createRadialGradient(px, py, 40, px, py, 260);
      gr.addColorStop(0, 'rgba(10,0,20,0)'); gr.addColorStop(1, `rgba(10,0,20,${a})`);
      ctx.fillStyle = gr; ctx.fillRect(px - 400, py - 400, 800, 800);
      ctx.restore();
    } });
  }

  game.classSkills.shadow = {
    cast(run, key, sk, rank, kit) {
      K = kit;
      const fn = CAST[key];
      if (!fn) return false;
      return fn(run, sk, rank, kit.skillMult(key), key);
    },
    update(run, dt, kit) {
      K = kit;
      if (!isShadow()) return;
      updatePresence(run);
      updateStealth(run, dt);
      updateDomain(run);
      if (run.shGhosts) for (let i = run.shGhosts.length - 1; i >= 0; i--) {
        const g = run.shGhosts[i];
        if (g.vx) { g.x += g.vx * dt; g.y += g.vy * dt; }
        if ((g.t += dt) >= g.dur) run.shGhosts.splice(i, 1);
      }
      const list = army(run);
      for (let i = list.length - 1; i >= 0; i--) if (!updateShadow(run, list[i], i, dt)) list.splice(i, 1);
    },
    drawables(run, out) {
      if (!K || !isShadow()) return;
      drawPresence(run, out);
      drawDomain(run, out);
      drawDim(run, out);
      drawGlow(run, out);
      if (run.shGhosts) for (const g of run.shGhosts) { // afterimages: the hero's frame as a black silhouette with a purple rim
        out.push({ y: g.y - 0.5, t: 5, draw: (ctx) => K.drawSheet(ctx, G.tintedSheet(g.key, 'shadow'), g.frame, g.x, g.y, 46, 57, 1, false, (g.a0 || 0.55) * (1 - g.t / g.dur)) });
      }
      if (!run.shadows || !run.shadows.length) return;
      for (const sh of run.shadows) {
        out.push({ y: sh.y, t: 5, draw: (ctx) => {
          const a = anim(sh);
          const loop = sh.anim === 'idle' || sh.anim === 'walk' || sh.anim === 'run';
          const frame = loop ? a.frame % a.n : Math.min(a.n - 1, a.frame);
          let alpha = sh.state === 'rise' ? Math.min(1, sh.stateT / 0.4) : 0.92;
          if (sh.life < 1.5) alpha *= 0.45 + 0.45 * Math.abs(Math.sin(sh.life * 10)); // flicker before fading
          let row = 0;
          if (sh.def.dir4) { // top-down sprites: rows down, up, left, right - face the target, else sideways
            const tg = sh.target && K.alive(sh.target) ? sh.target : null;
            const dx = tg ? tg.x - sh.x : sh.face, dy = tg ? tg.y - sh.y : 0;
            row = Math.abs(dx) >= Math.abs(dy) ? (dx < 0 ? 2 : 3) : (dy < 0 ? 1 : 0);
          }
          K.drawSheet(ctx, G.tintedSheet(a.key, 'shadow'), frame, sh.x, sh.y, sh.def.ax, sh.def.ay, sh.scale, sh.def.dir4 ? false : sh.face < 0, alpha, row);
        } });
      }
    },
  };
})();
