import { css } from "@linaria/core";
import { vec2 } from "gl-matrix";
import { canvas } from "../renderer/canvas";
import { World } from "../world";

const leftStickContainerElement = document.createElement("div");
const leftStickContainerClassName = css`
position: absolute;
bottom: 20px;
left: 20px;
width: min(max( 200px, 25vw, 25vh ), calc( 50vw - 40px ) , calc( 50vh - 40px ) );
aspect-ratio: 1;
border-radius: 50%;
border: solid 20px #ddda;


`;
leftStickContainerElement.className = leftStickContainerClassName;

const leftStickDotElement = document.createElement("div");
const leftStickDotClassName = css`
position: absolute;
top:  50% ;
left:  50% ;
width: 80px;
aspect-ratio: 1;
border-radius: 50%;
background-color: #ccca;
transform:translate(-50%,-50%);

`;
leftStickDotElement.classList.add(leftStickDotClassName);

leftStickContainerElement.appendChild(leftStickDotElement);

const updateDom = (dir: vec2) => {
  const s = leftStickContainerElement.offsetWidth / 2 - 10;

  leftStickDotElement.style.transform =
    "translate(" +
    `calc(-50% + ${dir[0] * s}px)` +
    "," +
    `calc(-50% - ${dir[1] * s}px)` +
    ")";
};

let remove: (() => void) | undefined;

const init = (world: World) => {
  const a = new AbortController();
  const o = { signal: a.signal };

  //
  // left stick
  {
    let touchId: undefined | number;
    document.body.appendChild(leftStickContainerElement);
    leftStickContainerElement.addEventListener(
      "touchmove",
      (e) => {
        const touch = Array.from(e.changedTouches).find(
          (t) => t.identifier === touchId,
        );

        if (!touch) return;

        const { pageX, pageY } = touch;
        const x =
          pageX -
          (leftStickContainerElement.offsetLeft +
            leftStickContainerElement.offsetWidth / 2);
        const y =
          leftStickContainerElement.offsetTop +
          leftStickContainerElement.offsetHeight / 2 -
          pageY;

        const s = leftStickContainerElement.offsetWidth / 2;
        const l = Math.hypot(x, y);

        const m = Math.max(s, l);

        vec2.set(world.inputs.leftDirection, x / m, y / m);

        updateDom(world.inputs.leftDirection);
      },
      o,
    );
    leftStickContainerElement.addEventListener(
      "touchstart",
      (e) => {
        if (!touchId) {
          touchId = e.changedTouches[0].identifier;
          navigator.vibrate(50);
        }
      },
      o,
    );
    leftStickContainerElement.addEventListener(
      "touchend",
      (e) => {
        if (
          Array.from(e.changedTouches).some((t) => t.identifier === touchId)
        ) {
          touchId = undefined;
          vec2.set(world.inputs.leftDirection, 0, 0);
          updateDom(world.inputs.leftDirection);
        }
      },
      o,
    );
  }

  //
  // primary
  {
    let touchId: undefined | number;
    canvas.addEventListener("touchstart", (e) => {
      if (!touchId) {
        touchId = e.changedTouches[0].identifier;
        world.inputs.keydown.add("primary");
      }
    });
    canvas.addEventListener(
      "touchmove",
      (e) => {
        const touch = Array.from(e.changedTouches).find(
          (t) => t.identifier === touchId,
        );

        if (!touch) return;

        const { pageX, pageY } = touch;
        const x = pageX - (canvas.offsetLeft + canvas.offsetWidth / 2);
        const y = canvas.offsetTop + canvas.offsetHeight / 2 - pageY;

        vec2.set(world.inputs.rightDirection, x, y);

        const l = vec2.len(world.inputs.rightDirection);

        if (l > 0)
          vec2.scale(
            world.inputs.rightDirection,
            world.inputs.rightDirection,
            1 / l,
          );
      },
      o,
    );
    canvas.addEventListener(
      "touchend",
      (e) => {
        if (
          Array.from(e.changedTouches).some((t) => t.identifier === touchId)
        ) {
          touchId = undefined;
          world.inputs.keydown.delete("primary");
        }
      },
      o,
    );
  }

  return () => {
    document.body.removeChild(leftStickContainerElement);
    a.abort();
  };
};

export const update = (world: World) => {
  if (world.inputs.type === "mobile" && !remove) {
    remove = init(world);
  }

  if (world.inputs.type !== "mobile" && remove) {
    remove();
    remove = undefined;
  }
};
