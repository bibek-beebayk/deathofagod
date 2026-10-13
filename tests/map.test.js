import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { worldData } from "../map/data.js";
import { terrainData } from "../map/terrain-data.js";
import { createHeightfield } from "../map/heightfield.js";
import { createRandom } from "../map/utils.js";

test("decoded terrain preserves the pre-refactor elevation and biome grids", () => {
  const D = structuredClone({ ...terrainData, ...worldData });
  const terrain = createHeightfield({ D, vn: createRandom().vn });
  const hash = (array) =>
    createHash("sha256").update(Buffer.from(array.buffer)).digest("hex");
  // Recorded after comparing every cell against the original inline implementation.
  assert.equal(terrain.H.length, 484000);
  assert.equal(
    hash(terrain.H),
    "bf995344b2561bd092a68fdcf831008f12f44cec867c81b05cd17f7045bd1037",
  );
  assert.equal(
    hash(terrain.BM),
    "fb06847f0fde5b8f31778a4bffc459f2f4fe5d916f5c711b7f15b016d76f9388",
  );
});

test("world locations remain uniquely addressable and voyage destinations exist", () => {
  const ids = new Set(worldData.places.map((place) => place.id));
  assert.equal(ids.size, worldData.places.length);
  for (const id of [
    "lamp",
    "hall",
    "applegarth",
    "ledgerstone",
    "verethane",
    "saltreach",
  ]) {
    assert.ok(ids.has(id), `Missing voyage destination: ${id}`);
  }
  for (const place of worldData.places) {
    assert.ok(Number.isFinite(place.x) && Number.isFinite(place.y), place.id);
  }
});
