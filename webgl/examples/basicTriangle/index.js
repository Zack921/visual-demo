const VSHADER_SOURCE = `
  attribute vec4 a_Position;
  void main() {
    gl_Position = a_Position;
  }
`;

const FSHADER_SOURCE = `
  void main() {
    gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
  }
`;

function main() {
  const canvas = document.getElementById('webgl');
  const gl = getWebGLContext(canvas);
  if (!gl) {
    return console.log('Failed to get the rendering context for WebGL');
  }

  const program = createProgram(gl, VSHADER_SOURCE, FSHADER_SOURCE);
  gl.useProgram(program);
  gl.program = program;

  const n = initVertexBuffers(gl); // 将顶点数据写入缓冲区
  if (n < 0) {
    return console.log('Failed to set the positions of the vertices');
  }

  gl.clearColor(0.0, 0.0, 0.0, 1.0); // 设置清除颜色缓冲区后，画布使用的颜色

  const draw = function() {
    // 清空颜色缓冲区(画布)
    gl.clear(gl.COLOR_BUFFER_BIT);
    // 绘制
    gl.drawArrays(gl.TRIANGLES, 0, n);

    requestAnimationFrame(draw);
  };
  draw();
}

function initVertexBuffers(gl) {
  const vertices = new Float32Array ([
    0, 0.5,   -0.5, -0.5,   0.5, -0.5
  ]);
  const n = 3;

  const vertexBuffer = gl.createBuffer();
  if (!vertexBuffer) {
    console.log('Failed to create the buffer object');
    return -1;
  }

  // gl.ARRAY_BUFFER 指针指向新申请的内存
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  // 写入数据
  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

  const a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if(a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return -1;
  }
  // a_Position -> gl.ARRAY_BUFFER 指向的内存
  gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);

  // 启用遍历
  gl.enableVertexAttribArray(a_Position);

  // 清除指针指向
  gl.bindBuffer(gl.ARRAY_BUFFER, null);

  return n;
}
