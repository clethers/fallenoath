/* =========================================================================
   FALLEN OATH — Sound effects (lightning skills)
   Files live in assets/audio/, converted to MP3 from the two free packs in
   Prologue\Audio:
     • Lightning Magic SFX Pack Free Version — Hove Audio (royalty free;
       trimmed, shortened tails, low-end/presence EQ, compressed + limited for punch)
     • Elemental Magic: Lightning Attacks [Free Pack] © 2024 Last Day Dreaming,
       CC BY-ND 4.0 (format conversion only — not edited)
     • Sword Combat Sound Effects Pack Free Version — Hove Audio (royalty free;
       slash whooshes + blade hits, trimmed and levelled)
   Plays through Web Audio (decoded once, cheap on phones); falls back to
   plain <audio> elements when index.html is opened straight from disk.
   ========================================================================= */
(function () {
  'use strict';
  const G = (window.G = window.G || {});
  const H = 'assets/audio/Lightning Magic SFX Pack Free Version/';
  const L = 'assets/audio/LDD - Elemental Magic - Lightning Attacks [Free Pack]/';

  // key -> one or more files (a random one plays), base volume
  const S = 'assets/audio/Sword Combat SFX Pack Free Version/';
  const M = 'assets/audio/Magic Spells SFX Lite/';
  // base volumes are a mix: lightning hits on top, swings and cues underneath.
  // (LDD files can't be edited under their licence, so they are levelled here instead.)
  G.SFX = {
    strike: { src: [H + 'strike_08.mp3', H + 'strike_13.mp3', H + 'strike_16.mp3', H + 'strike_21.mp3', H + 'strike_26.mp3'], vol: 0.8, vary: 0.08 },
    strikeBig: { src: [H + 'strike_full_28.mp3'], vol: 0.9 },
    heroSpawn: { src: [H + 'spawn_crack.mp3'], vol: 0.75 }, // strike_full_28 cut to 0.55 s: the crack without the rumble
    finisher: { src: [H + 'combo_28.mp3'], vol: 1 },
    ultBlast: { src: [H + 'combo_08.mp3'], vol: 1 },
    charge: { src: [H + 'charge_short.mp3'], vol: 0.9 },
    whoosh: { src: [H + 'cast_01.mp3'], vol: 0.6 },
    stance: { src: [L + 'EM_LIGHT_CAST_02_S.mp3'], vol: 0.85 },
    castLong: { src: [L + 'EM_LIGHT_CAST_01_L.mp3'], vol: 0.7 },
    launch: { src: [L + 'EM_LIGHT_LAUNCH_01.mp3'], vol: 1 },
    impact: { src: [L + 'EM_LIGHT_IMPACT_01.mp3'], vol: 1 },
    hold: { src: [L + 'EM_LIGHT_HOLD_5s.mp3'], vol: 0.9 },
    // sword: Hove Audio "Sword Combat Sound Effects Pack" (free) - trimmed, tightened, peak-levelled
    slash: { src: [S + 'slash_07.mp3', S + 'slash_26.mp3'], vol: 0.75, vary: 0.1 },
    slashHit: { src: [S + 'slashhit_01.mp3', S + 'slashhit_11.mp3', S + 'slashhit_17.mp3'], vol: 0.7, vary: 0.07 },
    // Shadow Monarch: Willosuna "Magic Spells SFX Lite" (royalty free, no attribution required) - trimmed and peak-levelled
    shShadow: { src: [M + 'shadow.mp3'], vol: 0.8 },
    shSummon: { src: [M + 'summon.mp3'], vol: 0.85 },
    shTeleport: { src: [M + 'teleport.mp3'], vol: 0.8 },
    shPortal: { src: [M + 'portal.mp3'], vol: 0.85 },
    shDebuff: { src: [M + 'debuff.mp3'], vol: 0.85 },
    shLift: { src: [M + 'timewarp.mp3'], vol: 0.7 },
    shSlam: { src: [M + 'slam.mp3'], vol: 1 },
    shBlast: { src: [M + 'blast.mp3'], vol: 0.8, vary: 0.06 },
    shCharge: { src: [M + 'charge.mp3'], vol: 0.8 },
    shRune: { src: [M + 'rune.mp3'], vol: 0.6 },
    // mob spawn: Hove whoosh 26 reversed, pitched down and darkened -> a dusty "poof" that swells into the smoke burst
    spawn: { src: [S + 'spawn_poof.mp3'], vol: 0.85, vary: 0.08 },
  };
  // ---- hero voices: two voice actors, picked in Settings (never mixed in one hero)
  const W = 'assets/audio/Warrior Voice Pack/';
  const K = 'assets/audio/Male protagonist/';
  const w = (names) => names.map((n) => W + n + '.mp3');
  const k = (names) => names.map((n) => K + n + '.mp3');
  G.VOICES = {
    warrior: {
      name: 'Warrior (John Carroll)',
      light: w(['lightattack1', 'lightattack2', 'lightattack3', 'lightattack4', 'attack1', 'attack2', 'attack3', 'attack4']),
      heavy: w(['heavyattack1', 'heavyattack2', 'heavyattack3', 'heavyattack4']),
      ult: w(['heavyattack2', 'heavyattack4', 'angry1', 'angry2']),
      crit: w(['crit1', 'crit2', 'crit3']),
      dodge: w(['hup1', 'hup2', 'hup3', 'hut1', 'hut2']),
      stance: w(['defend1', 'defend2']),
      hurt: w(['hit1', 'hit2', 'hit3', 'hit4', 'hit5']),
      death: w(['death1', 'death2']),
    },
    protagonist: {
      name: 'Protagonist (Konakuma)',
      light: k(['hiyah_1', 'hiyah_2', 'hiyah_3', 'grunt_ra_1', 'grunt_ra_2', 'grunt_ra_3', 'kick_1', 'kick_2', 'punch_1', 'punch_2']),
      heavy: k(['grunt_uoe_1', 'grunt_uoe_2', 'grunt_uoe_3', 'grunt_wa_1', 'hiyah_4']),
      ult: k(['hiyah_4', 'grunt_ra_4', 'grunt_ra_5']),
      crit: k(['grunt_kwa', 'grunt_ra_4', 'hiyah_2']),
      dodge: k(['jump_1', 'jump_2', 'jump_3']),
      stance: k(['jp_n_1']),
      hurt: k(['ouch_1', 'ow_1', 'jp_itai_1', 'jp_itai_2', 'grunt_oof_1', 'grunt_oof_2']),
      death: k(['pained_death_1', 'pained_death_2', 'jp_shimatta_1']),
    },
  };
  const VOICE_GAIN = 0.6; // hero voices sit under the lightning effects
  G.SFX_CREDITS = 'Sound: Lightning Magic SFX Pack and Sword Combat Sound Effects Pack (free) by Hove Audio · "Elemental Magic: Lightning Attacks" © 2024 Last Day Dreaming, CC BY-ND 4.0 · Hero voices: Warrior Voice Pack by John Carroll (CC0) and RPG Male Vocal "Male protagonist" by Konakuma. Shadow Monarch spells: Magic Spells SFX Lite by Willosuna.';

  // ---------------------------------------------------------------- playback engine
  // Phones choke on dozens of <audio> elements (each one decodes its own copy, and
  // seeking them stalls the page), so sounds are decoded once into Web Audio buffers
  // and played as cheap one-shot sources. Opened straight from disk (file://) the
  // browser won't let us fetch the files, so we fall back to <audio> elements there.
  function settings() { return (G.profile && G.profile.settings) || G.tmpSettings || { sound: true, sfxVolume: 0.8 }; }
  function master() { const s = settings(); return s.sound === false ? 0 : Math.max(0, Math.min(1, s.sfxVolume == null ? 0.8 : s.sfxVolume)); }
  const url = (src) => (src.startsWith('data:') ? src : encodeURI(src));
  const canFetch = (src) => src.startsWith('data:') || location.protocol !== 'file:';
  let AC = null;
  function ac() {
    if (AC) return AC;
    const C = window.AudioContext || window.webkitAudioContext;
    if (!C) return null;
    try { AC = new C(); } catch (e) { AC = null; }
    return AC;
  }
  const bufs = {}; // src -> AudioBuffer (undefined: loading or not tried, null: failed)
  const loading = {};
  function loadBuf(src) {
    const c = ac();
    if (!c || !canFetch(src) || loading[src]) return;
    loading[src] = fetch(url(src)).then((r) => r.arrayBuffer())
      .then((ab) => new Promise((res, rej) => c.decodeAudioData(ab, res, rej))) // callback form: older Safari
      .then((b) => { bufs[src] = b; })
      .catch(() => { bufs[src] = null; });
  }
  // the audio context starts suspended until the player touches the screen
  const unlock = () => { const c = ac(); if (c && c.state !== 'running') c.resume().catch(() => {}); };
  if (window.addEventListener) ['pointerdown', 'touchend', 'keydown'].forEach((ev) => window.addEventListener(ev, unlock, { passive: true }));
  const live = new Set(); // playing Web Audio sources, so they can all be stopped
  function playBuf(src, vol, rate, o) {
    const c = AC, b = bufs[src];
    if (!c || !b || c.state !== 'running') return null;
    const n = c.createBufferSource(), g = c.createGain();
    n.buffer = b; n.loop = !!o.loop; n.playbackRate.value = rate;
    g.gain.value = vol;
    n.connect(g); g.connect(c.destination);
    n.start(0, Math.min(o.offset || 0, Math.max(0, b.duration - 0.01)));
    const h = { n, stop: () => { try { n.stop(); } catch (e) { /* already stopped */ } live.delete(h); } };
    n.onended = () => live.delete(h);
    live.add(h);
    return h;
  }
  // <audio> fallback (file://, or before a buffer has finished decoding)
  const POOL = 3;
  const pools = {};
  function playEl(src, vol, rate, o) {
    let list = pools[src];
    if (!list) {
      list = pools[src] = [];
      for (let i = 0; i < POOL; i++) {
        const a = new Audio(); a.preload = 'auto'; a.src = url(src);
        a.addEventListener('error', () => { if (!a.warned) { a.warned = true; console.warn('[audio] missing:', src); } });
        list.push(a);
      }
    }
    const a = list.find((x) => x.paused || x.ended) || list[0];
    try {
      a.loop = !!o.loop;
      a.currentTime = o.offset || 0;
      a.volume = Math.max(0, Math.min(1, vol));
      a.playbackRate = rate;
      const p = a.play();
      if (p && p.catch) p.catch(() => {}); // blocked until the first tap: fine
    } catch (e) { /* ignore */ }
    return { el: a, stop: () => { try { a.pause(); a.loop = false; } catch (e) { /* ignore */ } } };
  }
  function play(src, vol, rate, o) {
    if (AC && canFetch(src)) { // Web Audio path: silent until decoded / unlocked (only the first instants)
      if (AC.state !== 'running') unlock();
      if (bufs[src] === undefined) loadBuf(src);
      return playBuf(src, vol, rate, o);
    }
    return playEl(src, vol, rate, o);
  }

  G.loadSfx = function () {
    const c = ac();
    Object.keys(G.SFX).forEach((k) => G.SFX[k].src.forEach((src) => {
      if (c && canFetch(src)) loadBuf(src);
      else if (!pools[src]) playEl(src, 0, 1, {}).stop(); // file://: warm up the <audio> pool
    }));
  };

  // play a one-shot; minGap stops the same sound stacking on top of itself
  const last = {};
  G.sfx = function (key, o) {
    o = o || {};
    const def = G.SFX[key], vol = master();
    if (!def || vol <= 0) return null;
    const now = performance.now();
    if (last[key] && now - last[key] < (o.minGap == null ? 45 : o.minGap)) return null;
    last[key] = now;
    const src = def.src[Math.floor(Math.random() * def.src.length)];
    const v = Math.max(0, Math.min(1, def.vol * (o.vol == null ? 1 : o.vol) * vol));
    const rate = (o.rate || 1) * (def.vary ? 1 + (Math.random() * 2 - 1) * def.vary : 1); // slight pitch variety
    const h = play(src, v, rate, o);
    return { stop: () => { if (h) h.stop(); } };
  };

  // ---- hero voices: one line at a time, never the same line twice in a row
  let voiceNow = null, voiceLast = 0, voiceLastSrc = null;
  G.voice = function (kind, o) {
    o = o || {};
    const s = settings(), vol = master();
    const vid = s.voice || 'warrior';
    const set = G.VOICES[vid];
    if (!set || vid === 'off' || vol <= 0) return;
    if (o.chance != null && Math.random() > o.chance) return;
    const now = performance.now();
    if (now - voiceLast < (o.minGap == null ? 250 : o.minGap)) return;
    const list = set[kind];
    if (!list || !list.length) return;
    let src = list[Math.floor(Math.random() * list.length)];
    if (list.length > 1) while (src === voiceLastSrc) src = list[Math.floor(Math.random() * list.length)];
    voiceLastSrc = src;
    if (voiceNow && !o.overlap) voiceNow.stop();
    if (!bufs[src]) loadBuf(src);
    voiceNow = play(src, Math.max(0, Math.min(1, (o.vol == null ? 0.9 : o.vol) * vol * VOICE_GAIN)), 1, {});
    voiceLast = now;
  };
  // only the chosen actor's lines are loaded up front; the other set loads if picked in Settings
  G.preloadVoices = function () {
    const vid = settings().voice || 'warrior';
    const set = G.VOICES[vid];
    if (!set || !ac()) return;
    Object.keys(set).forEach((kk) => Array.isArray(set[kk]) && set[kk].forEach(loadBuf));
  };
  G.sfxStopAll = function () {
    if (voiceNow) voiceNow.stop();
    live.forEach((h) => h.stop());
    Object.values(pools).forEach((l) => l.forEach((a) => { try { a.pause(); a.loop = false; } catch (e) { /* ignore */ } }));
  };
})();
