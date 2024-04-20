import { vec2 } from "gl-matrix";
import { World } from "..";
import { getFromArray2 } from "../../utils/vec2";

export const update = (world: World) => {
  if (!world.player) return;

  {
    const dir = getFromArray2(world.direction, world.player);
    vec2.copy(dir, world.inputs.rightDirection);
  }

  {
    const velocity = getFromArray2(world.velocity, world.player);
    if (world.inputs.type === "keyboard_mouse") {
      velocity[0] = 0;
      velocity[1] = 0;
      if (world.inputs.keydown.has("arrow_down")) velocity[1]--;
      if (world.inputs.keydown.has("arrow_up")) velocity[1]++;
      if (world.inputs.keydown.has("arrow_right")) velocity[0]++;
      if (world.inputs.keydown.has("arrow_left")) velocity[0]--;

      const l = vec2.len(velocity);
      if (l > 0) {
        velocity[0] /= l;
        velocity[1] /= l;
      }
    } else {
      vec2.copy(velocity, world.inputs.leftDirection);
    }
  }
};
