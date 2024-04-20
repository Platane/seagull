import { World } from "..";

export const update = (world: World) => {
  world.camera.eye[0] =
    world.camera.lookAtPoint[0] * 0.8 +
    Math.sin(world.t * 0.8) * world.camera.eye[2] * 0.05;
  world.camera.eye[1] =
    world.camera.lookAtPoint[1] * 0.8 +
    Math.cos(world.t * 0.8) * world.camera.eye[2] * 0.05;

  world.changed.camera = true;
};
