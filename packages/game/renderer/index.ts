import type { World } from "../world";
import { canvas, dpr, gl } from "./canvas";
import { seagullModelPromise } from "./geometry/seagull";
import { draw as draw_gizmo } from "./materials/gizmo";
import { createSkinnedMeshMaterial } from "./materials/skinnedMesh";
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

let seagull: { draw: (world: World) => void };
seagullModelPromise
  .then(createSkinnedMeshMaterial)
  .then((res) => (seagull = res));

export const draw = (world: World) => {
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  gl.enable(gl.DEPTH_TEST);
  gl.depthFunc(gl.LESS);

  draw_gizmo(world);
  update_sprites(world);
  draw_sprites(world);

  seagull?.draw(world);
};
