import { World } from "../world";
import { canvas, dpr, gl } from "./canvas";
import { draw as draw_gizmo } from "./materials/gizmo";

export const update = (world: World) => {
  //
  // handle canvas resize
  if (world.camera.viewportChanged) {
    const w = window.innerWidth * dpr;
    const h = window.innerHeight * dpr;

    canvas.width = w;
    canvas.height = h;

    world.camera.aspect = w / h;

    gl.viewport(0, 0, w, h);
  }
};

export const draw = (world: World) => {
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  draw_gizmo(world);
};