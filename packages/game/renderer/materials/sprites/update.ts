import { vec3 } from "gl-matrix";
import { copyFromArray2, setIntoArray2 } from "../../../utils/vec2";
import { ZERO, copyIntoArray3 } from "../../../utils/vec3";
import type { World } from "../../../world";
import { positions, sprite, uvs } from "./draw";
import { N_SPRITES } from "./textureAtlas";

const a = vec3.create();
const b = vec3.create();
const c = vec3.create();
const d = vec3.create();

const t = vec3.create();

export const update = (world: World) => {
  let j = 0;

  for (let entity = 1; entity < world.tags.length; entity++) {
    const i = world.visual_sprite[entity];
    if (i !== 0) {
      const s = 0.5;
      const z = -j * 0.001 - 0.001;

      vec3.set(a, -s, -s, z);
      vec3.set(b, +s, -s, z);
      vec3.set(c, +s, +s, z);
      vec3.set(d, -s, +s, z);

      {
        const dx = world.direction[entity * 2 + 0];
        const dy = world.direction[entity * 2 + 1];

        const l = Math.hypot(dx, dy);

        const angle = l > 0 ? Math.atan2(dx / l, dy / l) + Math.PI : 0;

        vec3.rotateZ(a, a, ZERO, angle);
        vec3.rotateZ(b, b, ZERO, angle);
        vec3.rotateZ(c, c, ZERO, angle);
        vec3.rotateZ(d, d, ZERO, angle);
      }

      {
        copyFromArray2(t as any, world.position, entity);
        vec3.add(a, a, t);
        vec3.add(b, b, t);
        vec3.add(c, c, t);
        vec3.add(d, d, t);
      }

      //  A
      //    (5)        (4)           B
      //     +----------+        (2)
      //     |         /          +
      //     |      /           / |
      //     |    /          /    |
      //     | /           /      |
      //     +          /         |
      //    (3)       +-----------+
      //  D          (0)         (1)
      //                             C

      //
      // triangle (0,1,2)
      copyIntoArray3(positions, j * 2 * 3 + 0, d);
      copyIntoArray3(positions, j * 2 * 3 + 1, c);
      copyIntoArray3(positions, j * 2 * 3 + 2, b);

      setIntoArray2(uvs, j * 3 * 2 + 0, (i + 0) / N_SPRITES, 0);
      setIntoArray2(uvs, j * 3 * 2 + 1, (i + 1) / N_SPRITES, 0);
      setIntoArray2(uvs, j * 3 * 2 + 2, (i + 1) / N_SPRITES, 1);

      //
      // triangle (3,4,5)
      copyIntoArray3(positions, j * 2 * 3 + 3, d);
      copyIntoArray3(positions, j * 2 * 3 + 4, b);
      copyIntoArray3(positions, j * 2 * 3 + 5, a);

      setIntoArray2(uvs, j * 3 * 2 + 3, (i + 0) / N_SPRITES, 0);
      setIntoArray2(uvs, j * 3 * 2 + 4, (i + 1) / N_SPRITES, 1);
      setIntoArray2(uvs, j * 3 * 2 + 5, (i + 0) / N_SPRITES, 1);

      j++;
    }
  }

  sprite.count = j;
};
