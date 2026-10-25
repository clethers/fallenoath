/* =========================================================================
   FALLEN OATH — Boot, input, main loop
   ========================================================================= */
(function () {
  'use strict';
  const G = (window.G = window.G || {});
  const $ = (id) => document.getElementById(id);
  const canvas = $('view');
  const ctx = canvas.getContext('2d', { alpha: false }); // opaque: the browser can skip blending the canvas with the page (big win in Safari)
  G.view = { w: 360, h: 640, dpr: 1 };

  // ------------------------------------------------------------ resize
  // autoScale: if the device can't keep up (slow frames for a few seconds), the render resolution
  // steps down automatically from 1.25 to 1. It never steps back up during a session.
  let autoScale = 1.25;
  const AUTO_STEPS = [1.25, 1];
  function resize() {
    const app = $('app');
    const r = app.getBoundingClientRect();
    // pixel art doesn't need the phone's full pixel density: rendering at up to 1.25x and letting
    // the browser scale the canvas up (image-rendering: pixelated) is about 6x less work on a 3x phone.
    // Reduced effects drops to 1x.
    const st = (G.profile && G.profile.settings) || {};
    const dpr = Math.min(window.devicePixelRatio || 1, st.reducedEffects ? 1 : 1.25, autoScale);
    canvas.width = Math.max(1, Math.round(r.width * dpr));
    canvas.height = Math.max(1, Math.round(r.height * dpr));
    G.view = { w: canvas.width, h: canvas.height, dpr };
    ctx.imageSmoothingEnabled = false;
  }
  G.resizeView = resize;
  window.addEventListener('resize', resize);
  window.addEventListener('orientationchange', () => setTimeout(resize, 200));

  // ------------------------------------------------------------ input
  const input = (G.input = { mx: 0, my: 0, attack: false, keys: {}, joy: { id: null, ox: 0, oy: 0, x: 0, y: 0 } });
  input.reset = function () {
    input.mx = 0; input.my = 0; input.attack = false; input.keys = {};
    input.joy.id = null; input.joy.x = 0; input.joy.y = 0;
    $('joy').classList.remove('on');
    $('joy-knob').style.transform = '';
  };
  function keyVector() {
    const k = input.keys;
    let x = (k.ArrowRight || k.KeyD ? 1 : 0) - (k.ArrowLeft || k.KeyA ? 1 : 0);
    let y = (k.ArrowDown || k.KeyS ? 1 : 0) - (k.ArrowUp || k.KeyW ? 1 : 0);
    const m = Math.hypot(x, y);
    return m ? [x / m, y / m] : [0, 0];
  }
  function updateMove() {
    const kv = keyVector();
    if (input.joy.id !== null) { input.mx = input.joy.x; input.my = input.joy.y; }
    else { input.mx = kv[0]; input.my = kv[1]; }
  }

  // joystick (floating, inside the joystick zone)
  const zone = $('joyzone'), joy = $('joy'), knob = $('joy-knob');
  const JR = 46;
  zone.addEventListener('pointerdown', (e) => {
    if (input.joy.id !== null) return;
    e.preventDefault();
    zone.setPointerCapture(e.pointerId);
    const zr = zone.getBoundingClientRect();
    input.joy.id = e.pointerId; input.joy.ox = e.clientX; input.joy.oy = e.clientY;
    joy.style.left = e.clientX - zr.left + 'px'; joy.style.top = e.clientY - zr.top + 'px';
    joy.classList.add('on');
  });
  zone.addEventListener('pointermove', (e) => {
    if (e.pointerId !== input.joy.id) return;
    let dx = e.clientX - input.joy.ox, dy = e.clientY - input.joy.oy;
    const d = Math.hypot(dx, dy);
    if (d > JR) { dx = (dx / d) * JR; dy = (dy / d) * JR; }
    input.joy.x = dx / JR; input.joy.y = dy / JR;
    knob.style.transform = `translate(${dx}px, ${dy}px)`;
    updateMove();
  });
  const joyEnd = (e) => {
    if (e.pointerId !== input.joy.id) return;
    input.joy.id = null; input.joy.x = 0; input.joy.y = 0;
    knob.style.transform = '';
    joy.classList.remove('on');
    joy.style.left = ''; joy.style.top = '';
    updateMove();
  };
  zone.addEventListener('pointerup', joyEnd);
  zone.addEventListener('pointercancel', joyEnd);

  // no attack button: auto-attack swings at anything in reach (Space / J still swing on a keyboard)

  document.querySelectorAll('.act.skill').forEach((b) => b.addEventListener('pointerdown', (e) => { e.preventDefault(); G.game.castSkill(+b.dataset.slot); }));
  $('btn-hp').addEventListener('pointerdown', (e) => { e.preventDefault(); G.game.usePotion('hp'); });
  $('btn-mp').addEventListener('pointerdown', (e) => { e.preventDefault(); G.game.usePotion('mp'); });

  // keyboard
  window.addEventListener('keydown', (e) => {
    if (e.repeat && !/^(Arrow|Key[WASD])/.test(e.code)) return;
    const inGame = G.ui.screen === 'hud' && G.game.run;
    const modalOpen = !$('modal').hidden || !$('sheet').hidden;
    if (e.code === 'Escape') {
      if (!$('sheet').hidden) { G.ui.closeSheet(); return; }
      if (!$('modal').hidden) { G.ui.close(); return; }
      if (inGame && !G.game.run.finished) G.ui.open('pause');
      return;
    }
    if (modalOpen) return;
    input.keys[e.code] = true;
    updateMove();
    if (!inGame) return;
    if (e.code === 'Space' || e.code === 'KeyJ') { input.attack = true; e.preventDefault(); }
    const slot = { Digit1: 0, Digit2: 1, Digit3: 2, Digit4: 3, Digit5: 4, KeyR: 4 }[e.code];
    if (slot != null) G.game.castSkill(slot);
    if (e.code === 'KeyQ') G.game.usePotion('hp');
    if (e.code === 'KeyE') G.game.usePotion('mp');
    const panel = { KeyI: 'bag', KeyC: 'hero', KeyK: 'skills', KeyL: 'quests' }[e.code];
    if (panel && !G.game.run.finished) G.ui.open(panel);
    if (e.code.startsWith('Arrow') || e.code === 'Space') e.preventDefault();
  });
  window.addEventListener('keyup', (e) => {
    input.keys[e.code] = false;
    if (e.code === 'Space' || e.code === 'KeyJ') input.attack = false;
    updateMove();
  });
  window.addEventListener('blur', () => input.reset());
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      input.reset();
      if (G.game.run && !G.game.run.finished && G.ui.screen === 'hud' && $('modal').hidden) G.ui.open('pause');
      G.save();
    }
  });
  // block browser gestures / context menu
  document.addEventListener('contextmenu', (e) => e.preventDefault());
  document.addEventListener('gesturestart', (e) => e.preventDefault());
  document.addEventListener('dblclick', (e) => e.preventDefault());

  // ------------------------------------------------------------ buttons
  document.querySelectorAll('[data-open]').forEach((b) => b.addEventListener('click', () => G.ui.open(b.dataset.open)));
  $('btn-pause').addEventListener('click', () => G.game.run && !G.game.run.finished && G.ui.open('pause'));
  $('panel-close').addEventListener('click', () => G.ui.close());
  $('modal').addEventListener('click', (e) => { if (e.target === $('modal')) G.ui.close(); });
  $('sheet').addEventListener('click', (e) => { if (e.target === $('sheet')) G.ui.closeSheet(); });

  function startProfile(p) {
    G.profile = p;
    G.slot = p.gm ? 'gm' : 'main';
    G.refreshQuests();
    G.ui.restockShop(false);
    G.save();
    G.ui.show('hub');
    if (!p.path) G.ui.open('skills');
  }
  $('btn-continue').addEventListener('click', () => {
    const r = G.loadSave('main');
    if (r.warning) G.ui.toast(r.warning, 'warn');
    if (r.profile) startProfile(r.profile);
    else G.ui.show('title');
  });
  $('btn-new').addEventListener('click', () => {
    const go = () => G.ui.chooseClass('new', (cls) => {
      startProfile(G.newProfile(cls));
      G.ui.toast('Your journey begins as a ' + G.PATHS[cls].name + '. Enter the Mossy Courtyard!', 'quest');
    });
    if (G.hasSave('main')) G.ui.confirm('Starting a new game will overwrite your current save.', go, { yes: 'Start new game', danger: true });
    else go();
  });
  // GM account: pick a class; the saved GM account is kept if it is already that class
  $('btn-gm').addEventListener('click', () => {
    G.ui.chooseClass('gm', (cls) => {
      const r = G.loadSave('gm');
      let p = r.profile;
      if (p && p.path !== cls) G.choosePath(p, cls); // same GM account, new class (maxed)
      if (!p) p = G.newGmProfile(cls);
      startProfile(p);
      G.ui.toast(r.profile ? 'GM account loaded as ' + G.PATHS[cls].name : 'GM ' + G.PATHS[cls].name + ' created: level ' + p.level + ', all skills maxed, every area unlocked', 'level');
    });
  });
  // GM account: switch character from the hub without losing level, gear or progress
  $('hub-switch').addEventListener('click', () => {
    const p = G.profile;
    if (!p || !p.gm) return;
    G.ui.chooseClass('switch', (cls) => {
      if (cls !== p.path) G.choosePath(p, cls);
      G.save();
      G.ui.show('hub');
      G.ui.toast('Switched to ' + G.PATHS[cls].name + ' (all skills maxed)', 'level');
    }, () => G.ui.show('hub'));
  });
  G.tmpSettings = G.defaultSettings();
  $('btn-title-settings').addEventListener('click', () => {
    if (!G.profile) {
      const r = G.loadSave('main');
      if (r.profile) G.profile = r.profile;
    }
    G.ui.open('settings');
  });

  G.onQuestComplete = () => G.ui.updateBadges();

  // ------------------------------------------------------------ loop
  let last = performance.now();
  let slowT = 0, slowEma = 16;
  function frame(now) {
    const raw = Math.max(0, now - last);
    const dt = Math.min(0.05, raw / 1000);
    last = now;
    // adaptive resolution: only judged while actually playing (not in menus or a hidden tab)
    if (G.game.run && G.ui.screen === 'hud' && raw < 250) {
      slowEma += (raw - slowEma) * 0.05;
      slowT = slowEma > 24 ? slowT + raw : 0;
      const i = AUTO_STEPS.indexOf(autoScale);
      if (slowT > 2500 && i >= 0 && i < AUTO_STEPS.length - 1) { autoScale = AUTO_STEPS[i + 1]; slowT = 0; slowEma = 16; resize(); }
    }
    try {
      updateMove();
      G.game.update(dt);
      G.game.render(ctx);
      G.ui.updateHUD();
    } catch (err) {
      console.error(err);
    }
    requestAnimationFrame(frame);
  }

  // autosave
  setInterval(() => { if (G.profile) G.save(); }, 15000);

  // ------------------------------------------------------------ boot
  resize();
  G.loadSfx();
  G.preloadVoices();
  G.loadAssets((f) => {
    $('load-fill').style.width = Math.round(f * 100) + '%';
    $('load-text').textContent = 'Loading assets… ' + Math.round(f * 100) + '%';
  }).then((failed) => {
    if (failed.length) {
      console.warn('[assets] ' + failed.length + ' file(s) failed to load', failed);
      $('title-foot').textContent = failed.length + ' asset file(s) could not be loaded — see console. The game will continue without them.';
    }
    const r = G.loadSave();
    resize(); // apply the saved render resolution
    if (r.warning) $('title-foot').textContent = r.warning;
    G.game.ensureShowcase();
    G.ui.show('title');
    requestAnimationFrame((t) => { last = t; frame(t); });
  });
})();
