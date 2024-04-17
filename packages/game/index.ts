import { draw, update as update_renderer } from "./renderer";
import "./ui/global";
import { createWorld } from "./world";
import { update as update_clock } from "./world/systems/clock";
import { createEventListeners } from "./world/systems/eventListeners";

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
  update_renderer(world);

  //
  //

  draw(world);

  //
  //

  requestAnimationFrame(loop);
};

loop();
