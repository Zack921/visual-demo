const VSHADER_SOURCE = `
  attribute vec4 a_Position;
  attribute vec2 a_TexCoord;
  varying vec2 v_TexCoord;
  void main() {
    gl_Position = a_Position;
    v_TexCoord = a_TexCoord;
  }
`;

const FSHADER_SOURCE = `
  precision mediump float;
  uniform sampler2D u_Sampler;
  varying vec2 v_TexCoord; // 内插后的纹理坐标
  void main() {
    gl_FragColor = texture2D(u_Sampler, v_TexCoord);
  }
`;

function main() {
  const canvas = document.getElementById('webgl');
  const gl = getWebGLContext(canvas);
  if (!gl) {
    return console.log('Failed to get the rendering context for WebGL');
  }

  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    return console.log('Failed to intialize shaders.');
  }

  const n = initVertexBuffers(gl);
  if (n < 0) {
    return console.log('Failed to set the vertex information');
  }

  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  if (!initTextures(gl, n)) {
    return console.log('Failed to intialize the texture.');
  }
}

function initVertexBuffers(gl) {
  // 顶点坐标和纹理坐标共用一个缓冲区
  const verticesTexCoords = new Float32Array([
    -0.5,  0.5,   0.0, 1.0,
    -0.5, -0.5,   0.0, 0.0,
     0.5,  0.5,   1.0, 1.0,
     0.5, -0.5,   1.0, 0.0,
  ]);
  const n = 4;

  const vertexTexCoordBuffer = gl.createBuffer();
  if (!vertexTexCoordBuffer) {
    console.log('Failed to create the buffer object');
    return -1;
  }

  gl.bindBuffer(gl.ARRAY_BUFFER, vertexTexCoordBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, verticesTexCoords, gl.STATIC_DRAW);

  const FSIZE = verticesTexCoords.BYTES_PER_ELEMENT;
  const a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return -1;
  }
  gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, FSIZE * 4, 0);
  gl.enableVertexAttribArray(a_Position);

  const a_TexCoord = gl.getAttribLocation(gl.program, 'a_TexCoord');
  if (a_TexCoord < 0) {
    console.log('Failed to get the storage location of a_TexCoord');
    return -1;
  }

  gl.vertexAttribPointer(a_TexCoord, 2, gl.FLOAT, false, FSIZE * 4, FSIZE * 2);
  gl.enableVertexAttribArray(a_TexCoord);

  return n;
}

function initTextures(gl, n) {
  const texture = gl.createTexture();
  if (!texture) {
    console.log('Failed to create the texture object');
    return false;
  }

  // u_Sampler 取样器，通过 纹理坐标 得到 颜色值
  const u_Sampler = gl.getUniformLocation(gl.program, 'u_Sampler');
  if (!u_Sampler) {
    console.log('Failed to get the storage location of u_Sampler');
    return false;
  }
  const image = new Image();
  if (!image) {
    console.log('Failed to create the image object');
    return false;
  }

  image.onload = function(){ loadTexture(gl, n, texture, u_Sampler, image); };
  image.src = './assets/sky.jpg';

  return true;
}

function loadTexture(gl, n, texture, u_Sampler, image) {
  // 反转y轴，因为图片的坐标系统y轴朝下
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
  // 激活纹理单元，一个纹理单元管理一个纹理对象
  gl.activeTexture(gl.TEXTURE0);
  // 绑定 纹理对象 到 纹理单元 上
  gl.bindTexture(gl.TEXTURE_2D, texture);
  // 配置纹理对象参数，设置纹理图像映射到图形上的方式
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  // 将 纹理图像 分配到 纹理对象 上
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
  // 将零号纹理单元指定到片元着色器的取样器参数上
  gl.uniform1i(u_Sampler, 0);
  
  gl.clear(gl.COLOR_BUFFER_BIT);

  gl.drawArrays(gl.TRIANGLE_STRIP, 0, n);
}
