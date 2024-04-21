import { vec2 } from "gl-matrix";
import { Entity, RUSHING_ENEMY, World, getTag } from "..";
import { getFromArray2 } from "../../utils/vec2";

export const update = (world: World) => {
  if (!world.player) return;

  for (let entity = world.entityPoolSize as Entity; entity--; ) {
    if (getTag(world, RUSHING_ENEMY, entity)) {
      const v = getFromArray2(world.velocity, entity);

      v[0] =
        world.position[world.player * 2 + 0] - world.position[entity * 2 + 0];
      v[1] =
        world.position[world.player * 2 + 1] - world.position[entity * 2 + 1];

      const V = 0.3;

      const l = vec2.len(v);

      if (l > 0) {
        if (l > 0) {
          world.direction[entity * 2 + 0] = -v[0] / l;
          world.direction[entity * 2 + 1] = -v[1] / l;
        }

        v[0] = (v[0] / l) * V;
        v[1] = (v[1] / l) * V;
      }
    }
  }
};
