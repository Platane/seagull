import { World } from "..";

export const update = (world: World) => {
  world.t += world.dt;
};
