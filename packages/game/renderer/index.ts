import type { World } from "../world";
import { canvas, dpr, gl } from "./canvas";
import { seagullModelPromise } from "./geometry/seagull";
import { draw as draw_gizmo } from "./materials/gizmo";
import {
  MAX_INSTANCES,
  createSkinnedMeshMaterial,
} from "./materials/skinnedMesh";
import { draw as draw_sprites } from "./materials/sprites/draw";
import { update as update_sprites } from "./materials/sprites/update";

export const update = (world: World) => {
  //
  // handle canvas resize
  if (world.changed.viewport) {
    const w = window.innerWidth * dpr;
    const h = window.innerHeight * dpr;

    canvas.width = w;
    canvas.height = h;

    world.camera.aspect = w / h;

    gl.viewport(0, 0, w, h);
  }
};

let seagull: { draw: (world: World) => void; update: (world: World) => void };
seagullModelPromise
  .then(createSkinnedMeshMaterial)
  .then(({ draw, updateInstances }) => {
    const instances = new Float32Array(MAX_INSTANCES * 8);

    const update = (world: World) => {
      for (let entity = 1; entity < world.entityPoolSize; entity++) {
        const i = world.visual_model[entity];
        if (i) {
        }
      }

      const player = world.player;

      instances[0] = world.position[player * 2 + 0];
      instances[1] = world.position[player * 2 + 1];

      instances[2] = world.direction[player * 2 + 0];
      instances[3] = world.direction[player * 2 + 1];

      instances[4] = 0;
      instances[5] = 1;

      instances[6] = 0;
      instances[7] = 0;

      updateInstances(instances, 1);
    };

    seagull = { update, draw };
  });

export const draw = (world: World) => {
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  gl.enable(gl.DEPTH_TEST);
  gl.depthFunc(gl.LESS);

  draw_gizmo(world);
  update_sprites(world);
  draw_sprites(world);

  seagull?.update(world);
  seagull?.draw(world);
};
