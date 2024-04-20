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
  if (!world.player) {
    const entity = createEntity(world);
    world.player = entity;

    world.visual_sprite[entity] = 2;
    world.camera.following = entity;
  }

  if (!spawned) {
    for (let i = 0; i--; ) {
      spawned = spawnEnemy(world, 3);
    }
  }

  for (let entity = world.entityPoolSize as Entity; entity--; ) {
    if (getTag(world, TAG_BLUE, entity)) {
      setIntoArray2(
        world.position,
        entity,
        Math.cos(world.t * 1.2 * (1 + (entity % 8) / 8) + entity) * 0.5 +
          (entity ** 2 % 100) / 100 -
          0.5,
        Math.sin(world.t * 1.2 * (1 + (entity % 8) / 8) + entity) * 0.5,
      );
    }
  }
};
