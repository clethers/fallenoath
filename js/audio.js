/* =========================================================================
   FALLEN OATH — Sound effects (lightning skills)
   Files live in assets/audio/, converted to MP3 from the two free packs in
   Prologue\Audio:
     • Lightning Magic SFX Pack Free Version — Hove Audio (royalty free;
       trimmed, shortened tails, low-end/presence EQ, compressed + limited for punch)
     • Elemental Magic: Lightning Attacks [Free Pack] © 2024 Last Day Dreaming,
       CC BY-ND 4.0 (format conversion only — not edited)
   Uses plain <audio> elements so it also works when index.html is opened
   straight from disk.
   ========================================================================= */
(function () {
  'use strict';
  const G = (window.G = window.G || {});
  const H = 'assets/audio/Lightning Magic SFX Pack Free Version/';
  const L = 'assets/audio/LDD - Elemental Magic - Lightning Attacks [Free Pack]/';

  // key -> one or more files (a random one plays), base volume
  G.SFX = {
    strike: { src: [H + 'strike_08.mp3', H + 'strike_13.mp3', H + 'strike_16.mp3', H + 'strike_21.mp3', H + 'strike_26.mp3'], vol: 0.9, vary: 0.08 },
    strikeBig: { src: [H + 'strike_full_28.mp3'], vol: 1 },
    finisher: { src: [H + 'combo_28.mp3'], vol: 1 },
    ultBlast: { src: [H + 'combo_08.mp3'], vol: 1 },
    charge: { src: [H + 'charge_short.mp3'], vol: 0.8 },
    whoosh: { src: [H + 'cast_01.mp3'], vol: 0.85 },
    spawn: { src: [H + 'cast_01.mp3'], vol: 0.8, vary: 0.06 },
    stance: { src: [L + 'EM_LIGHT_CAST_02_S.mp3'], vol: 0.6 },
    castLong: { src: [L + 'EM_LIGHT_CAST_01_L.mp3'], vol: 0.7 },
    launch: { src: [L + 'EM_LIGHT_LAUNCH_01.mp3'], vol: 0.7 },
    impact: { src: [L + 'EM_LIGHT_IMPACT_01.mp3'], vol: 1 },
    hold: { src: [L + 'EM_LIGHT_HOLD_5s.mp3'], vol: 0.9 },
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
  const vpools = {};
  let voiceNow = null, voiceLast = 0;
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
    const src = list[Math.floor(Math.random() * list.length)];
    let a = vpools[src];
    if (!a) { a = vpools[src] = new Audio(); a.preload = 'auto'; a.src = src.startsWith('data:') ? src : encodeURI(src); }
    try {
      if (voiceNow && voiceNow !== a && !o.overlap) voiceNow.pause(); // one voice line at a time
      a.currentTime = 0;
      a.volume = Math.max(0, Math.min(1, (o.vol == null ? 0.9 : o.vol) * vol * VOICE_GAIN));
      const p = a.play();
      if (p && p.catch) p.catch(() => {});
      voiceNow = a; voiceLast = now;
    } catch (e) { /* ignore */ }
  };
  G.preloadVoices = function () {
    Object.values(G.VOICES).forEach((set) => Object.keys(set).forEach((kk) => Array.isArray(set[kk]) && set[kk].forEach((src) => {
      if (!vpools[src]) { const a = new Audio(); a.preload = 'auto'; a.src = src.startsWith('data:') ? src : encodeURI(src); vpools[src] = a; }
    })));
  };

  G.SFX_CREDITS = 'Sound: Lightning Magic SFX Pack (free) by Hove Audio · "Elemental Magic: Lightning Attacks" © 2024 Last Day Dreaming, CC BY-ND 4.0 · Hero voices: Warrior Voice Pack by John Carroll (CC0) and RPG Male Vocal "Male protagonist" by Konakuma.';

  const POOL = 4;
  const pools = {};
  const last = {};
  function settings() { return (G.profile && G.profile.settings) || G.tmpSettings || { sound: true, sfxVolume: 0.8 }; }
  function master() { const s = settings(); return s.sound === false ? 0 : Math.max(0, Math.min(1, s.sfxVolume == null ? 0.8 : s.sfxVolume)); }

  G.loadSfx = function () {
    Object.keys(G.SFX).forEach((k) => {
      pools[k] = G.SFX[k].src.map((src) => {
        const list = [];
        for (let i = 0; i < POOL; i++) {
          const a = new Audio();
          a.preload = 'auto';
          a.src = src.startsWith('data:') ? src : encodeURI(src);
          a.addEventListener('error', () => { if (!a.warned) { a.warned = true; console.warn('[audio] missing:', src); } });
          list.push(a);
        }
        return list;
      });
    });
  };

  // play a one-shot; minGap stops the same sound stacking on top of itself
  G.sfx = function (key, o) {
    o = o || {};
    const def = G.SFX[key], vol = master();
    if (!def || !pools[key] || vol <= 0) return null;
    const now = performance.now();
    if (last[key] && now - last[key] < (o.minGap == null ? 45 : o.minGap)) return null;
    last[key] = now;
    const variants = pools[key];
    const list = variants[Math.floor(Math.random() * variants.length)];
    const a = list.find((x) => x.paused || x.ended) || list[0];
    try {
      a.loop = !!o.loop;
      a.currentTime = 0;
      a.volume = Math.max(0, Math.min(1, def.vol * (o.vol == null ? 1 : o.vol) * vol));
      a.playbackRate = (o.rate || 1) * (def.vary ? 1 + (Math.random() * 2 - 1) * def.vary : 1); // slight pitch variety
      const p = a.play();
      if (p && p.catch) p.catch(() => {}); // blocked until the first tap — fine
    } catch (e) { /* ignore */ }
    return { stop: () => { try { a.pause(); a.loop = false; } catch (e) { /* ignore */ } } };
  };
  G.sfxStopAll = function () {
    if (voiceNow) try { voiceNow.pause(); } catch (e) { /* ignore */ }
    Object.values(pools).forEach((v) => v.forEach((l) => l.forEach((a) => { try { a.pause(); a.loop = false; } catch (e) { /* ignore */ } })));
  };
})();
