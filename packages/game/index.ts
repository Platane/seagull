import { draw, update as update_renderer } from "./renderer";
import "./ui/global";
import { createWorld } from "./world";
import { update as update_clock } from "./world/systems/clock";
import { createEventListeners } from "./world/systems/eventListeners";
import { update as update_spawnEnemy } from "./world/systems/spawnEnemy";

const world = createWorld();

createEventListeners(world);

let lastDate = Date.now();
const loop = () => {
  const now = Date.now();
  world.dt = (now - lastDate) / 1000;
  lastDate = now;

  //
  //

  update_clock(world);
  update_spawnEnemy(world);
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

loop();
