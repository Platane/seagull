import { Entity, RUSHING_ENEMY, World, createEntity, getTag, setTag } from "..";
import { setIntoArray2 } from "../../utils/vec2";

let spawned: boolean;

export const update = (world: World) => {
  if (!world.player) {
    // spawn player
    {
      const entity = createEntity(world);
      world.player = entity;

      world.visual_sprite[entity] = 2;
      world.hitBoxSize[entity] = 0.4;
      world.camera.following = entity;
    }

    // spawn tree

    for (let i = 10; i--; ) {
      const entity = createEntity(world);

      world.position[entity * 2 + 0] = Math.random() * 10 - 5;
      world.position[entity * 2 + 1] = Math.random() * 10 - 5;

      world.visual_sprite[entity] = 4;

      world.hitBoxSize[entity] = 0.4;
    }
  }

  if (!spawned) {
    for (let i = 16; i--; ) {
      const entity = createEntity(world);

      world.position[entity * 2 + 0] = Math.random() * 10 - 5;
      world.position[entity * 2 + 1] = Math.random() * 10 - 5;

      world.direction[entity * 2 + 0] = 0;
      world.direction[entity * 2 + 1] = 0;

      world.visual_sprite[entity] = 3;

      world.hitBoxSize[entity] = 0.4;

      setTag(world, RUSHING_ENEMY, entity, true);
    }

    spawned = true;
  }
};
