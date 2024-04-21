#version 300 es
precision highp float;

// attributes
in vec4 a_position;
in vec4 a_normal;
in vec3 a_color;

in vec4 a_weights;
// in uvec4 a_boneIndexes;

in uint a_instanceIndex;


// uniforms
uniform mat4 u_viewMatrix;
uniform sampler2D u_instancesTexture;
uniform sampler2D u_posesTexture;

out vec3 v_normal;
out vec3 v_color;

 

void main() {

  int n = int(a_instanceIndex);

  // mat4 bm0 = mat4(
  //   texelFetch(u_boneMatrixTexture, ivec2(4 * int(a_boneIndexes[0]) + 0, n), 0),
  //   texelFetch(u_boneMatrixTexture, ivec2(4 * int(a_boneIndexes[0]) + 1, n), 0),
  //   texelFetch(u_boneMatrixTexture, ivec2(4 * int(a_boneIndexes[0]) + 2, n), 0),
  //   texelFetch(u_boneMatrixTexture, ivec2(4 * int(a_boneIndexes[0]) + 3, n), 0)
  // );

  // mat4 bm1 = mat4(
  //   texelFetch(u_boneMatrixTexture, ivec2(4 * int(a_boneIndexes[1]) + 0, n), 0),
  //   texelFetch(u_boneMatrixTexture, ivec2(4 * int(a_boneIndexes[1]) + 1, n), 0),
  //   texelFetch(u_boneMatrixTexture, ivec2(4 * int(a_boneIndexes[1]) + 2, n), 0),
  //   texelFetch(u_boneMatrixTexture, ivec2(4 * int(a_boneIndexes[1]) + 3, n), 0)
  // );

  // mat4 bm2 = mat4(
  //   texelFetch(u_boneMatrixTexture, ivec2(4 * int(a_boneIndexes[2]) + 0, n), 0),
  //   texelFetch(u_boneMatrixTexture, ivec2(4 * int(a_boneIndexes[2]) + 1, n), 0),
  //   texelFetch(u_boneMatrixTexture, ivec2(4 * int(a_boneIndexes[2]) + 2, n), 0),
  //   texelFetch(u_boneMatrixTexture, ivec2(4 * int(a_boneIndexes[2]) + 3, n), 0)
  // );

  // mat4 bm3 = mat4(
  //   texelFetch(u_boneMatrixTexture, ivec2(4 * int(a_boneIndexes[3]) + 0, n), 0),
  //   texelFetch(u_boneMatrixTexture, ivec2(4 * int(a_boneIndexes[3]) + 1, n), 0),
  //   texelFetch(u_boneMatrixTexture, ivec2(4 * int(a_boneIndexes[3]) + 2, n), 0),
  //   texelFetch(u_boneMatrixTexture, ivec2(4 * int(a_boneIndexes[3]) + 3, n), 0)
  // );

  vec4 a = texelFetch(u_instancesTexture, ivec2(0, n), 0);
  vec4 b = texelFetch(u_instancesTexture, ivec2(1, n), 0);

  vec2 position = vec2(a[0],a[1]);
  vec2 direction = vec2(a[2],a[3]);
  
  int pose0 = int(b[0]);
  int pose1 = int(b[1]);

  float pose0weight = b[2];
  float pose1weight = b[3];


  // mat4 bm = s
  //   bm0 * a_weights[0] +
  //   bm1 * a_weights[1] +
  //   bm2 * a_weights[2] +s
  //   bm3 * a_weights[3] ;

  mat3 rot = mat3(
     direction.y, -direction.x, 0,
     direction.x,  direction.y, 0,
               0,            0, 1
  );

  vec4 p = vec4( ( rot * a_position.xyz ), 1.0 );

  p.x += position.x;
  p.y += position.y;

  gl_Position = u_viewMatrix * p;

  v_normal = rot * vec3(a_normal);



  v_color = vec3(a_weights);
  // v_color.r = float(a_boneIndexes[0]);
  v_color = vec3(float(n),0.0,0.0);
  
  v_color = a_color;
  // v_color = a.xyz;
}

