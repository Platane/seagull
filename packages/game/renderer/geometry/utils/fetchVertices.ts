import { vec3 } from "gl-matrix";

export const fetchVertices = async (packUrl: string, size: vec3) => {
  const buffer = await fetch(packUrl).then((res) => res.arrayBuffer());

  const positions = [...new Uint8Array(buffer)].map((x, i) => {
    x /= 256;

    if (i % 3 == 0) return (x - 0.5) * size[0];
    if (i % 3 == 1) return (x - 0.5) * size[1];
    if (i % 3 == 2) return (x - 0.5) * size[2];
    return 0;
  });

  return positions;
};
