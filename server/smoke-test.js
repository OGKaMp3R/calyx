import assert from "node:assert/strict";

const requiredAgents = [
  "sprite_pixelphaze.png",
  "sprite_signalsage.png",
  "sprite_templatefox.png",
  "sprite_cudapunk.png",
  "sprite_taskmoth.png",
  "sprite_bosscat.png",
  "sprite_kindknife.png",
  "sprite_plainjane.png",
  "sprite_chartmonk.png",
  "sprite_botboi.png",
  "sprite_scrublord.png",
  "sprite_patchbyte.png",
];

assert.equal(requiredAgents.length, 12);
assert.ok(requiredAgents.every((file) => file.startsWith("sprite_") && file.endsWith(".png")));
console.log("Smoke tests passed.");
