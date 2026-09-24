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

- **Garden:** upgrade heroes, open plots, and recruit Seedling Scouts, Bloom Archers, and Root Guardians for the legion.
- **Combat:** watch heroes and troops battle automatically through enemy waves and earn bonus Leaf Points.
- **Accessories & Bag:** equip accessories unlocked by battle milestones.
- **Upgrades:** buy permanent harvest, combat power, and health boosts.
- **Settings:** control animation and floating harvest text, save manually, or reset progress with confirmation.

Heroes and troops generate Leaf Points automatically. Hero levels, troops, accessories, and permanent upgrades all affect harvest or combat stats.

Progress saves to browser local storage every five seconds and when the page is hidden or closed. Returning players receive up to eight hours of offline harvest and combat progress.

Phaser renders and animates the garden heroes and combatants. Hero sprites breathe and sway; combat uses projectiles, hit reactions, and particles. The interface remains HTML and CSS for accessible buttons and responsive layout. See [ASSETS.md](ASSETS.md) for the illustration set and art prompts.
