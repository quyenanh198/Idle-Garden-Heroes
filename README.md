# 🌿 Idle Garden Hero

> A cozy, mobile-friendly incremental idle garden game with active tap harvesting, automated RPG glade defense, Phaser 3 animations, built-in Web Audio synthesis, and an Ancient Artifact prestige system.

[![CI Status](https://github.com/quyenanh198/Idle-Garden-Heroes/actions/workflows/build.yml/badge.svg)](https://github.com/quyenanh198/Idle-Garden-Heroes/actions/workflows/build.yml)
[![Tests](https://img.shields.io/badge/tests-37%20passed-brightgreen.svg)](test/game-engine.test.js)
[![Vite](https://img.shields.io/badge/Vite-7.3-646CFF.svg?logo=vite)](https://vitejs.dev/)
[![Phaser](https://img.shields.io/badge/Phaser-3.90-ff2442.svg?logo=phaser)](https://phaser.io/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## 📸 Screenshots

| 🌿 Cozy Garden HQ | ⚔️ Auto-Battle & Biomes |
| :---: | :---: |
| ![Garden Screen](screenshots/screenshot-garden-engine.png) | ![Combat Team](screenshots/combat-team-desktop.png) |

[View the mobile team battle](screenshots/combat-team-mobile.png).

---

## ✨ Key Features & Gameplay

### 1. 🌿 Cozy Garden & Active Tap-Harvesting
- **Idle Production:** Your recruited heroes generate **Leaf Points (LPS)** every second, working quietly even when exploring other screens or closed.
- **Active Tapping:** Tap directly on any unlocked hero plot to trigger instant harvests based on hero level and boosts.
- **Critical Taps:** 12% chance to land a **💥 CRIT!** for **3× leaf payout**, accompanied by dynamic gold floating text and squash-and-stretch particle bursts.
- **Plot Expansion:** Unlock up to 6 garden plots to welcome new heroes with escalating production rates.

### 2. ⚔️ Auto-Battle & Combat Progression
- **Automated Glade Defense:** Recruited heroes and legion troops form an expedition force that automatically battles waves of glade creatures.
- **Team Formation:** Up to six heroes stand together in a two-row formation. Each hero has a separate combat pose and joins a staggered team attack animation.
- **5 Themed Biomes:** Journey across 150 progressive combat waves:
  - 🌼 **Whispering Glade** *(Waves 1–25)*
  - 🌵 **Thorny Thicket** *(Waves 26–50)*
  - 🐸 **Misty Swamp** *(Waves 51–75)*
  - 🌲 **Ancient Redwood** *(Waves 76–100)*
  - 🌙 **Twilight Grove** *(Waves 101–150)*
- **Stalemate Feedback:** If the legion can't beat the current wave, the battle banner switches to *"Legion too weak · upgrade to advance"* instead of looping silently.
- **Boss Waves:** Face formidable shadow bosses every 5 waves for elevated Leaf Point rewards.
- **Tactile Combat VFX:** Hero-specific color projectiles, enemy spore attacks with party pushback, hit spark reactions, and floating damage numbers (white for normal, gold for crits, red for party damage).

### 3. ☀️ "Sunlight Burst" Ultimate Skill
- **Energy Gauge:** Charges passively at 4%/sec and gains +5% bonus on every wave victory.
- **Unleash the Sunlight:** When 100% full, trigger **Sunlight Burst** to:
  - Instantly restore **40% Party Max HP**.
  - Boost **Combat Power by 2×** for 8 seconds.
  - Illuminate the battlefield with radiant sunbeams and radial starburst particles.

### 4. 🌸 "Bloom Anew" Prestige System & Ancient Relics
- **Transcend the Glade:** Unlocks at **Wave 25+**. Reset heroes, plots, and battle progression to harvest cosmic **Golden Seeds** (scaled by wave depth, wins, and lifetime harvested leaves).
- **Persistent Progress:** All equippable Bag treasures, Golden Seeds, and Ancient Artifacts persist across resets. Accessories unlock from *lifetime* wave wins, so a bloom never re-locks them.
- **5 Ancient Artifacts:**
  1. 💎 **Sunlight Crystal:** `+15%` Combat Power per level.
  2. 🌱 **Fertile Soil:** `+20%` Tap & LPS Harvest per level.
  3. 🌳 **Eternal Root:** `+60` Party Max HP per level.
  4. ✨ **Golden Dew Bucket:** `+25%` Ultimate Energy Charge Rate per level.
  5. 🍀 **Clover of Fortune:** `+20%` Wave Reward leaves per level.

### 5. 🎵 Built-in Cozy Web Audio Synthesizer
- **Zero-Dependency Audio:** Synthesized entirely via the browser's native `AudioContext` (no external MP3/WAV downloads, zero latency, zero bandwidth bloat).
- **Hero-Specific Tones:** Distinct attack signatures (Sprout Knight sword sweep, Rose Mage crystal chime, Oak Sentinel deep thud, Sunflower Sage warm harmonic chord).
- **Full Soundscape:** Tap harvest notes, crit fanfare, enemy spore impacts, level-up chimes, wave victory jingles, ultimate roar, and cosmic bloom melody.
- **Mute & Volume Control:** Toggle sound effects and set a master volume in Settings, both saved locally.

### 6. 🎒 Bag, Accessories & Upgrades
- **Accessories:** Earn unique relics (Leaf Charm, Rose Brooch, Oak Badge, Sunstone Pendant) by achieving battle win milestones.
- **Permanent Leaf Boosts:** Spend Leaf Points on *Golden Watering Can* (+25% harvest), *Training Grounds* (+20% power), and *Healing Spring* (+40 HP).
- **Legion Recruitment:** Train Seedling Scouts, Bloom Archers, and Root Guardians to support your party in both harvest and war.

### 7. 💤 Offline Progression
- Automatically computes up to **8 hours** of offline harvest and wave advancement on tab return.
- **Anti-Stalemate Protection:** Halts combat loops in `<1ms` if the party reaches an impasse, eliminating browser freezing or battery drain.

---

## 👥 Roster & Units

### Garden Heroes

| Hero | Plant Type | Role | Base LPS | Unlock Plot |
| :--- | :---: | :--- | :---: | :---: |
| **Sprout Knight** | 🌱 | Brave Sprout | `1.0` / sec | Plot 1 (Default) |
| **Rose Mage** | 🌹 | Thorn Sorceress | `3.5` / sec | Plot 2 |
| **Oak Sentinel** | 🌳 | Glade Guardian | `8.0` / sec | Plot 3 |
| **Daisy Dancer** | 🌼 | Meadow Sprite | `18.0` / sec | Plot 4 |
| **Moss Golem** | 🪨 | Ancient Protector | `40.0` / sec | Plot 5 |
| **Sunflower Sage** | ☀️ | Solar Luminary | `90.0` / sec | Plot 6 |

### Legion Troops

| Troop | Emoji | Harvest Rate | Combat Power | HP Bonus |
| :--- | :---: | :---: | :---: | :---: |
| **Seedling Scout** | 🌱 | `+0.3` / sec | `+0.4` | `+12` HP |
| **Bloom Archer** | 🌸 | `+1.2` / sec | `+1.8` | `+25` HP |
| **Root Guardian** | 🌳 | `+3.0` / sec | `+4.5` | `+60` HP |

---

## 🛠️ Architecture & Tech Stack

```
Idle Garden Hero/
├── .github/workflows/build.yml   # CI pipeline: test, build
├── art-source/                   # Full-size PNG originals (not shipped)
├── public/
│   ├── assets/                   # 12 WebP illustrations for heroes & foes
│   ├── favicon.svg, manifest.webmanifest, sw.js  # Icon, install manifest, offline service worker
├── screenshots/                  # README & review screenshots
├── src/
│   ├── game-engine.js            # Pure decoupled math, formulas, combat sim & save sanitization
│   ├── format.js                 # Shared number formatting (K … Dc, then scientific)
│   ├── audio.js                  # Native Web Audio API synthesizer with master volume
│   ├── visuals.js                # One Phaser 3 game, Garden & Combat scenes; canvas follows the active screen
│   ├── main.js                   # UI controller, routing, click handlers, tick loop & multi-tab guard
│   ├── preflight.css             # Vendored CSS reset (Tailwind v4 preflight, MIT)
│   └── style.css                 # Custom cozy responsive design
├── test/
│   ├── game-engine.test.js       # Engine unit tests (Node.js Test Runner)
│   └── format.test.js            # Number formatting tests
├── AUDIT.md                      # In-depth architectural audit & optimization report
├── ASSETS.md                     # Asset catalog & illustration prompts
├── package.json
└── vite.config.js
```

### Key Technical Highlights
- **Decoupled Engine (`src/game-engine.js`):** All mathematical formulas, scaling functions, combat simulation steps, and save sanitization are 100% pure functions with zero DOM or browser dependencies, allowing automated headless testing.
- **Hybrid Rendering Architecture:** Uses native semantic HTML and hand-written CSS for snappy accessibility, combined with transparent Phaser 3 canvas overlays for particle bursts, squash-and-stretch tweens, and projectile physics.
- **Save Sanitization (`sanitizeSave`):** Guarded against `NaN`, `Infinity`, negative bounds, and corrupted JSON storage to guarantee player progress integrity.

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** `>= 18.0.0`
- **npm** `>= 9.0.0`

### Installation & Run

```bash
# Clone the repository
git clone https://github.com/quyenanh198/Idle-Garden-Heroes.git
cd Idle-Garden-Heroes

# Install dependencies
npm install

# Run automated unit tests
npm test

# Start the local development server
npm run dev
```

Open the local URL (typically `http://localhost:5173`) in your browser.

### Production Build

```bash
npm run build
npm run preview
```

Generates optimized, minified assets into `dist/`.

---

## 🧪 Automated Testing

The project includes 19 rigorous unit tests executed via Node.js's built-in test runner:

```bash
npm test
```

```
▶ Game Engine - Math & Formulas (7 tests)
  ✔ calculates initial LPS correctly
  ✔ calculates LPS with multiple heroes, legion, boosts, and leaf_charm
  ✔ calculates combat power correctly with rose_brooch
  ✔ calculates party maximum HP correctly with oak_badge and eternal_root artifact
  ✔ calculates upgrade costs with exponential scaling
  ✔ calculates artifact costs with level scaling
  ✔ calculates plot costs accurately
  ✔ calculates wave rewards with boss multiplier, sunstone, and clover artifact
▶ Game Engine - Active Tapping & Ultimate Skill (2 tests)
  ✔ calculates tap harvest rewards correctly
  ✔ charges energy and activates Ultimate skill (Sunlight Burst)
▶ Game Engine - Prestige / Bloom Anew & Biomes (3 tests)
  ✔ checks Bloom Anew requirement correctly
  ✔ executes Bloom Anew reset cleanly and retains artifacts and seeds
  ✔ selects correct Biome based on current Wave
▶ Game Engine - Combat Simulation & Progression (4 tests)
  ✔ advances combat and clears a wave when party is strong
  ✔ handles combat stalemate cleanly without spinning 10,000 steps
  ✔ respects wave 150 cap
  ✔ resilient against NaN or negative inputs in advanceCombat
▶ Game Engine - Save Sanitization & Corruption Resistance (2 tests)
  ✔ returns valid default state for null or invalid JSON objects
  ✔ cleanses NaN, Infinity, negative values, and preserves artifacts and seeds

ℹ tests 19 | pass 19 | fail 0
```

---

## 📜 Documentation

- [AUDIT.md](AUDIT.md): Detailed architectural analysis, performance bottleneck fixes, and security audit.
- [ASSETS.md](ASSETS.md): Complete illustration guide, prompt recipes, and styling notes.

---

## 📄 License

MIT © [Quyen Nguyen](https://github.com/quyenanh198)
