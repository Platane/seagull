import { vec2 } from "gl-matrix";
import { World } from "..";
import { getFromArray2 } from "../../utils/vec2";

const direction = vec2.create();

export const update = (world: World) => {
  if (!world.player) return;

  direction[0] = 0;
  direction[1] = 0;
  if (world.inputs.keydown.has("arrow_down")) direction[1]--;
  if (world.inputs.keydown.has("arrow_up")) direction[1]++;
  if (world.inputs.keydown.has("arrow_right")) direction[0]++;
  if (world.inputs.keydown.has("arrow_left")) direction[0]--;

  const l = vec2.len(direction);

  if (l === 0) return;

  const p = getFromArray2(world.position, world.player);

  p[0] += (direction[0] / l) * 1.8 * world.dt;
  p[1] += (direction[1] / l) * 1.8 * world.dt;
};
