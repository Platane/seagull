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

let bones: mat4[] = [];
seagullModelPromise.then((res) => {
  bones = res.bones;
});

let seagull: { draw: (world: World) => void; update: (world: World) => void };
seagullModelPromise
  .then((res) => createSkinnedMeshMaterial(res))
  .then(({ draw, updateInstances }) => {
    const positions = new Float32Array(MAX_INSTANCES * 2);
    const directions = new Float32Array(MAX_INSTANCES * 2);
    const poseIndexes = new Uint8Array(MAX_INSTANCES * 2);
    const poseWeights = new Float32Array(MAX_INSTANCES * 2);

    const update = (world: World) => {
      let j = 0;
      gizmos.length = 0;

      for (let entity = 1; entity < world.entityPoolSize; entity++) {
        const i = world.visual_model[entity];
        if (i) {
          positions[j * 2 + 0] = world.position[entity * 2 + 0];
          positions[j * 2 + 1] = world.position[entity * 2 + 1];

          directions[j * 2 + 0] = world.direction[entity * 2 + 0];
          directions[j * 2 + 1] = world.direction[entity * 2 + 1];

          poseIndexes[j * 4 + 0] = i;
          poseIndexes[j * 4 + 1] = 0;
          poseIndexes[j * 4 + 2] = 0;
          poseIndexes[j * 4 + 3] = 0;

          poseWeights[j * 4 + 0] = 1;
          poseWeights[j * 4 + 1] = 0;
          poseWeights[j * 4 + 2] = 0;
          poseWeights[j * 4 + 3] = 0;

          if (j === 0 || true) {
            const w = mat4.create();
            const u = mat4.create();

            const position = [positions[j * 2 + 0], positions[j * 2 + 1]];
            const direction = [directions[j * 2 + 0], directions[j * 2 + 1]];
            // const direction = [0, 1];

            // biome-ignore format: <explanation>
            mat4.set(w,
              direction[1], -direction[0],   0,           0,
              direction[0],  direction[1],   0,           0,
                         0,             0,   1,           0,
                         0,             0,   0,           1,
            );

            mat4.fromTranslation(u, [position[0], position[1], 0]);

            gizmos.push(
              ...bones.map((p) => {
                const m = mat4.create();
                mat4.copy(m, p);
                mat4.multiply(m, w, m);
                mat4.multiply(m, u, m);
                return m;
              }),
            );
          }
          j++;
        }
      }

      updateInstances(positions, directions, poseIndexes, poseWeights, j);
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
