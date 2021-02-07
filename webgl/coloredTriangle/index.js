const VSHADER_SOURCE = `
  attribute vec4 a_Position;
  attribute vec4 a_Color;
  varying vec4 v_Color;
  void main() {
    gl_Position = a_Position;
    v_Color = a_Color;
  }
`;

const FSHADER_SOURCE = `
  // 这里要显示设置，是因为片元着色器中的float没有默认精度 
  // 指定变量的范围和精度,精度限定字决定程序使用多少内存，精度越低可能会越粗糙，precision为着色器统一设置了默认精度(也可以给各变量设置自己的精度)
  precision mediump float;
  varying vec4 v_Color;
  void main() {
    gl_FragColor = v_Color; // 这里是已经内插过后的颜色值了,所以片元上的点才会产生渐变效果
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
  gl.clear(gl.COLOR_BUFFER_BIT);

  gl.drawArrays(gl.TRIANGLES, 0, n);
}

function initVertexBuffers(gl) {
  // 顶点数据和颜色数据共用同一个缓冲区
  const verticesColors = new Float32Array([
     0.0,  0.5,  1.0,  0.0,  0.0, 
    -0.5, -0.5,  0.0,  1.0,  0.0, 
     0.5, -0.5,  0.0,  0.0,  1.0, 
  ]);
  const n = 3;

  const vertexColorBuffer = gl.createBuffer();  
  if (!vertexColorBuffer) {
    console.log('Failed to create the buffer object');
    return false;
  }

  gl.bindBuffer(gl.ARRAY_BUFFER, vertexColorBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, verticesColors, gl.STATIC_DRAW);

  const FSIZE = verticesColors.BYTES_PER_ELEMENT; // 每个元素的大小(字节数)
  const a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return -1;
  }
  // 因为顶点数据和颜色数据共用同一个缓冲区，a_Position 取数据时要设置偏移量
  // 这里指定相邻顶点间的字节数为 FSIZE * 5
  gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, FSIZE * 5, 0);
  gl.enableVertexAttribArray(a_Position);

  const a_Color = gl.getAttribLocation(gl.program, 'a_Color');
  if(a_Color < 0) {
    console.log('Failed to get the storage location of a_Color');
    return -1;
  }
  gl.vertexAttribPointer(a_Color, 3, gl.FLOAT, false, FSIZE * 5, FSIZE * 2);
  gl.enableVertexAttribArray(a_Color);

  gl.bindBuffer(gl.ARRAY_BUFFER, null);

  return n;
}
