# Game art

The PNG source art in `art-source/` was generated with the built-in image generation tool. The image supplied by the user was used as a style reference for cozy storybook fantasy art. The generated characters and garden scene are new artwork, with transparent backgrounds for character sprites. Matching `.webp` files in `public/assets/` are the optimized copies the game ships; together they total about 1.4 MB instead of 21 MB of PNG originals.

| Asset | File |
| --- | --- |
| Sprout Knight | `art-source/sprout-knight.png` |
| Rose Mage | `art-source/rose-mage.png` |
| Oak Sentinel | `art-source/oak-sentinel.png` |
| Daisy Dancer | `art-source/daisy-dancer.png` |
| Moss Golem | `art-source/moss-golem.png` |
| Sunflower Sage | `art-source/sunflower-sage.png` |
| Grumpy Mushroom | `art-source/grumpy-mushroom.png` |
| Thorny Bramble | `art-source/thorny-bramble.png` |
| Slime Sprig | `art-source/slime-sprig.png` |
| Wild Wasp | `art-source/wild-wasp.png` |
| Shadow Stump | `art-source/shadow-stump.png` |
| Garden glade backdrop | `art-source/garden-glade.png` |

## Prompt set

- **Style reference:** Match the supplied image's cozy storybook fantasy garden illustration, soft painterly shading, expressive chibi proportions, warm green and cream palette, and floral detail. Make new artwork rather than reproducing its interface or characters.
- **Hero sprites:** Generate each named hero as a distinct full-body mobile game character on a true transparent background, centered with a clear silhouette: Sprout Knight with leaf hood, shield, and sword; Rose Mage with rose cloak and staff; Oak Sentinel with oak armor, shield, and spear; Daisy Dancer with daisy headdress and flute; Moss Golem made of mossy stone; Sunflower Sage with sunflower headdress and staff. No text, UI, border, or watermark.
- **Enemy sprites:** Generate each named enemy as a distinct full-body transparent storybook creature: Grumpy Mushroom, Thorny Bramble, Slime Sprig, Wild Wasp, and Shadow Stump. Keep the shapes friendly and readable at mobile size. No text, UI, border, or watermark.
- **Backdrop:** Generate a wide sunlit flowering glade with a winding pale stone path, distant cottage, rolling hills, and open space for game sprites. No characters, text, UI, or watermark.
