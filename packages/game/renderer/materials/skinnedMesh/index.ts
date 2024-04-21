import type { World } from "../../../world";
import { gl } from "../../canvas";
import { getAttribLocation, getUniformLocation } from "../../utils/location";
import { createProgram } from "../../utils/program";
import codeFrag from "./shader.frag";
import codeVert from "./shader.vert";

export const createSkinnedMeshMaterial = ({
  positions,
  normals,
  colors,
}: {
  positions: Float32Array;
  normals: Float32Array;
  colors: Float32Array;
}) => {
  const program = createProgram(gl, codeVert, codeFrag);

  //
  // uniforms
  //
  const u_viewMatrix = gl.getUniformLocation(program, "u_viewMatrix");

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
  // color pattern
  //
  const colorBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW);
  const a_color = getAttribLocation(gl, program, "a_color");
  gl.enableVertexAttribArray(a_color);
  gl.vertexAttribPointer(a_color, 3, gl.FLOAT, false, 0, 0);

  //
  gl.bindVertexArray(null);

  //
  //

  const nVertices = positions.length / 3;

  const draw = (world: World) => {
    gl.useProgram(program);

    gl.uniformMatrix4fv(u_viewMatrix, false, world.camera.worldMatrix);

    gl.bindVertexArray(vao);

    gl.enable(gl.CULL_FACE);
    gl.cullFace(gl.BACK);

    gl.drawArraysInstanced(gl.TRIANGLES, 0, nVertices, 1);

    gl.bindVertexArray(null);
  };

  return { draw };
};
