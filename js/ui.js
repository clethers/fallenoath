/* =========================================================================
   FALLEN OATH — Interface: screens, HUD, panels, dialogs
   ========================================================================= */
(function () {
  'use strict';
  const G = (window.G = window.G || {});
  const C = G.CONFIG;
  const $ = (id) => document.getElementById(id);
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const fmt = (n) => Math.floor(n).toLocaleString('en-US');

  const ui = (G.ui = { screen: 'loading', panel: null, tab: null, cache: {}, pickSkill: null });

  // ------------------------------------------------------------ screens
  ui.show = function (name) {
    ['loading', 'title', 'hub', 'hud'].forEach((s) => {
      const el = $(s === 'hud' ? 'hud' : 'screen-' + s);
      el.classList.toggle('active', s === name);
    });
    ui.screen = name;
    document.getElementById('app').classList.toggle('screen-hub-mode', name !== 'hud');
    if (name === 'hub') ui.refreshHub();
    if (name === 'title') {
      $('btn-continue').disabled = !G.hasSave();
    }
  };

  // ------------------------------------------------------------ toasts / banner
  const lastToast = {};
  ui.toast = function (msg, kind, color) {
    const now = performance.now();
    if (lastToast[msg] && now - lastToast[msg] < 1500) return; // suppress repeated identical toasts
    lastToast[msg] = now;
    const box = $('toasts');
    while (box.children.length > 3) box.firstChild.remove();
    const t = document.createElement('div');
    t.className = 'toast ' + (kind || '');
    if (color) { t.style.borderColor = color; t.style.color = color; }
    t.textContent = msg;
    box.appendChild(t);
    setTimeout(() => t.remove(), 2900);
  };
  let bannerTimer = 0;
  ui.banner = function (title, sub) {
    const b = $('banner');
    b.querySelector('b').textContent = title;
    b.querySelector('span').textContent = sub || '';
    b.classList.add('show');
    clearTimeout(bannerTimer);
    bannerTimer = setTimeout(() => b.classList.remove('show'), 1800);
  };
  ui.bossBar = function (e) {
    ui.boss = e;
    $('bossbar').hidden = !e;
    if (e) $('boss-name').textContent = e.def.name + '  ·  Lv ' + e.level;
  };

  // ------------------------------------------------------------ badges
  function claimable() { return G.QUESTS.filter((q) => { const s = G.profile.quests[q.id]; return s && s.done && !s.claimed; }).length; }
  function learnableSkills() {
    const p = G.profile;
    if (!p.path) return 1;
    return G.SKILL_ORDER.filter((k) => !G.skillBlock(p, k)).length;
  }
  ui.updateBadges = function () {
    const p = G.profile;
    if (!p) return;
    const set = (id, n) => { const el = $(id); if (!el) return; el.textContent = n > 0 ? n : ''; el.classList.toggle('on', n > 0); };
    const q = claimable(), sk = !p.path ? 1 : learnableSkills() ? p.skillPoints : 0;
    set('badge-hero', p.attrPoints); set('hbadge-hero', p.attrPoints);
    set('badge-skills', sk); set('hbadge-skills', sk);
    set('badge-quests', q); set('hbadge-quests', q);
  };

  // ------------------------------------------------------------ hub
  const thumbs = {};
  function areaThumb(area) {
    if (thumbs[area.id]) return thumbs[area.id];
    const map = G.buildArea(area);
    const c = document.createElement('canvas');
    c.width = 96; c.height = 96;
    const g = c.getContext('2d');
    g.imageSmoothingEnabled = false;
    const s = 96 / 200, ox = -(map.W / 2 - 100), oy = -(area.theme === 'shrine' || area.theme === 'trial' ? 60 : 40);
    g.setTransform(s, 0, 0, s, ox * s, oy * s);
    g.drawImage(map.ground, 0, 0);
    map.deco.forEach((d) => (d.floor || d.top || d.key === 'wallFront') && G.drawDeco(g, d));
    map.props.slice().sort((a, b) => a.y - b.y).forEach((pr) => G.drawProp(g, pr.key, pr.x, pr.y));
    thumbs[area.id] = c;
    return c;
  }
  function thumbCopy(area) {
    const src = areaThumb(area);
    const c = document.createElement('canvas');
    c.width = 96; c.height = 96;
    c.getContext('2d').drawImage(src, 0, 0); // canvas-to-canvas copy works even from file:// (no toDataURL)
    return c;
  }

  ui.refreshHub = function () {
    const p = G.profile;
    if (!p) return;
    $('hub-lv').textContent = p.level;
    $('hub-name').textContent = p.gm ? 'Game Master' : 'Adventurer';
    $('hub-gm').hidden = !p.gm;
    const need = C.xpForLevel(p.level);
    $('hub-xp').style.width = (p.level >= C.MAX_LEVEL ? 100 : (p.xp / need) * 100) + '%';
    $('hub-xp-text').textContent = p.level >= C.MAX_LEVEL ? 'Max level' : fmt(p.xp) + ' / ' + fmt(need) + ' XP';
    $('hub-gold').textContent = fmt(p.gold);
    const list = $('area-list');
    list.innerHTML = '';
    G.AREAS.forEach((a) => {
      const st = p.areas[a.id];
      const unlocked = st && st.unlocked;
      const card = document.createElement('button');
      card.className = 'area-card' + (unlocked ? '' : ' locked');
      const lvClass = p.level >= a.level ? 'ok' : 'warn';
      const prevName = G.AREAS[G.AREAS.indexOf(a) - 1];
      card.innerHTML =
        '<span class="thumb"></span>' +
        `<div><h4>${esc(a.name)}</h4><p>${esc(unlocked ? a.desc : 'Clear ' + (prevName ? prevName.name : 'the previous area') + ' to unlock.')}</p>` +
        `<div class="meta"><span class="chip ${lvClass}">Rec. Lv ${a.level}</span>` +
        (a.endless ? `<span class="chip">Best wave ${p.bestWave}</span>` : `<span class="chip">${a.waves.length} waves${a.boss ? ' + boss' : ''}</span>`) +
        (st && st.cleared ? `<span class="chip ok">Cleared ×${st.cleared}</span>` : '') + '</div></div>';
      card.querySelector('.thumb').replaceWith(thumbCopy(a));
      card.addEventListener('click', () => {
        if (!unlocked) { ui.toast('Locked — clear the previous area first', 'warn'); return; }
        if (!p.path) { ui.toast('Choose your path first', 'skill'); ui.open('skills'); return; }
        const go = () => { ui.show('hud'); G.game.startArea(a.id); };
        if (p.level < a.level - 1) ui.confirm('This area is recommended for level ' + a.level + '. Enter anyway?', go, { yes: 'Enter' });
        else go();
      });
      list.appendChild(card);
    });
    ui.updateBadges();
  };

  // ------------------------------------------------------------ HUD
  function setW(id, pct) {
    const k = 'w_' + id, v = Math.max(0, Math.min(100, pct)).toFixed(1);
    if (ui.cache[k] !== v) { ui.cache[k] = v; $(id).style.width = v + '%'; }
  }
  function setT(id, txt) {
    const k = 't_' + id;
    if (ui.cache[k] !== txt) { ui.cache[k] = txt; $(id).textContent = txt; }
  }

  ui.onRunStart = function (run) {
    ui.cache = {};
    ui.bossBar(null);
    ui.refreshSkillButtons();
    $('hud').classList.toggle('lefty', !!G.profile.settings.leftHanded);
    ui.updateBadges();
  };

  ui.refreshSkillButtons = function () {
    const p = G.profile;
    document.querySelectorAll('.act.skill').forEach((b) => {
      const i = +b.dataset.slot, key = G.barSkill(p, i);
      const ico = b.querySelector('.ico');
      b.classList.toggle('empty', !key);
      b.classList.toggle('ult', i === G.ULT_SLOT);
      if (key) {
        const sk = G.SKILLS[key];
        ico.setAttribute('style', G.fxIconStyle(sk.icon[0], sk.icon[1], 56));
        b.querySelector('small').textContent = sk.mp + ' MP';
        b.setAttribute('aria-label', sk.name);
      } else { ico.removeAttribute('style'); b.querySelector('small').textContent = ''; }
    });
  };

  ui.updateHUD = function () {
    const run = G.game.run;
    if (!run || ui.screen !== 'hud') return;
    const p = G.profile, pl = run.player, s = pl.stats;
    setT('hud-lv', String(p.level));
    setW('hud-hp', (pl.hp / s.maxHp) * 100); setT('hud-hp-text', Math.ceil(pl.hp) + ' / ' + s.maxHp);
    setW('hud-mp', (pl.mp / s.maxMp) * 100); setT('hud-mp-text', Math.floor(pl.mp) + ' / ' + s.maxMp);
    setW('hud-xp', p.level >= C.MAX_LEVEL ? 100 : (p.xp / C.xpForLevel(p.level)) * 100);
    setT('hud-gold', fmt(p.gold));
    setT('hp-count', String(G.invCount(p, 'hpPotion')));
    setT('mp-count', String(G.invCount(p, 'mpPotion')));
    // skills
    document.querySelectorAll('.act.skill').forEach((b) => {
      const key = G.barSkill(p, +b.dataset.slot);
      const cdEl = b.querySelector('.cd');
      if (!key) { if (cdEl.textContent) { cdEl.textContent = ''; cdEl.style.background = ''; } return; }
      const sk = G.SKILLS[key], cd = pl.cds[key] || 0;
      const label = cd > 0 ? (cd < 1 ? cd.toFixed(1) : Math.ceil(cd)) + '' : '';
      const pct = cd > 0 ? (cd / sk.cd) * 100 : 0;
      const bg = cd > 0 ? `conic-gradient(rgba(0,0,0,.7) ${pct.toFixed(0)}%, rgba(0,0,0,.15) 0)` : '';
      if (cdEl.textContent !== label) cdEl.textContent = label;
      const ck = 'cdp_' + b.dataset.slot;
      if (ui.cache[ck] > 0 && cd <= 0) { b.classList.remove('ready'); void b.offsetWidth; b.classList.add('ready'); setTimeout(() => b.classList.remove('ready'), 700); }
      ui.cache[ck] = cd;
      if (cdEl.style.background !== bg) cdEl.style.background = bg;
      b.classList.toggle('nomp', pl.mp < sk.mp);
    });
    // boss
    if (ui.boss) setW('boss-fill', (ui.boss.hp / ui.boss.maxHp) * 100);
    // buffs
    let bt = '';
    if (pl.buffTimers) Object.keys(pl.buffTimers).forEach((k) => (bt += `<div class="buff">${esc(G.SKILLS[k].name)} ${Math.ceil(pl.buffTimers[k])}s</div>`));
    if (ui.cache.buffs !== bt) { ui.cache.buffs = bt; $('buffs').innerHTML = bt; }
    // tracker (throttled)
    const now = performance.now();
    if (!ui.cache.trT || now - ui.cache.trT > 300) { ui.cache.trT = now; renderTracker(run); }
  };

  function renderTracker(run) {
    const p = G.profile, a = run.area;
    const alive = run.enemies.filter((e) => !e.dead).length + run.spawnQueue.length;
    let line;
    if (run.phase === 'cleared' || run.phase === 'victory') line = run.map.chest && !run.chestOpened ? '<b>Area cleared!</b> Open the chest' : '<b>Area cleared!</b>';
    else if (a.endless) line = `<b>Wave ${Math.max(1, run.waveIdx + 1)}</b> · Best ${p.bestWave} · Foes ${alive}`;
    else if (run.phase === 'boss') line = `<b>Boss fight</b> · Foes ${alive}`;
    else line = `<b>Wave ${Math.max(1, Math.min(a.waves.length, run.waveIdx + 1))}/${a.waves.length}</b> · Foes ${alive}`;
    const qs = G.QUESTS.filter((q) => G.questAvailable(p, q) && !(p.quests[q.id] && p.quests[q.id].claimed)).slice(0, 2);
    let html = line;
    qs.forEach((q) => {
      const st = G.questState(p, q);
      html += st.done ? `<br><span class="done">✓ ${esc(q.name)} — claim</span>` : `<br>${esc(q.name)} ${st.progress}/${q.count}`;
    });
    if (ui.cache.tracker !== html) { ui.cache.tracker = html; $('tracker').innerHTML = html; }
  }

  // ------------------------------------------------------------ panels
  const PANELS = {
    hero: { title: 'Hero', tabs: [['stats', 'Stats'], ['gear', 'Equipment']], render: renderHero },
    bag: { title: 'Bag', render: renderBag },
    skills: { title: 'Skills', render: renderSkills },
    quests: { title: 'Quest Journal', render: renderQuests },
    shop: { title: 'Merchant', tabs: [['buy', 'Buy'], ['sell', 'Sell']], render: renderShop },
    settings: { title: 'Settings', render: renderSettings },
    pause: { title: 'Paused', render: renderPause, center: true },
    result: { title: '', render: () => {}, center: true, locked: true },
  };

  ui.open = function (name, tab) {
    if (name === 'map') { // leave the current area
      if (!G.game.run || G.game.run.finished) { ui.close(true); ui.show('hub'); return; }
      ui.confirm('Leave this area? You keep all experience, gold and items gained so far.', () => { ui.close(true); G.game.leaveRun(); }, { yes: 'Leave', danger: true });
      return;
    }
    const def = PANELS[name];
    if (!def) return;
    if (name === 'shop' && G.game.run) { ui.toast('The merchant is only available on the World Map', 'warn'); return; }
    ui.panel = name;
    ui.tab = tab || (def.tabs ? def.tabs[0][0] : null);
    if (G.game.run) G.game.paused = true;
    G.input.reset();
    $('modal').hidden = false;
    $('modal').classList.toggle('center', !!def.center);
    $('panel-close').hidden = !!def.locked;
    ui.renderPanel();
  };
  ui.renderPanel = function () {
    const def = PANELS[ui.panel];
    if (!def) return;
    $('panel-title').textContent = def.title;
    const tabs = $('panel-tabs');
    tabs.innerHTML = '';
    (def.tabs || []).forEach(([id, label]) => {
      const t = document.createElement('button');
      t.className = 'tab' + (ui.tab === id ? ' on' : '');
      t.textContent = label;
      t.onclick = () => { ui.tab = id; ui.renderPanel(); };
      tabs.appendChild(t);
    });
    const body = $('panel-body');
    const top = body.scrollTop;
    body.innerHTML = '';
    def.render(body);
    body.scrollTop = top;
    ui.updateBadges();
  };
  ui.close = function (force) {
    const def = PANELS[ui.panel];
    if (def && def.locked && !force) return;
    $('modal').hidden = true;
    ui.panel = null;
    ui.pickSkill = null;
    $('sheet').hidden = true;
    if (G.game.run && !G.game.run.finished) { G.game.paused = false; ui.refreshSkillButtons(); }
    if (ui.screen === 'hub') ui.refreshHub();
    G.save();
  };

  function el(html) { const d = document.createElement('div'); d.innerHTML = html.trim(); return d.firstChild; }
  function btn(label, cls, onClick, disabled) {
    const b = document.createElement('button');
    b.className = 'btn ' + (cls || '');
    b.textContent = label;
    b.disabled = !!disabled;
    b.onclick = onClick;
    return b;
  }

  // ---- hero
  function renderHero(body) {
    const p = G.profile;
    if (ui.tab === 'gear') { renderEquipment(body); return; }
    const s = G.calcStats(p, null);
    body.appendChild(el(`<div class="section-title">Level ${p.level} Adventurer</div>`));
    const need = C.xpForLevel(p.level);
    body.appendChild(el(`<div class="card"><div class="row"><div class="grow"><div class="bar xp"><i style="width:${p.level >= C.MAX_LEVEL ? 100 : (p.xp / need) * 100}%"></i></div></div>
      <span class="tiny muted">${p.level >= C.MAX_LEVEL ? 'MAX' : fmt(p.xp) + ' / ' + fmt(need) + ' XP'}</span></div></div>`));
    body.appendChild(el(`<div class="section-title">Attributes</div>`));
    const pts = el(`<div class="note" style="margin-bottom:6px">Unspent points: <b style="color:var(--gold-2)">${p.attrPoints}</b> (gain ${C.ATTR_POINTS_PER_LEVEL} per level)</div>`);
    body.appendChild(pts);
    const st = el('<div class="stack"></div>');
    Object.keys(C.ATTR).forEach((k) => {
      const a = C.ATTR[k];
      const row = el(`<div class="attr-row"><div class="grow"><div class="name">${a.name}</div><div class="desc">${a.desc}</div></div><div class="val">${p.attrs[k]}</div></div>`);
      const plus = document.createElement('button');
      plus.className = 'plus'; plus.textContent = '+'; plus.disabled = p.attrPoints <= 0;
      plus.setAttribute('aria-label', 'Add ' + a.name);
      plus.onclick = () => {
        if (G.profile.attrPoints <= 0) return;
        G.profile.attrPoints--; G.profile.attrs[k]++;
        syncRunStats();
        G.save(); ui.renderPanel();
      };
      row.appendChild(plus);
      st.appendChild(row);
    });
    body.appendChild(st);
    body.appendChild(el(`<div class="section-title">Combat stats</div>`));
    const grid = el('<div class="stats-grid"></div>');
    [['Max HP', s.maxHp], ['Max MP', s.maxMp], ['Attack', s.atk.toFixed(1)], ['Defense', s.def.toFixed(1)], ['Crit chance', (s.crit * 100).toFixed(1) + '%'],
      ['Crit damage', (s.critDmg * 100).toFixed(0) + '%'], ['Attack speed', (s.atkSpeed * 100).toFixed(0) + '%'], ['Move speed', s.moveSpeed.toFixed(0)],
      ['MP regen', s.mpRegen.toFixed(2) + '/s'], ['Skill power', (s.skillPower * 100).toFixed(0) + '%'],
      ['Damage taken', ((C.DEF_K / (C.DEF_K + s.def)) * 100).toFixed(0) + '%'], ['Enemies defeated', fmt(p.stats.kills)]].forEach(([k, v]) =>
      grid.appendChild(el(`<div class="stat"><span>${k}</span><b>${v}</b></div>`)));
    body.appendChild(grid);
  }

  function syncRunStats() {
    const run = G.game.run;
    if (!run) return;
    const pl = run.player, old = pl.stats;
    pl.stats = G.calcStats(G.profile, pl.buffs);
    if (pl.stats.maxHp > old.maxHp) pl.hp += pl.stats.maxHp - old.maxHp;
    if (pl.stats.maxMp > old.maxMp) pl.mp += pl.stats.maxMp - old.maxMp;
    pl.hp = Math.min(pl.hp, pl.stats.maxHp); pl.mp = Math.min(pl.mp, pl.stats.maxMp);
  }
  ui.syncRunStats = syncRunStats;

  const SLOT_NAMES = { weapon: 'Weapon', armor: 'Armor', accessory: 'Accessory' };
  const SLOT_TAG = { weapon: 'WPN', armor: 'ARM', accessory: 'ACC' };
  function equipRow() {
    const p = G.profile;
    const row = el('<div class="equip-row"></div>');
    Object.keys(SLOT_NAMES).forEach((slot) => {
      const it = p.equipped[slot];
      const b = document.createElement('button');
      b.className = 'slot' + (it ? ' filled r-' + it.rarity : '');
      b.innerHTML = `<div class="slot-label">${SLOT_NAMES[slot]}</div>` + (it ? `<div class="iname" style="color:${G.rarityOf(it).color}">${esc(it.name)}</div>` +
        G.itemStatLines(it.stats).slice(0, 2).map((l) => `<div class="tiny muted">${l.text} ${l.label}</div>`).join('') : '<div class="iname muted">Empty</div>');
      b.onclick = () => it && ui.itemSheet(it, 'equipped');
      row.appendChild(b);
    });
    return row;
  }
  function renderEquipment(body) {
    body.appendChild(el('<div class="section-title">Equipped</div>'));
    body.appendChild(equipRow());
    body.appendChild(el('<p class="note">Tap an equipped item to inspect or unequip it. Equip new gear from your Bag. Item art does not exist in the asset folder, so gear is shown as rarity-coloured cards.</p>'));
    const gear = G.profile.inventory.filter((i) => i.kind === 'gear');
    body.appendChild(el(`<div class="section-title">Gear in bag (${gear.length})</div>`));
    body.appendChild(invGrid(gear, 'bag', false));
  }

  // ---- bag
  function isBetter(it) {
    const cur = G.profile.equipped[it.slot];
    const score = (x) => (x ? (x.stats.atk || 0) * 3 + (x.stats.def || 0) * 2.5 + (x.stats.maxHp || 0) * 0.3 + (x.stats.maxMp || 0) * 0.3 + (x.stats.crit || 0) * 300 + (x.stats.atkSpeed || 0) * 200 + (x.stats.mpRegen || 0) * 10 : 0);
    return score(it) > score(cur);
  }
  function invGrid(items, ctx, fill) {
    const grid = el('<div class="inv-grid"></div>');
    items.forEach((it) => {
      const b = document.createElement('button');
      if (it.kind === 'gear') {
        const r = G.rarityOf(it);
        b.className = 'inv r-' + it.rarity;
        b.innerHTML = `<span class="tag" style="color:${r.color}">${SLOT_TAG[it.slot]}</span><span class="nm">${esc(it.name)}</span>` + (isBetter(it) ? '<span class="better">▲</span>' : '');
      } else {
        const c = G.CONSUMABLES[it.key];
        b.className = 'inv r-common';
        b.innerHTML = `<span class="tag" style="color:${it.key === 'hpPotion' ? '#ef7a6a' : it.key === 'mpPotion' ? '#7ab0ef' : '#e8c27a'}">${it.key === 'tusk' ? 'MAT' : 'USE'}</span><span class="nm">${esc(c.name)}</span><span class="qty">${it.qty}</span>`;
      }
      b.onclick = () => ui.itemSheet(it, ctx);
      grid.appendChild(b);
    });
    if (fill) for (let i = items.length; i < C.INVENTORY_SIZE; i++) grid.appendChild(el('<div class="inv empty"></div>'));
    return grid;
  }
  function renderBag(body) {
    const p = G.profile;
    body.appendChild(el('<div class="section-title">Equipped</div>'));
    body.appendChild(equipRow());
    body.appendChild(el(`<div class="cap"><span>Inventory</span><span>${p.inventory.length} / ${C.INVENTORY_SIZE} slots · <b style="color:var(--gold-2)">${fmt(p.gold)}g</b></span></div>`));
    body.appendChild(invGrid(p.inventory, 'bag', true));
    body.appendChild(el('<p class="note">▲ marks gear that looks stronger than what you wear. Tap any item for details.</p>'));
  }

  function statCompare(it) {
    const cur = G.profile.equipped[it.slot];
    if (!cur || cur.id === it.id) return '';
    const keys = new Set([...Object.keys(it.stats), ...Object.keys(cur.stats)]);
    let out = '';
    keys.forEach((k) => {
      const d = (it.stats[k] || 0) - (cur.stats[k] || 0);
      if (Math.abs(d) < 1e-6) return;
      const t = G.PCT_STATS[k] ? (d * 100).toFixed(1) + '%' : k === 'mpRegen' ? d.toFixed(2) : Math.round(d);
      out += `<div class="${d > 0 ? 'cmp-up' : 'cmp-down'}">${d > 0 ? '+' : ''}${t} ${G.STAT_LABEL[k]}</div>`;
    });
    return out ? `<div class="section-title" style="margin-top:4px">vs. equipped ${esc(cur.name)}</div>${out}` : '';
  }

  // ---- item detail sheet
  ui.itemSheet = function (it, ctx) {
    const p = G.profile, card = $('sheet-card');
    card.innerHTML = '';
    const acts = el('<div class="sheet-actions"></div>');
    if (it.kind === 'gear') {
      const r = G.rarityOf(it);
      card.appendChild(el(`<div><h4 style="color:${r.color}">${esc(it.name)}</h4><div class="rar muted">${r.name} ${SLOT_NAMES[it.slot]} · Item level ${it.ilvl}</div>
        <div class="lines">${G.itemStatLines(it.stats).map((l) => `<div>${l.text} <span class="muted">${l.label}</span></div>`).join('')}</div>${ctx !== 'equipped' ? statCompare(it) : ''}</div>`));
      if (ctx === 'bag') {
        acts.appendChild(btn('Equip', 'primary', () => { G.equip(p, it.id); syncRunStats(); G.save(); closeSheet(); ui.renderPanel(); }));
        acts.appendChild(btn('Discard', 'danger', () => ui.confirm('Discard ' + it.name + '? This cannot be undone.', () => {
          const i = p.inventory.indexOf(it); if (i >= 0) p.inventory.splice(i, 1); G.save(); ui.renderPanel();
        }, { yes: 'Discard', danger: true })));
      } else if (ctx === 'equipped') {
        acts.appendChild(btn('Unequip', '', () => {
          if (!G.unequip(p, it.slot)) { ui.toast('Bag is full', 'warn'); return; }
          syncRunStats(); G.save(); closeSheet(); ui.renderPanel();
        }));
      } else if (ctx === 'sell') {
        const v = Math.round(it.value);
        acts.appendChild(btn('Sell for ' + v + 'g', 'primary', () => {
          const i = p.inventory.indexOf(it); if (i < 0) return;
          p.inventory.splice(i, 1); p.gold += v; G.save(); closeSheet(); ui.toast('Sold ' + it.name + ' for ' + v + 'g'); ui.renderPanel();
        }));
      } else if (ctx === 'buy') {
        const price = shopPrice(it);
        acts.appendChild(btn('Buy for ' + price + 'g', 'primary', () => {
          if (p.gold < price) { ui.toast('Not enough gold', 'warn'); return; }
          if (p.inventory.length >= C.INVENTORY_SIZE) { ui.toast('Bag is full', 'warn'); return; }
          const i = p.shop.stock.indexOf(it); if (i < 0) return;
          p.shop.stock.splice(i, 1); p.gold -= price; G.addGear(p, it); G.save(); closeSheet(); ui.toast('Bought ' + it.name); ui.renderPanel();
        }, p.gold < price));
      }
    } else {
      const c = G.CONSUMABLES[it.key];
      card.appendChild(el(`<div><h4>${esc(c.name)}</h4><div class="rar muted">Owned: ${it.qty}</div><div class="lines"><div>${esc(c.desc)}</div></div></div>`));
      if (ctx === 'bag' && !c.material) {
        const inRun = !!G.game.run && !G.game.run.finished;
        acts.appendChild(btn('Use', 'primary', () => {
          G.game.paused = false;
          const ok = G.game.usePotion(it.key === 'hpPotion' ? 'hp' : 'mp');
          G.game.paused = true;
          if (ok) { closeSheet(); ui.renderPanel(); }
        }, !inRun));
        if (!inRun) card.appendChild(el('<p class="note">Potions can be used during an adventure. HP and MP are fully restored when you enter an area.</p>'));
      }
      if (ctx === 'sell') {
        acts.appendChild(btn('Sell 1 for ' + c.value + 'g', 'primary', () => {
          if (G.removeConsumable(p, it.key, 1)) { p.gold += c.value; G.refreshQuests(); G.save(); ui.renderPanel(); if (!p.inventory.includes(it)) closeSheet(); else ui.itemSheet(it, 'sell'); }
        }));
      }
    }
    acts.appendChild(btn('Close', 'ghost', closeSheet));
    card.appendChild(acts);
    $('sheet').hidden = false;
  };
  function closeSheet() {
    $('sheet').hidden = true;
    if (!ui.panel && G.game.run && !G.game.run.finished) G.game.paused = false;
  }
  ui.closeSheet = closeSheet;

  ui.confirm = function (msg, onYes, o) {
    o = o || {};
    const card = $('sheet-card');
    card.innerHTML = '';
    card.appendChild(el(`<div><h4>${esc(o.title || 'Are you sure?')}</h4><p class="note" style="font-size:14px;color:var(--ink)">${esc(msg)}</p></div>`));
    const acts = el('<div class="sheet-actions"></div>');
    acts.appendChild(btn(o.no || 'Cancel', 'ghost', closeSheet));
    acts.appendChild(btn(o.yes || 'Confirm', o.danger ? 'danger' : 'primary', () => { closeSheet(); onYes(); }));
    card.appendChild(acts);
    $('sheet').hidden = false;
    if (G.game.run) { G.game.paused = true; G.input.reset(); }
    ui.confirmOpen = true;
  };

  // ---- skills: elemental skill tree
  function renderSkills(body) {
    const p = G.profile;
    if (!p.path) G.choosePath(p, 'storm'); // the hero is a lightning swordsman
    const path = G.PATHS[p.path];
    body.appendChild(el(`<div class="path-head" style="--pc:${path.color}"><div class="skill-ico big" style='${G.fxIconStyle(path.icon[0], path.icon[1], 58)}'></div>
      <div class="grow"><div class="path-name">${esc(path.name)}</div><div class="note">${esc(path.element)} · Skill points: <b style="color:var(--gold-2)">${p.skillPoints}</b> (1 per level)</div></div></div>`));
    // action bar preview: 4 chosen skills + ultimate
    G.fixSlots(p);
    const bar = el('<div class="bar-preview"></div>');
    [0, 1, 2, 3, G.ULT_SLOT].forEach((i) => {
      const k = G.barSkill(p, i);
      const sl = el(`<div class="sslot${k ? ' filled' : ''}${i === G.ULT_SLOT ? ' ult' : ''}">${k ? `<i class="ico" style='${G.fxIconStyle(G.SKILLS[k].icon[0], G.SKILLS[k].icon[1], 52)}'></i>` : ''}<b>${i === G.ULT_SLOT ? 'ULT' : i + 1}</b></div>`);
      if (k) sl.title = G.SKILLS[k].name;
      bar.appendChild(sl);
    });
    body.appendChild(el('<div class="section-title">Action bar <span class="tiny" style="text-transform:none;letter-spacing:0">· tap a learned skill to choose its slot</span></div>'));
    body.appendChild(bar);
    const tree = el(`<div class="tree" style="--pc:${path.color}"></div>`);
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 100 100'); svg.setAttribute('preserveAspectRatio', 'none'); svg.setAttribute('class', 'tree-lines');
    const pos = {};
    G.TREE_LAYOUT.forEach((l) => (pos[l.slot] = l));
    const nodes = G.TREE_LAYOUT.map((l) => G.pathSkill(p.path, l.slot));
    nodes.forEach((k) => {
      const sk = G.SKILLS[k];
      if (!sk.req) return;
      const a = pos[G.SKILLS[sk.req].slot], b = pos[sk.slot];
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', a.x); line.setAttribute('y1', a.y); line.setAttribute('x2', b.x); line.setAttribute('y2', b.y);
      line.setAttribute('class', p.skills[k] > 0 ? 'on' : p.skills[sk.req] > 0 ? 'open' : '');
      svg.appendChild(line);
    });
    tree.appendChild(svg);
    nodes.forEach((k) => {
      const sk = G.SKILLS[k], l = pos[sk.slot], rank = p.skills[k] || 0;
      const block = G.skillBlock(p, k);
      const state = rank > 0 ? 'learned' : sk.unlock > p.level || (sk.req && !(p.skills[sk.req] > 0)) ? 'locked' : 'open';
      const n = document.createElement('button');
      n.className = `node ${state}${sk.ult ? ' ult' : ''}${sk.kind === 'passive' ? ' passive' : ''}${!block ? ' can' : ''}`;
      n.style.left = l.x + '%'; n.style.top = l.y + '%';
      n.innerHTML = `<i class="ico" style='${G.fxIconStyle(sk.icon[0], sk.icon[1], sk.ult ? 74 : 60)}'></i><b class="rk">${rank}/${G.SKILL_MAX_RANK}</b>` +
        `<span class="nlabel">${esc(sk.name)}${sk.unlock > p.level ? `<em>Lv ${sk.unlock}</em>` : ''}</span>`;
      n.setAttribute('aria-label', sk.name + ', rank ' + rank);
      n.onclick = () => skillSheet(k);
      tree.appendChild(n);
    });
    body.appendChild(tree);
    body.appendChild(el('<p class="note">8 skills: 6 actives and 2 passives (diamond frames, always on). Pick which 4 actives sit on the action bar from each skill’s details; the ultimate always has its own button.</p>'));
  }

  function skillSheet(k) {
    const p = G.profile, sk = G.SKILLS[k], rank = p.skills[k] || 0, card = $('sheet-card');
    const block = G.skillBlock(p, k);
    card.innerHTML = '';
    card.appendChild(el(`<div><div class="row"><div class="skill-ico" style='${G.fxIconStyle(sk.icon[0], sk.icon[1], 54)}'></div><div class="grow">
      <h4>${esc(sk.name)}</h4><div class="rar muted">${sk.ult ? 'Ultimate' : sk.kind === 'passive' ? 'Passive' : 'Active'} · Rank ${rank}/${G.SKILL_MAX_RANK} · Unlocks at Lv ${sk.unlock}</div></div></div>
      <p class="note" style="font-size:14px;color:var(--ink)">${esc(sk.desc)}</p>
      <div class="lines">${skillNumbers(k, Math.max(1, rank)).map((t) => `<div>${t}</div>`).join('')}${rank > 0 && rank < G.SKILL_MAX_RANK ? `<div class="cmp-up">Next rank: ${skillNumbers(k, rank + 1)[0] || ''}</div>` : ''}</div>
      ${sk.fx ? `<div class="tiny muted">Effects: ${esc(sk.fx)}</div>` : ''}</div>`));
    if (sk.kind === 'active' && !sk.ult && rank > 0) {
      const row = el('<div class="slot-pick"><span class="tiny muted">Action bar slot:</span></div>');
      [0, 1, 2, 3].forEach((i) => {
        const on = p.slots[i] === k;
        row.appendChild(btn(String(i + 1), 'small' + (on ? ' primary' : ''), () => {
          const prev = p.slots.indexOf(k);
          if (prev >= 0) p.slots[prev] = p.slots[i];
          p.slots[i] = k;
          G.fixSlots(p); G.save(); ui.refreshSkillButtons(); ui.renderPanel(); skillSheet(k);
        }));
      });
      card.appendChild(row);
    }
    const acts = el('<div class="sheet-actions" style="margin-top:12px"></div>');
    acts.appendChild(btn(block || (rank ? 'Rank up (1 pt)' : 'Learn (1 pt)'), 'primary', () => {
      if (G.skillBlock(p, k)) return;
      p.skillPoints--; p.skills[k] = (p.skills[k] || 0) + 1;
      G.fixSlots(p);
      G.save(); ui.refreshSkillButtons(); ui.renderPanel(); skillSheet(k);
    }, !!block));
    acts.appendChild(btn('Close', 'ghost', closeSheet));
    card.appendChild(acts);
    $('sheet').hidden = false;
  }

  function skillNumbers(key, rank) {
    const sk = G.SKILLS[key], out = [];
    const m = (sk.mult || 0) + (sk.perRank || 0) * (rank - 1);
    if (sk.kind === 'passive') {
      if (sk.focusTime) out.push('Focus after ' + sk.focusTime + 's still · next Flash skill crits, +' + Math.round(sk.bonus * rank * 100) + '% damage');
      if (sk.cdr) out.push('-' + (sk.cdr * rank).toFixed(2) + 's cooldowns and +' + sk.mp * rank + ' MP per flash-dash');
      if (sk.crit) out.push('+' + (sk.crit * rank * 100).toFixed(0) + '% Crit, +' + (sk.stunBonus * rank * 100).toFixed(0) + '% stun chance');
      if (sk.mpRegen) out.push('+' + (sk.mpRegen * rank).toFixed(1) + ' MP/s, ' + (sk.proc * rank * 100).toFixed(0) + '% bolt chance');
      if (sk.burnBonus) out.push('+' + (sk.burnBonus * rank * 100).toFixed(0) + '% burn damage');
      if (sk.regen) out.push((sk.regen * rank * 100).toFixed(1) + '% HP/s regen, ' + (sk.proc * rank * 100).toFixed(0) + '% explosion chance');
      if (sk.lifesteal) out.push((sk.lifesteal * rank * 100).toFixed(0) + '% sword lifesteal');
      if (sk.poisonBonus) out.push('+' + (sk.poisonBonus * rank * 100).toFixed(0) + '% poison damage, plague bursts');
      return out;
    }
    if (sk.window) out.push('Parry window ' + (sk.window + sk.perRankWindow * (rank - 1)).toFixed(1) + 's · counter ' + Math.round(m * 100) + '% (always crits)');
    else if (sk.dist) out.push(Math.round(m * 100) + '% burst where you vanish · ' + Math.max(1.5, sk.cd - sk.cdPerRank * (rank - 1)).toFixed(1) + 's cooldown');
    else if (sk.flashes) out.push(sk.flashes + ' flashes × ' + Math.round(m * 100) + '% damage' + (sk.finisher ? ' + finisher ' + Math.round(sk.finisher * (1 + sk.perRank * (rank - 1)) * 100) + '%' : ''));
    else if (sk.mult) out.push(Math.round(m * 100) + '% skill damage' + (sk.strikes ? ' × ' + (sk.strikes + rank - 1) + ' strikes' : sk.jumps ? ' · ' + (1 + sk.jumps + Math.floor((rank - 1) / 2)) + ' targets' : ''));
    if (sk.zapMult) out.push(Math.round((sk.zapMult + sk.perRank * (rank - 1)) * 100) + '% per hit · ' + (sk.dur + (sk.perRankDur || 0) * (rank - 1)) + 's' + (sk.orbs ? ' · ' + (sk.orbs + Math.floor((rank - 1) / 2)) + ' fireballs' : ''));
    out.push(sk.mp + ' MP · ' + sk.cd + 's cooldown');
    return out;
  }

  // ---- quests
  function renderQuests(body) {
    const p = G.profile;
    G.refreshQuests();
    const avail = G.QUESTS.filter((q) => G.questAvailable(p, q));
    const locked = G.QUESTS.length - avail.length;
    const order = avail.slice().sort((a, b) => {
      const sa = G.questState(p, a), sb = G.questState(p, b);
      const w = (s) => (s.done && !s.claimed ? 0 : !s.done ? 1 : 2);
      return w(sa) - w(sb);
    });
    const list = el('<div class="stack"></div>');
    order.forEach((q) => {
      const st = G.questState(p, q);
      const r = q.reward, rw = [];
      if (r.gold) rw.push(r.gold + ' gold'); if (r.xp) rw.push(r.xp + ' XP');
      if (r.hpPotion) rw.push(r.hpPotion + '× HP potion'); if (r.mpPotion) rw.push(r.mpPotion + '× MP potion');
      if (r.item) rw.push(G.RARITY.find((x) => x.id === r.item[1]).name + ' ' + SLOT_NAMES[r.item[0]].toLowerCase());
      const card = el(`<div class="quest${st.done ? ' done' : ''}${st.claimed ? ' claimed' : ''}"><h5>${esc(q.name)}${st.claimed ? ' <span class="chip ok">Completed</span>' : ''}</h5><p>${esc(q.desc)}</p>
        <div class="qbar"><i style="width:${(st.progress / q.count) * 100}%"></i></div><div class="row"><span class="reward grow">Reward: ${esc(rw.join(', '))}</span><span class="tiny muted">${st.progress}/${q.count}</span></div></div>`);
      if (st.done && !st.claimed) {
        const b = btn('Claim reward', 'primary', () => {
          const res = G.claimQuest(q.id);
          if (!res) return;
          if (res.error) { ui.toast(res.error, 'warn'); return; }
          ui.toast('Received: ' + res.got.join(', '), 'quest');
          if (res.levels) ui.toast('Level up! You are now level ' + p.level, 'level');
          syncRunStats();
          G.save(); ui.renderPanel(); ui.refreshHub();
        });
        b.style.marginTop = '8px';
        card.appendChild(b);
      }
      list.appendChild(card);
    });
    body.appendChild(list);
    if (locked) body.appendChild(el(`<p class="note" style="margin-top:10px">${locked} more quest${locked > 1 ? 's' : ''} will appear as your story progresses.</p>`));
  }

  // ---- shop
  function shopPrice(it) { return Math.round(it.value * 2.6); }
  ui.restockShop = function (force) {
    const p = G.profile;
    if (!force && p.shop.stock.length) return;
    p.shop.stock = [];
    for (let i = 0; i < 4; i++) p.shop.stock.push(G.makeItem(null, G.rollRarity(0.4), p.level));
  };
  function renderShop(body) {
    const p = G.profile;
    body.appendChild(el(`<div class="cap"><span>Your gold</span><b style="color:var(--gold-2)">${fmt(p.gold)}g</b></div>`));
    if (ui.tab === 'sell') {
      const items = p.inventory;
      if (!items.length) body.appendChild(el('<p class="note">Nothing to sell.</p>'));
      else body.appendChild(invGrid(items, 'sell', false));
      body.appendChild(el('<p class="note">Tap an item to see its sell price.</p>'));
      return;
    }
    body.appendChild(el('<div class="section-title">Supplies</div>'));
    const sup = el('<div class="stack"></div>');
    [['hpPotion', C.SHOP.hpPotion], ['mpPotion', C.SHOP.mpPotion]].forEach(([k, price]) => {
      const c = G.CONSUMABLES[k];
      const row = el(`<div class="shop-item"><div class="grow"><div class="nm">${c.name}</div><div class="sub2">${c.desc} · Owned ${G.invCount(p, k)}</div></div><span class="price">${price}g</span></div>`);
      row.appendChild(btn('Buy', 'small primary', () => {
        if (p.gold < price) { ui.toast('Not enough gold', 'warn'); return; }
        if (!G.addConsumable(p, k, 1)) { ui.toast('Bag is full', 'warn'); return; }
        p.gold -= price; G.save(); ui.renderPanel();
      }, p.gold < price));
      sup.appendChild(row);
    });
    body.appendChild(sup);
    ui.restockShop(false);
    body.appendChild(el('<div class="section-title">Equipment</div>'));
    const gear = el('<div class="stack"></div>');
    if (!p.shop.stock.length) gear.appendChild(el('<p class="note">Sold out. Restock for new wares.</p>'));
    p.shop.stock.forEach((it) => {
      const r = G.rarityOf(it);
      const row = el(`<div class="shop-item"><div class="grow"><div class="nm" style="color:${r.color}">${esc(it.name)}</div><div class="sub2">${r.name} ${SLOT_NAMES[it.slot]} · ${G.itemStatLines(it.stats).map((l) => l.text + ' ' + l.label).join(', ')}</div></div><span class="price">${shopPrice(it)}g</span></div>`);
      row.style.cursor = 'pointer';
      row.onclick = () => ui.itemSheet(it, 'buy');
      gear.appendChild(row);
    });
    body.appendChild(gear);
    const rs = btn('Restock wares (' + C.SHOP.refresh + 'g)', '', () => {
      if (p.gold < C.SHOP.refresh) { ui.toast('Not enough gold', 'warn'); return; }
      p.gold -= C.SHOP.refresh; ui.restockShop(true); G.save(); ui.renderPanel();
    }, p.gold < C.SHOP.refresh);
    rs.style.marginTop = '10px';
    body.appendChild(rs);
  }

  // ---- settings
  function renderSettings(body) {
    const s = G.profile ? G.profile.settings : G.tmpSettings;
    const opts = [
      ['damageNumbers', 'Damage numbers', 'Floating numbers for damage and healing'],
      ['screenShake', 'Screen shake', 'Camera shake on heavy hits'],
      ['autoAttack', 'Auto-attack', 'Swing automatically at enemies in reach (pauses while you run away)'],
      ['leftHanded', 'Left-handed controls', 'Swap the joystick and action buttons'],
      ['reducedEffects', 'Reduced effects', 'Limit simultaneous effects on slower devices'],
    ];
    const st = el('<div class="stack"></div>');
    opts.forEach(([k, label, hint]) => {
      const row = el(`<button class="toggle"><span style="text-align:left">${label}<small>${hint}</small></span><i class="switch${s[k] ? ' on' : ''}"></i></button>`);
      row.onclick = () => {
        s[k] = !s[k];
        if (k === 'leftHanded') $('hud').classList.toggle('lefty', s[k]);
        G.save(); ui.renderPanel();
      };
      st.appendChild(row);
    });
    body.appendChild(st);
    body.appendChild(el('<div class="section-title">Audio</div>'));
    const snd = el(`<button class="toggle"><span style="text-align:left">Sound effects<small>Lightning skill sounds</small></span><i class="switch${s.sound !== false ? ' on' : ''}"></i></button>`);
    snd.onclick = () => { s.sound = s.sound === false; if (!s.sound) G.sfxStopAll(); else G.sfx('strike', { minGap: 0 }); G.save(); ui.renderPanel(); };
    body.appendChild(snd);
    const vol = el(`<div class="toggle"><label for="sfx-vol" style="flex:1">Volume <small>${Math.round((s.sfxVolume == null ? 0.8 : s.sfxVolume) * 100)}%</small></label><input id="sfx-vol" type="range" min="0" max="100" step="5" value="${Math.round((s.sfxVolume == null ? 0.8 : s.sfxVolume) * 100)}" style="flex:1.4"></div>`);
    const r = vol.querySelector('input');
    r.addEventListener('input', () => { s.sfxVolume = +r.value / 100; vol.querySelector('small').textContent = r.value + '%'; });
    r.addEventListener('change', () => { G.sfx('strike', { minGap: 0 }); G.save(); });
    body.appendChild(vol);
    const vrow = el('<div class="toggle" style="flex-wrap:wrap"><span style="text-align:left;flex:1 1 100%">Hero voice<small>Shouts when using skills, grunts when hit. Tap to hear a sample.</small></span><div class="voice-pick"></div></div>');
    [['warrior', 'Warrior'], ['protagonist', 'Protagonist'], ['off', 'Off']].forEach(([id, label]) => {
      const cur = s.voice || 'warrior';
      vrow.querySelector('.voice-pick').appendChild(btn(label, 'small' + (cur === id ? ' primary' : ''), () => {
        s.voice = id; G.save(); ui.renderPanel();
        if (id !== 'off') G.voice('light', { minGap: 0 });
      }));
    });
    body.appendChild(vrow);
    body.appendChild(el(`<p class="note">${esc(G.SFX_CREDITS)} There is no music yet.</p>`));
    body.appendChild(el('<div class="section-title">Controls</div>'));
    body.appendChild(el(`<p class="note card">Touch: drag the left side to move, tap ATK to attack (hold to keep swinging), skill buttons to cast, HP/MP to drink potions.<br>
      Keyboard: WASD / arrows move · Space or J attack · 1–4 skills · 5 or R ultimate · Q / E potions · Esc pause · I bag · C hero · K skills · L quests.</p>`));
    if (G.profile) {
      body.appendChild(el('<div class="section-title">Progress</div>'));
      const gm = !!G.profile.gm;
      body.appendChild(btn(gm ? 'Reset GM account' : 'Reset all progress', 'danger', () => ui.confirm(gm ? 'Delete the GM account? A fresh maxed GM account is created next time you choose it on the title screen. Your normal save is not affected.' : 'Delete your saved game and start over? This cannot be undone. The GM account is not affected.', () => {
        G.deleteSave(gm ? 'gm' : 'main'); G.profile = null; G.game.run = null; ui.close(true); ui.show('title'); ui.toast('Progress reset');
      }, { yes: 'Delete save', danger: true })));
    }
    body.appendChild(el('<p class="note" style="margin-top:14px">Art: FREE Adventurer & Knight 2D Pixel Art, Tiny RPG Character pack, Pixel Art Top Down – Basic, Super Pixel Effects Gigapack (free), Thunder Effect 02, Pixel fire asset pack — all from the Prologue folder.</p>'));
  }

  // ---- pause
  function renderPause(body) {
    const st = el('<div class="stack"></div>');
    st.appendChild(btn('Resume', 'primary', () => ui.close()));
    [['hero', 'Hero'], ['bag', 'Bag'], ['skills', 'Skills'], ['quests', 'Quest Journal'], ['settings', 'Settings']].forEach(([k, l]) => st.appendChild(btn(l, '', () => ui.open(k))));
    st.appendChild(btn('Leave area', 'danger', () => ui.open('map')));
    body.appendChild(st);
  }

  // ---- result
  ui.showResult = function (result, run) {
    G.input.reset();
    $('toasts').innerHTML = '';
    const r = run.rewards, p = G.profile;
    ui.open('result');
    const body = $('panel-body');
    body.innerHTML = '';
    const win = result === 'victory';
    const title = win ? 'Victory!' : result === 'defeat' ? 'Defeated' : result === 'endless' ? 'Trial Over' : 'Retreated';
    const sub = win ? run.area.name + ' cleared' : result === 'defeat' ? 'You fell in ' + run.area.name + '. Your loot and experience are kept.' :
      result === 'endless' ? 'You reached wave ' + (r.wave || 0) + ' (best ' + p.bestWave + ')' : 'You left ' + run.area.name + '.';
    body.appendChild(el(`<div class="result-head ${win || result === 'endless' ? 'win' : 'lose'}"><h2>${title}</h2><p class="note">${esc(sub)}</p></div>`));
    const list = el('<div class="result-list"></div>');
    [['Enemies defeated', r.kills], ['Experience', '+' + fmt(r.xp)], ['Gold', '+' + fmt(r.gold)]].forEach(([k, v]) => list.appendChild(el(`<div class="stat"><span>${k}</span><b>${v}</b></div>`)));
    if (r.levels) list.appendChild(el(`<div class="stat"><span>Levels gained</span><b>+${r.levels} (now ${p.level})</b></div>`));
    if (r.unlocked) list.appendChild(el(`<div class="stat"><span>New area</span><b>${esc(r.unlocked)}</b></div>`));
    body.appendChild(list);
    if (r.items.length) {
      body.appendChild(el('<div class="section-title">Loot</div>'));
      body.appendChild(el(`<div class="card stack">${r.items.map((it) => `<div style="color:${G.rarityOf(it).color};font-weight:700">${esc(it.name)} <span class="tiny muted">${G.rarityOf(it).name} ${SLOT_NAMES[it.slot]}</span></div>`).join('')}</div>`));
    }
    if (claimable()) body.appendChild(el(`<p class="note" style="color:var(--gold-2)">You have ${claimable()} quest reward(s) to claim in the Journal.</p>`));
    const acts = el('<div class="sheet-actions" style="margin-top:14px"></div>');
    acts.appendChild(btn('Retry', '', () => { const id = run.area.id; ui.close(true); G.game.exitToHub(); G.game.startArea(id); }));
    acts.appendChild(btn('World Map', 'primary', () => { ui.close(true); G.game.exitToHub(); ui.show('hub'); }));
    body.appendChild(acts);
    $('panel-title').textContent = '';
  };
})();
