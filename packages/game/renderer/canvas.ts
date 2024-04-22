import { canvasClassName } from "../ui/global";

export const canvas = document.createElement("canvas");

canvas.className = canvasClassName;

export const gl = canvas.getContext("webgl2")!;

export const dpr = Math.min(window.devicePixelRatio ?? 1, 2);

let i = 0;
export const getNextTextureIndex = () => i++;
