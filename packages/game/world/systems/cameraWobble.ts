import { World } from "..";

export const update = (world: World) => {
  const A = 0.6;
  const w = 0.7;

  world.camera.eye[0] =
    world.camera.lookAtPoint[0] * 0.8 +
    Math.sin(world.t * w) * world.camera.eye[2] * A;
  world.camera.eye[1] =
    world.camera.lookAtPoint[1] * 0.8 +
    Math.cos(world.t * w) * world.camera.eye[2] * A;

  world.changed.camera = true;
};
