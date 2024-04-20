import { mat4 } from "gl-matrix";
import { World } from "..";
import { NORTH } from "../../utils/vec3";

const perspectiveMatrix = mat4.create();
const lookAtMatrix = mat4.create();

export const updateCamera = (world: World) => {
  if (world.changed.camera) {
    mat4.identity(world.camera.worldMatrix);

    const fovX = Math.PI / 3;
    const near = 0.005;
    const far = 2000;
    const aspect = world.camera.aspect;
    mat4.perspective(perspectiveMatrix, fovX, aspect, near, far);

    mat4.lookAt(
      lookAtMatrix,
      world.camera.eye,
      world.camera.lookAtPoint,
      NORTH,
    );

    mat4.multiply(world.camera.worldMatrix, perspectiveMatrix, lookAtMatrix);
  }
};

export const update = (world: World) => {
  if (world.camera.following) {
    world.camera.lookAtPoint[0] =
      world.position[world.camera.following * 2 + 0];
    world.camera.lookAtPoint[1] =
      world.position[world.camera.following * 2 + 1];
  }

  updateCamera(world);
};
