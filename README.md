# Idle Garden Hero

A mobile-friendly idle garden game built with Vite, Tailwind CSS, vanilla JavaScript, and Phaser 3.

## Run locally

```bash
npm install
npm test
npm run dev
```

Open the local URL printed by Vite. For running unit tests, run `npm test`. For a production build, run `npm run build`.

GitHub Actions runs `npm ci`, `npm test`, and `npm run build` on pushes and pull requests to `main`. See [AUDIT.md](AUDIT.md) for architectural review and audit details.

The app opens on a **Home** screen with access to five destinations:

- **Garden:** upgrade heroes, open plots, recruit troops, and actively tap heroes for instant leaf harvests and critical bursts.
- **Combat:** watch heroes battle across 5 distinct biomes (Whispering Woods, Sunlit Meadow, Misty Hollow, Ancient Glade, and Celestial Bramble) with floating damage numbers, enemy counter-attacks, and the **Sunlight Burst** ultimate skill.
- **Accessories & Bag:** equip accessories unlocked by battle milestones.
- **Upgrades:** spend Leaf Points on permanent boosts, transcend via **Bloom Anew** prestige to earn Golden Seeds, and invest in 5 **Ancient Artifacts**.
- **Settings:** control animations, floating harvest text, and Web Audio synthesizer sound effects, save manually, or reset progress.

Heroes and troops generate Leaf Points automatically. Hero levels, troops, accessories, permanent upgrades, and Ancient Artifacts all amplify harvest and combat capabilities.

Progress saves to browser local storage every five seconds and when the page is hidden or closed. Returning players receive up to eight hours of offline harvest and combat progress.

Phaser renders and animates the garden heroes and combatants. Hero sprites breathe and sway, react to taps with squash-and-stretch physics, and shoot hero-colored projectiles in combat with hit sparks and floating numbers. Built-in zero-dependency Web Audio synthesizes cozy sound effects. See [ASSETS.md](ASSETS.md) for the illustration set and art prompts.
