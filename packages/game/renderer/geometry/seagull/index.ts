import { mat4, vec3 } from "gl-matrix";
import seagullGeometryUrl from "../../../assets/models/seagull/geometry.bin";
import {
  bones,
  packedGeometrySize,
  verticesSegments,
} from "../../../assets/models/seagull/meta.json";
import { setIntoArray3 } from "../../../utils/vec3";
import { fetchVertices } from "../utils/fetchVertices";
import { getFlatShadingNormals } from "../utils/flatShading";

export const seagullModelPromise = fetchVertices(
  seagullGeometryUrl,
  packedGeometrySize as vec3,
).then((positions) => {
  //

  for (let i = 0; i < positions.length; i += 3) {
    const s = packedGeometrySize[1];

    const x = positions[i + 0];
    const y = positions[i + 1];
    const z = positions[i + 2];

    positions[i + 0] = z / s;
    positions[i + 1] = x / s;
    positions[i + 2] = y / s;
  }

  const colors = Array.from(positions);
  {
    let i = 0;
    for (; i < verticesSegments[0]; i++) {
      setIntoArray3(colors, i, 0.9, 0.8, 1);
    }
    for (; i < verticesSegments[0] + verticesSegments[1]; i++) {
      setIntoArray3(colors, i, 0.5, 0.5, 0.5);
    }
    for (
      ;
      i <
      verticesSegments[0] +
        verticesSegments[1] +
        verticesSegments[2] +
        verticesSegments[3];
      i++
    ) {
      setIntoArray3(colors, i, 1, 0.5, 0.5);
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
    positions: new Float32Array(positions),
    colors: new Float32Array(colors),
    normals,
    weights,
    boneIndexes,
    poses,
    bonesCount,
    posesCount,
  };
});
