import { css } from "@linaria/core";
import { vec2 } from "gl-matrix";
import { World } from "../world";

const containerElement = document.createElement("div");
const containerClassName = css`
position: absolute;
bottom: 20px;
left: 20px;
width: min(max( 200px, 25vw, 25vh ), calc( 50vw - 40px ) , calc( 50vh - 40px ) );
aspect-ratio: 1;
border-radius: 50%;
border: solid 20px #ddda;


`;
containerElement.className = containerClassName;

const stickElement = document.createElement("div");
const stickClassName = css`
position: absolute;
top:  50% ;
left:  50% ;
width: 80px;
aspect-ratio: 1;
border-radius: 50%;
background-color: #ccca;
transform:translate(-50%,-50%);

`;
stickElement.classList.add(stickClassName);

containerElement.appendChild(stickElement);

const updateDom = (dir: vec2) => {
  const s = containerElement.offsetWidth / 2 - 10;

  stickElement.style.transform =
    "translate(" +
    `calc(-50% + ${dir[0] * s}px)` +
    "," +
    `calc(-50% - ${dir[1] * s}px)` +
    ")";
};

let remove: (() => void) | undefined;

export const update = (world: World) => {
  if (world.inputs.type === "mobile" && !remove) {
    const a = new AbortController();
    let touchId: undefined | number;
    document.body.appendChild(containerElement);
    containerElement.addEventListener(
      "touchmove",
      (e) => {
        const touch = Array.from(e.changedTouches).find(
          (t) => t.identifier === touchId,
        );

        if (!touch) return;

        const { pageX, pageY } = touch;
        const x =
          pageX -
          (containerElement.offsetLeft + containerElement.offsetWidth / 2);
        const y =
          containerElement.offsetTop +
          containerElement.offsetHeight / 2 -
          pageY;

        const s = containerElement.offsetWidth / 2;
        const l = Math.hypot(x, y);

        const m = Math.max(s, l);

        vec2.set(world.inputs.leftDirection, x / m, y / m);

        updateDom(world.inputs.leftDirection);
      },
      { signal: a.signal },
    );
    containerElement.addEventListener(
      "touchstart",
      (e) => {
        if (!touchId) {
          touchId = e.changedTouches[0].identifier;
          navigator.vibrate(50);
        }
      },
      { signal: a.signal },
    );
    containerElement.addEventListener(
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
      { signal: a.signal },
    );
    remove = () => {
      document.body.removeChild(containerElement);
      a.abort();
    };
  }

  if (world.inputs.type !== "mobile" && remove) {
    remove();
    remove = undefined;
  }
};
