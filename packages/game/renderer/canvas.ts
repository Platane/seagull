export const canvas = document.getElementById("a") as HTMLCanvasElement;

export const gl = canvas.getContext("webgl2")!;

export const dpr = Math.min(window.devicePixelRatio ?? 1, 2);
