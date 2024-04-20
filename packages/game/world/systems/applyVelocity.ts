import { Entity, World } from "..";

export const update = (world: World) => {
  for (let entity = world.entityPoolSize as Entity; entity--; ) {
    world.position[entity * 2 + 0] += world.velocity[entity * 2 + 0] * world.dt;
    world.position[entity * 2 + 1] += world.velocity[entity * 2 + 1] * world.dt;
  }
};
