import { World } from "..";

export const update = (world: World) => {
  world.camera.eye[0] = Math.sin(world.t) * world.camera.eye[2] * 0.2;
  world.camera.eye[1] = Math.cos(world.t) * world.camera.eye[2] * 0.2;
  world.changed.camera = true;
};
