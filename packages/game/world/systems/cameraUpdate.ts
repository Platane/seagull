import { mat4 } from "gl-matrix";
import { World } from "..";

export const updateCamera = (world: World) => {
  if (world.changed.camera) {
    mat4.identity(world.camera.worldMatrix);
  }
};
