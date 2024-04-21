import { mat4, vec3 } from "gl-matrix";
import { copyFromArray3 } from "../../utils/vec3";

export const computeWeights = (bones: mat4[], positions: ArrayLike<number>) => {
  const boneIndexes = new Uint8Array((positions.length / 3) * 4);
  const weights = new Float32Array((positions.length / 3) * 4);

  const bonePositions = bones
    .slice(0, -2)
    .map((m) => mat4.getTranslation(vec3.create(), m));

  const p = vec3.create();

  const ws = new Float32Array(4);
  const is = new Uint8Array(4);

  const getWeight = (bone: vec3, p: vec3) => {
    const d = vec3.distance(p, bone);
    return 1 / d ** 4;
  };

  for (let i = 0; i < positions.length / 3; i++) {
    copyFromArray3(p, positions, i);

    ws[0] = ws[1] = ws[2] = ws[3] = 0;
    is[0] = is[1] = is[2] = is[3] = 0;

    for (let j = bonePositions.length; j--; ) {
      const w = getWeight(bonePositions[j], p);

      let k = 4;
      while (k > 0 && w > ws[k - 1]) k--;

      for (let u = 3; u >= k; u--) {
        ws[u + 1] = ws[u];
        is[u + 1] = is[u];
      }

      ws[k] = w;
      is[k] = j;
    }

    const sum = ws[0] + ws[1] + ws[2] + ws[3];

    weights[i * 4 + 0] = ws[0] / sum;
    weights[i * 4 + 1] = ws[1] / sum;
    weights[i * 4 + 2] = ws[2] / sum;
    weights[i * 4 + 3] = ws[3] / sum;

    boneIndexes[i * 4 + 0] = is[0];
    boneIndexes[i * 4 + 1] = is[1];
    boneIndexes[i * 4 + 2] = is[2];
    boneIndexes[i * 4 + 3] = is[3];
  }

  return { weights, boneIndexes };
};
