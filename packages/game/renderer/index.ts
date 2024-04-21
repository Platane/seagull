import { mat4 } from "gl-matrix";
import type { World } from "../world";
import { canvas, dpr, gl } from "./canvas";
import { seagullModelPromise } from "./geometry/seagull";
import { draw as draw_gizmo } from "./materials/gizmo";
import { createGizmoMaterial } from "./materials/gizmos";
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
  .then((res) => createSkinnedMeshMaterial(res))
  .then(({ draw, updateInstances }) => {
    const instances = new Float32Array(MAX_INSTANCES * 8);

    const update = (world: World) => {
      let j = 0;

      for (let entity = 1; entity < world.entityPoolSize; entity++) {
        const i = world.visual_model[entity];
        if (i) {
          instances[j * 8 + 0] = world.position[entity * 2 + 0];
          instances[j * 8 + 1] = world.position[entity * 2 + 1];

          instances[j * 8 + 2] = world.direction[entity * 2 + 0];
          instances[j * 8 + 3] = world.direction[entity * 2 + 1];

          if (j === 0) {
            const w = mat4.create();
            const u = mat4.create();

            const position = [instances[j * 8 + 0], instances[j * 8 + 1]];
            const direction = [instances[j * 8 + 2], instances[j * 8 + 3]];
            // const direction = [0, 1];

            // biome-ignore format: <explanation>
            mat4.set(w,
              direction[1], -direction[0],   0,           0,
              direction[0],  direction[1],   0,           0,
                         0,             0,   1,           0,
                         0,             0,   0,           1,
            );

            mat4.fromTranslation(u, [position[0], position[1], 0]);

            seagullModelPromise.then(({ bones }) => {
              gizmos.length = 0;
              gizmos.push(
                ...bones.map((p) => {
                  const m = mat4.create();
                  mat4.fromTranslation(m, p);
                  mat4.multiply(m, w, m);
                  mat4.multiply(m, u, m);
                  return m;
                }),
              );
            });
          }
          j++;
        }
      }
      updateInstances(instances, j);
    };

    seagull = { update, draw };
  });

export const gizmos: mat4[] = [];
const gizmo = createGizmoMaterial();

export const draw = (world: World) => {
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  gl.enable(gl.DEPTH_TEST);
  gl.depthFunc(gl.LESS);

  draw_gizmo(world);
  update_sprites(world);
  draw_sprites(world);

  seagull?.update(world);
  seagull?.draw(world);

  gizmo.updateGizmos(gizmos);
  gizmo.draw(world);
};
