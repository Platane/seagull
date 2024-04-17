import { Entity, TAG_BLUE, World, createEntity, getTag, setTag } from "..";
import { setIntoArray2 } from "../../utils/vec2";

const spawnEnemy = (world: World, spriteIndex: 1 | 2 | 3) => {
  const entity = createEntity(world);

  world.position[entity * 2 + 0] = 0;
  world.position[entity * 2 + 1] = 0;

  world.direction[entity * 2 + 0] = 0;
  world.direction[entity * 2 + 1] = 0;

  world.visual_sprite[entity] = spriteIndex;

  setTag(world, TAG_BLUE, entity, true);

  return entity;
};

let spawned: Entity;

export const update = (world: World) => {
  if (!spawned) {
    for (let i = 500; i--; ) {
      spawned = spawnEnemy(world, 3);
    }
  }

  for (let entity = world.tags.length as Entity; entity--; ) {
    if (getTag(world, TAG_BLUE, entity)) {
      setIntoArray2(
        world.position,
        entity,
        Math.cos(world.t * 1.2 + entity) * 0.5 + (entity % 5) / 5,
        Math.sin(world.t * 1.2 + entity) * 0.5,
      );
    }
  }
};
