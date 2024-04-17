import { Entity, TAG_BLUE, World, createEntity, setTag } from "..";
import { setIntoArray2 } from "../../utils/vec2";

const spawnEnemy = (world: World, spriteIndex: 1 | 2 | 3) => {
  const entity = createEntity(world);

  world.position[entity * 2 + 0] = 0;
  world.position[entity * 2 + 1] = 0;

  world.direction[entity * 2 + 0] = 0;
  world.direction[entity * 2 + 1] = 0;

  world.visual_sprite[entity] = spriteIndex;

  setTag(entity, TAG_BLUE, true);

  return entity;
};

let spawned: Entity;

export const update = (world: World) => {
  if (!spawned) {
    spawned = spawnEnemy(world, 3);
  }

  setIntoArray2(
    world.position,
    spawned,
    Math.cos(world.t * 1.2) * 0.5,
    Math.sin(world.t * 1.2) * 0.5,
  );
};
