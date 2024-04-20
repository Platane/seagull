import { vec2 } from "gl-matrix";
import { World, createEntity } from "..";
import { copyFromArray2, getFromArray2 } from "../../utils/vec2";

const d = vec2.create();

export const update = (world: World) => {
  if (!world.player) return;

  world.playerCooldown.primary = Math.max(
    0,
    world.playerCooldown.primary - world.dt,
  );
  world.playerCooldown.secondary -= world.dt;

  if (
    world.playerCooldown.primary <= 0 &&
    world.inputs.keydown.has("primary")
  ) {
    const dir = copyFromArray2(d, world.direction, world.player);

    const bullet = createEntity(world);

    const V = 5;

    world.position[bullet * 2 + 0] =
      world.position[world.player * 2 + 0] + dir[0] * 0.5;
    world.position[bullet * 2 + 1] =
      world.position[world.player * 2 + 1] + dir[1] * 0.5;

    world.direction[bullet * 2 + 0] = dir[0];
    world.direction[bullet * 2 + 1] = dir[1];

    world.velocity[bullet * 2 + 0] = dir[0] * V;
    world.velocity[bullet * 2 + 1] = dir[1] * V;

    world.visual_sprite[bullet] = 5;

    world.playerCooldown.primary = 0.3;
    navigator.vibrate(80);
  }
};
