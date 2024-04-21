import type { World } from "../../../world";
import { gl } from "../../canvas";
import { getAttribLocation, getUniformLocation } from "../../utils/location";
import { createProgram } from "../../utils/program";
import codeFrag from "./shader.frag";
import codeVert from "./shader.vert";

// texture index
let i = 1;

export const MAX_INSTANCES = 1 << 10;

export const createSkinnedMeshMaterial = ({
  positions,
  normals,
  colors,
  weights,
  boneIndexes,
  poses,
  bonesCount,
  posesCount,
}: {
  positions: Float32Array;
  normals: Float32Array;
  colors: Float32Array;
  weights: Float32Array;
  boneIndexes: Uint8Array;
  poses: Float32Array;
  bonesCount: number;
  posesCount: number;
}) => {
  const program = createProgram(gl, codeVert, codeFrag);

  //
  // uniforms
  //
  const u_viewMatrix = gl.getUniformLocation(program, "u_viewMatrix");

  //
  // poses
  //
  const POSES_TEXTURE_INDEX = i++;
  const posesTexture = gl.createTexture();
  const u_posesTexture = getUniformLocation(gl, program, "u_posesTexture");
  gl.activeTexture(gl.TEXTURE0 + POSES_TEXTURE_INDEX);
  gl.bindTexture(gl.TEXTURE_2D, posesTexture);
  gl.texImage2D(
    gl.TEXTURE_2D,
    0, // level
    gl.RGBA32F, // internal format
    4 * bonesCount, // 4 pixels, each pixel has RGBA so 4 pixels is 16 values ( = one matrix ). one row contains all bones
    posesCount, // one row per pose
    0, // border
    gl.RGBA, // format
    gl.FLOAT, // type
    poses,
  );
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

  //
  // instances
  //
  const INSTANCES_TEXTURE_INDEX = i++;
  const instancesTexture = gl.createTexture();
  const u_instancesTexture = getUniformLocation(
    gl,
    program,
    "u_instancesTexture",
  );
  gl.activeTexture(gl.TEXTURE0 + INSTANCES_TEXTURE_INDEX);
  gl.bindTexture(gl.TEXTURE_2D, instancesTexture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

  //
  // attributes
  //

  const vao = gl.createVertexArray();
  gl.bindVertexArray(vao);

  //
  // position
  //
  const positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
  const a_position = getAttribLocation(gl, program, "a_position");
  gl.enableVertexAttribArray(a_position);
  gl.vertexAttribPointer(a_position, 3, gl.FLOAT, false, 0, 0);

  //
  // normal
  //
  const normalBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, normals, gl.STATIC_DRAW);
  const a_normal = getAttribLocation(gl, program, "a_normal");
  gl.enableVertexAttribArray(a_normal);
  gl.vertexAttribPointer(a_normal, 3, gl.FLOAT, false, 0, 0);

  //
  // color
  //
  const colorBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW);
  const a_color = getAttribLocation(gl, program, "a_color");
  gl.enableVertexAttribArray(a_color);
  gl.vertexAttribPointer(a_color, 3, gl.FLOAT, false, 0, 0);

  //
  // weight
  //
  const weightsBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, weightsBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, weights, gl.STATIC_DRAW);
  const a_weights = getAttribLocation(gl, program, "a_weights");
  gl.enableVertexAttribArray(a_weights);
  gl.vertexAttribPointer(a_weights, 4, gl.FLOAT, false, 0, 0);

  //
  // bone indexes
  //
  // const boneIndexesBuffer = gl.createBuffer();
  // gl.bindBuffer(gl.ARRAY_BUFFER, boneIndexesBuffer);
  // gl.bufferData(gl.ARRAY_BUFFER, boneIndexes, gl.STATIC_DRAW);
  // const a_boneIndexes = getAttribLocation(gl, program, "a_boneIndexes");
  // gl.enableVertexAttribArray(a_boneIndexes);
  // gl.vertexAttribPointer(a_boneIndexes, 4, gl.UNSIGNED_BYTE, false, 0, 0);

  //
  // entity index
  //
  const instanceIndexBuffer = gl.createBuffer();
  const instanceIndex = new Uint8Array(
    Array.from({ length: MAX_INSTANCES }, (_, i) => i),
  );
  gl.bindBuffer(gl.ARRAY_BUFFER, instanceIndexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, instanceIndex, gl.STATIC_DRAW);
  const a_entityIndex = getAttribLocation(gl, program, "a_instanceIndex");
  gl.enableVertexAttribArray(a_entityIndex);
  gl.vertexAttribIPointer(a_entityIndex, 1, gl.UNSIGNED_BYTE, 0, 0);
  gl.vertexAttribDivisor(a_entityIndex, 1);

  //
  gl.bindVertexArray(null);

  //
  //

  const nVertices = positions.length / 3;

  let nInstances = 0;

  /**
   * update the instances
   *
   * - position_x
   * - position_y
   *
   * - direction_x
   * - direction_y
   *
   * - pose_a_index
   * - pose_b_index
   *
   * - pose_a_weight
   * - pose_b_weight
   */
  const updateInstances = (instances: Float32Array, n: number) => {
    nInstances = n;

    gl.bindTexture(gl.TEXTURE_2D, instancesTexture);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0, // level
      gl.RGBA32F, // internal format
      2, // 2 pixels, each pixel has RGBA so 2 pixels is 8 values,
      MAX_INSTANCES, // one row per instance
      0, // border
      gl.RGBA, // format
      gl.FLOAT, // type
      instances,
    );

    0;
  };

  const draw = (world: World) => {
    gl.useProgram(program);

    gl.uniformMatrix4fv(u_viewMatrix, false, world.camera.worldMatrix);

    gl.bindVertexArray(vao);

    // gl.bindTexture(gl.TEXTURE_2D, posesTexture);
    // gl.uniform1i(u_posesTexture, POSES_TEXTURE_INDEX);

    // gl.bindTexture(gl.TEXTURE_2D, instancesTexture);
    // gl.uniform1i(u_instancesTexture, INSTANCES_TEXTURE_INDEX);

    gl.enable(gl.CULL_FACE);
    gl.cullFace(gl.BACK);

    gl.drawArraysInstanced(gl.TRIANGLES, 0, nVertices, nInstances);

    gl.bindVertexArray(null);
  };

  return { draw, updateInstances };
};
