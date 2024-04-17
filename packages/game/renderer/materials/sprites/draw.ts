import { MAX_ENTITIES, World } from "../../../world";
import { gl } from "../../canvas";
import { getAttribLocation, getUniformLocation } from "../../utils/location";
import { createProgram } from "../../utils/program";
import codeFrag from "./shader.frag";
import codeVert from "./shader.vert";
import { textureAtlasCanvas } from "./textureAtlas";
import { update } from "./update";

const program = createProgram(gl, codeVert, codeFrag);

//
// uniforms
//
const u_texture = getUniformLocation(gl, program, "u_texture");

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
const a_position = getAttribLocation(gl, program, "a_position");
gl.enableVertexAttribArray(a_position);
gl.vertexAttribPointer(a_position, 3, gl.FLOAT, false, 0, 0);

//
// texcoord
//
const texcoordBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer);
const a_texcoord = getAttribLocation(gl, program, "a_texcoord");
gl.enableVertexAttribArray(a_texcoord);
gl.vertexAttribPointer(a_texcoord, 2, gl.FLOAT, false, 0, 0);

//
// texture
//
const texture = gl.createTexture();
gl.activeTexture(gl.TEXTURE0);
gl.bindTexture(gl.TEXTURE_2D, texture);
gl.texImage2D(
  gl.TEXTURE_2D,
  0,
  gl.RGBA,
  gl.RGBA,
  gl.UNSIGNED_BYTE,
  textureAtlasCanvas,
);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
gl.generateMipmap(gl.TEXTURE_2D);

//
gl.bindVertexArray(null);

export const positions = new Float32Array(MAX_ENTITIES * 2 * 3 * 3);
export const uvs = new Float32Array(MAX_ENTITIES * 2 * 3 * 2);
export const sprite = { count: 0 };

export const draw = (world: World) => {
  gl.useProgram(program);

  gl.bindVertexArray(vao);

  // gl.enable(gl.CULL_FACE);
  // gl.cullFace(gl.FRONT);

  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.uniform1i(u_texture, 0);

  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, positions, gl.DYNAMIC_DRAW);

  gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, uvs, gl.DYNAMIC_DRAW);

  gl.drawArrays(gl.TRIANGLES, 0, sprite.count * 3 * 2);

  gl.bindVertexArray(null);
};