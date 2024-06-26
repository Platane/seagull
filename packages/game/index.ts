import { draw, update as update_renderer } from "./renderer";
import { canvas } from "./renderer/canvas";
import { update as update_fullscreen } from "./ui/fullscreen";
import "./ui/global";
import { update as update_ui_mobile_control } from "./ui/mobile-control";
import { startButton } from "./ui/start-screen";
import { createWorld } from "./world";
import { update as update_applyVelocity } from "./world/systems/applyVelocity";
import { update as update_camera } from "./world/systems/cameraUpdate";
import { update as update_cameraWobble } from "./world/systems/cameraWobble";
import { update as update_clock } from "./world/systems/clock";
import { update as update_collisionResolution } from "./world/systems/collisionResolution";
import { update as update_enemyMovement } from "./world/systems/enemyMovement";
import { createEventListeners } from "./world/systems/eventListeners";
import { update as update_playerMovement } from "./world/systems/playerMovement";
import { update as update_playerWeapon } from "./world/systems/playerWeapon";
import { update as update_spawnEnemy } from "./world/systems/spawnEnemy";

import "./renderer/geometry/seagull";
import { seagullModelPromise } from "./renderer/geometry/seagull";

const world = createWorld();

createEventListeners(world);

let lastDate = 0;
const loop = () => {
  const now = Date.now();
  lastDate = lastDate || now;
  world.dt = Math.min(now - lastDate, 200) / 1000;
  lastDate = now;

  //
  //

  update_clock(world);
  update_spawnEnemy(world);

  update_enemyMovement(world);

  update_playerMovement(world);
  update_playerWeapon(world);

  update_collisionResolution(world);

  update_applyVelocity(world);

  update_fullscreen(world);
  update_ui_mobile_control(world);

  update_cameraWobble(world);
  update_camera(world);

  update_renderer(world);

  // reset dirty flag
  for (const k in world.changed) {
    // @ts-ignore
    world.changed[k] = false;
  }

  //
  //

  draw(world);

  //
  //
  requestAnimationFrame(loop);
};

startButton.disabled = true;
startButton.textContent = "Loading...";
Promise.all([
  //
  seagullModelPromise,
  // new Promise((r) => setTimeout(r, 100)),
]).then(() => {
  startButton.disabled = false;
  startButton.textContent = "Start";
});

document.body.appendChild(startButton);

const start = () => {
  document.body.removeChild(startButton);
  document.body.appendChild(canvas);
  loop();
};
startButton.onclick = start;

start();
