#version 300 es
precision highp float;

// attributes
in vec4 a_position;
in vec4 a_normal;
in vec3 a_color;

in vec4 a_weights;
in uvec4 a_boneIndexes;

in vec2 a_instancePosition;
in vec2 a_instanceDirection;
in vec4 a_instancePoseWeights;
in uvec4 a_instancePoseIndexes;


// uniforms
uniform mat4 u_viewMatrix;
uniform sampler2D u_posesTexture;

out vec3 v_normal;
out vec3 v_color;

 

void main() {


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

  


  // mat4 bm = s
  //   bm0 * a_weights[0] +
  //   bm1 * a_weights[1] +
  //   bm2 * a_weights[2] +s
  //   bm3 * a_weights[3] ;

  mat3 rot = mat3(
     a_instanceDirection.y, -a_instanceDirection.x, 0,
     a_instanceDirection.x,  a_instanceDirection.y, 0,
                         0,                      0, 1
  );

  vec4 p = vec4( ( rot * a_position.xyz ), 1.0 );

  p.x += a_instancePosition.x;
  p.y += a_instancePosition.y;

  gl_Position = u_viewMatrix * p;

  v_normal = rot * vec3(a_normal);


  //
  // debugger weight
  uvec3 debugIndexes = uvec3(1,2,0);
  vec3 debugWeights = vec3(0.0,0.0,0.0);
  if( a_boneIndexes[0] == debugIndexes[0] ){
    debugWeights[0]=a_weights[0];
  } else if( a_boneIndexes[1] == debugIndexes[0] ){
    debugWeights[0]=a_weights[1];
  } else if( a_boneIndexes[2] == debugIndexes[0] ){
    debugWeights[0]=a_weights[2];
  } else if( a_boneIndexes[3] == debugIndexes[0] ){
    debugWeights[0]=a_weights[3];
  } 

  if( a_boneIndexes[0] == debugIndexes[1] ){
    debugWeights[1]=a_weights[0];
  } else if( a_boneIndexes[1] == debugIndexes[1] ){
    debugWeights[1]=a_weights[1];
  } else if( a_boneIndexes[2] == debugIndexes[1] ){
    debugWeights[1]=a_weights[2];
  } else if( a_boneIndexes[3] == debugIndexes[1] ){
    debugWeights[1]=a_weights[3];
  } 

  if( a_boneIndexes[0] == debugIndexes[2] ){
    debugWeights[2]=a_weights[0];
  } else if( a_boneIndexes[1] == debugIndexes[2] ){
    debugWeights[2]=a_weights[1];
  } else if( a_boneIndexes[2] == debugIndexes[2] ){
    debugWeights[2]=a_weights[2];
  } else if( a_boneIndexes[3] == debugIndexes[2] ){
    debugWeights[2]=a_weights[3];
  }
  v_color = debugWeights;



  v_color = vec3(a_weights);
  v_color = vec3( float(a_instancePoseIndexes[0])/10.0,a_instancePoseWeights[0], float(a_boneIndexes[0]));
  v_color = vec3(a_instanceDirection,0.0);
  
  v_color = a_color;
}

