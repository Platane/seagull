import { mat4, vec3 } from "gl-matrix";

export const TAG_ALIVE = 1 << 0;
export const TAG_BLUE = 1 << 1;

const TAG_MASK = (1 << 8) - 1;
export const getTag = (x: number, tag_mask: number) => !!(x & tag_mask);
export const setTag = (x: number, tag_mask: number, value: boolean) => {
  const u = TAG_MASK ^ tag_mask;
  return (x & u) + tag_mask * +value;
};

export const createWorld = (MAX_ENTITIES = 1 << 10) => {
  const tags = new Uint8Array(MAX_ENTITIES);

  const position = new Float32Array(MAX_ENTITIES * 2); // as (x,y)
  const direction = new Float32Array(MAX_ENTITIES * 2); // as (vx,vy)
  const health = new Uint8Array(MAX_ENTITIES);
  const hitBoxSize = new Uint8Array(MAX_ENTITIES); // as disk hit box radius
  const visual = new Uint8Array(MAX_ENTITIES * 4); // as (model, pose_param_1, pose_param_2, pose_param_3)

  const camera = {
    eye: vec3.create(),
    aspect: 1,

    worldMatrix: mat4.create(),

    viewportChanged: true,
  };

  const inputs = { keydown: new Set<Key>() };

  return {
    dt: 0,
    t: 0,
    tags,
    position,
    direction,
    health,
    hitBoxSize,
    visual,
    camera,
    inputs,
  };
};

export type Key =
  | "ArrowUp"
  | "ArrowLeft"
  | "ArrowRight"
  | "ArrowDown"
  | "Space";

export type World = ReturnType<typeof createWorld>;

export type Entity = number & { __opaque_type: "Entity" };

export const createEntity = (world: World, i0 = 1) => {
  for (let i = i0; i < world.tags.length; i++) {
    if (!getTag(world.tags[i], TAG_ALIVE)) {
      world.tags[i] = setTag(world.tags[i], TAG_ALIVE, true);
      return i as Entity;
    }
  }

  throw new Error(
    process.env.NODE_ENV !== "production" ? "reached entity cap" : "",
  );
};
export const deleteEntity = (world: World, entity: Entity) => {
  world.tags[entity] = 0;
};
