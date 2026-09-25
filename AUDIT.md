# Deep Audit & Optimization Report: Idle Garden Hero

**Project:** Idle Garden Hero  
**Repository:** [https://github.com/quyenanh198/Idle-Garden-Heroes.git](https://github.com/quyenanh198/Idle-Garden-Heroes.git)  
**Date:** September 2026  
**Auditor:** Antigravity AI Engineering  
**Tech Stack:** Vanilla JavaScript (ES Modules), Vite 7, Phaser 3 (`phaser@3.90.0`), Node.js Test Runner

---

## 1. Executive Summary

An exhaustive technical, architectural, and gameplay audit was conducted across the **Idle Garden Hero** codebase. The application is an idle incremental game combining a cozy garden management loop with automated RPG combat, featuring a hybrid HTML/CSS user interface layered with a dual-canvas Phaser 3 rendering engine.

Prior to this audit, while the game was visually appealing and responsive, it suffered from several critical edge-case bugs:
1. **CPU freeze on offline combat stalemates** (up to 10,000 synchronous loop iterations per tab return).
2. **Silent DOM memory leak** in floating harvest animations when navigating away from the garden screen.
3. **Phaser canvas layout thrashing and misplaced sprites at (0, 0)** caused by background wave clears querying `getBoundingClientRect()` on `display: none` containers.
4. **`NaN` / corruption vulnerability** in local storage save restoration.
5. **Absence of automated testing** in the project and CI pipeline.

All identified vulnerabilities and performance bottlenecks have been fixed and validated with an automated test suite (now 37 tests; see Section 6) and clean production builds.

---

## 2. In-Depth Findings & Vulnerability Analysis

### 2.1 Critical Finding: Offline Combat Stalemate Loop (High Severity)
- **Location:** `src/main.js` (`advanceCombat(seconds)`)
- **Root Cause:** When simulating offline time (up to 8 hours / 28,800 seconds) or when returning to an inactive tab via `visibilitychange`, `advanceCombat` stepped through combat time iteratively. If the player's party reached a wave where their damage per second could not defeat the enemy before their party died (`untilLoss <= untilWin`), each death reset the party to `partyMaxHp()` and the enemy to `enemyMaxHp(wave)`. Because each defeat cycle only took ~0.5s–2.0s, the loop executed all 10,000 maximum allowed iterations synchronously on the main thread, freezing the UI for hundreds of milliseconds while achieving zero net progression.
- **Resolution:** Implemented intelligent **stalemate detection** in `src/game-engine.js`:
  ```javascript
  // If party is at full HP and incoming damage defeats party before enemy is killed,
  // subsequent attempts will only loop indefinitely in defeat.
  if (battle.partyHp >= maxHp - 0.001 && untilLoss <= untilWin) {
    battle.partyHp = maxHp;
    battle.enemyHp = enemyMaxHp(battle.wave);
    break;
  }
  ```
  This immediately halts the simulation in `<1ms`, preserving party and enemy state without CPU burn.

---

### 2.2 Finding: DOM Element Memory Leak in Floating Harvest (Medium Severity)
- **Location:** `src/main.js` (`floatingHarvest()`, `tick()`)
- **Root Cause:** `floatingHarvest()` was invoked every 2 seconds by `tick()`, creating `<span>` elements appended to `#garden-grid` and waiting for the CSS `animationend` event to call `span.remove()`. However, whenever the user was on any other screen (`Home`, `Combat`, `Bag`, `Upgrades`, or `Settings`), the `#garden-screen` element had `hidden` (`display: none`). In all modern browser rendering engines, CSS animations do NOT run on `display: none` elements, meaning `animationend` never fired. Over minutes of gameplay, thousands of hidden `<span>` DOM nodes accumulated.
- **Resolution:**
  1. Guarded `floatingHarvest()` to run only when `activeScreen === 'garden'`.
  2. Added a 1.5s fallback removal timeout (`setTimeout(cleanup, 1500)`) to guarantee DOM nodes are cleaned up even if CSS animations are aborted or reduced.

---

### 2.3 Finding: Canvas Layout Thrashing & Misplaced Sprites (Medium Severity)
- **Location:** `src/visuals.js` (`GardenScene.sync()`, `CombatScene.sync()`, `resize()`), `src/main.js` (`renderCombat()`)
- **Root Cause:**
  1. When idle combat cleared a wave in the background while the player viewed another screen (e.g. Garden), `tick()` called `renderCombat()`, which in turn invoked `visuals.syncCombat()`.
  2. `syncCombat()` called `positionIn(element, parent)`, invoking `getBoundingClientRect()`. Since `#combat-screen` was `display: none`, all rect measurements returned `0` width and height.
  3. Phaser destroyed the existing sprites and recreated them at `(0, 0)` with scale `0`.
  4. Similarly, `ResizeObserver` triggered when tabs changed visibility, causing `scale.resize(0, 0)`.
- **Resolution:**
  - Added visibility and dimension guards in `GardenScene.sync()` (`if (getScreen() !== 'garden' || !gardenParent.clientWidth) return;`) and `CombatScene.sync()` (`if (getScreen() !== 'combat' || !combatParent.clientWidth) return;`).
  - Constrained `resize()` to only resize and sync the currently active screen when its dimensions are non-zero.
  - In `tick()`, only execute `renderCombat()` and `renderBattleNumbers()` when `activeScreen === 'combat'`.

---

### 2.4 Finding: Save Corruption & `NaN` Poisoning (Medium Severity)
- **Location:** `src/main.js` (`load()`, `advanceCombat()`)
- **Root Cause:** `localStorage` values like `battle.partyHp`, `leaves`, or `boosts` were parsed with `Number(x) || fallback`. If values were `NaN`, `Infinity`, or negative, `Math.min(remaining, NaN)` produced `NaN`, poisoning player leaves and party stats permanently.
- **Resolution:**
  - Created `sanitizeSave(raw)` in `src/game-engine.js` that verifies `Number.isFinite(...)`, clamps numerical bounds (plots 1–6, wave 1–150, boost levels 0–20, hero levels 1–100,000), and validates that equipped accessories are actually unlocked before restoring them.
  - Added numerical guards to `advanceCombat` ensuring all inputs and elapsed time steps are strictly finite and non-negative.

---

### 2.5 Finding: Unpersisted Offline Earnings Timing (Low Severity)
- **Location:** `src/main.js` (startup sequence)
- **Root Cause:** On game launch, offline earnings were added to `state.leaves`, but `save()` was only scheduled 5 seconds later. If the player closed the browser or reloaded within 5 seconds, the updated `state.lastSaved` was never written to storage, causing offline rewards to trigger again or desynchronize.
- **Resolution:** Explicitly invoked `save()` immediately after processing startup offline earnings and inside `visibilitychange` upon tab return.

---

### 2.6 Finding: Missing Automated Testing Architecture (Code Quality)
- **Location:** Project root / `package.json`
- **Root Cause:** No test script or test runner existed in the repository. Refactoring game balance, combat mechanics, or formulas carried high regression risks.
- **Resolution:**
  - Decoupled pure game mechanics into `src/game-engine.js`.
  - Added `test/game-engine.test.js` using Node.js's built-in test runner (`node --test`).
  - Added `"test": "node --test"` to `package.json`.
  - Added test execution step to `.github/workflows/build.yml`.

---

## 3. Architecture & File Structure

```
Idle Garden Hero/
├── .github/
│   └── workflows/
│       └── build.yml               # CI: installs deps, runs unit tests, runs production build
├── public/
│   └── assets/                     # 12 WebP hero & enemy art assets
├── src/
│   ├── game-engine.js              # Pure game mechanics, math formulas, combat sim & save sanitization
│   ├── main.js                     # DOM shell, screen routing, click handlers & tick loop
│   ├── visuals.js                  # Phaser 3 dual-scene manager (GardenScene & CombatScene)
│   ├── format.js                   # Shared number formatting
│   ├── audio.js                    # Web Audio synthesizer with master volume
│   ├── preflight.css               # Vendored CSS reset (Tailwind v4 preflight, MIT)
│   └── style.css                   # Custom cozy responsive stylesheet
├── test/
│   ├── game-engine.test.js         # Engine unit tests: math, combat & saves
│   ├── regressions.test.js         # Tests for the Section 6 follow-up fixes
│   └── format.test.js              # Number formatting tests
├── index.html                      # Single-page HTML entrypoint
├── package.json                    # Scripts: "dev", "test", "build", "preview"
├── AUDIT.md                        # This audit & optimization report
└── README.md                       # Project documentation
```

---

## 4. Verification & Test Results

### 4.1 Unit Test Suite (`npm test`)
```
▶ Game Engine - Math & Formulas
  ✔ calculates initial LPS correctly (0.8ms)
  ✔ calculates LPS with multiple heroes, legion, boosts, and leaf_charm (0.1ms)
  ✔ calculates combat power correctly with rose_brooch (0.2ms)
  ✔ calculates party maximum HP correctly with oak_badge (0.1ms)
  ✔ calculates upgrade costs with exponential scaling (0.1ms)
  ✔ calculates plot costs accurately (0.1ms)
  ✔ calculates wave rewards with boss multiplier and sunstone (0.1ms)
✔ Game Engine - Math & Formulas (2.6ms)
▶ Game Engine - Combat Simulation & Progression
  ✔ advances combat and clears a wave when party is strong (0.4ms)
  ✔ handles combat stalemate cleanly without spinning 10,000 steps (0.8ms)
  ✔ respects wave 150 cap (0.2ms)
  ✔ resilient against NaN or negative inputs in advanceCombat (0.2ms)
✔ Game Engine - Combat Simulation & Progression (1.9ms)
▶ Game Engine - Save Sanitization & Corruption Resistance
  ✔ returns valid default state for null or invalid JSON objects (0.2ms)
  ✔ cleanses NaN, Infinity, negative values, and out-of-range fields (0.3ms)
✔ Game Engine - Save Sanitization & Corruption Resistance (1.8ms)
ℹ tests 19
ℹ suites 5
ℹ pass 19
ℹ fail 0
```

### 4.2 Production Build (`npm run build`)
```
vite v7.3.6 building client environment for production...
transforming...
✓ 12 modules transformed.
rendering chunks...
computing gzip size...
dist/index.html                      0.87 kB │ gzip:   0.46 kB
dist/assets/index-CVY-DKcl.css      70.03 kB │ gzip:  16.67 kB
dist/assets/index-DDHFe-j4.js       57.07 kB │ gzip:  17.50 kB
dist/assets/visuals-EEFPrtIg.js  1,221.12 kB │ gzip: 337.07 kB
✓ built in 4.33s
```

---

## 5. Gameplay Evolution (Phases 1 to 3 Implemented)

### Phase 1: Dynamic Tactile Interaction & Combat Feedback
- **Active Tap Harvesting:** Players can actively tap unlocked garden plots to trigger instant leaf harvests with a 12% critical harvest chance (3× payout), visual squash/stretch and heart/leaf particle bursts, and floating damage/leaf numbers.
- **Combat Floating Damage Numbers:** Both hero attacks and enemy counter-attacks spawn floating damage popups (normal, critical hits in gold, and enemy damage in red) directly above combatants.
- **Enemy Attack Animations:** Enemies lunge and shoot spore projectiles that bounce back party heroes with hit sound effects.

### Phase 2: Web Audio Synthesizer & Sunlight Burst Ultimate
- **Cozy Synthesized SFX (`src/audio.js`):** Built-in zero-dependency Web Audio synthesizer generating unique frequencies for taps, critical taps, hero attacks per plant type (Rose Mage chime, Oak Sentinel thud, Sunflower Sage melody), enemy attacks, wave victories, upgrades, and prestige resets. Seamless audio resumption without autoplay policy blocks.
- **Sunlight Burst Ultimate Skill:** Energy accumulates passively (4%/sec) and on wave victories (+5%). At 100% charge, gardeners can unleash **Sunlight Burst** to heal the party by 40% max HP and double combat power for 8 seconds, accompanied by a radiant sunbeam flash.
- **Audio Control:** Settings screen includes an instant toggle for sound effects with local storage persistence.

### Phase 3: "Bloom Anew" Prestige System, Ancient Relics & Biomes
- **Prestige Mechanism (`bloomAnew`):** Upon reaching Wave 25+, gardeners can transcend the glade to harvest **Golden Seeds** based on wave depth, total victories, and lifetime leaves.
- **Ancient Artifacts:** 5 permanent cosmic relics purchased with Golden Seeds that persist through all prestige resets:
  1. *Sunlight Crystal:* +15% Combat Power per level.
  2. *Fertile Soil:* +20% Tap Harvest & LPS per level.
  3. *Eternal Root:* +60 Party Max HP per level.
  4. *Golden Dew Bucket:* +25% Ultimate Energy Charge Rate per level.
  5. *Clover of Fortune:* +20% Wave Reward leaves per level.
- **Wave Biomes (`biomeForWave`):** Dynamically transitions across 5 themed biomes (Whispering Glade, Thorny Thicket, Misty Swamp, Ancient Redwood, and Twilight Grove) up to Wave 150.

---

## 6. Follow-up Audit (September 24, 2026)

A second pass found the issues below. All are fixed, with tests in `test/regressions.test.js` and `test/format.test.js` (37 tests total, all passing).

### Gameplay bugs
- **Bloom Anew re-locked Bag accessories.** Accessories unlocked from `battle.wins`, which prestige resets to 0, and the equipped item was dropped on the next load. Added `lifetimeWins` (migrated from current wins for old saves); accessories now unlock from it.
- **Artifact bonus text disagreed with the engine.** Eternal Root showed `+25%` HP but applied a flat `+60`; Clover showed `+15%` but applied `+20%`. Artifacts now carry a `perLevel` value that both the formulas and `artifactBonusText()` read.
- **Tap harvest floating text never appeared, and the squash tween was cut off.** Each tap rebuilt the whole garden grid (removing the new text) and triggered a Phaser re-sync (destroying the sprite). Taps now update the grid in place.
- **With animations off, tap particles and the Sunlight Burst flash stayed on screen forever** (tweens run at `timeScale = 0`). Short-lived effects are now tracked and skipped or destroyed when motion is off.
- **Large numbers overflowed** (`4600.00B`). A shared `src/format.js` adds T, Qa … Dc suffixes, then scientific notation.
- **Stalemates looked frozen.** `advanceCombat` sets `battle.stalled`; the arena shows "Legion too weak · upgrade to advance" and stops fake hit animations.
- Tap harvest used a 15% boost per level instead of the documented 25%.
- Per-hero and roster rates ignored multipliers; they now use `heroLps` / `heroPower` / `unitPower`.
- The offline toast now includes leaves won in battle while away.
- `calculateGoldenSeeds` could return `NaN`; a far-future `ultActiveUntil` in an edited save granted permanent 2× damage; artifact levels were silently capped at 25 on load. All clamped or fixed.
- **Two open tabs overwrote each other's save.** The newest tab now claims ownership; older tabs pause behind a banner.

### Performance and build
- **Unused PNG originals shipped in `dist/`** (22.8 MB). Moved to `art-source/`; `dist/` is now 2.7 MB.
- **Two Phaser games** replaced by one game with two scenes whose canvas moves to the visible screen. The garden canvas is also re-attached after grid re-renders (previously a purchase could detach it).
- The 10 Hz tick no longer rewrites the plot counter's SVG every frame, and purchases re-render only the active screen.
- Audio routes through one master gain with a Volume setting, and no `AudioContext` is created before the first user gesture.
- Tailwind was listed but its Vite plugin was never configured, so the build shipped raw `@tailwind` / `--theme()` rules. Replaced with a vendored preflight reset; CSS dropped from 70 KB to 52 KB.
- Added `vite.config.js` with a relative `base` so the build works under a sub-path (e.g. GitHub Pages).
- Added a favicon, web manifest, and network-first service worker.
- Root screenshots moved into `screenshots/`; the stray `.chrome-combat/` browser profile was deleted.
