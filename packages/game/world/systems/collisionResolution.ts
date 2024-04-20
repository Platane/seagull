import { Entity, World } from "..";

export const update = (world: World) => {
  if (!world.dt) return;

  for (let i = world.entityPoolSize as Entity; i--; )
    for (let j = 1 as Entity; j < i; j++)
      if (world.hitBoxSize[i] && world.hitBoxSize[j]) {
        const vx = world.position[j * 2 + 0] - world.position[i * 2 + 0];
        const vy = world.position[j * 2 + 1] - world.position[i * 2 + 1];

        const d = Math.hypot(vx, vy);

        const sj = world.hitBoxSize[j];
        const si = world.hitBoxSize[i];

        const e = sj + si - d;

        if (e < 0) continue;

        let pi = 1;
        let pj = 1;

        pi *= +(!!world.velocity[i * 2 + 0] || !!world.velocity[i * 2 + 1]);
        pj *= +(!!world.velocity[j * 2 + 0] || !!world.velocity[j * 2 + 1]);

        const pt = pi + pj || 1;

        world.velocity[j * 2 + 0] += (vx / d) * e * (pj / pt) * (1 / world.dt);
        world.velocity[j * 2 + 1] += (vy / d) * e * (pj / pt) * (1 / world.dt);

        world.velocity[i * 2 + 0] -= (vx / d) * e * (pi / pt) * (1 / world.dt);
        world.velocity[i * 2 + 1] -= (vy / d) * e * (pi / pt) * (1 / world.dt);
      }
};
