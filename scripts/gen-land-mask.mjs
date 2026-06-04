// Rasterize the Natural Earth country polygons into a compact 1-bit
// equirectangular land mask, base64-encoded. The boot animation samples this
// to draw recognizable continents (instead of random blobs) and to morph from
// a chunky NES globe into a shaded high-res one.
//
// Output is printed and written to scripts/land-mask.txt. Paste the base64 and
// the W/H into the LAND_* consts in index.html. Regenerate with:
//   node scripts/gen-land-mask.mjs
//
// Holes (lakes) are intentionally ignored — at this resolution filling the
// Caspian/Great Lakes as land is invisible and keeps the code simple.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.join(__dirname, '..');

const W = 240, H = 120;  // 28,800 cells → 3,600 bytes → ~4.8KB base64

const gj = JSON.parse(fs.readFileSync(
  path.join(REPO, 'test-fixtures', 'ne_50m_admin_0_countries.geojson'), 'utf8'));

// Flatten to outer rings with a bbox for fast rejection.
const rings = [];
for (const f of gj.features) {
  const g = f.geometry;
  if (!g) continue;
  const polys = g.type === 'Polygon' ? [g.coordinates]
              : g.type === 'MultiPolygon' ? g.coordinates : [];
  for (const poly of polys) {
    const outer = poly[0];
    let minx = 180, miny = 90, maxx = -180, maxy = -90;
    for (const [x, y] of outer) {
      if (x < minx) minx = x; if (x > maxx) maxx = x;
      if (y < miny) miny = y; if (y > maxy) maxy = y;
    }
    rings.push({ outer, minx, miny, maxx, maxy });
  }
}

function inRing(x, y, pts) {
  let inside = false;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const xi = pts[i][0], yi = pts[i][1], xj = pts[j][0], yj = pts[j][1];
    if (((yi > y) !== (yj > y)) && (x < ((xj - xi) * (y - yi)) / (yj - yi) + xi)) inside = !inside;
  }
  return inside;
}

const bytes = new Uint8Array(Math.ceil((W * H) / 8));
let landCount = 0;
for (let py = 0; py < H; py++) {
  const lat = 90 - ((py + 0.5) / H) * 180;
  for (let px = 0; px < W; px++) {
    const lon = -180 + ((px + 0.5) / W) * 360;
    let land = false;
    for (const r of rings) {
      if (lon < r.minx || lon > r.maxx || lat < r.miny || lat > r.maxy) continue;
      if (inRing(lon, lat, r.outer)) { land = true; break; }
    }
    if (land) {
      const idx = py * W + px;
      bytes[idx >> 3] |= 128 >> (idx & 7);
      landCount++;
    }
  }
}

const b64 = Buffer.from(bytes).toString('base64');
fs.writeFileSync(path.join(__dirname, 'land-mask.txt'), b64);
console.log(`W=${W} H=${H} land=${landCount}/${W * H} (${(100 * landCount / (W * H)).toFixed(1)}%) bytes=${bytes.length} b64=${b64.length}`);
console.log(b64);
