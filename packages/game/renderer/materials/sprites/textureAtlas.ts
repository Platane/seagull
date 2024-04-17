const emojis = [
  //
  "", // 0
  "🍟", // 1
  "🐱", // 2
  "🦤", // 3
];
export const N_SPRITES = emojis.length;

export const textureAtlasCanvas = document.createElement("canvas");

const SPRITE_SIZE = 128;

textureAtlasCanvas.width = emojis.length * SPRITE_SIZE;
textureAtlasCanvas.height = SPRITE_SIZE;

const ctx = textureAtlasCanvas.getContext("2d")!;

// document.body.appendChild(textureAtlasCanvas);
// textureAtlasCanvas.style.position = "absolute";
// textureAtlasCanvas.style.top = "0";
// textureAtlasCanvas.style.width = "auto";
// textureAtlasCanvas.style.height = "auto";

ctx.textAlign = "center";
ctx.textBaseline = "middle";
ctx.font = `${SPRITE_SIZE * 0.7}px mono`;

const N = 3;
let contourFilter = "";

for (let k = N; k--; ) {
  const a = (k / N) * Math.PI * 2;
  const h = 2;
  const b = 1;
  contourFilter += `drop-shadow( ${Math.cos(a) * h}px ${
    Math.sin(a) * h
  }px ${b}px #fff)`;
}
for (let i = emojis.length; i--; ) {
  ctx.filter = contourFilter;
  ctx.fillText(emojis[i], (i + 0.5) * SPRITE_SIZE, SPRITE_SIZE * 0.5);
}
