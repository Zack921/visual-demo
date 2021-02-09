const VSHADER_SOURCE = `
  attribute vec4 a_Position;
  uniform mat4 u_ModelMatrix;
  void main() {
    gl_Position = u_ModelMatrix * a_Position;
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

  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    return console.log('Failed to init shaders.');
  }

  const n = initVertexBuffers(gl); // 将顶点数据写入缓冲区
  if (n < 0) {
    return console.log('Failed to set the positions of the vertices');
  }

  gl.clearColor(0.0, 0.0, 0.0, 1.0); // 设置清除颜色缓冲区后，画布使用的颜色

  const u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
  if (!u_ModelMatrix) { 
    return console.log('Failed to get the storage location of u_ModelMatrix');
  }

  let currentAngle = 0.0;
  const modelMatrix = new Matrix4();

  const tick = function() {
    currentAngle = animate(currentAngle);
    draw(gl, n, currentAngle, modelMatrix, u_ModelMatrix);
    requestAnimationFrame(tick, canvas);
  };
  tick();
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

function draw(gl, n, currentAngle, modelMatrix, u_ModelMatrix) {
  // 设置模型变换矩阵
  modelMatrix.setRotate(currentAngle, 0, 0, 1);
  // 写入缓存区
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
  // 清空颜色缓冲区(画布)
  gl.clear(gl.COLOR_BUFFER_BIT);
  // 绘制
  gl.drawArrays(gl.TRIANGLES, 0, n);
}

const ANGLE_STEP = 45.0; // 1s转45度
let g_last = Date.now();

function animate(angle) {
  const now = Date.now();
  const elapsed = now - g_last;
  g_last = now;
  let newAngle = angle + (ANGLE_STEP * elapsed) / 1000.0;
  return newAngle %= 360;
}
