import type { Key, World } from "..";

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
      const key = (event.key === " " && "Space") || (event.key as Key);
      world.inputs.keydown.add(key);
    },
    o,
  );

  containerElement.addEventListener(
    "keyup",
    (event) => {
      const key = (event.key === " " && "Space") || (event.key as Key);
      world.inputs.keydown.delete(key);
    },
    o,
  );

  containerElement.addEventListener(
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

  return () => cleanupController.abort();
};
