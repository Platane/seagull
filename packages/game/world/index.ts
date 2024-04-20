import { mat4, vec2, vec3 } from "gl-matrix";

export const TAG_ALIVE = 1 << 0;
export const TAG_BLUE = 1 << 1;

const TAG_MASK = (1 << 8) - 1;
export const readTag = (x: number, tag_mask: number) => !!(x & tag_mask);
export const updateTag = (x: number, tag_mask: number, value: boolean) => {
  const u = TAG_MASK ^ tag_mask;
  return (x & u) + tag_mask * +value;
};

export const getTag = (world: World, tag_mask: number, entity: Entity) =>
  readTag(world.tags[entity], tag_mask);

export const setTag = (
  world: World,
  tag_mask: number,
  entity: Entity,
  value: boolean,
) => {
  world.tags[entity] = updateTag(world.tags[entity], tag_mask, value);
};

export const MAX_ENTITIES = 1 << 11;

export const createWorld = (m = MAX_ENTITIES) => {
  const tags = new Uint8Array(m);

  const position = new Float32Array(m * 2); // as (x,y)
  const direction = new Float32Array(m * 2); // as (dx,dy)
  const velocity = new Float32Array(m * 2); // as (vx,vy)
  const health = new Uint8Array(m);
  const hitBoxSize = new Uint8Array(m); // as disk hit box radius
  const visual_model = new Uint8Array(m * 4); // as (model, pose_param_1, pose_param_2, pose_param_3)
  const visual_sprite = new Uint8Array(m); // as sprite_index or 0 for empty

  const camera = {
    eye: vec3.create(),
    lookAtPoint: vec3.create(),
    aspect: 1,

    following: 0 as Entity,

    worldMatrix: mat4.create(),
  };
  vec3.set(camera.eye, 0, 0, 2);
  vec3.set(camera.lookAtPoint, 0, 0, 0);

  const inputs = {
    type: ("ontouchstart" in document.documentElement
      ? "mobile"
      : "keyboard_mouse") as "keyboard_mouse" | "gamepad" | "mobile",
    keyMap: {
      ArrowUp: "arrow_up",
      ArrowDown: "arrow_down",
      ArrowLeft: "arrow_left",
      ArrowRight: "arrow_right",

      w: "arrow_up",
      s: "arrow_down",
      a: "arrow_left",
      d: "arrow_right",
    } as Record<string, Key>,
    keydown: new Set<Key>(),
    leftDirection: vec2.create(),
    rightDirection: vec2.create(),
  };

  // dirty flags
  const changed = { viewport: true, camera: true };

  return {
    dt: 0,
    t: 0,
    player: 0 as Entity,
    entityPoolSize: MAX_ENTITIES,
    changed,
    tags,
    position,
    velocity,
    direction,
    health,
    hitBoxSize,
    visual_model,
    visual_sprite,
    camera,
    inputs,
  };
};

export type Key =
  | "arrow_up"
  | "arrow_left"
  | "arrow_right"
  | "arrow_down"
  | "primary"
  | "secondary";

export type World = ReturnType<typeof createWorld>;

export type Entity = number & { __opaque_type: "Entity" };

export const createEntity = (world: World, i0 = 1) => {
  for (let i = i0; i < world.tags.length; i++) {
    if (!readTag(world.tags[i], TAG_ALIVE)) {
      world.tags[i] = updateTag(world.tags[i], TAG_ALIVE, true);
      return i as Entity;
    }
  }

  throw new Error(
    process.env.NODE_ENV !== "production" ? "reached entity cap" : "",
  );
};
export const deleteEntity = (world: World, entity: Entity) => {
  world.tags[entity] = 0;
  world.visual_sprite[entity] = 0;
  world.visual_model[entity * 4] = 0;
  world.velocity[entity * 2 + 0] = 0;
  world.velocity[entity * 2 + 1] = 0;
};
