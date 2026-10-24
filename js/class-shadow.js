/* =========================================================================
   FALLEN OATH — Shadow Monarch class (purple & black shadow)
   Inspired by Sung Jinwoo (Solo Leveling): Dagger Rush, Arise, Shadow Exchange,
   Ruler's Authority, Bloodlust and Army of Shadows, with Monarch's Domain and
   Advanced Dagger Arts as passives.
   Plugs into the game through G.game.classSkills.shadow (see js/game.js), so the
   locked Storm Blade code is never touched.
   Art: shadow soldiers are the Orc / Soldier / Knight sheets redrawn as black
   silhouettes with a purple rim at load time (G.tintedSheet(..., 'shadow')).
   ========================================================================= */
(function () {
  'use strict';
  const G = window.G;
  const game = G.game;
  const { rnd } = G.util;
  let K = null; // building blocks from game.js (set on first update/cast)

  const isShadow = () => G.profile && G.profile.path === 'shadow';
  const army = (run) => run.shadows || (run.shadows = []);
  const ANIM_FPS = { idle: 8, walk: 10, run: 12, attack: 13, heavy: 12, lunge: 13, hurt: 14, death: 10 };
  const ARMY_CAP = 12;

  // ---------------------------------------------------------------- shadow soldiers
  function domainRank() { return K.passiveRank('monarchdomain'); }
  function domainBonus(run, sh) {
    const r = domainRank();
    if (!r) return 1;
    return K.dist(sh, run.player) <= G.SKILLS.monarchdomain.range ? 1 + r * G.SKILLS.monarchdomain.bonus : 1;
  }
  function raise(run, id, x, y, o) {
    const def = G.ENEMIES[id];
    if (!def) return null;
    const list = army(run);
    if (list.length >= ARMY_CAP) { const old = list.shift(); vanish(run, old); }
    const sh = {
      id, def, x, y, r: def.radius, face: x < run.player.x ? 1 : -1, anim: 'idle', animT: 0, state: 'rise', stateT: 0,
      life: o.life, maxLife: o.life, mult: o.mult, cdT: rnd(0.15, 0.5), target: null, igris: !!o.igris, slot: Math.random() * Math.PI * 2,
    };
    list.push(sh);
    K.fx(run, 'riseSkull', x, y - 10, { scale: def.scale * 0.7, fps: 16 });
    K.fx(run, 'portalVoid', x, y - 4, { scale: o.igris ? 0.9 : 0.55, fps: 18 });
    return sh;
  }
  function vanish(run, sh) {
    if (!sh) return;
    K.fx(run, 'smokeDark', sh.x, sh.y - 10, { scale: sh.def.scale * 0.6, fps: 22 });
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
    const r = K.rollDamage(K.power(run) * sh.mult * domainBonus(run, sh), mult || 1, e.defense, 0.08, 1.6);
    K.damageEnemy(run, e, r.dmg, { crit: r.crit, skill: true, knock: sh.igris ? 12 : 6 });
    K.fx(run, 'voidCut', e.x, K.bodyY(e), { scale: sh.igris ? 0.8 : 0.55, fps: 22, rot: sh.face > 0 ? 0 : Math.PI });
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

  // ---------------------------------------------------------------- souls (what Arise can raise)
  function trackSouls(run) {
    const souls = run.souls || (run.souls = []);
    const life = G.SKILLS.arise.soulTime;
    for (const e of run.enemies) {
      if (!e.dead || e.soulTracked || e.boss || e.deadAt == null) continue;
      e.soulTracked = true;
      if (K.rank('arise') <= 0) continue;
      souls.push({ id: e.id, x: e.x, y: e.y, t: run.time, fx: K.fx(run, 'soulMark', e.x, e.y - 8, { loop: true, dur: life, scale: 0.7, fps: 12 }) });
    }
    for (let i = souls.length - 1; i >= 0; i--) if (run.time - souls[i].t > life) souls.splice(i, 1);
  }

  // ---------------------------------------------------------------- Ruler's Authority (lift, then slam)
  function updateLifts(run, dt) {
    const lifts = run.shLifts;
    if (!lifts || !lifts.length) return;
    for (let i = lifts.length - 1; i >= 0; i--) {
      const L = lifts[i];
      L.t += dt;
      const k = Math.min(1, L.t / L.dur);
      for (const e of L.victims) {
        if (e.dead) { e.liftY = 0; continue; }
        e.liftY = Math.sin(Math.min(1, k * 1.4) * Math.PI / 2) * 20;
        e.x += (L.cx - e.x) * Math.min(1, dt * 3); e.y += (L.cy - e.y) * Math.min(1, dt * 3);
      }
      if (k >= 1) {
        L.victims.forEach((e) => { e.liftY = 0; });
        const sk = G.SKILLS.rulers;
        K.hitArea(run, L.cx, L.cy, sk.aoe, L.mult * L.bonus, (e) => K.stun(run, e, sk.stun), { crit: L.crit, knock: 0, stop: 0.1 });
        K.fx(run, 'sparkVoid', L.cx, L.cy - 12, { scale: 1.25, fps: 22, important: true });
        K.fx(run, 'riseSkull', L.cx, L.cy - 8, { scale: 0.9, fps: 18 });
        K.fx(run, 'smokeDark', L.cx - 10, L.cy - 6, { scale: 0.9, fps: 24, flip: true });
        K.fx(run, 'smokeDark', L.cx + 10, L.cy - 6, { scale: 0.9, fps: 24 });
        K.fx(run, 'shadowMist', L.cx, L.cy - 6, { scale: 0.88, fps: 20, alpha: 0.6 });
        G.sfx('shSlam', { minGap: 0 }); G.sfx('shBlast', { minGap: 0 }); G.sfx('impact', { minGap: 0, vol: 0.7 });
        K.shake(run, 7);
        lifts.splice(i, 1);
      }
    }
  }

  // ---------------------------------------------------------------- skills
  function fail(run, key, sk, msg) {
    const pl = run.player;
    pl.mp += sk.mp; pl.cds[key] = 0; // refund: nothing happened
    G.ui.toast(msg, 'warn');
    return false;
  }
  function aimAt(run, r) {
    const pl = run.player, t = K.nearestEnemy(run, pl, r || 160);
    if (t) { K.faceToward(pl, t.x, t.y); return { a: Math.atan2(t.y - pl.y, t.x - pl.x), t }; }
    const v = K.DIRV[pl.dir];
    return { a: Math.atan2(v[1], v[0]), t: null };
  }

  const CAST = {
    // ---- Lv 1: four rapid dagger cuts after a short lunge
    daggerrush(run, sk, rank, mult) {
      const pl = run.player, { a } = aimAt(run, 80);
      G.voice('light', { minGap: 0 });
      G.sfx('shBlast', { vol: 0.5 });
      K.startDash(run, pl.x + Math.cos(a) * sk.lunge, pl.y + Math.sin(a) * sk.lunge, 0.08, null, null, null);
      for (let i = 0; i < sk.hits; i++) {
        K.schedule(run, 0.08 + i * sk.gap, () => {
          if (game.run !== run) return;
          const last = i === sk.hits - 1;
          K.swing(run, i % 2, 3.4, false);
          G.sfx('slash', { minGap: 0, vol: 0.6, rate: 1.1 + i * 0.05 });
          const hit = K.enemiesInFront(run, sk.reach);
          if (hit.length) G.sfx('slashHit', { minGap: 0, vol: last ? 0.9 : 0.6, rate: 1.05 + i * 0.04 });
          hit.forEach((e) => {
            K.fx(run, 'voidCut', e.x, K.bodyY(e), { rot: a + rnd(-0.5, 0.5), scale: last ? 0.9 : 0.6, fps: 26 });
            K.hitOne(run, e, mult, { knock: last ? 14 : 3, stop: last ? 0.06 : 0.025 });
          });
          const f = K.frontPoint(pl, 14);
          K.fx(run, 'shadowArc', f.x, f.y, { rot: K.DIRA[pl.dir] + Math.PI / 2, scale: last ? 1.15 : 0.85, fps: 30, flip: i % 2 === 1 });
          if (last && hit.length) K.shake(run, 3);
        });
      }
      return true;
    },

    // ---- Lv 3: ARISE - fallen enemies stand up as shadow soldiers
    arise(run, sk, rank, mult, key) {
      const pl = run.player;
      const souls = (run.souls || []).filter((s) => Math.hypot(s.x - pl.x, s.y - pl.y) <= sk.radius).sort((a, b) => Math.hypot(a.x - pl.x, a.y - pl.y) - Math.hypot(b.x - pl.x, b.y - pl.y));
      if (!souls.length) return fail(run, key, sk, 'No fallen souls nearby to raise');
      const n = Math.min(souls.length, Math.floor(sk.raise + sk.perRankRaise * (rank - 1)));
      const list = army(run);
      while (list.filter((s) => !s.ult).length + n > sk.maxArmy) { const old = list.find((s) => !s.ult); if (!old) break; list.splice(list.indexOf(old), 1); vanish(run, old); }
      pl.castLock = 0.35;
      K.swing(run, 0, 1, false);
      G.voice('heavy', { minGap: 0 });
      G.sfx('shSummon', { minGap: 0 }); G.sfx('shShadow', { minGap: 0, vol: 0.6 });
      K.text(run, pl.x, pl.y - 44, 'ARISE', '#c9a6ff', true);
      K.fx(run, 'shadowMist', pl.x, pl.y - 6, { scale: 0.88, fps: 18, alpha: 0.6 });
      const life = sk.life + domainRank() * G.SKILLS.monarchdomain.life;
      souls.slice(0, n).forEach((s, i) => {
        run.souls.splice(run.souls.indexOf(s), 1);
        if (s.fx) s.fx.dur = 0.0001;
        K.schedule(run, 0.15 + i * 0.12, () => { if (game.run === run) raise(run, s.id, s.x, s.y, { life, mult }); });
      });
      K.shake(run, 2);
      return true;
    },

    // ---- Lv 4: swap places with a shadow (or blink), shadow bursts where you land
    shadowexchange(run, sk, rank, mult, key) {
      const pl = run.player;
      run.player.cds[key] = Math.max(2, sk.cd - sk.cdPerRank * (rank - 1));
      const foe = K.nearestEnemy(run, pl, 260);
      const list = army(run).filter((s) => s.state !== 'rise');
      let dest, swap = null;
      if (list.length) {
        const ref = foe || K.frontPoint(pl, 80);
        swap = list.reduce((b, s) => (Math.hypot(s.x - ref.x, s.y - ref.y) < Math.hypot(b.x - ref.x, b.y - ref.y) ? s : b));
        dest = { x: swap.x, y: swap.y };
      } else {
        const { a } = aimAt(run, 200);
        dest = { x: pl.x + Math.cos(a) * sk.blink, y: pl.y + Math.sin(a) * sk.blink };
      }
      const ox = pl.x, oy = pl.y;
      K.fx(run, 'smokeDark', ox, oy - 10, { scale: 0.9, fps: 24 });
      G.sfx('shTeleport', { minGap: 0 });
      G.voice('dodge', { minGap: 0 });
      pl.x = dest.x; pl.y = dest.y; G.collide(run.map, pl, pl.r);
      if (swap) { swap.x = ox; swap.y = oy; K.fx(run, 'riseSkull', ox, oy - 10, { scale: 0.6, fps: 20 }); }
      pl.invuln = Math.max(pl.invuln, 0.35);
      if (foe) K.faceToward(pl, foe.x, foe.y);
      K.fx(run, 'portalVoid', pl.x, pl.y - 10, { scale: 0.7, fps: 22 });
      K.fx(run, 'sparkVoid', pl.x, pl.y - 12, { scale: 0.7, fps: 22 });
      K.hitArea(run, pl.x, pl.y, sk.radius, mult, null, { knock: 16, stop: 0.04 });
      K.shake(run, 2);
      return true;
    },

    // ---- Lv 6: telekinesis - lift everything in an area, then slam it down
    rulers(run, sk, rank, mult) {
      const pl = run.player;
      const t = K.nearestEnemy(run, pl, sk.range);
      const c = t ? { x: t.x, y: t.y } : K.frontPoint(pl, 60);
      if (t) K.faceToward(pl, t.x, t.y);
      pl.castLock = 0.3;
      K.swing(run, 1, 1.2, false);
      G.voice('heavy', { minGap: 0 });
      G.sfx('shLift', { minGap: 0 });
      K.fx(run, 'absorbVoid', c.x, c.y - 14, { scale: 0.85, fps: 40 });
      const victims = K.enemiesNear(run, c.x, c.y, sk.radius).filter((e) => !e.boss);
      victims.forEach((e) => { K.applyStatus(run, e, 'stun', { t: sk.lift + 0.3, noFx: true, label: 'LIFT' }); });
      (run.shLifts || (run.shLifts = [])).push({ victims, t: 0, dur: sk.lift, cx: c.x, cy: c.y, mult, bonus: 1, crit: null });
      return true;
    },

    // ---- Lv 7: killing intent - fear and vulnerability
    bloodlust(run, sk, rank) {
      const pl = run.player;
      pl.castLock = 0.25;
      G.voice('stance', { minGap: 0 });
      G.sfx('shDebuff', { minGap: 0 }); G.sfx('shShadow', { minGap: 0, vol: 0.7 });
      K.text(run, pl.x, pl.y - 44, 'BLOODLUST', '#ff6b8a', true);
      K.fx(run, 'deathMark', pl.x, pl.y - 30, { scale: 1.1, fps: 40 });
      K.fx(run, 'shadowMist', pl.x, pl.y - 6, { scale: 1.32, fps: 16, alpha: 0.6 });
      const fear = sk.fear + sk.perRankFear * (rank - 1);
      let n = 0;
      K.enemiesNear(run, pl.x, pl.y, sk.radius).forEach((e) => {
        n++;
        K.applyStatus(run, e, 'vuln', { t: sk.vulnTime, amt: sk.vuln, noFx: true });
        if (!e.boss) K.applyStatus(run, e, 'fear', { t: fear, fxKey: 'fearMark', label: 'FEAR', labelColor: '#ff6b8a' });
      });
      K.shake(run, n ? 4 : 1.5);
      return true;
    },

    // ---- Ultimate: Igris + four elite shadows, and the whole army restored
    shadowarmy(run, sk, rank, mult) {
      const pl = run.player;
      pl.castLock = 0.6; pl.invuln = Math.max(pl.invuln, 1);
      K.swing(run, 0, 0.8, false);
      G.ui.banner(sk.name, '');
      G.voice('ult', { minGap: 0, vol: 1 });
      G.sfx('shCharge', { minGap: 0 });
      K.fx(run, 'shadowMist', pl.x, pl.y - 6, { scale: 1.43, fps: 14, alpha: 0.6 });
      K.fx(run, 'portalVoid', pl.x, pl.y - 14, { scale: 1.1, fps: 16, important: true });
      army(run).forEach((s) => { s.life = s.maxLife; K.fx(run, 'soulMark', s.x, s.y - 12, { scale: 0.8 }); });
      const life = sk.life + sk.perRankLife * (rank - 1) + domainRank() * G.SKILLS.monarchdomain.life;
      K.schedule(run, 0.45, () => {
        if (game.run !== run) return;
        G.sfx('shPortal', { minGap: 0 }); G.sfx('shSummon', { minGap: 0, vol: 0.8 }); G.sfx('finisher', { minGap: 0, vol: 0.6 });
        K.hitStop(run, 0.08); K.shake(run, 8);
        const { a } = aimAt(run, 200);
        const ig = raise(run, 'knight', pl.x + Math.cos(a) * 30, pl.y + Math.sin(a) * 30, { life, mult, igris: true });
        if (ig) { ig.ult = true; K.text(run, ig.x, ig.y - 60, 'IGRIS', '#ff6b6b', true); }
        sk.soldiers.forEach((id, i) => {
          const ang = a + Math.PI * 0.5 + (i / sk.soldiers.length) * Math.PI;
          K.schedule(run, 0.1 + i * 0.1, () => {
            if (game.run !== run) return;
            const s = raise(run, id, pl.x + Math.cos(ang) * 36, pl.y + Math.sin(ang) * 26, { life, mult });
            if (s) s.ult = true;
          });
        });
      });
      return true;
    },
  };

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
      trackSouls(run);
      updateLifts(run, dt);
      const list = army(run);
      for (let i = list.length - 1; i >= 0; i--) if (!updateShadow(run, list[i], i, dt)) list.splice(i, 1);
    },
    drawables(run, out) {
      if (!K || !run.shadows || !run.shadows.length) return;
      for (const sh of run.shadows) {
        out.push({ y: sh.y, t: 5, draw: (ctx) => {
          const a = anim(sh);
          const loop = sh.anim === 'idle' || sh.anim === 'walk' || sh.anim === 'run';
          const frame = loop ? a.frame % a.n : Math.min(a.n - 1, a.frame);
          let alpha = sh.state === 'rise' ? Math.min(1, sh.stateT / 0.4) : 0.92;
          if (sh.life < 1.5) alpha *= 0.45 + 0.45 * Math.abs(Math.sin(sh.life * 10)); // flicker before fading
          K.drawSheet(ctx, G.tintedSheet(a.key, 'shadow'), frame, sh.x, sh.y, sh.def.ax, sh.def.ay, sh.def.scale, sh.face < 0, alpha);
        } });
      }
    },
  };
})();
