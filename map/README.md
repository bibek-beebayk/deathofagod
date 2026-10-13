# Oathlands map

The map uses native JavaScript modules and the existing Three.js r128 CDN script.
Netlify serves these files directly; there is no bundler or production build step.
Serve the repository over HTTP when previewing locally (ES modules do not work reliably with `file://`).

## Where to make changes

| File              | Responsibility                                                                   |
| ----------------- | -------------------------------------------------------------------------------- |
| `../map.html`     | Page markup, metadata, panels and controls                                       |
| `styles.css`      | Map layout, responsive rules, labels and panel appearance                        |
| `data.js`         | Places, descriptions, routes, regions, sea names and source coordinates          |
| `terrain-data.js` | Encoded elevation and biome grids; not prose or settlement data                  |
| `heightfield.js`  | Coordinate scaling, grid decoding, interpolation and elevation sampling          |
| `terrain.js`      | Terrain mesh, colours, shoreline shading and terraces                            |
| `scene.js`        | Renderer, camera, lights and world group                                         |
| `environment.js`  | Ocean floor, water and cloud textures                                            |
| `world.js`        | Place lookup, orchard bounds and glow sprites                                    |
| `utils.js`        | Seeded random generator and terrain noise                                        |
| `trees.js`        | Forests, scrub and rocks                                                         |
| `settlements.js`  | Town buildings, camps and the Hall of Ilmarion                                   |
| `landmarks.js`    | Hollow Roads, Elowmere and Caelmar landmark models                               |
| `effects.js`      | Sunstair rings, shards, motes, mist and other landmark lights                    |
| `routes.js`       | Roads, shipping lanes, ships and pilgrim routes                                  |
| `lighting.js`     | Day, dusk and night presets                                                      |
| `controls.js`     | Camera movement, touch/mouse/keyboard input, search, layers and voyages          |
| `labels.js`       | Place pins, label projection and collision avoidance                             |
| `animation.js`    | Resize handling and frame updates                                                |
| `quality.js`      | Picks the "high" or "lite" (phone) render tier; `?q=lite` / `?q=high` forces one |
| `detail.js`       | Tileable noise textures for fine ground texture and relief                       |
| `scenery.js`      | Sea stacks along the coasts and mist banks on the highlands                      |
| `forges.js`       | Chimney smoke, furnace glow and lit mine adits (Iron Country)                    |
| `docks.js`        | Cinderwick ore-wharves: piers, cranes, ore stacks and moored ships               |
| `about.js`        | About panel toggle                                                               |
| `main.js`         | Initialization order and explicit connections between modules                    |

## Runtime conventions

Builders receive named dependencies and return the values other modules need.
`main.js` owns the initialization sequence. Keep that order: terrain sampling must
exist before buildings are placed, and the seeded random stream must be consumed
in the same order to preserve the procedural scene.

World data is copied before builders scale coordinates and attach runtime metadata.
Edit the original coordinates in `data.js`; do not multiply them by the runtime scale.
The compact `state` object shares only height exaggeration, time of day, glow strength
and label visibility, so animation and controls always read current values.
The existing `window.__o` camera/debug interface is retained.

## Checks

Install dependencies with `pnpm install --frozen-lockfile`, then run:

```sh
pnpm run check:map
pnpm run test:map
pnpm run format:map
```

After changing rendering or controls, preview `/map.html` on desktop and mobile.
Check search, place pins, fly-to, zoom/drag/pinch, layer toggles, time of day,
height exaggeration, whole-world reset and the About panel.
