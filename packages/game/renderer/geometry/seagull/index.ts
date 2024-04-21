import { vec3 } from "gl-matrix";
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

  return {
    positions: new Float32Array(positions),
    colors: new Float32Array(colors),
    normals,
  };
});
