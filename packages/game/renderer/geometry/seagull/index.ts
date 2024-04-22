import { mat4, quat, vec3 } from "gl-matrix";
import {
  center,
  size,
  verticesSegments,
} from "../../../assets/models/seagull/geometry-meta.json";
import seagullGeometryUrl from "../../../assets/models/seagull/geometry.bin";
import {
  bonesCount,
  posesCount,
} from "../../../assets/models/seagull/pose-meta.json";
import seagullPoseUrl from "../../../assets/models/seagull/pose.bin";
import { copyIntoArray3 } from "../../../utils/vec3";
import { computeWeights } from "../../utils/computeWeights";
import { fetchVertices } from "../utils/fetchVertices";
import { getFlatShadingNormals } from "../utils/flatShading";

export const seagullModelPromise = Promise.all([
  fetchVertices(seagullGeometryUrl, size as vec3, center as vec3),
  fetch(seagullPoseUrl)
    .then((res) => res.arrayBuffer())
    .then((res) => new Float32Array(res)),
]).then(([halfPositions, posesRaw]) => {
  //

  const positions = new Float32Array(halfPositions.length * 2);
  positions.set(halfPositions);

  const colors = new Float32Array(positions.length);
  colors.fill(0.5);

  const p = vec3.create();
  const q = quat.create();
  const poseBones = Array.from({ length: posesCount }, (_, i) =>
    Array.from({ length: bonesCount }, (_, j) => {
      const k = i * bonesCount + j;

      p[0] = posesRaw[k * 7 + 0];
      p[1] = posesRaw[k * 7 + 1];
      p[2] = posesRaw[k * 7 + 2];

      q[0] = posesRaw[k * 7 + 3 + 0];
      q[1] = posesRaw[k * 7 + 3 + 1];
      q[2] = posesRaw[k * 7 + 3 + 2];
      q[3] = posesRaw[k * 7 + 3 + 3];

      const m = mat4.create();

      mat4.fromRotationTranslation(m, q, p);
      mat4.fromTranslation(m, p);

      return m;
    }),
  );

  const bindPoseBones = poseBones[0];
  const bindPoseBonesInv = poseBones[0].map((m) =>
    mat4.invert(mat4.create(), m),
  );

  const poses = new Float32Array(
    poseBones.flatMap((bones) =>
      bones.flatMap((bone, i) => {
        const m = mat4.create();

        mat4.multiply(m, bone, bindPoseBonesInv[i]);

        return [...m];
      }),
    ),
  );

  console.log(poses);
  debugger;

  {
    const n = halfPositions.length;

    // mirror
    for (let i = 0; i < n; i += 9) {
      positions[n + i + 0 + 0] = -positions[i + 0 + 0];
      positions[n + i + 0 + 1] = positions[i + 0 + 1];
      positions[n + i + 0 + 2] = positions[i + 0 + 2];

      positions[n + i + 3 + 0] = -positions[i + 6 + 0];
      positions[n + i + 3 + 1] = positions[i + 6 + 1];
      positions[n + i + 3 + 2] = positions[i + 6 + 2];

      positions[n + i + 6 + 0] = -positions[i + 3 + 0];
      positions[n + i + 6 + 1] = positions[i + 3 + 1];
      positions[n + i + 6 + 2] = positions[i + 3 + 2];
    }
  }

  {
    const n = halfPositions.length;
    const color = vec3.create();

    for (let i = 0; i < n / 3; i++) {
      if (
        (i === verticesSegments[0] - 3 ||
          i === verticesSegments[0] - 5 ||
          i === verticesSegments[0] - 15) &&
        false
      )
        vec3.set(color, 0.3, 0.35, 0.35);
      else if (i < verticesSegments[0]) {
        vec3.set(color, 0.92, 0.94, 0.93);
      } else if (i < verticesSegments[0] + verticesSegments[1]) {
        vec3.set(color, 0.3, 0.3, 0.3);
      } else {
        vec3.set(color, 1, 0.7, 0.3);
      }
      copyIntoArray3(colors, i, color);
      copyIntoArray3(colors, n / 3 + i, color);
    }
  }

  return {
    poseBones,

    positions,
    colors,
    normals: getFlatShadingNormals(positions),
    ...computeWeights(bindPoseBones, positions),
    poses,
    bonesCount,
    posesCount,
  };
});
