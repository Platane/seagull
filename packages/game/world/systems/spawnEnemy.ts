import { TAG_BLUE, World, createEntity, setTag } from "..";

const spawnEnemy = (world: World) => {
  const entity = createEntity(world);

  world.position[entity * 2 + 0] = 0;
  world.position[entity * 2 + 1] = 0;

  world.direction[entity * 2 + 0] = 0;
  world.direction[entity * 2 + 1] = 0;

  setTag(entity, TAG_BLUE, true);

  return entity;
};

export const update = (world: World) => {};
