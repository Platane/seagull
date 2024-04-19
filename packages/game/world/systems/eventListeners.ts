import type { Key, World } from "..";

const keyMap: Record<string, Key> = {
  ArrowUp: "arrow_up",
  ArrowDown: "arrow_down",
  ArrowLeft: "arrow_left",
  ArrowRight: "arrow_right",

  w: "arrow_up",
  s: "arrow_down",
  a: "arrow_left",
  d: "arrow_right",
};

export const createEventListeners = (
  world: World,
  containerElement: HTMLElement = document.body,
) => {
  const cleanupController = new AbortController();
  const o = {
    signal: cleanupController.signal,
  };

  containerElement.addEventListener(
    "keydown",
    (event) => {
      const key = keyMap[event.key];
      world.inputs.keydown.add(key);
    },
    o,
  );

  containerElement.addEventListener(
    "keyup",
    (event) => {
      const key = keyMap[event.key];
      world.inputs.keydown.delete(key);
    },
    o,
  );

  window.addEventListener(
    "blur",
    () => {
      world.inputs.keydown.clear();
    },
    o,
  );

  window.addEventListener(
    "resize",
    () => {
      world.changed.viewport = true;
    },
    o,
  );

  window.addEventListener(
    "mousemove",
    () => {
      world.changed.viewport = true;
    },
    o,
  );

  document.getElementById("zoom-input")?.addEventListener(
    "input",
    (e) => {
      const zoom = +(e.target as any).value;
      world.camera.eye[2] = zoom;
      world.changed.camera = true;
    },
    o,
  );

  return () => cleanupController.abort();
};
