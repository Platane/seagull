import { vec2 } from "gl-matrix";
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
      const key = world.inputs.keyMap[event.key];
      world.inputs.keydown.add(key);
    },
    o,
  );

  containerElement.addEventListener(
    "keyup",
    (event) => {
      const key = world.inputs.keyMap[event.key];
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
    (e) => {
      const x =
        ((e.pageX - containerElement.clientLeft) /
          containerElement.clientWidth -
          0.5) *
        2;
      const y =
        ((e.pageY - containerElement.clientTop) /
          containerElement.clientHeight -
          0.5) *
        2;

      vec2.set(world.inputs.rightDirection, x, -y);
    },
    o,
  );

  window.addEventListener(
    "mousedown",
    (e) => {
      const key = ((e.button === 0 && "primary") ||
        (e.button === 2 && "secondary")) as Key;

      world.inputs.keydown.add(key);
    },
    o,
  );

  window.addEventListener(
    "mouseup",
    (e) => {
      const key = ((e.button === 0 && "primary") ||
        (e.button === 2 && "secondary")) as Key;

      world.inputs.keydown.delete(key);
    },
    o,
  );

  window.addEventListener(
    "contextmenu",
    (e) => {
      e.preventDefault();
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
