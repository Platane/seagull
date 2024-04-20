import { css } from "@linaria/core";
import { vec2 } from "gl-matrix";
import { canvas } from "../renderer/canvas";
import { World } from "../world";

const leftStickContainerElement = document.createElement("div");
leftStickContainerElement.className = css`
position: absolute;
bottom: 20px;
left: 20px;
width: min(max( 200px, 25vw, 25vh ), calc( 50vw - 30px ) , calc( 50vh - 30px ) );
aspect-ratio: 1;
border-radius: 50%;
border: solid 20px #ddda;
z-index: 2;
`;

const leftStickDotElement = document.createElement("div");
leftStickDotElement.className = css`
position: absolute;
top:  50% ;
left:  50% ;
width: 80px;
aspect-ratio: 1;
border-radius: 50%;
background-color: #ccca;
transform:translate(-50%,-50%);
`;

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

const rightContainerElement = document.createElement("div");
rightContainerElement.className = css`
position: absolute;
bottom: 20px;
right: 20px;
width: min(max( 200px, 25vw, 25vh ), calc( 50vw - 30px ) , calc( 50vh - 30px ) );
aspect-ratio: 1;
pointer-events: none;
z-index: 2;

`;
const secondaryButtonElement = document.createElement("button");
secondaryButtonElement.className = css`
all:unset;
position: absolute;
top:  50% ;
left:  50% ;
width: 60px;
aspect-ratio: 1;
border-radius: 50%;
background-color: #ccca;
display: flex;
justify-content: center;
align-items: center;
font-size: 30px;
line-height: 30px;
pointer-events: auto;
`;
secondaryButtonElement.textContent = "B";
rightContainerElement.appendChild(secondaryButtonElement);

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
    document.body.appendChild(rightContainerElement);

    const onMove = (e: TouchEvent) => {
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
    };

    canvas.addEventListener("touchstart", (e) => {
      if (!touchId) {
        touchId = e.changedTouches[0].identifier;
        world.inputs.keydown.add("primary");

        onMove(e);
      }
    });
    canvas.addEventListener("touchmove", onMove, o);
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

  //
  // secondary
  {
    let touchId: undefined | number;
    document.body.appendChild(rightContainerElement);
    secondaryButtonElement.addEventListener("touchstart", (e) => {
      if (!touchId) {
        touchId = e.changedTouches[0].identifier;
        world.inputs.keydown.add("secondary");
      }
    });
    secondaryButtonElement.addEventListener(
      "touchend",
      (e) => {
        if (
          Array.from(e.changedTouches).some((t) => t.identifier === touchId)
        ) {
          touchId = undefined;
          world.inputs.keydown.delete("secondary");
        }
      },
      o,
    );
  }

  return () => {
    document.body.removeChild(leftStickContainerElement);
    document.body.removeChild(rightContainerElement);
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
