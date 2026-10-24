#!/usr/bin/env node
/* Class lock check: proves a locked class has not changed.
   Usage:  node tools/check-class-lock.js            (check every locked class)
           node tools/check-class-lock.js --update   (re-lock after an intended change)
   No browser or npm packages needed. For each class in classes/<id>/lock.json it compares:
     1. the class data (path, skills, tree layout, effect/sound/voice tables) loaded from the game's own JS
     2. a hash of the code between the LOCKED markers in js/game.js
     3. a hash of every asset file the class uses (effect sheets, sounds, voices) */
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm'), crypto = require('crypto');
const ROOT = path.resolve(__dirname, '..');
const sha = (buf) => crypto.createHash('sha256').update(buf).digest('hex').slice(0, 16);

// ---- load the game's data files in a sandbox (only top-level definitions run; nothing renders)
function loadGame() {
  const noop = () => {};
  const el = () => ({ getContext: () => ({}), addEventListener: noop, style: {}, classList: { add: noop, remove: noop, toggle: noop } });
  const ctx = {
    console, Math, JSON, Object, Array, Promise, setTimeout, clearTimeout,
    performance: { now: () => 0 }, localStorage: { getItem: () => null, setItem: noop },
    document: { createElement: el, getElementById: el, querySelector: el, querySelectorAll: () => [], addEventListener: noop },
    Image: function () {}, Audio: function () { return { addEventListener: noop }; }, encodeURI,
  };
  ctx.window = ctx;
  vm.createContext(ctx);
  for (const f of ['assets', 'audio', 'data']) vm.runInContext(fs.readFileSync(path.join(ROOT, 'js', f + '.js'), 'utf8'), ctx, { filename: f + '.js' });
  return ctx.G;
}

function lockedCode(id) {
  const src = fs.readFileSync(path.join(ROOT, 'js', 'game.js'), 'utf8').replace(/\r\n/g, '\n');
  const re = new RegExp('// ==== LOCKED: ' + id.name + '[^\\n]*\\n([\\s\\S]*?)// ==== END LOCKED: ' + id.name);
  const m = src.match(re);
  return m ? { hash: sha(m[1]), lines: m[1].split('\n').length - 1 } : null;
}

function snapshot(G, def) {
  const p = G.PATHS[def.path];
  const keys = [...p.actives, ...p.passives];
  const skills = {}; keys.forEach((k) => { skills[k] = G.SKILLS[k]; });
  const rel = (s) => s.replace(/^.*?assets\//, 'assets/');
  const fx = {}; def.fx.forEach((k) => { const f = G.FX[k]; fx[k] = f ? { src: rel(f.src), fw: f.fw, fh: f.fh, n: f.n, dark: !!f.dark, warm: f.warm || false } : null; });
  const sfx = {}; (def.sfx || Object.keys(G.SFX)).forEach((k) => { if (!G.SFX[k]) { sfx[k] = null; return; } const s = G.SFX[k]; sfx[k] = { src: s.src.map(rel), vol: s.vol, vary: s.vary || 0 }; });
  const voices = {}; Object.keys(G.VOICES).forEach((v) => { voices[v] = {}; (def.voiceKinds || Object.keys(G.VOICES[v])).forEach((k) => { const x = G.VOICES[v][k]; voices[v][k] = Array.isArray(x) ? x.map(rel) : x; }); });
  const files = new Set();
  Object.values(fx).forEach((f) => f && files.add(f.src));
  Object.values(sfx).forEach((s) => s && s.src.forEach((x) => files.add(x)));
  Object.values(voices).forEach((v) => Object.values(v).forEach((x) => Array.isArray(x) && x.forEach((y) => files.add(y))));
  const assets = {};
  [...files].sort().forEach((f) => { const fp = path.join(ROOT, f); assets[f] = fs.existsSync(fp) ? sha(fs.readFileSync(fp)) : 'MISSING'; });
  return { data: { path: p, skills, tree: G.TREE_LAYOUT, ultSlot: G.ULT_SLOT, fx, sfx, voices }, code: lockedCode(def), assets };
}

function diff(a, b, at, out) {
  if (JSON.stringify(a) === JSON.stringify(b)) return;
  if (a && b && typeof a === 'object' && typeof b === 'object') {
    new Set([...Object.keys(a), ...Object.keys(b)]).forEach((k) => diff(a[k], b[k], at ? at + '.' + k : k, out));
  } else out.push(`  ${at}: locked ${JSON.stringify(a)}  ->  now ${JSON.stringify(b)}`);
}

const update = process.argv.includes('--update');
const G = loadGame();
let failed = 0;
for (const dir of fs.readdirSync(path.join(ROOT, 'classes'))) {
  const lf = path.join(ROOT, 'classes', dir, 'lock.json');
  if (!fs.existsSync(lf)) continue;
  const lock = JSON.parse(fs.readFileSync(lf, 'utf8'));
  const now = snapshot(G, lock.def);
  if (update) {
    lock.snapshot = now; lock.lockedAt = new Date().toISOString().slice(0, 10);
    fs.writeFileSync(lf, JSON.stringify(lock, null, 1) + '\n');
    console.log(`re-locked ${lock.def.name}: ${Object.keys(now.assets).length} asset files, ${now.code ? now.code.lines : 0} lines of skill code`);
    continue;
  }
  const out = [];
  diff(lock.snapshot, now, '', out);
  if (!now.code) out.push('  LOCKED markers missing from js/game.js');
  if (out.length) { failed++; console.log(`CHANGED  ${lock.def.name} (locked ${lock.lockedAt}):\n` + out.join('\n')); }
  else console.log(`OK  ${lock.def.name}: unchanged since ${lock.lockedAt} (${Object.keys(now.assets).length} asset files, ${now.code.lines} lines of skill code)`);
}
if (failed) { console.log('\nIf a change above was intended, re-lock with: node tools/check-class-lock.js --update'); process.exit(1); }
