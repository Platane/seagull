import { mat4, vec3 } from "gl-matrix";
import seagullGeometryUrl from "../../../assets/models/seagull/geometry.bin";
import {
  bones,
  packedGeometrySize,
  verticesSegments,
} from "../../../assets/models/seagull/meta.json";
import { copyIntoArray3 } from "../../../utils/vec3";
import { fetchVertices } from "../utils/fetchVertices";
import { getFlatShadingNormals } from "../utils/flatShading";

export const seagullModelPromise = fetchVertices(
  seagullGeometryUrl,
  packedGeometrySize as vec3,
).then((rawPositions) => {
  //

  const positions = new Float32Array(rawPositions.length * 2);
  const colors = Array.from(positions);

  {
    const [sx, sy, sz] = packedGeometrySize;
    const s = sy;
    const n = rawPositions.length;
    const color = vec3.create();

    for (let i = 0; i < n / 9; i++) {
      const ax = rawPositions[i * 9 + 0 + 0] / s + (sx / s) * 0.5;
      const ay = rawPositions[i * 9 + 0 + 1] / s;
      const az = rawPositions[i * 9 + 0 + 2] / s;

      const bx = rawPositions[i * 9 + 3 + 0] / s + (sx / s) * 0.5;
      const by = rawPositions[i * 9 + 3 + 1] / s;
      const bz = rawPositions[i * 9 + 3 + 2] / s;

      const cx = rawPositions[i * 9 + 6 + 0] / s + (sx / s) * 0.5;
      const cy = rawPositions[i * 9 + 6 + 1] / s;
      const cz = rawPositions[i * 9 + 6 + 2] / s;

      positions[i * 9 + 0 + 0] = -ax;
      positions[i * 9 + 0 + 1] = az;
      positions[i * 9 + 0 + 2] = ay;

      positions[i * 9 + 3 + 0] = -bx;
      positions[i * 9 + 3 + 1] = bz;
      positions[i * 9 + 3 + 2] = by;

      positions[i * 9 + 6 + 0] = -cx;
      positions[i * 9 + 6 + 1] = cz;
      positions[i * 9 + 6 + 2] = cy;

      //

      positions[n + i * 9 + 0 + 0] = ax;
      positions[n + i * 9 + 0 + 1] = az;
      positions[n + i * 9 + 0 + 2] = ay;

      positions[n + i * 9 + 3 + 0] = cx;
      positions[n + i * 9 + 3 + 1] = cz;
      positions[n + i * 9 + 3 + 2] = cy;

      positions[n + i * 9 + 6 + 0] = bx;
      positions[n + i * 9 + 6 + 1] = bz;
      positions[n + i * 9 + 6 + 2] = by;

      //
      if (i < verticesSegments[0] / 3) {
        vec3.set(color, 0.8, 0.86, 0.9);
      } else if (i < verticesSegments[0] / 3 + verticesSegments[1] / 3) {
        vec3.set(color, 0.5, 0.5, 0.5);
      } else {
        vec3.set(color, 1, 0.5, 0.5);
      }

      copyIntoArray3(colors, i * 3 + 0, color);
      copyIntoArray3(colors, i * 3 + 1, color);
      copyIntoArray3(colors, i * 3 + 2, color);

      copyIntoArray3(colors, n / 3 + i * 3 + 0, color);
      copyIntoArray3(colors, n / 3 + i * 3 + 1, color);
      copyIntoArray3(colors, n / 3 + i * 3 + 2, color);
    }
  }

  const normals = getFlatShadingNormals(positions);

  const weights = new Float32Array(
    Array.from({ length: positions.length / 3 }, () => [1, 0, 0, 0]).flat(),
  );

  const boneIndexes = new Uint8Array(
    Array.from({ length: positions.length / 3 }, () => [1, 0, 0, 0]).flat(),
  );

  const bonesCount = bones.length;
  const posesCount = 1;
  const poses = new Float32Array(
    Array.from({ length: posesCount }, () =>
      Array.from({ length: bonesCount }, () => {
        const m = mat4.create();
        mat4.identity(m);
        return [...m];
      }),
    ).flat(2),
  );

  return {
    positions,
    colors: new Float32Array(colors),
    normals,
    weights,
    boneIndexes,
    poses,
    bonesCount,
    posesCount,
  };
});
