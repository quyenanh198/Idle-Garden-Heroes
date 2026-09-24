# Deep Audit & Optimization Report: Idle Garden Hero

**Project:** Idle Garden Hero  
**Repository:** [https://github.com/quyenanh198/Idle-Garden-Heroes.git](https://github.com/quyenanh198/Idle-Garden-Heroes.git)  
**Date:** September 2026  
**Auditor:** Antigravity AI Engineering  
**Tech Stack:** Vanilla JavaScript (ES Modules), Vite 7, Tailwind CSS 4, Phaser 3 (`phaser@3.90.0`), Node.js Test Runner

---

## 1. Executive Summary

An exhaustive technical, architectural, and gameplay audit was conducted across the **Idle Garden Hero** codebase. The application is an idle incremental game combining a cozy garden management loop with automated RPG combat, featuring a hybrid HTML/CSS user interface layered with a dual-canvas Phaser 3 rendering engine.

Prior to this audit, while the game was visually appealing and responsive, it suffered from several critical edge-case bugs:
1. **CPU freeze on offline combat stalemates** (up to 10,000 synchronous loop iterations per tab return).
2. **Silent DOM memory leak** in floating harvest animations when navigating away from the garden screen.
3. **Phaser canvas layout thrashing and misplaced sprites at (0, 0)** caused by background wave clears querying `getBoundingClientRect()` on `display: none` containers.
4. **`NaN` / corruption vulnerability** in local storage save restoration.
5. **Absence of automated testing** in the project and CI pipeline.

All identified vulnerabilities and performance bottlenecks have been fixed and validated with a comprehensive 13-test automated test suite and clean production builds.

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
│   └── style.css                   # Tailwind CSS 4 & custom cozy responsive stylesheet
├── test/
│   └── game-engine.test.js         # 13 comprehensive unit tests covering math, combat & saves
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
ℹ tests 13
ℹ suites 3
ℹ pass 13
ℹ fail 0
```

### 4.2 Production Build (`npm run build`)
```
vite v7.3.6 building client environment for production...
transforming...
✓ 11 modules transformed.
rendering chunks...
computing gzip size...
dist/index.html                      0.87 kB │ gzip:   0.46 kB
dist/assets/index-wnhCUp9y.css      64.36 kB │ gzip:  15.51 kB
dist/assets/index-_i4RVy9A.js       42.60 kB │ gzip:  13.45 kB
dist/assets/visuals-CKeKXFrl.js  1,218.07 kB │ gzip: 336.05 kB
✓ built in 4.40s
```

---

## 5. Conclusion & Recommendations

The Idle Garden Hero project is now hardened, robust against data corruption, free of DOM memory leaks and layout thrashing, and backed by a comprehensive unit test suite in CI.

Future recommended features:
- **Audio / SFX:** Add gentle ambient glade sound effects with a mute toggle in Settings.
- **Prestige / Rebirth System:** Provide a "Garden Metamorphosis" prestige option after wave 100 to increase long-term replayability.
